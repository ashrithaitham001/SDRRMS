import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  AlertTriangle,
  MapPin,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  Users,
  Maximize2,
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';

import { disasterService } from '../services/disasterService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';

// Fix Leaflet's default icon assets broken by Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Color mapping for disaster severities
const SEVERITY_CONFIG = {
  CRITICAL: {
    color: '#DC2626',
    border: '#991B1B',
    badge: 'bg-red-100 text-red-800 border-red-200',
    label: 'Critical',
    dotBg: 'bg-red-600',
  },
  HIGH: {
    color: '#EA580C',
    border: '#C2410C',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
    label: 'High',
    dotBg: 'bg-orange-600',
  },
  MEDIUM: {
    color: '#D97706',
    border: '#B45309',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'Medium',
    dotBg: 'bg-amber-500',
  },
  LOW: {
    color: '#0D9488',
    border: '#0F766E',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    label: 'Low',
    dotBg: 'bg-teal-600',
  },
};

const getSeverityDetails = (severity) => {
  const norm = (severity || '').toUpperCase();
  return SEVERITY_CONFIG[norm] || SEVERITY_CONFIG.MEDIUM;
};

// Create custom pin icons with pulsed ripple for Leaflet markers
const createCustomMarkerIcon = (severity) => {
  const conf = getSeverityDetails(severity);
  const svgHtml = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <span style="
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: ${conf.color};
        opacity: 0.25;
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></span>
      <div style="
        position: relative;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background-color: ${conf.color};
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-disaster-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Component to recenter or fly to a selected disaster
function MapController({ selectedDisaster }) {
  const map = useMap();

  useEffect(() => {
    if (selectedDisaster) {
      const lat = selectedDisaster.location?.coordinates?.[1] || selectedDisaster.latitude || selectedDisaster.location?.lat;
      const lng = selectedDisaster.location?.coordinates?.[0] || selectedDisaster.longitude || selectedDisaster.location?.lng;

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 10, {
          duration: 1.2,
        });
      }
    }
  }, [selectedDisaster, map]);

  return null;
}

export default function MapPage() {
  const [disasters, setDisasters] = useState([]);
  const [filteredDisasters, setFilteredDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const defaultCenter = [20.5937, 78.9629]; // India geographic center
  const defaultZoom = 5;

  const fetchDisasters = async (isManual = false) => {
    try {
      if (isManual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await disasterService.getActiveDisasters();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setDisasters(list);
    } catch (err) {
      console.error('Failed to load active disasters for map:', err);
      setError(err?.message || 'Failed to fetch active disasters. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  // Filter disasters based on severity
  useEffect(() => {
    if (filterSeverity === 'ALL') {
      setFilteredDisasters(disasters);
    } else {
      setFilteredDisasters(
        disasters.filter(
          (d) => (d.severity || '').toUpperCase() === filterSeverity
        )
      );
    }
  }, [filterSeverity, disasters]);

  // Extract valid coordinates helper
  const getDisasterCoordinates = (d) => {
    let lat = null;
    let lng = null;

    if (d?.location?.coordinates && Array.isArray(d.location.coordinates) && d.location.coordinates.length >= 2) {
      // GeoJSON standard: [longitude, latitude]
      lng = Number(d.location.coordinates[0]);
      lat = Number(d.location.coordinates[1]);
    } else if (d?.latitude && d?.longitude) {
      lat = Number(d.latitude);
      lng = Number(d.longitude);
    } else if (d?.location?.lat && d?.location?.lng) {
      lat = Number(d.location.lat);
      lng = Number(d.location.lng);
    }

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      return [lat, lng];
    }
    return null;
  };

  const geocodedDisasters = filteredDisasters.filter((d) => getDisasterCoordinates(d) !== null);
  const unmappedDisasters = filteredDisasters.filter((d) => getDisasterCoordinates(d) === null);

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-100">
      {/* Top Map Toolbar Header */}
      <div className="z-10 bg-white border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Disaster Monitoring & Geographic Response
            </h1>
            <p className="text-xs text-slate-500">
              Interactive map visualizing active emergency zones across affected regions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Severity Filter Dropdown */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDisasters(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            title="Refresh map disasters"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-teal-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{sidebarOpen ? 'Hide Panel' : 'Disasters List'}</span>
            <span className="ml-1 px-1.5 py-0.2 bg-teal-200/80 rounded-full text-[10px]">
              {filteredDisasters.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Map Body & Floating Overlays */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <LoadingSpinner size="lg" message="Loading disaster zones & map telemetry..." />
          </div>
        ) : error ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white/90">
            <div className="max-w-md w-full rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-900 shadow-md">
              <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-red-600" />
              <h3 className="font-bold text-base">Unable to Load Map Data</h3>
              <p className="mt-1 text-xs text-red-700">{error}</p>
              <button
                onClick={() => fetchDisasters(true)}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {/* Leaflet Map Container */}
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          <MapController selectedDisaster={selectedDisaster} />

          {/* Render Active Disaster Markers */}
          {geocodedDisasters.map((disaster) => {
            const coords = getDisasterCoordinates(disaster);
            if (!coords) return null;

            const disasterId = disaster._id || disaster.id;
            const severityStyle = getSeverityDetails(disaster.severity);
            const icon = createCustomMarkerIcon(disaster.severity);

            return (
              <Marker
                key={disasterId}
                position={coords}
                icon={icon}
                eventHandlers={{
                  click: () => setSelectedDisaster(disaster),
                }}
              >
                <Popup className="disaster-custom-popup" maxWidth={320}>
                  <div className="p-1 space-y-2">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {disaster.name || disaster.title}
                        </h4>
                        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                          Type: {disaster.type?.replace(/_/g, ' ') || 'Incident'}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${severityStyle.badge}`}>
                        {severityStyle.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {disaster.description || 'Active disaster operational zone requiring monitoring.'}
                    </p>

                    <div className="space-y-1 pt-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {disaster.location?.address || disaster.location?.city || disaster.location?.state || 'Coordinates provided'}
                        </span>
                      </div>

                      {disaster.affectedArea && (
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Area: {disaster.affectedArea}</span>
                        </div>
                      )}

                      {disaster.estimatedAffectedPopulation && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Affected: ~{disaster.estimatedAffectedPopulation.toLocaleString()} citizens</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Declared: {formatDate(disaster.createdAt || disaster.startDate)}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-6 right-6 z-[1000] bg-white/95 backdrop-blur-md rounded-xl p-3.5 border border-slate-200 shadow-lg text-xs pointer-events-auto">
          <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-700" />
            <span>Severity Legend</span>
          </div>
          <div className="space-y-1.5">
            {Object.entries(SEVERITY_CONFIG).map(([key, item]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${item.dotBg} shadow-sm border border-white`} />
                <span className="text-slate-600 font-medium">{item.label} Severity</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar / Overlay Listing Disasters */}
        {sidebarOpen && (
          <div className="absolute top-4 left-4 z-[1000] w-80 sm:w-96 max-h-[calc(100%-2rem)] flex flex-col bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden pointer-events-auto transition-all">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Active Incidents</h3>
                <p className="text-xs text-slate-500">
                  {geocodedDisasters.length} mapped / {filteredDisasters.length} total active
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs px-2 py-1 rounded border border-slate-200 bg-white"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
              {filteredDisasters.length > 0 ? (
                filteredDisasters.map((disaster) => {
                  const disasterId = disaster._id || disaster.id;
                  const severityStyle = getSeverityDetails(disaster.severity);
                  const coords = getDisasterCoordinates(disaster);
                  const isSelected = (selectedDisaster?._id || selectedDisaster?.id) === disasterId;

                  return (
                    <div
                      key={disasterId}
                      onClick={() => {
                        setSelectedDisaster(disaster);
                      }}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-50 border border-teal-200 shadow-xs'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {disaster.name || disaster.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase shrink-0 ${severityStyle.badge}`}>
                          {severityStyle.label}
                        </span>
                      </div>

                      <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {disaster.location?.address || disaster.location?.city || disaster.location?.state || 'Location unverified'}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">
                          {disaster.type?.replace(/_/g, ' ') || 'Disaster'}
                        </span>

                        {coords ? (
                          <span className="inline-flex items-center gap-1 text-teal-700 font-semibold">
                            <Eye className="w-3 h-3" /> Focus on map
                          </span>
                        ) : (
                          <span className="text-amber-600 font-medium text-[10px] bg-amber-50 px-1.5 py-0.5 rounded">
                            No coordinates
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No active disasters matching current criteria.
                </div>
              )}
            </div>

            {/* Notification when some disasters lack GPS coordinates */}
            {unmappedDisasters.length > 0 && (
              <div className="p-3 bg-amber-50 border-t border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {unmappedDisasters.length} disaster(s) lack GPS pin coordinates and cannot be pinpointed on the map.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
