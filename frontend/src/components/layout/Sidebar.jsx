import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  AlertTriangle,
  Users,
  UserCheck,
  Package,
  MapPin,
  Bell,
  Heart,
  Building2,
  Ambulance,
  Settings,
  Shield,
  LogOut,
  X,
} from 'lucide-react';
import useAuth from '../../contexts/AuthContext';
import { ROLES, ROLE_LABELS } from '../../utils/constants';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const role = user?.role || ROLES.CITIZEN;

  // Determine navigation items according to user role
  const getNavigationItems = () => {
    const items = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
      },
    ];

    switch (role) {
      case ROLES.CITIZEN:
        items.push(
          { name: 'My Requests', path: '/requests/my', icon: FileText },
          { name: 'Submit Request', path: '/requests/new', icon: PlusCircle },
          { name: 'Emergency SOS', path: '/sos', icon: AlertTriangle, badge: 'SOS' },
          { name: 'Disaster Map', path: '/map', icon: MapPin },
          { name: 'Emergency Alerts', path: '/alerts', icon: Bell },
          { name: 'Hospitals', path: '/hospitals', icon: Building2 }
        );
        break;

      case ROLES.VOLUNTEER:
        items.push(
          { name: 'My Assignments', path: '/volunteers/assignments', icon: UserCheck },
          { name: 'Volunteer Directory', path: '/volunteers', icon: Users },
          { name: 'Missions', path: '/missions', icon: FileText },
          { name: 'Disaster Map', path: '/map', icon: MapPin },
          { name: 'Emergency Alerts', path: '/alerts', icon: Bell },
          { name: 'Hospitals', path: '/hospitals', icon: Building2 }
        );
        break;

      case ROLES.NGO_REPRESENTATIVE:
        items.push(
          { name: 'Relief Requests', path: '/requests', icon: FileText },
          { name: 'Resources', path: '/resources', icon: Package },
          { name: 'Missions', path: '/missions', icon: FileText },
          { name: 'Volunteers', path: '/volunteers', icon: Users },
          { name: 'Disaster Map', path: '/map', icon: MapPin },
          { name: 'Emergency Alerts', path: '/alerts', icon: Bell },
          { name: 'Hospitals', path: '/hospitals', icon: Building2 }
        );
        break;

      case ROLES.DONOR:
        items.push(
          { name: 'My Donations', path: '/donations/my', icon: Heart },
          { name: 'Make Donation', path: '/donations/new', icon: PlusCircle },
          { name: 'Disaster Map', path: '/map', icon: MapPin },
          { name: 'Emergency Alerts', path: '/alerts', icon: Bell },
          { name: 'Hospitals', path: '/hospitals', icon: Building2 }
        );
        break;

      case ROLES.GOV_OFFICIAL:
        items.push(
          { name: 'Relief Requests', path: '/requests', icon: FileText },
          { name: 'Disasters', path: '/disasters', icon: AlertTriangle },
          { name: 'Resources', path: '/resources', icon: Package },
          { name: 'Volunteers', path: '/volunteers', icon: Users },
          { name: 'Missions', path: '/missions', icon: FileText },
          { name: 'Donations', path: '/donations', icon: Heart },
          { name: 'Emergency Alerts', path: '/alerts', icon: Bell },
          { name: 'Disaster Map', path: '/map', icon: MapPin },
          { name: 'Hospitals', path: '/hospitals', icon: Building2 }
        );
        break;

      case ROLES.HOSPITAL_REP:
        items.push(
          { name: 'Ambulance Requests', path: '/ambulance', icon: Ambulance },
          { name: 'Hospitals', path: '/hospitals', icon: Building2 },
          { name: 'Relief Requests', path: '/requests', icon: FileText },
          { name: 'Disaster Map', path: '/map', icon: MapPin },
          { name: 'Emergency Alerts', path: '/alerts', icon: Bell }
        );
        break;

      case ROLES.ADMIN:
        items.push(
          { name: 'Relief Requests', path: '/requests', icon: FileText },
          { name: 'Disasters', path: '/disasters', icon: AlertTriangle },
          { name: 'Resources', path: '/resources', icon: Package },
          { name: 'Volunteers', path: '/volunteers', icon: Users },
          { name: 'Missions', path: '/missions', icon: FileText },
          { name: 'Donations', path: '/donations', icon: Heart },
          { name: 'Disaster Map', path: '/map', icon: MapPin },
          { name: 'Emergency Alerts', path: '/alerts', icon: Bell },
          { name: 'Hospitals', path: '/hospitals', icon: Building2 },
          { name: 'Ambulances', path: '/ambulance', icon: Ambulance },
          { name: 'User Management', path: '/admin/users', icon: Settings }
        );
        break;

      default:
        items.push(
          { name: 'Relief Requests', path: '/requests', icon: FileText },
          { name: 'Disaster Map', path: '/map', icon: MapPin },
          { name: 'Emergency Alerts', path: '/alerts', icon: Bell },
          { name: 'Hospitals', path: '/hospitals', icon: Building2 }
        );
        break;
    }

    return items;
  };

  const navItems = getNavigationItems();

  // Helper for initials
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

  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Relief User';
  const roleLabel = ROLE_LABELS[role] || role;

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <NavLink to="/dashboard" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm group-hover:bg-teal-800 transition-colors">
              <Shield className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                SDRRMS
              </span>
              <span className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                Smart Relief. Faster Response.
              </span>
            </div>
          </NavLink>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024 && onClose) {
                    onClose();
                  }
                }}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white text-teal-800'
                        : 'bg-red-100 text-red-700 font-semibold'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User Profile Footer Section */}
        <div className="border-t border-slate-200 p-3 bg-slate-50/60">
          <div className="flex items-center justify-between rounded-lg p-2 hover:bg-white hover:shadow-xs transition-colors">
            <NavLink
              to="/profile"
              onClick={() => {
                if (window.innerWidth < 1024 && onClose) onClose();
              }}
              className="flex items-center space-x-3 min-w-0 flex-1 mr-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white shadow-xs">
                {getInitials(displayName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 leading-tight">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-500 font-medium leading-tight mt-0.5">
                  {roleLabel}
                </p>
              </div>
            </NavLink>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
