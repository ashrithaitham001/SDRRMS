import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  User,
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  UserCheck,
  Building,
  Navigation,
  FileText,
  Loader2,
  Users
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import StatusBadge from '../../components/common/StatusBadge';
import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  ROLES
} from '../../utils/constants';
import { requestService } from '../../services/requestService';
import { volunteerService } from '../../services/volunteerService';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

// Fix for leaflet default marker icon
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const RequestDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isManagerOrAdmin = [ROLES.ADMIN, ROLES.GOV_OFFICIAL, ROLES.NGO_REPRESENTATIVE].includes(
    user?.role
  );

  const [request, setRequest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState('');

  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [ngoName, setNgoName] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState('');

  // Fetch request and history
  const loadRequestData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch request details
      let reqData = null;
      try {
        const res = await requestService.getRequestById(id);
        reqData = res?.data || res;
      } catch (err) {
        // If not numeric id or 404, try tracking lookup
        try {
          const trackRes = await requestService.trackRequest(id);
          reqData = trackRes?.data || trackRes;
        } catch {
          throw err;
        }
      }

      setRequest(reqData);
      setNewStatus(reqData?.status || 'SUBMITTED');

      // Fetch history
      try {
        const histRes = await requestService.getRequestHistory(reqData?.id || id);
        const historyData = Array.isArray(histRes)
          ? histRes
          : histRes?.data || histRes?.history || [];
        setHistory(historyData);
      } catch (histErr) {
        console.warn('History endpoint not available or empty:', histErr);
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to load request details:', err);
      setError(err?.message || 'Could not load request details. Please check the URL or try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRequestData();
  }, [loadRequestData]);

  // Load volunteers if manager opens assign modal
  useEffect(() => {
    if (showAssignModal && isManagerOrAdmin && volunteers.length === 0) {
      const fetchVolunteers = async () => {
        setLoadingVolunteers(true);
        try {
          const res = await volunteerService.getAllVolunteers();
          const list = Array.isArray(res) ? res : res?.data || res?.volunteers || [];
          setVolunteers(list);
        } catch (err) {
          console.warn('Could not fetch volunteers:', err);
        } finally {
          setLoadingVolunteers(false);
        }
      };
      fetchVolunteers();
    }
  }, [showAssignModal, isManagerOrAdmin, volunteers.length]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    setUpdatingStatus(true);
    setStatusSuccess('');
    setError(null);

    try {
      await requestService.updateStatus(request?.id || id, newStatus, statusRemarks);
      setStatusSuccess('Status updated successfully.');
      setStatusRemarks('');
      await loadRequestData();
      setTimeout(() => setStatusSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err?.message || 'Failed to update request status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssigning(true);
    setAssignSuccess('');
    setError(null);

    try {
      await requestService.assignRequest(
        request?.id || id,
        selectedVolunteerId || null,
        ngoName.trim() || null,
        assignRemarks.trim() || null
      );
      setAssignSuccess('Request successfully assigned.');
      setShowAssignModal(false);
      setAssignRemarks('');
      await loadRequestData();
    } catch (err) {
      console.error('Failed to assign request:', err);
      setError(err?.message || 'Failed to assign request.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center py-12 px-4">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm font-medium text-slate-500">Loading request information...</p>
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Request Not Found</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => navigate('/requests')}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Back to Requests
            </button>
            <button
              onClick={loadRequestData}
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const trackingNumber =
    request?.trackingNumber || request?.tracking_number || `REQ-${request?.id || id}`;
  const categoryObj = REQUEST_CATEGORIES.find((c) => c.value === request?.category);
  const categoryLabel = categoryObj?.label || request?.category || 'General Relief';

  // Map coordinates
  const lat = parseFloat(request?.latitude);
  const lng = parseFloat(request?.longitude);
  const hasValidCoordinates = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/requests')}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                  {trackingNumber}
                </span>
                <StatusBadge status={request?.priority} size="sm" />
                <StatusBadge status={request?.status} size="sm" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {request?.title || 'Relief Assistance Request'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadRequestData}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            {isManagerOrAdmin && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span>Assign Request</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Notifications */}
        {statusSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{statusSuccess}</span>
          </div>
        )}

        {assignSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{assignSuccess}</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description & Overview */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
              <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-700" />
                <span>Request Details</span>
              </h2>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description of Needs
                </span>
                <p className="mt-1 text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                  {request?.description || 'No detailed description provided.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Category</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{categoryLabel}</p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Priority Level</span>
                  <div className="mt-1">
                    <StatusBadge status={request?.priority} size="sm" />
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">People Affected</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {request?.peopleCount || 1} Person(s)
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Reported Date & Time</span>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {formatDate(request?.createdAt || request?.date)}
                  </p>
                </div>
              </div>

              {/* Assignment details if assigned */}
              {(request?.assignedVolunteer || request?.assignedNgo || request?.volunteerId) && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Assigned Dispatcher</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-indigo-950">
                    {request?.assignedVolunteer && (
                      <p>
                        <strong>Volunteer:</strong> {request.assignedVolunteer.name || request.assignedVolunteer}
                      </p>
                    )}
                    {request?.assignedNgo && (
                      <p>
                        <strong>NGO Partner:</strong> {request.assignedNgo}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Map & Location */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-700" />
                  <span>Location Coordinates</span>
                </span>
                {hasValidCoordinates && (
                  <span className="text-xs font-mono text-slate-500">
                    {lat.toFixed(5)}, {lng.toFixed(5)}
                  </span>
                )}
              </h2>

              <div className="flex items-start gap-2 text-sm text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>
                  {request?.locationText ||
                    request?.location ||
                    request?.address ||
                    'No street address specified.'}
                </span>
              </div>

              {/* Leaflet Map */}
              {hasValidCoordinates ? (
                <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-200 relative z-0">
                  <MapContainer
                    center={[lat, lng]}
                    zoom={14}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[lat, lng]} icon={markerIcon}>
                      <Popup>
                        <div className="text-xs">
                          <p className="font-bold">{request?.title}</p>
                          <p className="text-slate-600">{request?.locationText}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              ) : (
                <div className="h-32 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Navigation className="w-6 h-6 mb-1 text-slate-300" />
                  <span>No exact GPS coordinates available for mapping.</span>
                </div>
              )}
            </div>

            {/* Status Timeline / History */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-700" />
                <span>Status History & Audit Trail</span>
              </h2>

              {history && history.length > 0 ? (
                <div className="relative border-l-2 border-teal-200 ml-3 space-y-6 py-2">
                  {history.map((event, index) => {
                    const eventStatus = event.status || event.newStatus || 'UPDATED';
                    const eventDate = event.timestamp || event.createdAt || event.date;
                    const actor = event.updatedBy || event.changedBy || event.user?.name || 'System Dispatch';

                    return (
                      <div key={event.id || index} className="relative pl-6">
                        {/* Dot */}
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-teal-600 border-4 border-white shadow-sm" />

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={eventStatus} size="sm" />
                            <span className="text-xs text-slate-500 font-medium">by {actor}</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {formatDate(eventDate)}
                          </span>
                        </div>

                        {event.remarks && (
                          <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            {event.remarks}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="relative border-l-2 border-teal-200 ml-3 space-y-6 py-2">
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-teal-600 border-4 border-white shadow-sm" />
                    <div className="flex items-center justify-between">
                      <StatusBadge status={request?.status || 'SUBMITTED'} size="sm" />
                      <span className="text-xs text-slate-400">
                        {formatDate(request?.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Request created and logged into dispatch system.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (1 column) */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-teal-700" />
                <span>Contact Details</span>
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Contact Person</span>
                    <p className="text-sm font-semibold text-slate-900">
                      {request?.contactName || request?.name || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-600 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Phone Number</span>
                    <p className="text-sm font-semibold text-slate-900">
                      {request?.contactPhone ? (
                        <a
                          href={`tel:${request.contactPhone}`}
                          className="text-teal-700 hover:underline"
                        >
                          {request.contactPhone}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin / Gov / NGO Status Update Form */}
            {isManagerOrAdmin && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-teal-700" />
                  <span>Update Status</span>
                </h2>

                <form onSubmit={handleUpdateStatus} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      New Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    >
                      {REQUEST_STATUSES.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Action Remarks / Notes
                    </label>
                    <textarea
                      rows={3}
                      value={statusRemarks}
                      onChange={(e) => setStatusRemarks(e.target.value)}
                      placeholder="Add status notes, verification remarks, or next steps..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {updatingStatus ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Save Status</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-5 border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-700" />
                  <h3 className="text-lg font-bold text-slate-900">Assign Request</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAssign} className="space-y-4">
                {/* Volunteer select */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Assign to Volunteer
                  </label>
                  {loadingVolunteers ? (
                    <div className="text-xs text-slate-500 py-2">Loading volunteers...</div>
                  ) : (
                    <select
                      value={selectedVolunteerId}
                      onChange={(e) => setSelectedVolunteerId(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 bg-white"
                    >
                      <option value="">-- Select Volunteer (optional) --</option>
                      {volunteers.map((vol) => (
                        <option key={vol.id || vol._id} value={vol.id || vol._id}>
                          {vol.name || vol.fullName || vol.user?.name || `Volunteer #${vol.id}`} (
                          {vol.skills || vol.area || 'General'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* NGO Name input */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Assign to NGO Partner
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Red Cross Emergency Wing, Seva Foundation"
                      value={ngoName}
                      onChange={(e) => setNgoName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Assignment Instructions / Remarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide contact details or instructions for this team..."
                    value={assignRemarks}
                    onChange={(e) => setAssignRemarks(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    disabled={assigning}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  >
                    {assigning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Confirm Assignment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetailsPage;
