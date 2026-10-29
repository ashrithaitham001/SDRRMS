import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertCircle,
  Clock,
  MapPin,
  Eye,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  XCircle,
  FileText
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import {
  REQUEST_CATEGORIES,
  REQUEST_PRIORITIES,
  REQUEST_STATUSES,
  ROLES
} from '../../utils/constants';
import { requestService } from '../../services/requestService';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

export const ReliefRequestsPage = ({ myOnly = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isCitizen = user?.role === ROLES.CITIZEN;
  const isManagerOrAdmin = [ROLES.ADMIN, ROLES.GOV_OFFICIAL, ROLES.NGO_REPRESENTATIVE].includes(user?.role);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [viewScope, setViewScope] = useState(isCitizen || myOnly ? 'my' : 'all'); // 'all' or 'my'

  // Data & loading states
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (myOnly) {
      setViewScope('my');
    }
  }, [myOnly]);

  // Load requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];
      if (isCitizen || viewScope === 'my') {
        const response = await requestService.getMyRequests();
        data = Array.isArray(response)
          ? response
          : response?.data || response?.requests || response?.content || [];
      } else {
        const params = {};
        if (selectedStatus) params.status = selectedStatus;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedPriority) params.priority = selectedPriority;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const response = await requestService.searchRequests(params);
        data = Array.isArray(response)
          ? response
          : response?.data || response?.requests || response?.content || [];
      }

      setRequests(data);
    } catch (err) {
      console.error('Error fetching relief requests:', err);
      setError(err?.message || 'Failed to load relief requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isCitizen, viewScope, selectedStatus, selectedCategory, selectedPriority, searchQuery]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Client-side filtering when searching within cached myRequests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = req.title?.toLowerCase().includes(query);
        const matchesDesc = req.description?.toLowerCase().includes(query);
        const matchesLocation = (req.location || req.locationText || req.address || '')
          .toLowerCase()
          .includes(query);
        const matchesTracking = (req.trackingNumber || req.id || '')
          .toString()
          .toLowerCase()
          .includes(query);

        if (!matchesTitle && !matchesDesc && !matchesLocation && !matchesTracking) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus && req.status !== selectedStatus) {
        return false;
      }

      // Category filter
      if (selectedCategory && req.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority && req.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [requests, searchQuery, selectedStatus, selectedCategory, selectedPriority]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRequests.slice(startIndex, startIndex + pageSize);
  }, [filteredRequests, currentPage, pageSize]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedCategory, selectedPriority, viewScope]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedCategory('');
    setSelectedPriority('');
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedStatus || selectedCategory || selectedPriority
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Relief Requests
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isCitizen
                ? 'Track your submitted requests and monitor assistance progress in real time.'
                : 'Manage, verify, and coordinate emergency relief operations across disaster zones.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
              title="Refresh requests"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/requests/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Request</span>
            </Link>
          </div>
        </div>

        {/* View Scope Toggle for Admin/NGO/Gov */}
        {isManagerOrAdmin && (
          <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setViewScope('all')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewScope === 'all'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Requests
            </button>
            <button
              type="button"
              onClick={() => setViewScope('my')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewScope === 'my'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Submitted Requests
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-4 lg:col-span-5">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by ID, title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Select */}
            <div className="md:col-span-3 lg:col-span-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filter by status"
                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white text-slate-700"
              >
                <option value="">All Statuses</option>
                {REQUEST_STATUSES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div className="md:col-span-3 lg:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by category"
                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white text-slate-700"
              >
                <option value="">All Categories</option>
                {REQUEST_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Select */}
            <div className="md:col-span-2 lg:col-span-2">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                aria-label="Filter by priority"
                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white text-slate-700"
              >
                <option value="">All Priorities</option>
                {REQUEST_PRIORITIES.map((pri) => (
                  <option key={pri.value} value={pri.value}>
                    {pri.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter summary & clear */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-700" />
                <span>
                  Filtering active: Showing <strong>{filteredRequests.length}</strong> of{' '}
                  <strong>{requests.length}</strong> records
                </span>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-teal-700 hover:text-teal-900 font-medium underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">Unable to load requests</p>
              <p className="mt-0.5">{error}</p>
            </div>
            <button
              onClick={fetchRequests}
              className="px-3 py-1 bg-white border border-rose-300 text-rose-700 text-xs font-semibold rounded-md hover:bg-rose-100 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table / List View */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-9 h-9 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-500">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">No requests found</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'No relief requests match the specified search query or filters. Try adjusting your criteria.'
                  : 'There are currently no relief requests in this section.'}
              </p>
              <div className="mt-5 flex justify-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  to="/requests/new"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
                >
                  Create New Request
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 sm:px-6">
                      Tracking / ID
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Title & Description
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Category
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Priority
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Location
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right sm:pr-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm">
                  {paginatedRequests.map((req) => {
                    const tracking = req.trackingNumber || `REQ-${req.id}`;
                    const categoryObj = REQUEST_CATEGORIES.find(
                      (c) => c.value === req.category
                    );
                    const categoryLabel = categoryObj?.label || req.category || 'General Relief';
                    const locationText =
                      req.locationText ||
                      req.location ||
                      req.address ||
                      (req.latitude && req.longitude
                        ? `${Number(req.latitude).toFixed(3)}, ${Number(req.longitude).toFixed(3)}`
                        : 'Unknown Location');

                    return (
                      <tr
                        key={req.id || tracking}
                        onClick={() => navigate(`/requests/${req.id || req.trackingNumber}`)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        {/* ID / Tracking */}
                        <td className="px-4 py-4 sm:px-6 whitespace-nowrap">
                          <span className="font-mono text-xs font-bold text-teal-800 group-hover:underline">
                            {tracking}
                          </span>
                        </td>

                        {/* Title & Description */}
                        <td className="px-4 py-4 max-w-xs sm:max-w-sm">
                          <div className="font-medium text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                            {req.title || 'Relief Assistance Request'}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            {req.description || 'No detailed description provided.'}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                            {categoryLabel}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={req.priority} size="sm" />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={req.status} size="sm" />
                        </td>

                        {/* Location */}
                        <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600 max-w-[160px] truncate">
                          <div className="flex items-center gap-1.5" title={locationText}>
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{locationText}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{formatDate(req.createdAt || req.date)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 whitespace-nowrap text-right text-xs font-medium sm:pr-6">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/requests/${req.id || req.trackingNumber}`);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100/80 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {!loading && filteredRequests.length > 0 && (
            <div className="px-4 py-3 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Showing{' '}
                <span className="font-semibold text-slate-800">
                  {(currentPage - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-800">
                  {Math.min(currentPage * pageSize, filteredRequests.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-800">
                  {filteredRequests.length}
                </span>{' '}
                results
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="px-2 font-medium text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReliefRequestsPage;
