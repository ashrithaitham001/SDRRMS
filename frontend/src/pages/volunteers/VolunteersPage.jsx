import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Award,
  Phone,
  Mail,
  Filter,
} from 'lucide-react';
import { volunteerService } from '../../services/volunteerService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';

const VolunteersPage = () => {
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, VERIFIED, PENDING
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  const canVerify = [ROLES.ADMIN, ROLES.GOV_OFFICIAL].includes(user?.role);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await volunteerService.getAllVolunteers();
      const data =
        res?.volunteers ||
        res?.data ||
        (Array.isArray(res) ? res : []);
      setVolunteers(data);
    } catch (err) {
      console.error('Failed to fetch volunteers:', err);
      setError(err?.message || 'Failed to load volunteer records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const handleVerify = async (volunteerId, newStatus) => {
    try {
      setActionInProgress(volunteerId);
      await volunteerService.verifyVolunteer(volunteerId, newStatus);
      // Update local state
      setVolunteers((prev) =>
        prev.map((v) => {
          const id = v.id || v._id;
          if (id === volunteerId) {
            return {
              ...v,
              verificationStatus: newStatus,
              isVerified: newStatus === 'VERIFIED',
              status: newStatus,
            };
          }
          return v;
        })
      );
    } catch (err) {
      alert(`Failed to update verification status: ${err?.message || 'Error'}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const getVolunteerSkills = (vol) => {
    if (Array.isArray(vol.skills)) return vol.skills;
    if (typeof vol.skills === 'string') {
      return vol.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((vol) => {
      const name =
        vol.name ||
        vol.user?.name ||
        `${vol.firstName || ''} ${vol.lastName || ''}`.trim() ||
        'Volunteer';
      const email = vol.email || vol.user?.email || '';
      const location = vol.location || vol.city || vol.address || '';
      const skills = getVolunteerSkills(vol).join(' ').toLowerCase();

      // Search match
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        location.toLowerCase().includes(query) ||
        skills.includes(query);

      // Status match
      const rawStatus = (vol.verificationStatus || vol.status || (vol.isVerified ? 'VERIFIED' : 'PENDING')).toUpperCase();
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'VERIFIED' && (rawStatus === 'VERIFIED' || vol.isVerified)) ||
        (statusFilter === 'PENDING' && (rawStatus === 'PENDING' || rawStatus === 'UNVERIFIED' || !vol.isVerified));

      // Availability match
      const isAvail = vol.isAvailable !== false && vol.availability !== 'UNAVAILABLE';
      const matchesAvailability =
        availabilityFilter === 'ALL' ||
        (availabilityFilter === 'AVAILABLE' && isAvail) ||
        (availabilityFilter === 'BUSY' && !isAvail);

      return matchesSearch && matchesStatus && matchesAvailability;
    });
  }, [volunteers, searchTerm, statusFilter, availabilityFilter]);

  const verifiedCount = volunteers.filter(
    (v) => (v.verificationStatus || '').toUpperCase() === 'VERIFIED' || v.isVerified
  ).length;

  const pendingCount = volunteers.length - verifiedCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Volunteer Network
          </h1>
          <p className="text-sm text-slate-500">
            Registered ground volunteers, medical aides, and rescue personnel
          </p>
        </div>

        <button
          onClick={fetchVolunteers}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4 text-slate-500" />
          Refresh Network
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-teal-50 p-3 text-teal-700">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Volunteers</p>
            <p className="text-2xl font-bold text-slate-900">{volunteers.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Verified Personnel</p>
            <p className="text-2xl font-bold text-emerald-600">{verifiedCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
          <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Verification</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search volunteers by name, skills (e.g. First Aid), or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending Verification</option>
            </select>
          </div>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          >
            <option value="ALL">All Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Engaged / Busy</option>
          </select>
        </div>
      </div>

      {/* Volunteer Grid / Directory */}
      {loading ? (
        <LoadingSpinner message="Loading volunteer directory..." />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm font-medium text-rose-800">{error}</p>
          <button
            onClick={fetchVolunteers}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredVolunteers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Users className="h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No volunteers found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVolunteers.map((vol) => {
            const id = vol.id || vol._id;
            const name =
              vol.name ||
              vol.user?.name ||
              `${vol.firstName || ''} ${vol.lastName || ''}`.trim() ||
              'Volunteer';
            const email = vol.email || vol.user?.email || '';
            const phone = vol.phone || vol.user?.phone || '';
            const location = vol.location || vol.city || vol.address || 'Location Unspecified';
            const skills = getVolunteerSkills(vol);
            const isVerified =
              (vol.verificationStatus || vol.status || '').toUpperCase() === 'VERIFIED' ||
              Boolean(vol.isVerified);
            const isAvailable =
              vol.isAvailable !== false &&
              (vol.availability || '').toUpperCase() !== 'BUSY' &&
              (vol.availability || '').toUpperCase() !== 'UNAVAILABLE';

            return (
              <div
                key={id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  {/* Top user header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 leading-tight">
                          {name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {location}
                        </p>
                      </div>
                    </div>

                    <StatusBadge
                      status={isVerified ? 'VERIFIED' : 'PENDING'}
                      text={isVerified ? 'Verified' : 'Pending'}
                    />
                  </div>

                  {/* Contact info */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    {email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{email}</span>
                      </div>
                    )}
                    {phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-slate-400">Availability:</span>
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          isAvailable ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {isAvailable ? 'Available for deployment' : 'Busy / On assignment'}
                      </span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                      Skills & Capabilities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.length > 0 ? (
                        skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                          >
                            <Award className="h-3 w-3 text-slate-500" />
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          No specific skills listed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Actions (Admin/Gov) */}
                {canVerify && (
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                    {!isVerified ? (
                      <button
                        onClick={() => handleVerify(id, 'VERIFIED')}
                        disabled={actionInProgress === id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Verify Volunteer
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerify(id, 'UNVERIFIED')}
                        disabled={actionInProgress === id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 transition"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Revoke Verification
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VolunteersPage;
