import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, LayoutDashboard, LifeBuoy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const userRoleLabel = user?.role ? (ROLE_LABELS[user.role] || user.role) : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full text-center">
        {/* Warning Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center shadow-sm mb-6">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Status Code & Header */}
        <span className="text-xs font-bold tracking-widest text-rose-600 uppercase bg-rose-100/60 px-3 py-1 rounded-full">
          403 Forbidden
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Access Restricted
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          You do not possess the required clearance level to view this module. Operations in this sector are restricted to authorized disaster relief personnel.
        </p>

        {/* Current Role Context Card */}
        {user && (
          <div className="mt-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Logged in as</span>
              <span className="text-sm font-bold text-slate-800">{user.fullName || user.email}</span>
            </div>
            {userRoleLabel && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                {userRoleLabel}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            Return to Dashboard
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Emergency SOS notice */}
        <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <LifeBuoy className="w-4 h-4 text-rose-600" />
          <span>Need immediate assistance?</span>
          <Link to="/sos" className="font-semibold text-rose-600 hover:underline">
            Go to SOS Beacon
          </Link>
        </div>
      </div>
    </div>
  );
}
