import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatusBadge from '../components/Common/StatusBadge';
import { Users, UserCheck, UserX, Clock, ShieldCheck } from 'lucide-react';

const Attendance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/attendance/today');
      setData(res.data);
    } catch (err) {
      console.error("Attendance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="space-y-6 font-sans pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Worker Attendance
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Real-time CCTV badge & facial check-in monitoring.
        </p>
      </div>

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-500">Total Roster</span>
            <p className="text-2xl font-black text-slate-900">{data.summary.total_assigned}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-500">Present Today</span>
            <p className="text-2xl font-black text-blue-600">{data.summary.present}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-500">Absent</span>
            <p className="text-2xl font-black text-red-600">{data.summary.absent}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">
            <span className="text-xs font-semibold text-slate-500">Attendance Rate</span>
            <p className="text-2xl font-black text-emerald-600">{data.summary.percentage}%</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Worker Roster & Detection Status</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Badge ID</th>
                <th className="py-3 px-4">Worker Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Zone</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data?.workers.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{w.badge_id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{w.name}</td>
                  <td className="py-3 px-4 text-slate-600">{w.role}</td>
                  <td className="py-3 px-4 text-slate-600">{w.assigned_zone}</td>
                  <td className="py-3 px-4"><StatusBadge status={w.status} size="small" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
