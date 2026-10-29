import React, { useState, useEffect, useMemo } from 'react';
import {
  Target,
  Plus,
  Search,
  Filter,
  UserPlus,
  RefreshCw,
  MapPin,
  Flame,
  Users,
  X,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { missionService } from '../../services/missionService';
import { disasterService } from '../../services/disasterService';
import { volunteerService } from '../../services/volunteerService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';

const MISSION_STATUSES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const MissionsPage = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMissionForAssign, setSelectedMissionForAssign] = useState(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    location: '',
    disasterId: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Assign volunteer form state
  const [assignForm, setAssignForm] = useState({
    volunteerId: '',
    notes: '',
  });
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState(null);

  const canManage = [
    ROLES.ADMIN,
    ROLES.GOV_OFFICIAL,
    ROLES.NGO_REPRESENTATIVE,
  ].includes(user?.role);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [missionsRes, disastersRes, volunteersRes] = await Promise.allSettled([
        missionService.getAllMissions(),
        disasterService.getActiveDisasters(),
        volunteerService.getAllVolunteers(),
      ]);

      if (missionsRes.status === 'fulfilled') {
        const mData =
          missionsRes.value?.missions ||
          missionsRes.value?.data ||
          (Array.isArray(missionsRes.value) ? missionsRes.value : []);
        setMissions(mData);
      } else {
        throw missionsRes.reason;
      }

      if (disastersRes.status === 'fulfilled') {
        const dData =
          disastersRes.value?.disasters ||
          disastersRes.value?.data ||
          (Array.isArray(disastersRes.value) ? disastersRes.value : []);
        setDisasters(dData);
      }

      if (volunteersRes.status === 'fulfilled') {
        const vData =
          volunteersRes.value?.volunteers ||
          volunteersRes.value?.data ||
          (Array.isArray(volunteersRes.value) ? volunteersRes.value : []);
        setVolunteers(vData);
      }
    } catch (err) {
      console.error('Failed to load mission dashboard data:', err);
      setError(err?.message || 'Failed to load missions data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleStatusChange = async (missionId, newStatus) => {
    try {
      await missionService.updateStatus(missionId, newStatus);
      setMissions((prev) =>
        prev.map((m) => {
          const id = m.id || m._id;
          if (id === missionId) {
            return { ...m, status: newStatus };
          }
          return m;
        })
      );
    } catch (err) {
      alert(`Failed to update status: ${err?.message || 'Error'}`);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      setCreateError('Mission title is required');
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError(null);
      const res = await missionService.createMission({
        title: createForm.title.trim(),
        name: createForm.title.trim(),
        description: createForm.description.trim(),
        location: createForm.location.trim(),
        disasterId: createForm.disasterId || null,
        status: 'PLANNED',
      });

      const newMission = res?.mission || res?.data || res;
      if (newMission && (newMission.id || newMission._id)) {
        setMissions((prev) => [newMission, ...prev]);
      } else {
        await fetchAllData();
      }

      setShowCreateModal(false);
      setCreateForm({ title: '', description: '', location: '', disasterId: '' });
    } catch (err) {
      console.error('Error creating mission:', err);
      setCreateError(err?.message || 'Failed to create mission.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenAssign = (mission) => {
    setSelectedMissionForAssign(mission);
    setAssignForm({ volunteerId: volunteers[0]?.id || volunteers[0]?._id || '', notes: '' });
    setAssignError(null);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.volunteerId) {
      setAssignError('Please select a volunteer');
      return;
    }

    const missionId = selectedMissionForAssign?.id || selectedMissionForAssign?._id;
    try {
      setAssignLoading(true);
      setAssignError(null);
      await missionService.assignVolunteer(
        missionId,
        assignForm.volunteerId,
        assignForm.notes
      );

      // Increment local count or update assignments list
      setMissions((prev) =>
        prev.map((m) => {
          const mId = m.id || m._id;
          if (mId === missionId) {
            const currentVolunteers = m.volunteers || m.assignments || [];
            const assignedVol = volunteers.find(
              (v) => (v.id || v._id) === assignForm.volunteerId
            );
            return {
              ...m,
              volunteers: [...currentVolunteers, assignedVol || { id: assignForm.volunteerId }],
              volunteersCount: (m.volunteersCount || currentVolunteers.length) + 1,
            };
          }
          return m;
        })
      );

      setShowAssignModal(false);
    } catch (err) {
      console.error('Failed to assign volunteer:', err);
      setAssignError(err?.message || 'Failed to assign volunteer.');
    } finally {
      setAssignLoading(false);
    }
  };

  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      const title = m.title || m.name || '';
      const desc = m.description || '';
      const status = (m.status || 'PLANNED').toUpperCase();
      const disasterName = m.disaster?.title || m.disasterName || '';

      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        title.toLowerCase().includes(searchLower) ||
        desc.toLowerCase().includes(searchLower) ||
        disasterName.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [missions, statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Emergency Relief Missions
          </h1>
          <p className="text-sm text-slate-500">
            Coordinate ground rescue operations, food distribution drives, and medical deployments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" />
            Refresh
          </button>

          {canManage && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition"
            >
              <Plus className="h-4 w-4" />
              Create Mission
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search missions by name, location, or associated disaster..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          >
            <option value="ALL">All Mission Statuses</option>
            {MISSION_STATUSES.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner message="Loading disaster missions..." />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm font-medium text-rose-800">{error}</p>
          <button
            onClick={fetchAllData}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredMissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <Target className="h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No missions found</h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm || statusFilter !== 'ALL'
              ? 'No missions match your selected filters.'
              : 'Launch and organize your first relief mission.'}
          </p>
          {canManage && !searchTerm && statusFilter === 'ALL' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              <Plus className="h-4 w-4" />
              Create Relief Mission
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Mission Name</th>
                  <th scope="col" className="px-6 py-4">Description</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Disaster</th>
                  <th scope="col" className="px-6 py-4">Volunteers Assigned</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMissions.map((mission) => {
                  const id = mission.id || mission._id;
                  const title = mission.title || mission.name || 'Relief Mission';
                  const desc = mission.description || '—';
                  const status = (mission.status || 'PLANNED').toUpperCase();
                  const disasterName =
                    mission.disaster?.title ||
                    mission.disasterName ||
                    disasters.find((d) => (d.id || d._id) === mission.disasterId)?.title ||
                    'General Relief';

                  const assignedCount =
                    mission.volunteersCount !== undefined
                      ? mission.volunteersCount
                      : Array.isArray(mission.volunteers)
                      ? mission.volunteers.length
                      : Array.isArray(mission.assignments)
                      ? mission.assignments.length
                      : 0;

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{title}</div>
                        {mission.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {mission.location}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {desc}
                      </td>
                      <td className="px-6 py-4">
                        {canManage ? (
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(id, e.target.value)}
                            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                          >
                            {MISSION_STATUSES.map((st) => (
                              <option key={st.value} value={st.value}>
                                {st.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={status} />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                          <Flame className="h-3 w-3 text-amber-600" />
                          {disasterName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span>{assignedCount} volunteer{assignedCount === 1 ? '' : 's'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {canManage && (
                          <button
                            onClick={() => handleOpenAssign(mission)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
                          >
                            <UserPlus className="h-3.5 w-3.5 text-teal-700" />
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
            Showing {filteredMissions.length} of {missions.length} relief missions
          </div>
        </div>
      )}

      {/* Create Mission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-teal-700" />
                <h3 className="text-lg font-bold text-slate-900">
                  Create Relief Mission
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Mission Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flood Evacuation Ward 7, Medical Camp Sector 2"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, title: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Target Disaster Incident
                </label>
                <select
                  value={createForm.disasterId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, disasterId: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  <option value="">General Emergency Relief</option>
                  {disasters.map((d) => (
                    <option key={d.id || d._id} value={d.id || d._id}>
                      {d.title || d.name} ({d.type || 'Disaster'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Field Location / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Riverside District, Relief Center 4"
                  value={createForm.location}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, location: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Description & Task Scope
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide objective, equipment instructions, safety precautions..."
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {createLoading ? 'Creating...' : 'Create Mission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Volunteer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-teal-700" />
                <h3 className="text-lg font-bold text-slate-900">
                  Assign Volunteer
                </h3>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Mission:</span>{' '}
              {selectedMissionForAssign?.title || selectedMissionForAssign?.name}
            </div>

            {assignError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Select Registered Volunteer <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assignForm.volunteerId}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, volunteerId: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  <option value="">-- Choose Volunteer --</option>
                  {volunteers.map((vol) => {
                    const id = vol.id || vol._id;
                    const name =
                      vol.name ||
                      vol.user?.name ||
                      `${vol.firstName || ''} ${vol.lastName || ''}`.trim() ||
                      'Volunteer';
                    const skills = Array.isArray(vol.skills)
                      ? vol.skills.join(', ')
                      : vol.skills || '';
                    return (
                      <option key={id} value={id}>
                        {name} {skills ? `(${skills})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Assignment Instructions / Notes
                </label>
                <textarea
                  rows="3"
                  placeholder="Specific role, assembly point, contact person..."
                  value={assignForm.notes}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, notes: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignLoading || !assignForm.volunteerId}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {assignLoading ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionsPage;
