import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Compass,
  User,
  Phone,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Send,
  Loader2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES
} from '../../utils/constants';
import { requestService } from '../../services/requestService';
import { useAuth } from '../../contexts/AuthContext';

export const SubmitRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'FOOD_WATER',
    priority: 'MEDIUM',
    contactName: user?.name || user?.fullName || '',
    contactPhone: user?.phone || '',
    locationText: '',
    latitude: '',
    longitude: '',
    peopleCount: 1,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Success modal / card state
  const [submissionResult, setSubmissionResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Auto-fill user contact info if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        contactName: prev.contactName || user.name || user.fullName || '',
        contactPhone: prev.contactPhone || user.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({
        ...prev,
        location: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setLocating(true);
    setLocationSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          locationText:
            prev.locationText || `GPS Coordinates: ${lat}, ${lng}`,
        }));

        setLocating(false);
        setLocationSuccess(true);
        setTimeout(() => setLocationSuccess(false), 3000);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
        let errorMsg = 'Could not retrieve your location.';
        if (err.code === 1) {
          errorMsg = 'Location permission was denied. Please enter manually.';
        } else if (err.code === 2) {
          errorMsg = 'Location information is unavailable.';
        } else if (err.code === 3) {
          errorMsg = 'Location request timed out.';
        }
        setErrors((prev) => ({ ...prev, location: errorMsg }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title or brief summary is required.';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title should be at least 5 characters long.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide details of what assistance is required.';
    } else if (formData.description.trim().length < 15) {
      newErrors.description = 'Description should provide at least 15 characters of detail.';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a relief category.';
    }

    if (!formData.priority) {
      newErrors.priority = 'Please select a priority level.';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact person name is required.';
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone number is required.';
    } else if (!/^[0-9+() -]{7,15}$/.test(formData.contactPhone.trim())) {
      newErrors.contactPhone = 'Please provide a valid contact phone number.';
    }

    if (!formData.locationText.trim() && (!formData.latitude || !formData.longitude)) {
      newErrors.locationText = 'Please provide an address or capture GPS coordinates.';
    }

    if (formData.latitude && isNaN(Number(formData.latitude))) {
      newErrors.latitude = 'Latitude must be a valid decimal number.';
    }

    if (formData.longitude && isNaN(Number(formData.longitude))) {
      newErrors.longitude = 'Longitude must be a valid decimal number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        contactName: formData.contactName.trim(),
        contactPhone: formData.contactPhone.trim(),
        locationText: formData.locationText.trim(),
        address: formData.locationText.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        peopleCount: parseInt(formData.peopleCount, 10) || 1,
      };

      const response = await requestService.submitRequest(payload);
      const resultData = response?.data || response;

      setSubmissionResult({
        trackingNumber:
          resultData?.trackingNumber ||
          resultData?.tracking_number ||
          `REQ-${resultData?.id || Math.floor(100000 + Math.random() * 900000)}`,
        id: resultData?.id || resultData?._id,
        ...payload,
      });
    } catch (err) {
      console.error('Request submission error:', err);
      setErrors({
        submit:
          err?.message ||
          'Failed to submit relief request. Please verify connection and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTracking = () => {
    if (submissionResult?.trackingNumber) {
      navigator.clipboard.writeText(submissionResult.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetForm = () => {
    setSubmissionResult(null);
    setFormData({
      title: '',
      description: '',
      category: 'FOOD_WATER',
      priority: 'MEDIUM',
      contactName: user?.name || user?.fullName || '',
      contactPhone: user?.phone || '',
      locationText: '',
      latitude: '',
      longitude: '',
      peopleCount: 1,
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/requests"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Relief Requests</span>
          </Link>
        </div>

        {/* Success Confirmation View */}
        {submissionResult ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Relief Request Submitted Successfully!
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto">
                Your request has been logged into the SDRRMS dispatch network. Emergency
                coordinators and volunteer networks in your district will be notified.
              </p>
            </div>

            {/* Tracking Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-md mx-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Your Tracking Reference Number
              </span>
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-teal-800 tracking-wider">
                  {submissionResult.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors"
                  title="Copy tracking code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Keep this code safe to check real-time status updates and delivery logs.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Submit Another Request
              </button>

              {submissionResult.id ? (
                <button
                  type="button"
                  onClick={() => navigate(`/requests/${submissionResult.id}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-sm"
                >
                  <span>View Request Details</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/requests')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-sm"
                >
                  <span>Go to Requests List</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Main Submission Form */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8"
          >
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Submit Relief Request
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Please provide accurate details regarding the required relief items, affected
                people, and reachable contact information.
              </p>
            </div>

            {/* Error Banner */}
            {errors.submit && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold">Submission Failed</p>
                  <p className="mt-0.5">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Section 1: Request Overview */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <span>Request Details</span>
                </h2>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title / Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Urgent drinking water and baby food needed at Community Hall"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                    errors.title ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-rose-600">{errors.title}</p>
                )}
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Relief Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    {REQUEST_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-xs text-rose-600">{errors.category}</p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Urgency / Priority <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    {REQUEST_PRIORITIES.map((pri) => (
                      <option key={pri.value} value={pri.value}>
                        {pri.label} Priority
                      </option>
                    ))}
                  </select>
                  {errors.priority && (
                    <p className="mt-1 text-xs text-rose-600">{errors.priority}</p>
                  )}
                </div>
              </div>

              {/* People Count */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estimated Number of Affected Persons
                </label>
                <input
                  type="number"
                  name="peopleCount"
                  min="1"
                  max="10000"
                  value={formData.peopleCount}
                  onChange={handleChange}
                  className="w-full sm:w-48 px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Detailed Needs & Circumstances <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Specify quantities required, vulnerable individuals (infants, elderly, injured), or special instructions for relief volunteers..."
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                    errors.description ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-700" />
                  <span>Contact Information</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Person Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="contactName"
                      placeholder="Full Name"
                      value={formData.contactName}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                        errors.contactName ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.contactName && (
                    <p className="mt-1 text-xs text-rose-600">{errors.contactName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="contactPhone"
                      placeholder="+91 98765 43210"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                        errors.contactPhone ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.contactPhone && (
                    <p className="mt-1 text-xs text-rose-600">{errors.contactPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Location Details */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-700" />
                  <span>Location & GPS</span>
                </h2>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50"
                >
                  {locating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting GPS...</span>
                    </>
                  ) : locationSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>GPS Captured!</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-3.5 h-3.5" />
                      <span>Get GPS Location</span>
                    </>
                  )}
                </button>
              </div>

              {errors.location && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {errors.location}
                </p>
              )}

              {/* Location Address / Landmarks */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address or Landmark <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="locationText"
                    placeholder="e.g. Near St. Mary Church, Ward 4, Riverside Road"
                    value={formData.locationText}
                    onChange={handleChange}
                    className={`w-full pl-9 pr-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 ${
                      errors.locationText ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.locationText && (
                  <p className="mt-1 text-xs text-rose-600">{errors.locationText}</p>
                )}
              </div>

              {/* Coordinates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Latitude (decimal)
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    placeholder="e.g. 19.0760"
                    value={formData.latitude}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                  />
                  {errors.latitude && (
                    <p className="mt-1 text-xs text-rose-600">{errors.latitude}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Longitude (decimal)
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    placeholder="e.g. 72.8777"
                    value={formData.longitude}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                  />
                  {errors.longitude && (
                    <p className="mt-1 text-xs text-rose-600">{errors.longitude}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/requests')}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Relief Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubmitRequestPage;
