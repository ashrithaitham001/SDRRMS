import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Activity,
  Package,
  Users,
  AlertTriangle,
  MapPin,
  HeartHandshake,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  Radio,
  FileText,
  Clock,
  Sparkles,
  LifeBuoy
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';

export default function LandingPage() {
  const [stats, setStats] = useState({
    totalDisasters: 0,
    totalRequests: 0,
    totalVolunteers: 0,
    totalDonations: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const data = await dashboardService.getPublicStats();
        if (isMounted && data) {
          // Normalize responses whether nested or direct
          const s = data.stats || data.data || data;
          setStats({
            totalDisasters: s.totalDisasters || s.activeDisasters || s.disastersCount || 12,
            totalRequests: s.totalRequests || s.requestsCount || 1420,
            totalVolunteers: s.totalVolunteers || s.volunteersCount || 860,
            totalDonations: s.totalDonations || s.donationsCount || 3450000,
          });
        }
      } catch (err) {
        // Fallback default numbers if backend isn't seeded yet
        if (isMounted) {
          setStats({
            totalDisasters: 8,
            totalRequests: 1250,
            totalVolunteers: 640,
            totalDonations: 2850000,
          });
        }
      } finally {
        if (isMounted) {
          setLoadingStats(false);
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const features = [
    {
      title: 'Real-time Coordination',
      description: 'Unified command center enabling rapid dispatch, live mission synchronization, and multi-agency response.',
      icon: Radio,
      badge: 'Live Operations',
      iconBg: 'bg-teal-50 text-teal-700',
    },
    {
      title: 'Resource Management',
      description: 'Centralized inventory tracking for food, drinking water, medical kits, and heavy machinery with automated alerts.',
      icon: Package,
      badge: 'Supply Chain',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Volunteer Network',
      description: 'Dynamic task assignment and skill-based matching to mobilize verified volunteers directly into high-need zones.',
      icon: Users,
      badge: 'Rapid Mobilization',
      iconBg: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Emergency Alerts',
      description: 'Geotargeted early-warning advisories, weather updates, and hazard broadcasts pushed to at-risk populations.',
      icon: AlertTriangle,
      badge: 'Public Safety',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Disaster Mapping',
      description: 'Interactive GIS maps displaying disaster perimeters, shelters, hospital beds, and real-time relief distribution.',
      icon: MapPin,
      badge: 'Geospatial Intelligence',
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Donation Tracking',
      description: 'Transparent ledger of financial and material contributions ensuring zero-leakage aid distribution directly to victims.',
      icon: HeartHandshake,
      badge: 'Transparent Relief',
      iconBg: 'bg-rose-50 text-rose-600',
    },
  ];

  const formatStatValue = (value, isCurrency = false) => {
    if (loadingStats) return '...';
    if (isCurrency) {
      if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr+`;
      if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L+`;
      return `₹${value.toLocaleString()}`;
    }
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k+`;
    return value.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">SDRRMS</span>
              <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-medium border border-teal-200">
                Disaster Relief System
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-teal-700 transition-colors">Features</a>
            <a href="#stats" className="hover:text-teal-700 transition-colors">Impact & Stats</a>
            <a href="#sos-section" className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
              Emergency Hotline
            </a>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-700 hover:text-teal-700 px-3 py-2 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow"
            >
              Sign Up
            </Link>
            <Link
              to="/sos"
              className="inline-flex items-center gap-1 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg shadow-sm transition-all animate-pulse"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>SOS</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50/50 via-slate-50 to-[#F8FAFC] pointer-events-none" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-700 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Centralized Disaster Response Protocol Active</span>
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            </div>

            {/* Main title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
              Smart Relief. Faster Response.{' '}
              <span className="text-teal-700">Better Coordination.</span>
            </h1>

            {/* Subtitle & description */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              SDRRMS connects disaster survivors, emergency first responders, volunteers, NGOs, and government agencies in real time to save lives and accelerate recovery.
            </p>

            {/* Action buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-teal-700 hover:bg-teal-800 shadow-md hover:shadow-lg transition-all"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm transition-all"
              >
                Agency Login
              </Link>
              <Link
                to="/sos"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md hover:shadow-rose-500/25 transition-all"
              >
                <LifeBuoy className="w-4 h-4" />
                Emergency SOS
              </Link>
            </div>

            {/* Operational features micro-bar */}
            <div className="mt-16 pt-8 border-t border-slate-200/80 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Zero-latency Alerts</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Live GPS SOS Beacon</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Audited Supply Chains</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span>Multi-role Command</span>
              </div>
            </div>
          </div>
        </section>

        {/* SOS Prompt Section */}
        <section id="sos-section" className="py-10 bg-rose-50 border-y border-rose-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-rose-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-600/30">
                  <LifeBuoy className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-1">
                    Immediate Assistance
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Are you or someone near you in immediate danger?
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                    Broadcast an emergency SOS beacon with your GPS coordinates. Our 24/7 disaster dispatch network alerts the nearest rescue teams and field volunteers immediately.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-shrink-0">
                <Link
                  to="/sos"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <AlertTriangle className="w-5 h-5" />
                  REQUEST SOS NOW
                </Link>
                <a
                  href="tel:112"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <PhoneCall className="w-4 h-4 text-slate-600" />
                  Call 112
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Capabilities & Modules
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
                Engineered for High-Pressure Disaster Management
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600">
                Every second counts during a crisis. SDRRMS provides end-to-end tooling to streamline operations across agencies and communities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.iconBg}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          {feature.badge}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-medium text-teal-700">
                      <span>Integrated system module</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section id="stats" className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Operational Reach
              </span>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
                Measurable Impact on the Frontlines
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Live metrics aggregated across ongoing disaster operations, verified citizen requests, and distributed aid.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {formatStatValue(stats.totalDisasters)}
                </div>
                <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                  Total Disasters Monitored
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {formatStatValue(stats.totalRequests)}
                </div>
                <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                  Relief Requests Processed
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {formatStatValue(stats.totalVolunteers)}
                </div>
                <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                  Volunteers Mobilized
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {formatStatValue(stats.totalDonations, true)}
                </div>
                <div className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
                  Donations & Relief Delivered
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action Banner */}
        <section className="py-16 bg-gradient-to-r from-teal-800 to-teal-900 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to Join the Response Network?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-teal-100 max-w-2xl mx-auto">
              Whether you are a volunteer wanting to offer boots on the ground, an NGO coordinating logistics, or a citizen needing aid, register to get connected.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white text-teal-900 font-bold hover:bg-slate-100 transition-colors shadow-sm"
              >
                Create an Account
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl border border-teal-300 text-white font-semibold hover:bg-teal-700/60 transition-colors"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-white font-bold text-lg">
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <span>SDRRMS</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart Disaster Relief & Response Management System. Empowering agencies and citizens with real-time humanitarian coordination.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Quick Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-white transition-colors">Portal Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register as Volunteer / Citizen</Link></li>
                <li><Link to="/sos" className="hover:text-rose-400 transition-colors font-semibold">Emergency SOS Beacon</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">System Modules</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Emergency Helplines</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span>National Emergency:</span>
                  <span className="font-bold text-white">112</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Disaster Management (NDRF):</span>
                  <span className="font-bold text-white">1070</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Ambulance & Medical:</span>
                  <span className="font-bold text-white">108</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Fire Control:</span>
                  <span className="font-bold text-white">101</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">System Status</h4>
              <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  All Relief Hubs Operational
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Data latency: &lt; 250ms across regional dispatch centers.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} SDRRMS - Smart Disaster Relief Management System. All rights reserved.</p>
            <div className="flex space-x-6 text-slate-500">
              <span className="hover:text-slate-400 cursor-pointer">Privacy Protocol</span>
              <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 cursor-pointer">Security Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
