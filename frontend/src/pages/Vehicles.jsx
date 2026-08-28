import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatusBadge from '../components/Common/StatusBadge';
import { Activity, Wrench, Thermometer, Gauge, Zap, AlertOctagon, Play } from 'lucide-react';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error("Vehicles fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSimulateOverheat = async (code, critical) => {
    try {
      await api.post('/api/vehicles/simulate', null, { params: { vehicle_code: code, critical } });
      fetchVehicles();
    } catch (err) {
      alert("Vehicle simulation failed");
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Vehicle Tracking & Health
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time IoT telemetry, engine temperature, and predictive health scores.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleSimulateOverheat('V03', true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <AlertOctagon className="w-4 h-4 text-red-600" />
            <span>Simulate Overheat on V03 (112°C)</span>
          </button>
          <button
            onClick={() => handleSimulateOverheat('V03', false)}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Play className="w-4 h-4 text-blue-600" />
            <span>Reset V03 to Normal</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className={`bg-white border rounded-2xl p-6 shadow-xs space-y-4 ${
              v.status === 'CRITICAL' ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${v.status === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-600'}`}>
                  {v.vehicle_code}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{v.name}</h3>
                  <p className="text-[11px] text-slate-500">{v.type} • {v.current_zone}</p>
                </div>
              </div>
              <StatusBadge status={v.status} />
            </div>

            <div className="space-y-3">
              {/* Health score gauge */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-slate-500">Health Score</span>
                  <span className={v.health_score < 50 ? 'text-red-600' : 'text-blue-600'}>
                    {v.health_score}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${v.health_score < 50 ? 'bg-red-600' : v.health_score < 80 ? 'bg-amber-500' : 'bg-blue-600'}`}
                    style={{ width: `${v.health_score}%` }}
                  />
                </div>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold text-[10px] block">Engine Temp</span>
                  <span className={`font-bold ${v.engine_temp_c >= 105 ? 'text-red-600 font-black' : 'text-slate-800'}`}>
                    {v.engine_temp_c}°C
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold text-[10px] block">Hydraulic Press</span>
                  <span className="font-bold text-slate-800">{v.hydraulic_press_psi} PSI</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-semibold text-[10px] block">Battery/Fuel</span>
                  <span className="font-bold text-slate-800">{v.fuel_pct}%</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Status: {v.maintenance_status}</span>
              <button className="flex items-center gap-1 text-blue-600 font-bold hover:underline">
                <Wrench className="w-3.5 h-3.5" />
                <span>Schedule Maintenance</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vehicles;
