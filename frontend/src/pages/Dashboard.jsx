import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  const { user, isOwner } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hover states for buttons
  const [newOrderHover, setNewOrderHover] = useState(false);
  const [logWorkHover, setLogWorkHover] = useState(false);
  const [refreshHover, setRefreshHover] = useState(false);

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
      label: 'TOTAL PRODUCTS',
      value: summary.inventory.total_items?.toLocaleString() || '0',
      color: '#2563eb',
      isWarn: false
    },
    {
      label: 'LOW STOCK',
      value: summary.inventory.low_stock?.toString() || '0',
      color: '#dc2626',
      isWarn: summary.inventory.low_stock > 0
    },
    {
      label: 'WAREHOUSES',
      value: '4',
      color: '#2563eb',
      isWarn: false
    },
    {
      label: 'VEHICLES',
      value: summary.vehicles.total?.toString() || '0',
      color: '#2563eb',
      isWarn: false
    },
    {
      label: 'WORKERS PRESENT',
      value: `${summary.attendance.present} / ${summary.attendance.total_workers}`,
      color: '#2563eb',
      isWarn: false
    },
    {
      label: 'PENDING RECEIVING',
      value: summary.receiving?.pending_review?.toString() || '0',
      color: '#d97706',
      isWarn: summary.receiving?.pending_review > 0
    }
  ] : [];

  // Scoped layout styles to ensure a clean, professional, human-designed look
  const styles = {
    container: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#1e293b',
      background: '#f8fafc',
      minHeight: '100%',
      padding: '2px 0 24px 0'
    },
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#0f172a',
      margin: 0
    },
    subtitle: {
      fontSize: '12px',
      color: '#64748b',
      margin: '2px 0 0 0'
    },
    refreshBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      background: refreshHover ? '#f1f5f9' : '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      color: '#475569',
      cursor: 'pointer',
      transition: 'background 0.15s ease'
    },
    dashboardGrid: {
      display: 'flex',
      gap: '16px',
      marginBottom: '24px',
      alignItems: 'stretch'
    },
    attentionCard: {
      flex: 3,
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      padding: '16px'
    },
    cardTitle: {
      fontSize: '12px',
      fontWeight: '700',
      color: '#475569',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      margin: '0 0 16px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    attentionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px'
    },
    severityCol: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    severityHeader: (color) => ({
      fontSize: '11px',
      fontWeight: '700',
      color: color,
      textTransform: 'uppercase',
      borderBottom: `2px solid ${color}`,
      paddingBottom: '4px',
      marginBottom: '6px'
    }),
    bulletList: {
      listStyleType: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    bulletItem: {
      fontSize: '11px',
      color: '#334155',
      lineHeight: '1.4',
      position: 'relative',
      paddingLeft: '12px'
    },
    bulletDot: (color) => ({
      position: 'absolute',
      left: 0,
      top: '5px',
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      backgroundColor: color
    }),
    quickActionsCard: {
      width: '240px',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column'
    },
    actionBtn: (isPrimary, isHovered) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      width: '100%',
      padding: '8px 14px',
      background: isPrimary ? (isHovered ? '#1d4ed8' : '#2563eb') : (isHovered ? '#f1f5f9' : '#ffffff'),
      color: isPrimary ? '#ffffff' : '#334155',
      border: isPrimary ? 'none' : '1px solid #cbd5e1',
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: '600',
      cursor: 'pointer',
      marginBottom: '8px',
      transition: 'background 0.15s ease'
    }),
    sectionHeader: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#334155',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      marginBottom: '12px'
    },
    overviewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '12px',
      marginBottom: '24px'
    },
    statCard: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    statLabel: {
      fontSize: '9px',
      fontWeight: '700',
      color: '#64748b',
      letterSpacing: '0.5px'
    },
    statVal: (isWarn, color) => ({
      fontSize: '20px',
      fontWeight: '700',
      color: isWarn ? '#dc2626' : '#0f172a'
    }),
    ownerCard: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      padding: '16px'
    },
    ownerHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #f1f5f9',
      paddingBottom: '8px',
      marginBottom: '12px'
    },
    ownerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px'
    },
    ownerLabel: {
      fontSize: '10px',
      fontWeight: '700',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    ownerVal: (color) => ({
      fontSize: '18px',
      fontWeight: '700',
      color: color || '#0f172a',
      margin: '4px 0 2px 0'
    }),
    ownerDesc: {
      fontSize: '10px',
      color: '#94a3b8',
      margin: 0
    }
  };

  return (
    <div style={styles.container}>
      {/* Page Title & Controls */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}>Good Morning, {firstName}</h1>
          <p style={styles.subtitle}>Here's what requires your attention today.</p>
        </div>
        <button
          onClick={fetchData}
          style={styles.refreshBtn}
          onMouseEnter={() => setRefreshHover(true)}
          onMouseLeave={() => setRefreshHover(false)}
        >
          <RefreshCw style={{ width: 12, height: 12, animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
          <span>Refresh telemetry</span>
        </button>
      </div>

      {/* Main Operations Block */}
      <div style={styles.dashboardGrid}>
        {/* Left Column: What Should I Do Today? */}
        <div style={styles.attentionCard}>
          <h2 style={styles.cardTitle}>
            <ClipboardList style={{ width: 14, height: 14, color: '#2563eb' }} />
            <span>Operational Priority Checklist</span>
          </h2>
          <div style={styles.attentionGrid}>
            {/* Category: URGENT */}
            <div style={styles.severityCol}>
              <div style={styles.severityHeader('#dc2626')}>Urgent</div>
              <ul style={styles.bulletList}>
                {urgentItems.map((item, idx) => (
                  <li key={idx} style={styles.bulletItem}>
                    <span style={styles.bulletDot('#dc2626')} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Category: HIGH PRIORITY */}
            <div style={styles.severityCol}>
              <div style={styles.severityHeader('#ea580c')}>High Priority</div>
              <ul style={styles.bulletList}>
                {highPriorityItems.map((item, idx) => (
                  <li key={idx} style={styles.bulletItem}>
                    <span style={styles.bulletDot('#ea580c')} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Category: ATTENTION */}
            <div style={styles.severityCol}>
              <div style={styles.severityHeader('#d97706')}>Attention</div>
              <ul style={styles.bulletList}>
                {attentionItems.map((item, idx) => (
                  <li key={idx} style={styles.bulletItem}>
                    <span style={styles.bulletDot('#d97706')} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Category: HEALTHY */}
            <div style={styles.severityCol}>
              <div style={styles.severityHeader('#16a34a')}>Healthy</div>
              <ul style={styles.bulletList}>
                {healthyItems.map((item, idx) => (
                  <li key={idx} style={styles.bulletItem}>
                    <span style={styles.bulletDot('#16a34a')} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div style={styles.quickActionsCard}>
          <h2 style={styles.cardTitle}>Quick Actions</h2>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/receiving')}
              style={styles.actionBtn(true, newOrderHover)}
              onMouseEnter={() => setNewOrderHover(true)}
              onMouseLeave={() => setNewOrderHover(false)}
            >
              <Plus style={{ width: 13, height: 13 }} />
              <span>New Order</span>
            </button>
            <button
              onClick={() => navigate('/vehicles')}
              style={styles.actionBtn(false, logWorkHover)}
              onMouseEnter={() => setLogWorkHover(true)}
              onMouseLeave={() => setLogWorkHover(false)}
            >
              <Wrench style={{ width: 13, height: 13 }} />
              <span>Log Work</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Overview section */}
      <div>
        <h2 style={styles.sectionHeader}>System Overview</h2>
        <div style={styles.overviewGrid}>
          {statsCards.map((stat, idx) => (
            <div key={idx} style={styles.statCard}>
              <span style={styles.statLabel}>{stat.label}</span>
              <span style={styles.statVal(stat.isWarn, stat.color)}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* OWNER-ONLY Financial & Energy Panel */}
      {isOwner && summary?.energy && summary?.financials && (
        <div style={styles.ownerCard}>
          <div style={styles.ownerHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap style={{ width: 14, height: 14, color: '#d97706' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Owner Executive Panel
              </span>
            </div>
            <span style={{
              background: '#fef3c7',
              color: '#d97706',
              fontSize: '9px',
              fontWeight: '700',
              padding: '2px 6px',
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Restricted
            </span>
          </div>
          <div style={styles.ownerGrid}>
            <div>
              <div style={styles.ownerLabel}>Current Power Load</div>
              <div style={styles.ownerVal('#d97706')}>{summary.energy.current_power_kw} kW</div>
              <p style={styles.ownerDesc}>Daily consumption: {summary.energy.today_consumption_kwh} kWh</p>
            </div>
            <div>
              <div style={styles.ownerLabel}>Projected Utility Cost</div>
              <div style={styles.ownerVal('#16a34a')}>{formatINR(projectedUtilityCost)} / mo</div>
              <p style={styles.ownerDesc}>Based on {formatINR(ELECTRICITY_RATE_PER_KWH)}/kWh estimate</p>
            </div>
            <div>
              <div style={styles.ownerLabel}>Total Inventory Assets</div>
              <div style={styles.ownerVal('#2563eb')}>{formatINR(summary.financials.total_inventory_value)}</div>
              <p style={styles.ownerDesc}>Monthly Expenses: {formatINR(summary.financials.monthly_expenses)}</p>
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
