import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Bed, 
  Truck, 
  Activity, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { medicalService } from '../../services/medicalService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ROLES } from '../../utils/constants';

export const HospitalsPage = () => {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [hasBedsOnly, setHasBedsOnly] = useState(false);
  const [hasAmbulanceOnly, setHasAmbulanceOnly] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    email: '',
    services: '',
    totalBeds: '',
    availableBeds: '',
    icuBeds: '',
    ambulancesAvailable: '',
    latitude: '',
    longitude: '',
  });

  const canManage = user?.role === ROLES.ADMIN || user?.role === ROLES.HOSPITAL_REP;

  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await medicalService.getAllHospitals();
      const list = Array.isArray(res) ? res : (res?.data || res?.hospitals || []);
      setHospitals(list);
    } catch (err) {
      setError(err?.message || 'Failed to load hospitals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const openCreateModal = () => {
    setEditingHospital(null);
    setFormData({
      name: '',
      address: '',
      contactNumber: '',
      email: '',
      services: '',
      totalBeds: '',
      availableBeds: '',
      icuBeds: '',
      ambulancesAvailable: '',
      latitude: '',
      longitude: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (h) => {
    setEditingHospital(h);
    const servicesStr = Array.isArray(h.services) 
      ? h.services.join(', ') 
      : (h.services || '');

    setFormData({
      name: h.name || '',
      address: h.address || '',
      contactNumber: h.contactNumber || h.phone || '',
      email: h.email || '',
      services: servicesStr,
      totalBeds: h.totalBeds !== undefined && h.totalBeds !== null ? h.totalBeds : '',
      availableBeds: h.availableBeds !== undefined && h.availableBeds !== null ? h.availableBeds : '',
      icuBeds: h.icuBeds !== undefined && h.icuBeds !== null ? h.icuBeds : '',
      ambulancesAvailable: h.ambulancesAvailable !== undefined && h.ambulancesAvailable !== null ? h.ambulancesAvailable : '',
      latitude: h.latitude !== undefined && h.latitude !== null ? h.latitude : '',
      longitude: h.longitude !== undefined && h.longitude !== null ? h.longitude : '',
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const servicesArray = formData.services
      ? formData.services.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      contactNumber: formData.contactNumber.trim(),
      email: formData.email.trim(),
      services: servicesArray,
      totalBeds: formData.totalBeds !== '' ? parseInt(formData.totalBeds, 10) : 0,
      availableBeds: formData.availableBeds !== '' ? parseInt(formData.availableBeds, 10) : 0,
      icuBeds: formData.icuBeds !== '' ? parseInt(formData.icuBeds, 10) : 0,
      ambulancesAvailable: formData.ambulancesAvailable !== '' ? parseInt(formData.ambulancesAvailable, 10) : 0,
      latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
    };

    try {
      if (editingHospital) {
        await medicalService.updateHospital(editingHospital.id, payload);
        setSuccessMsg('Hospital record updated successfully');
      } else {
        await medicalService.createHospital(payload);
        setSuccessMsg('Hospital added to emergency directory');
      }
      setIsModalOpen(false);
      fetchHospitals();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to save hospital details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await medicalService.deleteHospital(id);
      setSuccessMsg('Hospital removed from directory');
      setDeleteConfirmId(null);
      fetchHospitals();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to delete hospital.');
      setDeleteConfirmId(null);
    }
  };

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const servicesStr = Array.isArray(h.services) ? h.services.join(' ') : (h.services || '');
      const matchSearch =
        !searchQuery ||
        h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        servicesStr.toLowerCase().includes(searchQuery.toLowerCase());

      const matchBeds = !hasBedsOnly || (h.availableBeds && h.availableBeds > 0);
      const matchAmbulance = !hasAmbulanceOnly || (h.ambulancesAvailable && h.ambulancesAvailable > 0);

      return matchSearch && matchBeds && matchAmbulance;
    });
  }, [hospitals, searchQuery, hasBedsOnly, hasAmbulanceOnly]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Hospital Directory & Medical Centers
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Emergency hospitals, trauma centers, bed capacity and on-call ambulance availability.
            </p>
          </div>
          {canManage && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Add Hospital
            </button>
          )}
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by hospital name, location, or specialized service (e.g. ICU, Trauma)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#E2E8F0] py-2 pl-9 pr-4 text-sm text-[#0F172A] placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] cursor-pointer">
              <input
                type="checkbox"
                checked={hasBedsOnly}
                onChange={(e) => setHasBedsOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
              />
              Beds Available Only
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] cursor-pointer">
              <input
                type="checkbox"
                checked={hasAmbulanceOnly}
                onChange={(e) => setHasAmbulanceOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
              />
              Ambulance Ready
            </label>
          </div>
        </div>

        {/* Hospital Cards Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-white py-16">
              <LoadingSpinner message="Locating hospitals..." />
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-12 text-center shadow-sm">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-semibold text-[#0F172A]">No hospitals found</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                {hospitals.length === 0
                  ? 'No hospitals have been registered in the directory.'
                  : 'No hospital facilities match your criteria.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHospitals.map((h) => {
                const servicesList = Array.isArray(h.services)
                  ? h.services
                  : typeof h.services === 'string'
                  ? h.services.split(',').map((s) => s.trim())
                  : [];

                const availableBeds = h.availableBeds ?? 0;
                const totalBeds = h.totalBeds ?? 0;
                const ambulances = h.ambulancesAvailable ?? 0;

                return (
                  <div
                    key={h.id}
                    className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-lg bg-teal-50 p-2 text-teal-700">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                              {h.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-[#64748B]">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span className="line-clamp-1">{h.address || 'Address on file'}</span>
                            </div>
                          </div>
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(h)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-teal-700"
                              title="Edit Hospital"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(h.id)}
                              className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              title="Delete Hospital"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Capacity Badges */}
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-slate-50 border border-[#E2E8F0] p-2.5">
                          <div className="flex items-center gap-1.5 text-[#64748B]">
                            <Bed className="h-3.5 w-3.5 text-blue-600" />
                            <span>Beds Free</span>
                          </div>
                          <p className="mt-1 font-bold text-[#0F172A]">
                            <span className={availableBeds > 0 ? 'text-emerald-700' : 'text-rose-600'}>
                              {availableBeds}
                            </span>
                            <span className="text-slate-400 font-normal"> / {totalBeds}</span>
                          </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 border border-[#E2E8F0] p-2.5">
                          <div className="flex items-center gap-1.5 text-[#64748B]">
                            <Truck className="h-3.5 w-3.5 text-teal-600" />
                            <span>Ambulances</span>
                          </div>
                          <p className="mt-1 font-bold text-[#0F172A]">
                            <span className={ambulances > 0 ? 'text-teal-700' : 'text-slate-500'}>
                              {ambulances}
                            </span>
                            <span className="text-xs text-slate-400 font-normal"> Ready</span>
                          </p>
                        </div>
                      </div>

                      {/* Services list */}
                      {servicesList.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                            Specialized Services
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {servicesList.map((srv, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                              >
                                {srv}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Contact details */}
                    <div className="mt-5 border-t border-[#E2E8F0] pt-3 text-xs text-[#64748B] space-y-1.5">
                      {(h.contactNumber || h.phone) && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>Emergency Helpline:</span>
                          </div>
                          <a
                            href={`tel:${h.contactNumber || h.phone}`}
                            className="font-semibold text-teal-700 hover:underline"
                          >
                            {h.contactNumber || h.phone}
                          </a>
                        </div>
                      )}
                      {h.email && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>Email:</span>
                          </div>
                          <span className="line-clamp-1">{h.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Hospital Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">
                {editingHospital ? 'Edit Hospital Facility' : 'Register New Hospital'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Hospital / Center Name *
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. City General Trauma Center"
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Street Address & City *
                </label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="e.g. 104 Main Hospital Rd, Sector 3"
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Contact / Emergency Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleFormChange}
                    placeholder="e.g. +91 94370 12345"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Official Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="e.g. emergency@hospital.org"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Medical Services (Comma-separated)
                </label>
                <input
                  type="text"
                  name="services"
                  value={formData.services}
                  onChange={handleFormChange}
                  placeholder="e.g. ICU, Emergency Surgery, Pediatric, Blood Bank, Burn Unit"
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Total Beds
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="totalBeds"
                    value={formData.totalBeds}
                    onChange={handleFormChange}
                    placeholder="100"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Available Beds
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="availableBeds"
                    value={formData.availableBeds}
                    onChange={handleFormChange}
                    placeholder="25"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    ICU Beds
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="icuBeds"
                    value={formData.icuBeds}
                    onChange={handleFormChange}
                    placeholder="8"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Ambulances
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="ambulancesAvailable"
                    value={formData.ambulancesAvailable}
                    onChange={handleFormChange}
                    placeholder="3"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Latitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleFormChange}
                    placeholder="e.g. 20.2961"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Longitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleFormChange}
                    placeholder="e.g. 85.8245"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition"
                >
                  {submitting && <LoadingSpinner size="sm" />}
                  {editingHospital ? 'Save Changes' : 'Register Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#0F172A]">Remove Hospital</h3>
            <p className="mt-2 text-sm text-[#64748B]">
              Are you sure you want to remove this hospital from the emergency directory?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalsPage;
