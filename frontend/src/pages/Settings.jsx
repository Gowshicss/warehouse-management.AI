import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Database, ShieldCheck, Server } from 'lucide-react';

const Settings = () => {
  const { user, isOwner } = useAuth();

  return (
    <div className="space-y-6 font-sans pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          System Settings & Credentials
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Hackathon demo environment configuration and credentials overview.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Demo Access Accounts</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">Owner Account</span>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded">FULL ACCESS</span>
            </div>
            <p className="text-slate-600">Email: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-blue-600">owner@smartwarehouse.com</code></p>
            <p className="text-slate-600">Password: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">password123</code></p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900">Manager Account</span>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">OPERATIONAL</span>
            </div>
            <p className="text-slate-600">Email: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-blue-600">manager@smartwarehouse.com</code></p>
            <p className="text-slate-600">Password: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">password123</code></p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Backend API Host</h3>
          <p className="text-xs text-slate-600 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200 inline-block">
            http://127.0.0.1:8000
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
