import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Package, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  Edit3, 
  X,
  User,
  Layers
} from 'lucide-react';
import { donationService } from '../../services/donationService';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ROLES } from '../../utils/constants';
import { formatDate, formatCurrency } from '../../utils/formatters';

const DONATION_STATUSES = ['PENDING', 'RECEIVED', 'ALLOCATED', 'REJECTED'];

export const DonationsPage = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Admin/Gov toggle: All vs My
  const isDonorOnly = user?.role === ROLES.DONOR;
  const canManageAll = user?.role === ROLES.ADMIN || user?.role === ROLES.GOV_OFFICIAL;
  const [viewScope, setViewScope] = useState(canManageAll ? 'all' : 'my');

  // Status update modal for admin/gov
  const [statusModalDonation, setStatusModalDonation] = useState(null);
  const [newStatus, setNewStatus] = useState('RECEIVED');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (canManageAll && viewScope === 'all') {
        res = await donationService.getAllDonations();
      } else {
        res = await donationService.getMyDonations();
      }
      const list = Array.isArray(res) ? res : (res?.data || res?.donations || []);
      setDonations(list);
    } catch (err) {
      setError(err?.message || 'Failed to load donations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [viewScope]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalDonation) return;
    setUpdatingStatus(true);
    setError(null);
    try {
      await donationService.updateStatus(statusModalDonation.id, newStatus, statusNote);
      setSuccessMsg(`Donation status updated to ${newStatus}`);
      setStatusModalDonation(null);
      setStatusNote('');
      fetchDonations();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to update donation status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const donorName = d.donorName || d.donor?.name || d.donorEmail || '';
      const ref = d.referenceNumber || d.reference || d.id || '';
      const itemDesc = d.itemDescription || d.description || '';

      const matchSearch =
        !searchQuery ||
        String(ref).toLowerCase().includes(searchQuery.toLowerCase()) ||
        donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemDesc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = !typeFilter || d.type === typeFilter;
      const matchStatus = !statusFilter || d.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [donations, searchQuery, typeFilter, statusFilter]);

  // Aggregate stats
  const totalMonetary = useMemo(() => {
    return donations
      .filter((d) => d.type === 'MONETARY' && (d.status === 'RECEIVED' || d.status === 'ALLOCATED'))
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [donations]);

  const totalMaterial = useMemo(() => {
    return donations.filter((d) => d.type === 'MATERIAL').length;
  }, [donations]);

  const pendingCount = useMemo(() => {
    return donations.filter((d) => d.status === 'PENDING').length;
  }, [donations]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
              Relief Donations
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Track financial contributions and material aid packages supporting disaster victims.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canManageAll && (
              <div className="flex rounded-lg border border-[#E2E8F0] bg-white p-1">
                <button
                  onClick={() => setViewScope('all')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    viewScope === 'all'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  All Donations
                </button>
                <button
                  onClick={() => setViewScope('my')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    viewScope === 'my'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  My Donations
                </button>
              </div>
            )}
            <Link
              to="/donations/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              New Donation
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
                  Verified Funds
                </p>
                <p className="mt-1 text-2xl font-bold text-teal-700">
                  {formatCurrency(totalMonetary)}
                </p>
              </div>
              <div className="rounded-lg bg-teal-50 p-2.5 text-teal-700">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
                  Material Shipments
                </p>
                <p className="mt-1 text-2xl font-bold text-[#0F172A]">{totalMaterial}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">
                  Pending Verification
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
                <Clock className="h-5 w-5" />
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
              placeholder="Search reference, donor name or material item..."
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
                <option value="MONETARY">Monetary</option>
                <option value="MATERIAL">Material / Goods</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="">All Statuses</option>
              {DONATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Donations Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading donations list..." />
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="py-16 text-center">
              <Heart className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-semibold text-[#0F172A]">No donations found</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                {donations.length === 0
                  ? 'No donation records recorded yet.'
                  : 'No donations match your filter selection.'}
              </p>
              <div className="mt-4">
                <Link
                  to="/donations/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  <Plus className="h-4 w-4" />
                  Make a Donation
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E2E8F0] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Reference</th>
                    <th scope="col" className="px-6 py-3.5">Donor</th>
                    <th scope="col" className="px-6 py-3.5">Type</th>
                    <th scope="col" className="px-6 py-3.5">Amount / Quantity</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Date</th>
                    {canManageAll && <th scope="col" className="px-6 py-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] bg-white">
                  {filteredDonations.map((item) => {
                    const isMonetary = item.type === 'MONETARY';
                    const donorName = item.donorName || item.donor?.name || item.donorEmail || 'Anonymous Donor';
                    const ref = item.referenceNumber || item.reference || `DON-${String(item.id).padStart(5, '0')}`;
                    return (
                      <tr key={item.id} className="transition hover:bg-slate-50/75">
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-teal-700">
                          {ref}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#0F172A]">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="font-medium text-[#0F172A]">{donorName}</p>
                              {item.purpose && (
                                <p className="text-xs text-[#64748B] line-clamp-1">{item.purpose}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isMonetary
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {isMonetary ? <DollarSign className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                            {item.type}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#0F172A]">
                          {isMonetary ? (
                            <span className="font-semibold text-[#0F172A]">
                              {formatCurrency(item.amount)}
                            </span>
                          ) : (
                            <div>
                              <span className="font-medium">{item.itemDescription || 'Material Aid'}</span>
                              {item.quantity && (
                                <span className="ml-1 text-xs text-[#64748B]">
                                  ({item.quantity} {item.unit || 'units'})
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-[#64748B]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{formatDate(item.createdAt || item.date)}</span>
                          </div>
                        </td>
                        {canManageAll && (
                          <td className="whitespace-nowrap px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setStatusModalDonation(item);
                                setNewStatus(item.status || 'RECEIVED');
                                setStatusNote('');
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition"
                            >
                              <Edit3 className="h-3 w-3" />
                              Update Status
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

      {/* Admin/Gov Update Status Modal */}
      {statusModalDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">Update Donation Status</h2>
              <button
                onClick={() => setStatusModalDonation(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-[#64748B]">Reference</p>
                <p className="font-mono text-sm font-semibold text-[#0F172A]">
                  {statusModalDonation.referenceNumber || statusModalDonation.reference || statusModalDonation.id}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  New Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  {DONATION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Status Note / Allocation Detail
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Bank transfer verified. Allocated to shelter relief."
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setStatusModalDonation(null)}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition"
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

export default DonationsPage;
