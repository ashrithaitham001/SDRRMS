import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  Settings,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import useAuth from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';
import { notificationService } from '../../services/notificationService';

const getPageTitle = (pathname) => {
  if (pathname === '/dashboard') return 'Dashboard Overview';
  if (pathname === '/requests') return 'Relief Requests';
  if (pathname === '/requests/my') return 'My Relief Requests';
  if (pathname === '/requests/new') return 'Submit Relief Request';
  if (pathname.startsWith('/requests/')) return 'Request Details';
  if (pathname === '/resources') return 'Resource Inventory';
  if (pathname === '/resources/new') return 'Add New Resource';
  if (pathname.includes('/resources/') && pathname.endsWith('/edit')) return 'Edit Resource';
  if (pathname === '/resources/transactions') return 'Resource Distribution & Logs';
  if (pathname === '/volunteers') return 'Volunteer Directory';
  if (pathname === '/volunteers/assignments') return 'My Assignments';
  if (pathname === '/missions') return 'Relief Missions';
  if (pathname === '/disasters') return 'Disaster Incident Monitoring';
  if (pathname === '/donations') return 'Donation Contributions';
  if (pathname === '/donations/my') return 'My Donations';
  if (pathname === '/donations/new') return 'Make a Donation';
  if (pathname === '/alerts') return 'Emergency Alerts';
  if (pathname === '/map') return 'Live Disaster & Relief Map';
  if (pathname === '/hospitals') return 'Hospitals & Medical Centers';
  if (pathname === '/ambulance') return 'Ambulance Requests';
  if (pathname === '/sos') return 'Emergency SOS Center';
  if (pathname === '/profile') return 'User Profile & Settings';
  if (pathname === '/admin/users') return 'User Administration';
  return 'Smart Disaster Relief Management';
};

const TopNav = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([]);

  const userMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  const pageTitle = getPageTitle(location.pathname);

  // Fetch unread notifications if possible
  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getUnreadNotifications();
        const data = res?.data || res || [];
        if (isMounted) {
          if (Array.isArray(data)) {
            setNotifications(data.slice(0, 5));
            setUnreadCount(data.length);
          }
        }
      } catch (err) {
        // Fallback default sample alerts if backend is empty or unreachable
        if (isMounted) {
          setNotifications([
            { id: 1, title: 'Flash Flood Warning', message: 'Heavy rainfall in coastal sector', time: '10m ago' },
            { id: 2, title: 'Relief Dispatched', message: 'Medical kit delivered to Shelter 4', time: '1h ago' },
            { id: 3, title: 'Volunteer Required', message: 'Urgent rescue team at North Ward', time: '2h ago' },
          ]);
          setUnreadCount(3);
        }
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle outside click for dropdown menus
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(e.target)) {
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  };

  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Relief User';
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'Citizen';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-xs">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-lg md:text-xl font-bold tracking-tight text-slate-900">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Middle & Right section */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Search Input (Visual only) */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            readOnly
            placeholder="Search requests, relief..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-teal-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notificationMenuRef}>
          <button
            type="button"
            onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white py-2 shadow-lg ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <span className="text-sm font-semibold text-slate-900">Notifications</span>
                <Link
                  to="/alerts"
                  onClick={() => setNotificationMenuOpen(false)}
                  className="text-xs font-medium text-teal-700 hover:text-teal-800"
                >
                  View all alerts
                </Link>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {item.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {item.time || 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 rounded-lg p-1.5 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            aria-expanded={userMenuOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white shadow-xs">
              {getInitials(displayName)}
            </div>
            <div className="hidden text-left sm:block">
              <span className="block text-xs font-semibold text-slate-800 leading-tight">
                {displayName}
              </span>
              <span className="block text-[10px] font-medium text-slate-500 leading-tight">
                {roleLabel}
              </span>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg ring-1 ring-black/5 z-50">
              <div className="border-b border-slate-100 px-4 py-2.5 sm:hidden">
                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{roleLabel}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <UserIcon className="h-4 w-4 text-slate-500" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center space-x-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                <span>Account Settings</span>
              </Link>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center space-x-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 text-red-600" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
