import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  RefreshCw,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { volunteerService } from '../../services/volunteerService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

const ASSIGNMENT_STATUS_OPTIONS = [
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const VolunteerAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Status notes modal/inline input state
  const [activeNotes, setActiveNotes] = useState({});

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await volunteerService.getMyAssignments();
      const data =
        res?.assignments ||
        res?.data ||
        (Array.isArray(res) ? res : []);
      setAssignments(data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError(err?.message || 'Failed to retrieve your task assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleStatusChange = async (assignmentId, newStatus) => {
    try {
      setUpdatingId(assignmentId);
      const note = activeNotes[assignmentId] || '';
      await volunteerService.updateAssignmentStatus(assignmentId, newStatus, note);
      
      // Update local state
      setAssignments((prev) =>
        prev.map((item) => {
          const id = item.id || item._id;
          if (id === assignmentId) {
            return {
              ...item,
              status: newStatus,
              notes: note || item.notes,
            };
          }
          return item;
        })
      );
    } catch (err) {
      alert(`Failed to update status: ${err?.message || 'An error occurred'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNoteChange = (assignmentId, text) => {
    setActiveNotes((prev) => ({ ...prev, [assignmentId]: text }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Mission Assignments
          </h1>
          <p className="text-sm text-slate-500">
            Track and update the status of your assigned rescue tasks and disaster relief missions
          </p>
        </div>

        <button
          onClick={fetchAssignments}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4 text-slate-500" />
          Refresh Assignments
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingSpinner message="Loading your task assignments..." />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="text-sm font-medium text-rose-800">{error}</p>
          <button
            onClick={fetchAssignments}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
          <ClipboardList className="h-12 w-12 text-slate-400 mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No active assignments found
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md">
            You currently have no emergency tasks assigned. Check back once relief coordinators dispatch teams to active disaster zones.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const id = assignment.id || assignment._id;
            const currentStatus = assignment.status || 'ASSIGNED';
            const mission = assignment.mission || {};
            const missionTitle =
              mission.title ||
              mission.name ||
              assignment.taskName ||
              assignment.title ||
              'Relief Task';
            const missionDesc =
              mission.description ||
              assignment.description ||
              'No specific instructions provided.';
            const location =
              mission.location ||
              assignment.location ||
              'Field Location';
            const disasterTitle =
              mission.disaster?.title ||
              mission.disasterName ||
              assignment.disasterName ||
              'Active Disaster';
            const assignedAt = assignment.createdAt || assignment.assignedAt;

            return (
              <div
                key={id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Mission details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200">
                        <ShieldAlert className="h-3 w-3" />
                        {disasterTitle}
                      </span>
                      <StatusBadge status={currentStatus} />
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900">
                      {missionTitle}
                    </h3>

                    <p className="text-sm text-slate-600">
                      {missionDesc}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {location}
                      </span>
                      {assignedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          Assigned: {formatDate(assignedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status update controls */}
                  <div className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 min-w-[280px]">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Update Your Status
                    </label>

                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(id, e.target.value)}
                      disabled={updatingId === id}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 disabled:opacity-50"
                    >
                      {ASSIGNMENT_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Progress notes / remarks..."
                        value={
                          activeNotes[id] !== undefined
                            ? activeNotes[id]
                            : assignment.notes || ''
                        }
                        onChange={(e) => handleNoteChange(id, e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleStatusChange(id, currentStatus)}
                        disabled={updatingId === id}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 hover:text-teal-800 disabled:opacity-50"
                      >
                        <Send className="h-3 w-3" />
                        Save notes
                      </button>
                    </div>

                    {updatingId === id && (
                      <span className="text-xs text-teal-700 animate-pulse font-medium">
                        Updating status...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VolunteerAssignmentsPage;
