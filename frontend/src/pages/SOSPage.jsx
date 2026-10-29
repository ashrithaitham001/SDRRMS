import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertOctagon,
  AlertTriangle,
  PhoneCall,
  MapPin,
  Compass,
  User,
  Phone,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  ShieldAlert,
  ArrowLeft,
  LifeBuoy,
  Radio,
  ExternalLink
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import { requestService } from '../services/requestService';
import { useAuth } from '../contexts/AuthContext';

export const SOSPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    contactName: user?.name || user?.fullName || '',
    contactPhone: user?.phone || '',
    emergencyType: 'RESCUE',
    description: '',
    locationText: '',
    latitude: '',
    longitude: '',
    peopleCount: 1,
  });

  const [locating, setLocating] = useState(false);
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Confirmation modal step
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmedRisk, setConfirmedRisk] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [sosResult, setSosResult] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync user info
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        contactName: prev.contactName || user.name || user.fullName || '',
        contactPhone: prev.contactPhone || user.phone || '',
      }));
    }
  }, [user]);

  // Attempt auto-gps on load for rapid emergency response
  useEffect(() => {
    handleCaptureGps(false);
  }, []);

  const handleCaptureGps = (userInitiated = true) => {
    if (!navigator.geolocation) {
      if (userInitiated) {
        setGpsError('Geolocation is not supported by your browser.');
      }
      return;
    }

    setLocating(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          locationText:
            prev.locationText || `GPS: ${lat}, ${lng} (Accuracy: ~${Math.round(pos.coords.accuracy)}m)`,
        }));
        setGpsCaptured(true);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation capture failed:', err);
        setLocating(false);
        if (userInitiated) {
          if (err.code === 1) {
            setGpsError('GPS permission was denied. Please provide location details manually.');
          } else {
            setGpsError('Could not acquire GPS fix. Please enter landmark or address below.');
          }
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.contactName.trim()) {
      setSubmitError('Contact name is required so rescue teams know who to contact.');
      return false;
    }
    if (!formData.contactPhone.trim()) {
      setSubmitError('Phone number is required for dispatchers to verify and coordinate.');
      return false;
    }
    if (!formData.locationText.trim() && (!formData.latitude || !formData.longitude)) {
      setSubmitError('Please provide your location or capture GPS coordinates.');
      return false;
    }
    setSubmitError('');
    return true;
  };

  const handleInitiateSOS = (e) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmSOS = async () => {
    if (submitting || submissionComplete) return;

    setSubmitting(true);
    setSubmitError('');

    const payload = {
      title: `CRITICAL SOS: Emergency ${formData.emergencyType} Request`,
      description:
        formData.description.trim() ||
        `IMMEDIATE SOS ASSISTANCE REQUESTED. Contact: ${formData.contactName} (${formData.contactPhone})`,
      category: formData.emergencyType === 'MEDICAL' ? 'MEDICAL' : 'RESCUE',
      priority: 'CRITICAL',
      contactName: formData.contactName.trim(),
      contactPhone: formData.contactPhone.trim(),
      locationText: formData.locationText.trim(),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      peopleCount: parseInt(formData.peopleCount, 10) || 1,
      isEmergency: true,
      status: 'SUBMITTED',
    };

    try {
      let response;
      if (isAuthenticated) {
        response = await requestService.submitSos(payload);
      } else {
        try {
          response = await requestService.submitPublicSos(payload);
        } catch {
          response = await requestService.submitSos(payload);
        }
      }

      const resData = response?.data || response;
      const refNum =
        resData?.trackingNumber ||
        resData?.referenceNumber ||
        resData?.tracking_number ||
        `SOS-${Math.floor(100000 + Math.random() * 900000)}`;

      setSosResult({
        referenceNumber: refNum,
        id: resData?.id || resData?._id,
        createdAt: new Date().toISOString(),
        ...payload,
      });

      setSubmissionComplete(true);
      setIsConfirmOpen(false);
    } catch (err) {
      console.error('SOS submission failed:', err);
      setSubmitError(
        err?.message ||
          'Failed to transmit SOS beacon. Please dial 112 immediately for emergency services!'
      );
      setIsConfirmOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (sosResult?.referenceNumber) {
      navigator.clipboard.writeText(sosResult.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 selection:bg-red-900 selection:text-white">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Top Disclaimer / Prototype Warning */}
        <div className="bg-red-950/80 border-2 border-red-600 rounded-2xl p-4 sm:p-5 shadow-lg shadow-red-950/50 flex items-start gap-4 animate-pulse">
          <div className="p-2.5 bg-red-600 text-white rounded-xl flex-shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="text-sm">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase tracking-wider text-red-400 text-xs">
                Emergency Alert
              </span>
              <span className="bg-red-800/80 text-red-200 text-[10px] px-2 py-0.5 rounded-full font-bold">
                PROTOTYPE MODE
              </span>
            </div>
            <p className="mt-1 font-bold text-red-100 text-base">
              For immediate life-threatening emergencies, call{' '}
              <a
                href="tel:112"
                className="underline text-red-300 font-extrabold text-lg hover:text-white"
              >
                112
              </a>{' '}
              or your local disaster response hotline now!
            </p>
            <p className="mt-1 text-xs text-red-300/90">
              This digital SDRRMS SOS system notifies online responders and relief authorities.
            </p>
          </div>
        </div>

        {/* Success Confirmation State */}
        {submissionComplete && sosResult ? (
          <div className="bg-slate-800/90 rounded-2xl border-2 border-emerald-500 p-6 sm:p-8 space-y-6 text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <Radio className="w-10 h-10 animate-ping" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
                Beacon Transmitted
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Help is being coordinated!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Your emergency SOS beacon has been received by the regional disaster control
                room. Response teams in your sector are being mobilized.
              </p>
            </div>

            {/* Reference Card */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-sm mx-auto">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                Emergency Reference ID
              </span>
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className="font-mono text-2xl font-black text-emerald-400 tracking-wider">
                  {sosResult.referenceNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                  title="Copy reference ID"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Emergency Hotline Numbers */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-slate-200">Keep your phone line open and accessible:</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-red-400">
                <a href="tel:112" className="hover:underline flex items-center gap-1">
                  <PhoneCall className="w-4 h-4" /> National: 112
                </a>
                <a href="tel:108" className="hover:underline flex items-center gap-1">
                  <PhoneCall className="w-4 h-4" /> Ambulance: 108
                </a>
                <a href="tel:1070" className="hover:underline flex items-center gap-1">
                  <PhoneCall className="w-4 h-4" /> Disaster Ops: 1070
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {sosResult.id && (
                <button
                  type="button"
                  onClick={() => navigate(`/requests/${sosResult.id}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
                >
                  <span>Track Status</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <Link
                to="/requests"
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Go to Requests
              </Link>
            </div>
          </div>
        ) : (
          /* SOS Dispatch Form */
          <div className="bg-slate-800/90 rounded-2xl border-2 border-red-700 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            {/* Top red glow accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
                  <span>EMERGENCY SOS BEACON</span>
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Transmit an urgent high-priority distress signal with your live location.
                </p>
              </div>

              <Link
                to="/requests"
                className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Standard Request</span>
              </Link>
            </div>

            {/* Error Banner */}
            {submitError && (
              <div className="bg-red-950 border border-red-500 text-red-200 p-4 rounded-xl flex items-start gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p>{submitError}</p>
              </div>
            )}

            <form onSubmit={handleInitiateSOS} className="space-y-5">
              {/* Emergency Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Emergency Nature
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'RESCUE', label: 'Flood / Trapped Rescue' },
                    { id: 'MEDICAL', label: 'Critical Medical / Trauma' },
                    { id: 'COLLAPSE', label: 'Structure Collapse' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, emergencyType: item.id }))}
                      className={`p-3 text-left rounded-xl border text-xs font-bold transition-all ${
                        formData.emergencyType === item.id
                          ? 'border-red-500 bg-red-950/60 text-white ring-2 ring-red-500'
                          : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location & GPS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Location & GPS Coordinates <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleCaptureGps(true)}
                    disabled={locating}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-900/50 hover:bg-red-800/60 text-red-200 border border-red-700/80 rounded-lg text-xs font-bold transition-colors"
                  >
                    {locating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Acquiring GPS...</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-3.5 h-3.5" />
                        <span>Refresh GPS</span>
                      </>
                    )}
                  </button>
                </div>

                {gpsCaptured && (
                  <div className="p-2.5 bg-emerald-950/50 border border-emerald-600 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>
                      GPS Locked: {formData.latitude}, {formData.longitude}
                    </span>
                  </div>
                )}

                {gpsError && (
                  <p className="text-xs text-amber-400 bg-amber-950/50 p-2.5 rounded-lg border border-amber-800">
                    {gpsError}
                  </p>
                )}

                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="locationText"
                    placeholder="Enter landmarks, building number, street, or floor..."
                    value={formData.locationText}
                    onChange={handleFormChange}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Your Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="contactName"
                      placeholder="Full Name"
                      value={formData.contactName}
                      onChange={handleFormChange}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="contactPhone"
                      placeholder="+91 98765 43210"
                      value={formData.contactPhone}
                      onChange={handleFormChange}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Number of people in danger */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  People in Danger / Trapped
                </label>
                <input
                  type="number"
                  name="peopleCount"
                  min="1"
                  max="1000"
                  value={formData.peopleCount}
                  onChange={handleFormChange}
                  className="w-full sm:w-40 px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Brief Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Emergency Situation Details (Brief)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Water rising rapidly to first floor, elderly person with heart condition requires immediate rescue boat..."
                  value={formData.description}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || submissionComplete}
                  className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-base sm:text-lg tracking-wider uppercase transition-all shadow-lg shadow-red-900/60 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <AlertOctagon className="w-6 h-6 animate-bounce" />
                  <span>SEND SOS EMERGENCY SIGNAL</span>
                </button>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  Sending an SOS dispatches highest-priority alerts to disaster emergency squads.
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Confirmation Modal */}
        {isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border-2 border-red-600 rounded-2xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl">
              <div className="w-16 h-16 bg-red-600/20 text-red-500 border border-red-600/40 rounded-full flex items-center justify-center mx-auto">
                <AlertOctagon className="w-9 h-9 animate-pulse" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-extrabold text-white">
                  Confirm SOS Emergency Signal?
                </h3>
                <p className="text-xs text-slate-300">
                  Are you sure you want to send an SOS emergency signal? This will trigger an
                  immediate highest-priority dispatch notification to disaster management
                  teams.
                </p>
              </div>

              {/* Summary */}
              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 text-xs space-y-1 text-slate-300">
                <p>
                  <strong className="text-white">Caller:</strong> {formData.contactName} (
                  {formData.contactPhone})
                </p>
                <p>
                  <strong className="text-white">Location:</strong>{' '}
                  {formData.locationText || `${formData.latitude}, ${formData.longitude}`}
                </p>
                <p>
                  <strong className="text-white">Trapped/In Danger:</strong>{' '}
                  {formData.peopleCount} person(s)
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-red-400">
                <input
                  type="checkbox"
                  id="confirmCheck"
                  checked={confirmedRisk}
                  onChange={(e) => setConfirmedRisk(e.target.checked)}
                  className="rounded border-red-600 text-red-600 focus:ring-red-500 bg-slate-950"
                />
                <label htmlFor="confirmCheck" className="cursor-pointer select-none">
                  I confirm this is an authentic life or property safety emergency.
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsConfirmOpen(false)}
                  className="w-1/2 py-2.5 px-4 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting || !confirmedRisk}
                  onClick={handleConfirmSOS}
                  className="w-1/2 py-2.5 px-4 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <span>CONFIRM & TRANSMIT</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSPage;
