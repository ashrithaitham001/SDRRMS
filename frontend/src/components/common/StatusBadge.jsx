import React from 'react';

const statusStyles = {
  // Common & Generic
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INACTIVE: 'bg-slate-100 text-slate-700 border-slate-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  ASSIGNED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ACCEPTED: 'bg-teal-50 text-teal-700 border-teal-200',
  
  // Resource status
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  IN_STOCK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  LOW_STOCK: 'bg-amber-50 text-amber-700 border-amber-200',
  OUT_OF_STOCK: 'bg-rose-50 text-rose-700 border-rose-200',
  DEPLETED: 'bg-rose-50 text-rose-700 border-rose-200',

  // Volunteer verification
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UNVERIFIED: 'bg-amber-50 text-amber-700 border-amber-200',

  // Mission status
  PLANNED: 'bg-slate-100 text-slate-700 border-slate-200',
  ONGOING: 'bg-blue-50 text-blue-700 border-blue-200',
  CLOSED: 'bg-slate-100 text-slate-700 border-slate-200',

  // Priority
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
  CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const StatusBadge = ({ status, text, size = 'sm', className = '' }) => {
  if (!status && !text) return null;
  const rawStatus = (status || text || '').toString().toUpperCase().replace(/[\s-]/g, '_');
  const styleClass = statusStyles[rawStatus] || 'bg-slate-100 text-slate-700 border-slate-200';
  const displayText = text || rawStatus.replace(/_/g, ' ');

  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs font-medium px-2.5 py-1',
    md: 'text-sm font-medium px-3 py-1.5',
  }[size] || 'text-xs font-medium px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase transition-colors ${sizeClasses} ${styleClass} ${className}`}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;
