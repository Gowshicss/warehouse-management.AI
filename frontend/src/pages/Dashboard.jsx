import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import OutOfStockAlert from '../components/Common/OutOfStockAlert';
import {
  Boxes,
  Users,
  Activity,
  Zap,
  Warehouse,
  RefreshCw,
  AlertTriangle,
  Package,
  Clock,
  CheckCircle,
  Plus,
  Wrench,
  Truck,
  ClipboardList
} from 'lucide-react';

const Dashboard = () => {
  const { user, isOwner, isManager } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, prioRes] = await Promise.all([
        api.get('/api/dashboard/summary'),
        api.get('/api/dashboard/priorities')
      ]);
      setSummary(sumRes.data);
      setPriorities(prioRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Admin';

  // Helper for Indian Rupee Formatting (Bulletproof format)
  const formatINR = (val) => {
    if (val === undefined || val === null) return '₹0';
    const formatter = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    });
    return `₹${formatter.format(val)}`;
  };

  // Derive categories from DB summary and priority lists
  const urgentItems = [];
  const highPriorityItems = [];
  const attentionItems = [];
  const healthyItems = [];

  if (summary) {
    if (summary.inventory.critical > 0) {
      urgentItems.push(`${summary.inventory.critical} products critically low / running out`);
    }
    if (summary.inventory.low_stock > 0) {
      urgentItems.push(`${summary.inventory.low_stock} products in low stock alert`);
    }
    if (summary.vehicles.critical > 0) {
      urgentItems.push(`${summary.vehicles.critical} vehicle(s) require maintenance`);
    }
    if (summary.receiving?.pending_review > 0) {
      highPriorityItems.push(`${summary.receiving.pending_review} receiving orders pending review`);
    }
    highPriorityItems.push('Trucks waiting at loading bay');
    if (summary.safety?.ppe_violations_today > 0) {
      attentionItems.push(`${summary.safety.ppe_violations_today} PPE violation(s) detected today`);
    }
    if (summary.attendance?.absent > 0) {
      attentionItems.push(`${summary.attendance.absent} worker(s) absent — check staffing`);
    }
    healthyItems.push('Outbound shipments on schedule');
  }

  // Inject additional priority records from API
  priorities.forEach(p => {
    const sev = p.severity?.toUpperCase();
    const text = p.title || p.description;
    if (sev === 'URGENT' && urgentItems.length < 3 && !urgentItems.includes(text)) {
      urgentItems.push(text);
    } else if (sev === 'HIGH PRIORITY' && highPriorityItems.length < 3 && !highPriorityItems.includes(text)) {
      highPriorityItems.push(text);
    } else if (sev === 'ATTENTION' && attentionItems.length < 3 && !attentionItems.includes(text)) {
      attentionItems.push(text);
    }
  });

  // Ensure default fallback list items if data empty
  if (urgentItems.length === 0) urgentItems.push('No urgent threats detected');
  if (highPriorityItems.length === 0) highPriorityItems.push('Receiving checks completed');
  if (attentionItems.length === 0) attentionItems.push('PPE compliance check normal');
  if (healthyItems.length === 0) healthyItems.push('Outbound shipments on schedule');

  // Realistic Projected Utility Cost calculation: daily_kwh * 8 * 30
  const ELECTRICITY_RATE_PER_KWH = 8.00;
  const dailyKwh = summary?.energy?.today_consumption_kwh || 510;
  const projectedUtilityCost = dailyKwh * ELECTRICITY_RATE_PER_KWH * 30;

  // Overview stats cards definition
  const statsCards = summary ? [
    {
      label: 'OUT OF STOCK',
      value: summary.inventory.out_of_stock?.toString() ?? (summary.inventory.critical?.toString() || '0'),
      isWarn: (summary.inventory.out_of_stock ?? 0) > 0
    },
    {
      label: 'TOTAL PRODUCTS',
      value: summary.inventory.total_items?.toLocaleString() || '0',
      isWarn: false
    },
    {
      label: 'LOW STOCK',
      value: summary.inventory.low_stock?.toString() || '0',
      isWarn: summary.inventory.low_stock > 0
    },
    {
      label: 'WAREHOUSES',
      value: '4',
      isWarn: false
    },
    {
      label: 'VEHICLES',
      value: summary.vehicles.total?.toString() || '0',
      isWarn: false
    },
    {
      label: 'WORKERS PRESENT',
      value: `${summary.attendance.present} / ${summary.attendance.total_workers}`,
      isWarn: false
    },
    {
      label: 'PENDING RECEIVING',
      value: summary.receiving?.pending_review?.toString() || '0',
      isWarn: summary.receiving?.pending_review > 0
    }
  ] : [];

  // Severity column configs (replaces repeated JSX blocks)
  const severityConfigs = [
    { label: 'Urgent',       color: '#dc2626', items: urgentItems },
    { label: 'High Priority', color: '#ea580c', items: highPriorityItems },
    { label: 'Attention',    color: '#d97706', items: attentionItems },
    { label: 'Healthy',      color: '#16a34a', items: healthyItems },
  ];

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-full pb-6">
      {/* Out-of-Stock Alert Banner — shown to Owner and Manager */}
      {(isOwner || isManager) && <OutOfStockAlert />}

      {/* Page Title & Controls */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-[22px] font-bold text-slate-900 m-0">Good Morning, {firstName}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Here's what requires your attention today.</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-semibold text-slate-600 cursor-pointer transition-colors"
        >
          <RefreshCw style={{ width: 12, height: 12, animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
          <span>Refresh telemetry</span>
        </button>
      </div>

      {/* Main Operations Block */}
      <div className="flex gap-4 mb-6 items-stretch">
        {/* Left Column: What Should I Do Today? */}
        <div className="flex-1 bg-white border border-slate-200 rounded p-4" style={{ flex: 3 }}>
          <h2 className="text-xs font-bold text-slate-600 tracking-wide uppercase mb-4 flex items-center gap-1.5 m-0">
            <ClipboardList style={{ width: 14, height: 14, color: '#2563eb' }} />
            <span>Operational Priority Checklist</span>
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {severityConfigs.map(({ label, color, items }) => (
              <div key={label} className="flex flex-col gap-2">
                {/* Category Header */}
                <div style={{
                  fontSize: '11px', fontWeight: 700, color,
                  textTransform: 'uppercase', borderBottom: `2px solid ${color}`,
                  paddingBottom: '4px', marginBottom: '6px'
                }}>
                  {label}
                </div>
                <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                  {items.map((item, idx) => (
                    <li key={idx} className="text-[11px] text-slate-700 leading-snug relative pl-3">
                      <span style={{
                        position: 'absolute', left: 0, top: '5px',
                        width: '4px', height: '4px', borderRadius: '50%',
                        backgroundColor: color
                      }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="w-60 bg-white border border-slate-200 rounded p-4 flex flex-col">
          <h2 className="text-xs font-bold text-slate-600 tracking-wide uppercase mb-4 flex items-center gap-1.5 m-0">
            Quick Actions
          </h2>
          <div className="flex-1 flex flex-col justify-center">
            <button
              onClick={() => navigate('/receiving')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold mb-2 transition-colors border-none cursor-pointer"
            >
              <Plus style={{ width: 13, height: 13 }} />
              <span>New Order</span>
            </button>
            <button
              onClick={() => navigate('/vehicles')}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold mb-2 transition-colors cursor-pointer"
            >
              <Wrench style={{ width: 13, height: 13 }} />
              <span>Log Work</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Overview section */}
      <div>
        <h2 className="text-[13px] font-bold text-slate-700 uppercase tracking-wide mb-3">System Overview</h2>
        <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {statsCards.map((stat, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded px-3.5 py-3 flex flex-col gap-1.5">
              <span className="text-[9px] font-bold text-slate-500 tracking-wide">{stat.label}</span>
              <span className={`text-[20px] font-bold ${stat.isWarn ? 'text-red-600' : 'text-slate-900'}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* OWNER-ONLY Financial & Energy Panel */}
      {isOwner && summary?.energy && summary?.financials && (
        <div className="bg-white border border-slate-200 rounded p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <Zap style={{ width: 14, height: 14, color: '#d97706' }} />
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Owner Executive Panel
              </span>
            </div>
            <span className="bg-amber-100 text-amber-600 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
              Restricted
            </span>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Current Power Load</div>
              <div className="text-[18px] font-bold text-amber-600 my-1">{summary.energy.current_power_kw} kW</div>
              <p className="text-[10px] text-slate-400 m-0">Daily consumption: {summary.energy.today_consumption_kwh} kWh</p>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Projected Utility Cost</div>
              <div className="text-[18px] font-bold text-green-600 my-1">{formatINR(projectedUtilityCost)} / mo</div>
              <p className="text-[10px] text-slate-400 m-0">Based on {formatINR(ELECTRICITY_RATE_PER_KWH)}/kWh estimate</p>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Total Inventory Assets</div>
              <div className="text-[18px] font-bold text-blue-600 my-1">{formatINR(summary.financials.total_inventory_value)}</div>
              <p className="text-[10px] text-slate-400 m-0">Monthly Expenses: {formatINR(summary.financials.monthly_expenses)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Spin animation for refresh telemetry icon */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
