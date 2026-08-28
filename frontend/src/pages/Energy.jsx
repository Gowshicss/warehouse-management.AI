import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Zap,
  DollarSign,
  ShieldAlert,
  Activity,
  Play
} from 'lucide-react';

import { formatINR } from '../services/currency';

const Energy = () => {
  const { isOwner } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchEnergy = async () => {
    if (!isOwner) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.get('/api/energy/summary');
      setData(res.data);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.detail ||
        'Error loading energy metrics'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnergy();
  }, [isOwner]);

  const handleSimulateHighLoad = async () => {
    try {
      await api.post(
        '/api/energy/simulate',
        null,
        {
          params: {
            power_kw: 68.5
          }
        }
      );

      fetchEnergy();
    } catch (err) {
      alert('Simulation error');
    }
  };

  // Manager Restricted Fallback Banner
  if (!isOwner) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md bg-white border border-amber-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">

          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto border border-amber-100">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            Restricted Module
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Access Denied: Utility cost metrics and power grid financial
            analytics are restricted to system Owner accounts.
          </p>

          <span className="inline-block bg-slate-100 text-slate-600 text-xs font-mono font-bold px-3 py-1 rounded-full border border-slate-200">
            RBAC Code: 403_FORBIDDEN
          </span>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">

            <span>
              Energy & Utility Monitoring
            </span>

            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded border border-amber-200">
              Owner Only
            </span>

          </h1>

          <p className="text-xs text-slate-500 font-medium mt-0.5">
            IoT smart meter telemetry, peak load distribution, and cost projections.
          </p>
        </div>

        <button
          onClick={handleSimulateHighLoad}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md shadow-blue-500/20"
        >
          <Play className="w-4 h-4 fill-white" />

          <span>
            Simulate Peak Power Load (68.5 kW)
          </span>
        </button>

      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          {errorMsg}
        </div>
      )}

      {/* Energy Data */}
      {data && (
        <>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Current Power Load */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">

              <span className="text-xs font-semibold text-slate-500">
                Current Power Load
              </span>

              <p className="text-2xl font-black text-amber-500">
                {data.current_power_kw} kW
              </p>

              <p className="text-[11px] text-slate-400 font-medium">
                Voltage: {data.voltage_v}V • PF: {data.power_factor}
              </p>

            </div>

            {/* Today's Consumption */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">

              <span className="text-xs font-semibold text-slate-500">
                Today's Consumption
              </span>

              <p className="text-2xl font-black text-slate-900">
                {data.daily_consumption_kwh} kWh
              </p>

            </div>

            {/* Monthly Utility Cost */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-1">

              <span className="text-xs font-semibold text-slate-500">
                Est. Monthly Utility Cost
              </span>

              <p className="text-2xl font-black text-emerald-600">
                {formatINR(data.estimated_monthly_cost)}
              </p>

            </div>

          </div>

          {/* Hourly Power Consumption Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">

            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              REAL-TIME HOURLY LOAD (kW)
            </h2>

            <div className="h-64 w-full pt-4">

              <ResponsiveContainer width="100%" height="100%">

                <LineChart data={data.hourly_chart}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                  />

                  <XAxis
                    dataKey="time"
                    stroke="#94a3b8"
                    fontSize={11}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      borderColor: '#cbd5e1',
                      fontSize: '12px'
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="power_kw"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{
                      fill: '#f59e0b',
                      r: 3
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

        </>
      )}

    </div>
  );
};

export default Energy;