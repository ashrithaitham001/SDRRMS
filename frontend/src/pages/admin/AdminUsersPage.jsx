import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  X, 
  UserCheck, 
  UserX,
  Mail,
  Shield,
  RefreshCw,
  Lock
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ROLES, ROLE_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

export const AdminUsersPage = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Role edit modal
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [updatingRole, setUpdatingRole] = useState(false);

  // Toggle active in progress
  const [togglingUserId, setTogglingUserId] = useState(null);

  const isAdmin = user?.role === ROLES.ADMIN;

  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAllUsers();
      const list = Array.isArray(res) ? res : (res?.data || res?.users || []);
      setUsersList(list);
    } catch (err) {
      setError(err?.message || 'Failed to retrieve system user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isAdmin]);

  const handleToggleActive = async (targetUser) => {
    // Prevent admin from deactivating self
    if (targetUser.id === user?.id) {
      setError('You cannot deactivate your own active admin session.');
      return;
    }
    setTogglingUserId(targetUser.id);
    setError(null);
    try {
      await adminService.toggleUserActive(targetUser.id);
      const isCurrentlyActive = targetUser.isActive ?? targetUser.active ?? true;
      setSuccessMsg(
        `User ${targetUser.email} has been ${isCurrentlyActive ? 'deactivated' : 'activated'}.`
      );
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to update user status.');
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUserForRole || !newRole) return;
    setUpdatingRole(true);
    setError(null);
    try {
      await adminService.updateUserRole(selectedUserForRole.id, newRole);
      setSuccessMsg(`Role for ${selectedUserForRole.email} updated to ${ROLE_LABELS[newRole] || newRole}`);
      setSelectedUserForRole(null);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to update user role.');
    } finally {
      setUpdatingRole(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const name = u.name || '';
      const email = u.email || '';
      const matchSearch =
        !searchQuery ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole = !roleFilter || u.role === roleFilter;

      const isActive = u.isActive !== undefined ? u.isActive : (u.active !== undefined ? u.active : true);
      const matchStatus =
        !statusFilter ||
        (statusFilter === 'ACTIVE' && isActive) ||
        (statusFilter === 'INACTIVE' && !isActive);

      return matchSearch && matchRole && matchStatus;
    });
  }, [usersList, searchQuery, roleFilter, statusFilter]);

  // Access check
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#0F172A]">Access Restricted</h2>
          <p className="mt-2 text-sm text-[#64748B]">
            This section is exclusively restricted to System Administrators. You do not have sufficient permissions to view or modify user accounts.
          </p>
        </div>
      </div>
    );
  }

  // Summary counts
  const totalCount = usersList.length;
  const activeCount = usersList.filter((u) => (u.isActive ?? u.active ?? true)).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-teal-700" />
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                User Management & Access Control
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              Administer registered users, manage platform roles, and grant emergency operations access.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Directory
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Total Registered</p>
                <p className="mt-1 text-2xl font-bold text-[#0F172A]">{totalCount}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2.5 text-slate-700">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Active Accounts</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">{activeCount}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">Suspended / Inactive</p>
                <p className="mt-1 text-2xl font-bold text-rose-600">{inactiveCount}</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2.5 text-rose-600">
                <UserX className="h-5 w-5" />
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
              placeholder="Search user by name or email address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#E2E8F0] py-2 pl-9 pr-4 text-sm text-[#0F172A] placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="">All Roles</option>
                {Object.entries(ROLES).map(([key, val]) => (
                  <option key={val} value={val}>
                    {ROLE_LABELS[val] || key}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="">All Account Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          {loading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading user directory..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-semibold text-[#0F172A]">No users found</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                {usersList.length === 0
                  ? 'No user records retrieved from the database.'
                  : 'No users matching your active filters.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E2E8F0] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">User Details</th>
                    <th scope="col" className="px-6 py-3.5">Email</th>
                    <th scope="col" className="px-6 py-3.5">Assigned Role</th>
                    <th scope="col" className="px-6 py-3.5">Account Status</th>
                    <th scope="col" className="px-6 py-3.5">Registered</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] bg-white">
                  {filteredUsers.map((item) => {
                    const isActive = item.isActive !== undefined ? item.isActive : (item.active !== undefined ? item.active : true);
                    const isSelf = item.id === user?.id;

                    return (
                      <tr key={item.id} className="transition hover:bg-slate-50/75">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800 text-sm">
                              {(item.name || item.email || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                                {item.name || 'Anonymous User'}
                                {isSelf && (
                                  <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
                                    You
                                  </span>
                                )}
                              </div>
                              {item.phone && (
                                <p className="text-xs text-[#64748B]">{item.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-[#0F172A]">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{item.email}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
                            <Shield className="h-3 w-3" />
                            {ROLE_LABELS[item.role] || item.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isActive ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-[#64748B]">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedUserForRole(item);
                                setNewRole(item.role);
                              }}
                              className="rounded-lg border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-[#0F172A] hover:bg-slate-50 transition"
                            >
                              Change Role
                            </button>
                            <button
                              onClick={() => handleToggleActive(item)}
                              disabled={isSelf || togglingUserId === item.id}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition disabled:opacity-40 ${
                                isActive
                                  ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                                  : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {togglingUserId === item.id ? (
                                <span className="inline-block animate-spin">⏳</span>
                              ) : isActive ? (
                                'Deactivate'
                              ) : (
                                'Activate'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Role Update Modal */}
      {selectedUserForRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">Update User Role</h2>
              <button
                onClick={() => setSelectedUserForRole(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-[#64748B]">User Account</p>
                <p className="font-semibold text-sm text-[#0F172A]">
                  {selectedUserForRole.name || 'Anonymous User'}
                </p>
                <p className="text-xs font-mono text-slate-500">{selectedUserForRole.email}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Assign Platform Role *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  {Object.entries(ROLES).map(([key, val]) => (
                    <option key={val} value={val}>
                      {ROLE_LABELS[val] || key}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                <span className="font-semibold">Security Notice:</span> Changing this user's role will immediately update their operational permissions across the SDRRMS platform.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setSelectedUserForRole(null)}
                  className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRole}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition"
                >
                  {updatingRole && <LoadingSpinner size="sm" />}
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
