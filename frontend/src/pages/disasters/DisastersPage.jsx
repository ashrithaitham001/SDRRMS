import React, { useState, useEffect, useMemo } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle2, 
  Flame, 
  ShieldAlert,
  Users
} from 'lucide-react';
import { disasterService } from '../../services/disasterService';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ROLES, DISASTER_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const SEVERITY_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: 'High', color: 'bg-amber-100 text-amber-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

const DISASTER_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CONTAINED', label: 'Contained' },
  { value: 'RESOLVED', label: 'Resolved' },
];

export const DisastersPage = () => {
  const { user } = useAuth();
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDisaster, setEditingDisaster] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: DISASTER_TYPES[0]?.value || 'FLOOD',
    severity: 'MEDIUM',
    status: 'ACTIVE',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    affectedArea: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const canManage = user?.role === ROLES.ADMIN || user?.role === ROLES.GOV_OFFICIAL;

  const fetchDisasters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await disasterService.getAllDisasters();
      const list = Array.isArray(res) ? res : (res?.data || res?.disasters || []);
      setDisasters(list);
    } catch (err) {
      setError(err?.message || 'Failed to load disasters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  const openCreateModal = () => {
    setEditingDisaster(null);
    setFormData({
      name: '',
      type: DISASTER_TYPES[0]?.value || 'FLOOD',
      severity: 'MEDIUM',
      status: 'ACTIVE',
      description: '',
      location: '',
      latitude: '',
      longitude: '',
      affectedArea: '',
      startDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingDisaster(item);
    setFormData({
      name: item.name || '',
      type: item.type || DISASTER_TYPES[0]?.value || 'FLOOD',
      severity: item.severity || 'MEDIUM',
      status: item.status || 'ACTIVE',
      description: item.description || '',
      location: item.location || '',
      latitude: item.latitude !== undefined && item.latitude !== null ? item.latitude : '',
      longitude: item.longitude !== undefined && item.longitude !== null ? item.longitude : '',
      affectedArea: item.affectedArea || '',
      startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
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

    const payload = {
      ...formData,
      latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
    };

    try {
      if (editingDisaster) {
        await disasterService.updateDisaster(editingDisaster.id, payload);
        setSuccessMsg('Disaster record updated successfully');
      } else {
        await disasterService.createDisaster(payload);
        setSuccessMsg('New disaster event created successfully');
      }
      setIsModalOpen(false);
      fetchDisasters();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Operation failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await disasterService.deleteDisaster(id);
      setSuccessMsg('Disaster deleted successfully');
      setDeleteConfirmId(null);
      fetchDisasters();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to delete disaster.');
      setDeleteConfirmId(null);
    }
  };

  const filteredDisasters = useMemo(() => {
    return disasters.filter((d) => {
      const matchSearch = 
        !searchQuery ||
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.affectedArea?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = !typeFilter || d.type === typeFilter;
      const matchSeverity = !severityFilter || d.severity === severityFilter;

      return matchSearch && matchType && matchSeverity;
    });
  }, [disasters, searchQuery, typeFilter, severityFilter]);

  // Quick stats
  const activeCount = disasters.filter((d) => d.status === 'ACTIVE').length;
  const criticalCount = disasters.filter((d) => d.severity === 'CRITICAL' && d.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Disaster Management
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Track ongoing disasters, assess severity, and mobilize emergency response.
            </p>
          </div>
          {canManage && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Add Disaster
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Total Incidents</p>
                <p className="mt-1 text-2xl font-bold text-[#0F172A]">{disasters.length}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2.5 text-slate-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Active Disasters</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{activeCount}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
                <Flame className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Critical Status</p>
                <p className="mt-1 text-2xl font-bold text-rose-600">{criticalCount}</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
          </div>
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
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, location, or affected area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#E2E8F0] py-2 pl-9 pr-4 text-sm text-[#0F172A] placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="">All Types</option>
                {DISASTER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="">All Severities</option>
              {SEVERITY_LEVELS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading disaster reports..." />
            </div>
          ) : filteredDisasters.length === 0 ? (
            <div className="py-16 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-semibold text-[#0F172A]">No disasters found</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                {disasters.length === 0
                  ? 'No disaster events have been reported yet.'
                  : 'No disasters match the current search and filter criteria.'}
              </p>
              {canManage && disasters.length === 0 && (
                <button
                  onClick={openCreateModal}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  <Plus className="h-4 w-4" />
                  Report First Disaster
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E2E8F0] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Disaster</th>
                    <th scope="col" className="px-6 py-3.5">Type</th>
                    <th scope="col" className="px-6 py-3.5">Severity</th>
                    <th scope="col" className="px-6 py-3.5">Location</th>
                    <th scope="col" className="px-6 py-3.5">Affected Area</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Start Date</th>
                    {canManage && <th scope="col" className="px-6 py-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] bg-white">
                  {filteredDisasters.map((item) => {
                    const typeObj = DISASTER_TYPES.find((t) => t.value === item.type);
                    const typeLabel = typeObj ? typeObj.label : item.type;
                    return (
                      <tr key={item.id} className="transition hover:bg-slate-50/75">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#0F172A]">{item.name}</div>
                          {item.description && (
                            <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-[#64748B]">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#0F172A]">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {typeLabel}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge status={item.severity} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#64748B]">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.location || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#64748B]">
                          {item.affectedArea || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#64748B]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{formatDate(item.startDate)}</span>
                          </div>
                        </td>
                        {canManage && (
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-700 transition"
                                title="Edit Disaster"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(item.id)}
                                className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-rose-600 transition"
                                title="Delete Disaster"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">
                {editingDisaster ? 'Edit Disaster Incident' : 'Report New Disaster'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Disaster Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Coastal Storm Surge"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Disaster Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    {DISASTER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Severity *
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    {SEVERITY_LEVELS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    {DISASTER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Location / City *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="e.g. Cuttack, Odisha"
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Affected Area / Sub-district
                  </label>
                  <input
                    type="text"
                    name="affectedArea"
                    value={formData.affectedArea}
                    onChange={handleFormChange}
                    placeholder="e.g. Sector 4 & Riverbank"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Latitude (opt)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleFormChange}
                    placeholder="e.g. 20.4625"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Longitude (opt)
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleFormChange}
                    placeholder="e.g. 85.8830"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Incident Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Provide incident situation details, immediate needs, or emergency context..."
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
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
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition"
                >
                  {submitting && <LoadingSpinner size="sm" />}
                  {editingDisaster ? 'Save Changes' : 'Create Disaster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#0F172A]">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-[#64748B]">
              Are you sure you want to delete this disaster record? This action cannot be undone.
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisastersPage;
