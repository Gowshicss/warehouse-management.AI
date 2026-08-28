import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, HelpCircle, User } from 'lucide-react';

const Header = ({ title = "Overview" }) => {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left Breadcrumb Nav Tabs */}
      <div className="flex items-center gap-6">
        <span className="font-bold text-slate-900 text-xs tracking-wider uppercase">SMART WAREHOUSE</span>
        <div className="h-4 w-px bg-slate-200" />
        <nav className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-blue-600 border-b-2 border-blue-600 pb-3.5 pt-4">OVERVIEW</span>
          <span className="text-slate-500 hover:text-slate-800 cursor-pointer">REPORTS</span>
          <span className="text-slate-500 hover:text-slate-800 cursor-pointer">LOGS</span>
        </nav>
      </div>

      {/* Right Action Icons & Role Toggle */}
      <div className="flex items-center gap-4">
        {/* Global Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search inventory, SKUs, vehicles..."
            className="pl-8 pr-4 py-1.5 w-64 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Help Icon */}
        <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors">
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200" />

        {/* User Badge */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.full_name?.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
