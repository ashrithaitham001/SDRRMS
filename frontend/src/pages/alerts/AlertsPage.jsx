import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Radio, 
  CheckCheck,
  Megaphone,
  AlertCircle
} from 'lucide-react';
import { alertService } from '../../services/alertService';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ROLES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const ALERT_SEVERITIES = [
  { value: 'LOW', label: 'Low - Advisory', color: 'bg-slate-100 text-slate-700' },
  { value: 'MEDIUM', label: 'Medium - Watch', color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: 'High - Warning', color: 'bg-amber-100 text-amber-800' },
  { value: 'CRITICAL', label: 'Critical - Emergency Evacuation', color: 'bg-red-100 text-red-800' },
];

export const AlertsPage = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'HIGH',
    affectedArea: '',
    expiresAt: '',
  });

  const canManage = user?.role === ROLES.ADMIN || user?.role === ROLES.GOV_OFFICIAL;

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await alertService.getAllAlerts();
      const list = Array.isArray(res) ? res : (res?.data || res?.alerts || []);
      setAlerts(list);
    } catch (err) {
      setError(err?.message || 'Failed to load emergency alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        severity: formData.severity,
        affectedArea: formData.affectedArea.trim(),
        ...(formData.expiresAt ? { expiresAt: new Date(formData.expiresAt).toISOString() } : {}),
      };
      await alertService.publishAlert(payload);
      setSuccessMsg('Emergency alert broadcasted successfully');
      setIsModalOpen(false);
      setFormData({
        title: '',
        message: '',
        severity: 'HIGH',
        affectedArea: '',
        expiresAt: '',
      });
      fetchAlerts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to publish alert.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await alertService.updateStatus(id, newStatus);
      setSuccessMsg(`Alert status marked as ${newStatus}`);
      fetchAlerts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.message || 'Failed to update alert status.');
    }
  };

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchSearch =
        !searchQuery ||
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.affectedArea?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSeverity = !severityFilter || a.severity === severityFilter;
      const matchStatus = !statusFilter || a.status === statusFilter;

      return matchSearch && matchSeverity && matchStatus;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter]);

  // Active alerts for banner at top
  const activeAlerts = useMemo(() => {
    return alerts.filter(
      (a) => a.status === 'ACTIVE' || a.status === 'PUBLISHED' || (!a.status && a.severity === 'CRITICAL')
    );
  }, [alerts]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
                Emergency Alerts & Bulletins
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">
              Real-time early warnings, severe weather notices, and evacuation bulletins.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              <Megaphone className="h-4 w-4" />
              Broadcast Alert
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

        {/* Active Alerts Prominent Showcase */}
        {activeAlerts.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
              <Radio className="h-4 w-4 animate-pulse" />
              Live Emergency Advisories ({activeAlerts.length})
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {activeAlerts.slice(0, 4).map((alert) => {
                const isCritical = alert.severity === 'CRITICAL';
                return (
                  <div
                    key={alert.id}
                    className={`relative rounded-xl border p-5 shadow-sm transition ${
                      isCritical
                        ? 'border-red-300 bg-red-50/70 text-red-950'
                        : 'border-amber-300 bg-amber-50/60 text-amber-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert
                          className={`h-5 w-5 flex-shrink-0 ${
                            isCritical ? 'text-red-600 animate-bounce' : 'text-amber-600'
                          }`}
                        />
                        <h3 className="font-bold text-base leading-snug">{alert.title}</h3>
                      </div>
                      <StatusBadge status={alert.severity} size="sm" />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed opacity-90">{alert.message}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-black/10 pt-3 text-xs opacity-75">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{alert.affectedArea || 'Statewide Area'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Issued {formatDate(alert.createdAt || alert.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert by keyword, region, or advisory text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#E2E8F0] py-2 pl-9 pr-4 text-sm text-[#0F172A] placeholder-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="">All Severities</option>
                {ALERT_SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
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
              <option value="ACTIVE">ACTIVE</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>
        </div>

        {/* All Alerts List */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-white py-16">
              <LoadingSpinner message="Loading bulletins and alerts..." />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-12 text-center shadow-sm">
              <Bell className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-2 text-sm font-semibold text-[#0F172A]">No alerts recorded</h3>
              <p className="mt-1 text-sm text-[#64748B]">
                {alerts.length === 0
                  ? 'There are currently no active emergency alerts broadcasted.'
                  : 'No alerts match your filter selection.'}
              </p>
            </div>
          ) : (
            filteredAlerts.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.severity} />
                    <h3 className="text-base font-bold text-[#0F172A]">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status || 'ACTIVE'} size="sm" />
                    {canManage && item.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'RESOLVED')}
                        className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition"
                      >
                        <CheckCheck className="h-3 w-3" />
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-sm text-[#0F172A] leading-relaxed">{item.message}</p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#64748B] border-t border-[#E2E8F0] pt-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-[#0F172A]">{item.affectedArea || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Broadcasted {formatDate(item.createdAt || item.publishedAt)}</span>
                  </div>
                  {item.expiresAt && (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>Expires: {formatDate(item.expiresAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Broadcast Alert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-teal-700" />
                <h2 className="text-lg font-bold text-[#0F172A]">Broadcast Emergency Alert</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Alert Title *
                </label>
                <input
                  type="text"
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Flash Flood Evacuation Notice - Ward 12"
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Severity Level *
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleFormChange}
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    {ALERT_SEVERITIES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#64748B]">
                    Affected Area / Region *
                  </label>
                  <input
                    type="text"
                    required
                    name="affectedArea"
                    value={formData.affectedArea}
                    onChange={handleFormChange}
                    placeholder="e.g. Coastal Puri & Cuttack Outer"
                    className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Advisory Message & Instructions *
                </label>
                <textarea
                  rows={4}
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleFormChange}
                  placeholder="Provide precise emergency steps, nearest shelter points, emergency hotline, and safety advice..."
                  className="mt-1 w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#64748B]">
                  Valid Until / Expiration (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleFormChange}
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
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition"
                >
                  {submitting && <LoadingSpinner size="sm" />}
                  Publish Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
