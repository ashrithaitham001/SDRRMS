import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  FileText,
  Users,
  Heart,
  Package,
  Bell,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, formatCurrency, formatRelativeTime } from '../utils/formatters';
import { REQUEST_PRIORITIES, REQUEST_STATUSES } from '../utils/constants';

const CHART_COLORS = ['#0F766E', '#2563EB', '#D97706', '#DC2626', '#7C3AED', '#059669', '#0891B2', '#E11D48'];

const getPriorityBadge = (priority) => {
  const p = REQUEST_PRIORITIES.find((item) => item.value === priority);
  const colorClass = p?.color || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
      {p?.label || priority || 'Normal'}
    </span>
  );
};

const getStatusBadge = (status) => {
  const s = REQUEST_STATUSES.find((item) => item.value === status);
  const colorClass = s?.color || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {s?.label || status || 'Unknown'}
    </span>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await dashboardService.getStats();
      const data = response?.data || response;
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      setError(err?.message || 'Failed to load dashboard statistics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <LoadingSpinner size="lg" message="Loading disaster relief dashboard..." />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-600" />
          <h2 className="text-lg font-bold">Failed to Load Dashboard</h2>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            onClick={() => fetchDashboardData(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // Fallback defaults supporting backend DTO keys
  const activeDisasters = stats?.totalActiveDisasters ?? stats?.activeDisasters ?? (Array.isArray(stats?.activeDisasters) ? stats.activeDisasters.length : 0);
  const pendingRequests = stats?.totalPendingRequests ?? stats?.pendingRequests ?? 0;
  const criticalRequests = stats?.totalCriticalRequests ?? stats?.criticalRequests ?? 0;
  const totalVolunteers = stats?.totalVolunteers ?? 0;
  const availableVolunteers = stats?.availableVolunteers ?? 0;
  const activeMissions = stats?.activeMissions ?? 0;
  const totalResources = stats?.totalResources ?? 0;
  const lowStockResources = stats?.lowStockResources ?? 0;
  const totalDonations = stats?.totalDonations ?? stats?.totalDonationsReceived ?? 0;
  const donationsReceived = stats?.totalDonationsReceived ?? stats?.donationsReceived ?? 0;
  const activeAlerts = stats?.activeAlerts ?? 0;
  const recentRequests = Array.isArray(stats?.recentRequests) ? stats.recentRequests : [];
  const recentAlerts = Array.isArray(stats?.recentAlerts) ? stats.recentAlerts : [];

  // Transform Category Data for Chart (handles both Object map: { FOOD_WATER: 1 } and Array: [{ category: 'FOOD_WATER', count: 1 }])
  const categoryData = Array.isArray(stats?.requestsByCategory)
    ? stats.requestsByCategory.map((item) => ({
        name: (item._id || item.category || item.name || 'Other').replace(/_/g, ' '),
        count: item.count || item.total || 0,
      }))
    : (stats?.requestsByCategory && typeof stats.requestsByCategory === 'object')
    ? Object.entries(stats.requestsByCategory).map(([key, value]) => ({
        name: key.replace(/_/g, ' '),
        count: Number(value) || 0,
      }))
    : [];

  // Transform Status Data for Pie Chart (handles both Object map and Array)
  const statusData = Array.isArray(stats?.requestsByStatus)
    ? stats.requestsByStatus.map((item) => ({
        name: (item._id || item.status || item.name || 'Unknown').replace(/_/g, ' '),
        value: item.count || item.total || 0,
      }))
    : (stats?.requestsByStatus && typeof stats.requestsByStatus === 'object')
    ? Object.entries(stats.requestsByStatus).map(([key, value]) => ({
        name: key.replace(/_/g, ' '),
        value: Number(value) || 0,
      }))
    : [];

  // Donation chart data (handles both Object map and Array)
  const donationData = Array.isArray(stats?.donationsByStatus)
    ? stats.donationsByStatus.map((item) => ({
        status: (item._id || item.status || 'Received').replace(/_/g, ' '),
        amount: item.totalAmount || item.amount || 0,
        count: item.count || 0,
      }))
    : (stats?.donationsByStatus && typeof stats.donationsByStatus === 'object')
    ? Object.entries(stats.donationsByStatus).map(([key, value]) => ({
        status: key.replace(/_/g, ' '),
        amount: Number(value) || 0,
        count: Number(value) || 0,
      }))
    : [
        {
          status: 'Collected',
          amount: donationsReceived || 0,
          count: totalDonations || 0,
        },
      ];

  const userName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Greeting & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {userName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time disaster overview, emergency alerts, relief distribution, and field operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 hover:text-teal-700 transition disabled:opacity-60"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-teal-600' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <Link
            to="/requests/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-700 rounded-lg shadow hover:bg-teal-800 transition"
          >
            <FileText className="w-4 h-4" />
            <span>New Request</span>
          </Link>
        </div>
      </div>

      {/* Critical alerts banner if critical requests or active alerts exist */}
      {(criticalRequests > 0 || activeAlerts > 0) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5 flex items-start gap-4">
          <div className="p-2.5 bg-rose-100 rounded-lg text-rose-700 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-rose-900">Immediate Action Attention</h3>
            <p className="text-xs sm:text-sm text-rose-800 mt-0.5">
              There are currently <span className="font-semibold">{criticalRequests}</span> critical priority request(s) and{' '}
              <span className="font-semibold">{activeAlerts}</span> active disaster broadcast alert(s) requiring coordination.
            </p>
          </div>
          <Link
            to="/alerts"
            className="shrink-0 text-xs sm:text-sm font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1 self-center"
          >
            View Alerts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Active Disasters"
          value={activeDisasters}
          icon={AlertTriangle}
          iconColor="amber"
          subtitle="Monitored incidents"
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          icon={FileText}
          iconColor="blue"
          subtitle={criticalRequests > 0 ? `${criticalRequests} Critical` : 'Awaiting triage'}
        />
        <StatCard
          title="Available Volunteers"
          value={availableVolunteers}
          icon={Users}
          iconColor="teal"
          subtitle={`${totalVolunteers} registered`}
        />
        <StatCard
          title="Total Donations"
          value={formatCurrency(donationsReceived)}
          icon={Heart}
          iconColor="purple"
          subtitle={`${totalDonations} contributions`}
        />
        <StatCard
          title="Available Resources"
          value={totalResources}
          icon={Package}
          iconColor="emerald"
          subtitle={lowStockResources > 0 ? `${lowStockResources} Low Stock` : 'Adequate supply'}
        />
        <StatCard
          title="Critical Alerts"
          value={activeAlerts}
          icon={Bell}
          iconColor="red"
          subtitle="Active notifications"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests by Category */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Requests by Category</h2>
              <p className="text-xs text-slate-500">Distribution of aid requirements</p>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#0F766E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No categorical request data available
              </div>
            )}
          </div>
        </div>

        {/* Request Status Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Request Status Distribution</h2>
              <p className="text-xs text-slate-500">Fulfillment lifecycle progress</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64 w-full">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No status breakdown available
              </div>
            )}
          </div>
        </div>

        {/* Donations Summary Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Donation Overview</h2>
              <p className="text-xs text-slate-500">Fund inflow & relief contributions</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64 w-full">
            {donationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donationData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="status" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Amount']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#F8FAFC', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="amount" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No donation distribution available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables and Side Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Relief Requests Table (2 cols on large screen) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Relief Requests</h2>
              <p className="text-xs text-slate-500">Latest aid appeals logged into the system</p>
            </div>
            <Link
              to="/requests"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            {recentRequests.length > 0 ? (
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3">Category / Title</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRequests.slice(0, 5).map((req) => {
                    const reqId = req._id || req.id;
                    return (
                      <tr key={reqId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <Link
                            to={`/requests/${reqId}`}
                            className="font-medium text-slate-900 hover:text-teal-700 block truncate max-w-xs"
                          >
                            {req.category?.replace(/_/g, ' ') || 'Relief Appeal'}
                          </Link>
                          <span className="text-xs text-slate-400 truncate block max-w-xs">
                            {req.description || req.affectedPeople ? `${req.affectedPeople || 1} people affected` : 'Urgent support needed'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          <div className="flex items-center gap-1 max-w-[140px] truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{req.locationAddress || req.location?.address || req.location?.district || req.address || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getPriorityBadge(req.priority)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getStatusBadge(req.status)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs text-slate-400 whitespace-nowrap">
                          {formatRelativeTime(req.createdAt) || formatDate(req.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-sm text-slate-400">
                No recent relief requests found.
              </div>
            )}
          </div>
        </div>

        {/* Active Emergency Alerts Column */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-600" /> Active Emergency Alerts
              </h2>
              <p className="text-xs text-slate-500">Live disaster notifications and advisories</p>
            </div>
            <Link
              to="/alerts"
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              All Alerts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[380px]">
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert) => {
                const alertId = alert._id || alert.id;
                const severity = alert.severity?.toUpperCase() || 'INFO';
                const severityStyle =
                  severity === 'CRITICAL' || severity === 'HIGH'
                    ? 'border-red-200 bg-red-50/70 text-red-900'
                    : severity === 'MODERATE' || severity === 'MEDIUM'
                    ? 'border-amber-200 bg-amber-50/70 text-amber-900'
                    : 'border-blue-200 bg-blue-50/70 text-blue-900';

                return (
                  <div
                    key={alertId}
                    className={`rounded-lg border p-3.5 transition-all hover:shadow-sm ${severityStyle}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider">{alert.title}</h4>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider bg-white/80 shrink-0">
                        {severity}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs line-clamp-2 opacity-90">{alert.message || alert.description}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] opacity-75">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.affectedArea || alert.area || alert.district || 'All Regions'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(alert.createdAt || alert.publishedAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-sm text-slate-400">
                No active emergency alerts at this moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
