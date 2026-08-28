import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  Video,
  Users,
  Activity,
  Zap,
  MapPin,
  TrendingDown,
  Bot,
  FileSpreadsheet,
  Settings,
  LogOut,
  Warehouse,
  ShieldAlert
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isOwner } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Inventory', path: '/inventory', icon: Boxes },
    { label: 'Receiving', path: '/receiving', icon: Truck },
    { label: 'CCTV & Safety', path: '/cctv', icon: Video },
    { label: 'Worker Attendance', path: '/attendance', icon: Users },
    { label: 'Vehicle Tracking', path: '/vehicles', icon: Activity },
    { label: 'Warehouse Map', path: '/warehouse', icon: MapPin },
    // OWNER ONLY MODULES
    ...(isOwner ? [
      { label: 'Energy Monitoring', path: '/energy', icon: Zap, ownerOnly: true },
      { label: 'Reports', path: '/reports', icon: FileSpreadsheet, ownerOnly: true }
    ] : []),
    { label: 'Stock-Out', path: '/stock-out', icon: TrendingDown },
    { label: 'AI Assistant', path: '/ai', icon: Bot },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shadow-sm font-sans z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Warehouse className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-sm leading-tight tracking-tight">SMART WAREHOUSE</h1>
          <p className="text-xs text-blue-600 font-semibold">Logistics Pro</p>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.ownerOnly && (
                <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                  Owner
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isOwner ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.full_name || 'User'}</p>
              <p className="text-[11px] text-slate-500 capitalize flex items-center gap-1">
                {isOwner ? (
                  <span className="text-amber-600 font-medium">Owner Role</span>
                ) : (
                  <span className="text-blue-600 font-medium">Warehouse Manager</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
