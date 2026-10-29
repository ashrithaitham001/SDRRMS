import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Home, LayoutDashboard, ArrowLeft, LifeBuoy, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full text-center">
        {/* Graphical Illustration */}
        <div className="relative mb-6 mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-teal-100/60 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="relative w-28 h-28 rounded-full bg-white border-2 border-teal-200 shadow-sm flex items-center justify-center text-teal-700">
            <Compass className="w-14 h-14" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* 404 Badge */}
        <span className="text-xs font-bold tracking-widest text-teal-800 uppercase bg-teal-100/70 px-3 py-1 rounded-full">
          Error 404 - Sector Unreachable
        </span>

        {/* Message */}
        <h1 className="mt-4 text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Page Not Found
        </h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          The requested coordinate or resource page does not exist or may have been relocated during active crisis dispatching.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </div>

        {/* SOS Anchor */}
        <div className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <LifeBuoy className="w-4 h-4 text-rose-600" />
          <span>Need critical emergency assistance?</span>
          <Link to="/sos" className="font-bold text-rose-600 hover:underline">
            Trigger SOS Beacon
          </Link>
        </div>
      </div>
    </div>
  );
}
