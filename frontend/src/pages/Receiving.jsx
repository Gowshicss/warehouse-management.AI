import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatusBadge from '../components/Common/StatusBadge';
import {
  Truck,
  CheckCircle,
  AlertTriangle,
  Scale,
  Camera,
  FileText,
  Play,
  ArrowRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const Receiving = () => {
  const [receivings, setReceivings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVerified, setLastVerified] = useState(null);

  const fetchReceivings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/receiving');
      setReceivings(res.data);
      if (res.data.length > 0 && !lastVerified) {
        setLastVerified(res.data[0]);
      }
    } catch (err) {
      console.error("Receiving fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivings();
  }, []);

  const handleSimulate = async (mismatch) => {
    try {
      const res = await api.post('/api/receiving/simulate', null, { params: { mismatch } });
      setLastVerified(res.data);
      fetchReceivings();
    } catch (err) {
      alert("Simulation error: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Automated Warehouse Receiving
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            AI Computer Vision & IoT Weight Sensor Verification Pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSimulate(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Simulate Mismatch Scenario</span>
          </button>

          <button
            onClick={() => handleSimulate(false)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Simulate Accepted Shipment</span>
          </button>
        </div>
      </div>

      {/* Visual Receiving Gate Flow Diagram */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Real-time Gate Inspection Pipeline Flow</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
            <Truck className="w-6 h-6 text-blue-600 mx-auto" />
            <p className="text-xs font-bold text-slate-800">1. Vehicle Arrival</p>
            <p className="text-[10px] text-slate-500">TRUCK-01 Dock Gate</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
            <FileText className="w-6 h-6 text-blue-600 mx-auto" />
            <p className="text-xs font-bold text-slate-800">2. Invoice Quantity</p>
            <p className="text-[10px] text-slate-500">Expected: {lastVerified?.expected_qty || 100} Units</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
            <Camera className="w-6 h-6 text-blue-600 mx-auto" />
            <p className="text-xs font-bold text-slate-800">3. Computer Vision</p>
            <p className="text-[10px] text-slate-500">CV Detected: {lastVerified?.cv_detected_qty || 100} Units</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1">
            <Scale className="w-6 h-6 text-blue-600 mx-auto" />
            <p className="text-xs font-bold text-slate-800">4. Weight Sensor</p>
            <p className="text-[10px] text-slate-500">Weight Eq: {lastVerified?.weight_measured_qty || 100} Units</p>
          </div>

          <div className={`border p-4 rounded-xl space-y-1 ${lastVerified?.status === 'ACCEPTED' ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <CheckCircle className={`w-6 h-6 mx-auto ${lastVerified?.status === 'ACCEPTED' ? 'text-blue-600' : 'text-red-600'}`} />
            <p className="text-xs font-bold text-slate-900">5. Final Decision</p>
            <StatusBadge status={lastVerified?.status || 'ACCEPTED'} size="small" />
          </div>
        </div>
      </div>

      {/* Latest Receiving Inspection Detail Banner */}
      {lastVerified && (
        <div className={`border rounded-2xl p-6 shadow-xs ${lastVerified.status === 'ACCEPTED' ? 'bg-blue-50/50 border-blue-200' : 'bg-red-50/50 border-red-200'} space-y-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${lastVerified.status === 'ACCEPTED' ? 'bg-blue-600' : 'bg-red-600'}`} />
              <h3 className="text-base font-bold text-slate-900">
                Latest Receiving Verification: Invoice #{lastVerified.invoice_number}
              </h3>
            </div>
            <StatusBadge status={lastVerified.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Product</span>
              <span className="font-bold text-slate-800">{lastVerified.product_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Expected Invoice</span>
              <span className="font-bold text-slate-800">{lastVerified.expected_qty} Units</span>
            </div>
            <div>
              <span className="text-slate-500 block">CV Detected</span>
              <span className="font-bold text-slate-800">{lastVerified.cv_detected_qty} Units</span>
            </div>
            <div>
              <span className="text-slate-500 block">Weight Sensor</span>
              <span className="font-bold text-slate-800">{lastVerified.weight_measured_qty} Units</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <p className="text-slate-700 font-medium">{lastVerified.decision_reason}</p>
            <span className="text-slate-400 font-mono text-[11px]">
              {new Date(lastVerified.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Receiving Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-6">
        <h2 className="text-sm font-bold text-slate-900">Historical Gate Receiving Records</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Expected</th>
                <th className="py-3 px-4">CV Detected</th>
                <th className="py-3 px-4">Weight Eq</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {receivings.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{rec.invoice_number}</td>
                  <td className="py-3 px-4 text-slate-700">{rec.supplier_name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{rec.product_name}</td>
                  <td className="py-3 px-4 text-slate-600">{rec.expected_qty}</td>
                  <td className="py-3 px-4 text-slate-600">{rec.cv_detected_qty}</td>
                  <td className="py-3 px-4 text-slate-600">{rec.weight_measured_qty}</td>
                  <td className="py-3 px-4"><StatusBadge status={rec.status} size="small" /></td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(rec.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Receiving;
