import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  Plus, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ShieldAlert, 
  Search, 
  Filter, 
  User, 
  Building2,
  Send,
  Calendar
} from 'lucide-react';
import { medicalService } from '../../services/medicalService';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ROLES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const URGENCY_LEVELS = [
  { value: 'CRITICAL', label: 'Critical / Life-Threatening', color: 'bg-red-100 text-red-800' },
  { value: 'HIGH', label: 'High / Severe Injury', color: 'bg-amber-100 text-amber-800' },
  { value: 'MEDIUM', label: 'Medium / Stable Medical Need', color: 'bg-blue-100 text-blue-800' },
  { value: 'LOW', label: 'Low / Non-Emergency Transit', color: 'bg-slate-100 text-slate-700' },
];

const AMBULANCE_STATUSES = ['PENDING', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];

export const AmbulanceRequestsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const isStaff = user?.role === ROLES.ADMIN || user?.role === ROLES.HOSPITAL_REP;

  // View toggle for staff: All vs My
  const [viewScope, setViewScope] = useState(isStaff ? 'all' : 'my');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Request Ambulance Modal (for Citizen or Staff)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({
    pickupLocation: '',
    urgency: 'HIGH',
    contactNumber: user?.phone || '',
    patientName: user?.name || '',
    notes: '',
  });

  // Status Update Modal (for Staff)
  const [statusModalReq, setStatusModalReq] = useState(null);
  const [newStatus, setNewStatus] = useState('DISPATCHED');
  const [assignedHospitalId, setAssignedHospitalId] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (isStaff && viewScope === 'all') {
        res = await medicalService.getAllAmbulanceRequests();
      } else {
        res = await medicalService.getMyAmbulanceRequests();
      }
      const list = Array.isArray(res) ? res : (res?.data || res?.requests || []);
      setRequests(list);
    } catch (err) {
      setError(err?.message || 'Failed to load ambulance dispatch requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalsList = async () => {
    if (isStaff) {
      try {
        const res = await medicalService.getAllHospitals();
        const list = Array.isArray(res) ? res : (res?.data || res?.hospitals || []);
        setHospitals(list);
      } catch {
        // quiet fallback
      }
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchHospitalsList();
  }, [viewScope, isStaff]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRequest(true);
    setError(null);
    try {
      await medicalService.requestAmbulance(requestForm);
      setSuccessMsg('Ambulance request dispatched to emergency response control!');
      setIsRequestModalOpen(false);
      setRequestForm({
        pickupLocation: '',
        urgency: 'HIGH',
        contactNumber: user?.phone || '',
        patientName: user?.name || '',
        notes: '',
      });
      fetchRequests();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to submit ambulance request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalReq) return;
    setUpdatingStatus(true);
    setError(null);
    try {
      await medicalService.updateAmbulanceStatus(
        statusModalReq.id,
        newStatus,
        assignedHospitalId || null,
        statusNotes
      );
      setSuccessMsg(`Ambulance request status updated to ${newStatus}`);
      setStatusModalReq(null);
      setStatusNotes('');
      fetchRequests();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to update request status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const patient = r.patientName || r.contactName || r.user?.name || '';
      const location = r.pickupLocation || '';
      const phone = r.contactNumber || r.phone || '';

      const matchSearch =
        !searchQuery ||
        patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery);

      const matchUrgency = !urgencyFilter || r.urgency === urgencyFilter;
      const matchStatus = !statusFilter || r.status === statusFilter;

      return matchSearch && matchUrgency && matchStatus;
    });
  }, [requests, searchQuery, urgencyFilter, statusFilter]);

  const pendingDispatches = requests.filter((r) => r.status === 'PENDING').length;
  const criticalRequests = requests.filter((r) => r.urgency === 'CRITICAL' && r.status !== 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-teal-700" />
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                Ambulance Dispatch & Emergency Transit
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              Immediate medical transport requests and real-time paramedic coordination.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isStaff && (
              <div className="flex rounded-lg border border-[#E2E8F0] bg-white p-1">
                <button
                  onClick={() => setViewScope('all')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    viewScope === 'all'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  All Dispatches
                </button>
                <button
                  onClick={() => setViewScope('my')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    viewScope === 'my'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  My Requests
                </button>
              </div>
            )}
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              Request Ambulance
            </button>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Pending Dispatch</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{pendingDispatches}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Critical Life-Threatening</p>
                <p className="mt-1 text-2xl font-bold text-rose-600">{criticalRequests}</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Total Requests</p>
                <p className="mt-1 text-2xl font-bold text-[#0F172A]">{requests.length}</p>
              </div>
              <div className="rounded-lg bg-teal-50 p-2.5 text-teal-700">
                <Truck className="h-5 w-5" />
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
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600" />
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
              placeholder="Search by patient, pickup address or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#E2E8F0] py-2 pl-9 pr-4 text-sm text-[#0F172A] placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="">All Urgencies</option>
                {URGENCY_LEVELS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="">All Statuses</option>
              {AMBULANCE_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading ambulance dispatch records..." />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center">
              <Truck className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-semibold text-[#0F172A]">No ambulance requests found</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                {requests.length === 0
                  ? 'No ambulance transports currently scheduled or requested.'
                  : 'No requests matched your query.'}
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <Plus className="h-4 w-4" />
                  Request Emergency Transport
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E2E8F0] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Patient / Contact</th>
                    <th scope="col" className="px-6 py-3.5">Pickup Location</th>
                    <th scope="col" className="px-6 py-3.5">Urgency</th>
                    <th scope="col" className="px-6 py-3.5">Assigned Hospital</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Requested At</th>
                    {isStaff && <th scope="col" className="px-6 py-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] bg-white">
                  {filteredRequests.map((req) => {
                    const patientName = req.patientName || req.contactName || req.user?.name || 'Emergency Patient';
                    const phone = req.contactNumber || req.phone || 'N/A';
                    return (
                      <tr key={req.id} className="transition hover:bg-slate-50/75">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#0F172A]">{patientName}</div>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-[#64748B]">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{phone}</span>
                          </div>
                          {req.notes && (
                            <p className="mt-1 line-clamp-1 max-w-xs text-xs text-slate-500 italic">
                              "{req.notes}"
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#0F172A]">
                          <div className="flex items-start gap-1.5 max-w-xs">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400 mt-0.5" />
                            <span className="text-xs leading-relaxed">{req.pickupLocation}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge status={req.urgency} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-[#64748B]">
                          {req.hospital?.name || req.hospitalName || 'Pending Assignment'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge status={req.status} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-[#64748B]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{formatDate(req.createdAt || req.requestedAt)}</span>
                          </div>
                        </td>
                        {isStaff && (
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setStatusModalReq(req);
                                setNewStatus(req.status || 'DISPATCHED');
                                setAssignedHospitalId(req.hospitalId || req.hospital?.id || '');
                                setStatusNotes(req.dispatchNotes || '');
                              }}
                              className="rounded-lg border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition"
                            >
                              Dispatch / Update
                            </button>
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

      {/* Citizen / Staff Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-bold text-[#0F172A]">Request Emergency Ambulance</h2>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Exact Pickup Location / Landmarks *
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.pickupLocation}
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, pickupLocation: e.target.value }))
                  }
                  placeholder="e.g. Near Govt High School, Old Bus Stand, Block B"
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Urgency Level *
                  </label>
                  <select
                    value={requestForm.urgency}
                    onChange={(e) =>
                      setRequestForm((prev) => ({ ...prev, urgency: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  >
                    {URGENCY_LEVELS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={requestForm.contactNumber}
                    onChange={(e) =>
                      setRequestForm((prev) => ({ ...prev, contactNumber: e.target.value }))
                    }
                    placeholder="+91 9876543210"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Patient Name / Identity
                </label>
                <input
                  type="text"
                  value={requestForm.patientName}
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, patientName: e.target.value }))
                  }
                  placeholder="Patient name or description"
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Patient Condition & Symptoms
                </label>
                <textarea
                  rows={3}
                  value={requestForm.notes}
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="e.g. Unconscious, severe bleeding, elderly patient with shortness of breath..."
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {submittingRequest && <LoadingSpinner size="sm" />}
                  Dispatch Ambulance Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Update Status Modal */}
      {statusModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">Update Ambulance Status</h2>
              <button
                onClick={() => setStatusModalReq(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-[#64748B]">Patient / Location</p>
                <p className="text-sm font-bold text-[#0F172A]">
                  {statusModalReq.patientName || 'Unknown Patient'}
                </p>
                <p className="text-xs text-slate-600">{statusModalReq.pickupLocation}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Update Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  {AMBULANCE_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Assign Responding Hospital (Optional)
                </label>
                <select
                  value={assignedHospitalId}
                  onChange={(e) => setAssignedHospitalId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  <option value="">-- Choose Hospital --</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.availableBeds ?? 0} beds available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Dispatch Notes / Paramedic Team
                </label>
                <textarea
                  rows={3}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Ambulance Unit #4 dispatched with 2 paramedics. ETA 12 mins."
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setStatusModalReq(null)}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition"
                >
                  {updatingStatus && <LoadingSpinner size="sm" />}
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceRequestsPage;
