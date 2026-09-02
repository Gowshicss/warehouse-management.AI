import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AlertTriangle, X, ShoppingCart, RefreshCw, Package } from 'lucide-react';

/**
 * OutOfStockAlert
 * Displays a dismissible alert banner on the dashboard for Owner/Manager roles
 * listing all inventory products with stock === 0 (OUT OF STOCK).
 */
const OutOfStockAlert = ({ onCountChange }) => {
  const navigate = useNavigate();
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOutOfStock = useCallback(async () => {
    try {
      const res = await api.get('/api/inventory', { params: { status: 'Out of Stock' } });
      const oos = (res.data || []).filter(
        item => item.current_stock === 0 || item.status === 'OUT OF STOCK'
      );
      setOutOfStockItems(oos);
      if (onCountChange) onCountChange(oos.length);
    } catch (err) {
      console.error('OutOfStockAlert fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchOutOfStock();
    const interval = setInterval(fetchOutOfStock, 60000);
    return () => clearInterval(interval);
  }, [fetchOutOfStock]);

  if (loading || dismissed || outOfStockItems.length === 0) return null;

  return (
    <div
      className="rounded-[10px] p-3.5 mb-5"
      style={{
        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
        border: '1.5px solid #fecaca',
        borderLeft: '4px solid #dc2626',
        boxShadow: '0 2px 12px rgba(220,38,38,0.10)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        animation: 'slideInAlert 0.4s cubic-bezier(0.16,1,0.3,1)'
      }}
    >
      <style>{`
        @keyframes slideInAlert {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRedIcon {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>

      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-[34px] h-[34px] rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0"
            style={{ animation: 'pulseRedIcon 2s ease-in-out infinite' }}
          >
            <AlertTriangle className="w-[17px] h-[17px] text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-red-800 leading-tight">
              🚨 Stock Out Alert — {outOfStockItems.length} Product{outOfStockItems.length > 1 ? 's' : ''} Out of Stock
            </div>
            <div className="text-[11px] text-red-700 mt-0.5">
              Immediate reorder required. These products have zero stock remaining in inventory.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <button
            onClick={fetchOutOfStock}
            title="Refresh stock data"
            className="px-2 py-1 rounded border border-red-300 bg-transparent cursor-pointer text-red-600 flex items-center gap-1 text-[11px] font-semibold hover:bg-red-50 transition-colors"
          >
            <RefreshCw className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={() => navigate('/inventory')}
            className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white border-none cursor-pointer text-[11px] font-bold flex items-center gap-1 transition-colors"
            style={{ boxShadow: '0 2px 8px rgba(220,38,38,0.30)' }}
          >
            <ShoppingCart className="w-2.5 h-2.5" />
            View All &amp; Reorder
          </button>
          <button
            onClick={() => setDismissed(true)}
            title="Dismiss alert"
            className="bg-transparent border-none cursor-pointer text-red-700 p-1 rounded flex items-center hover:text-red-900 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}
      >
        {outOfStockItems.slice(0, 6).map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/inventory/${item.id}`)}
            className="bg-white border border-red-200 rounded-lg px-3 py-2.5 cursor-pointer flex items-center gap-2.5 transition-all hover:shadow-md hover:border-red-500"
          >
            <div className="w-8 h-8 rounded-[7px] bg-red-100 flex items-center justify-center flex-shrink-0">
              <Package className="w-3.5 h-3.5 text-red-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-slate-800 truncate">{item.product_name}</div>
              <div className="text-[10px] text-slate-500 mt-px">SKU: {item.sku}</div>
              <div className="text-[10px] text-slate-500">
                Reorder qty: <strong className="text-red-700">{item.reorder_level} {item.unit_type}s</strong>
              </div>
            </div>

            <div className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0 whitespace-nowrap">
              0 Stock
            </div>
          </div>
        ))}

        {outOfStockItems.length > 6 && (
          <div
            onClick={() => navigate('/inventory')}
            className="bg-red-50 border border-dashed border-red-300 rounded-lg px-3 py-2.5 cursor-pointer flex items-center justify-center text-red-600 text-[11px] font-bold hover:bg-red-100 transition-colors"
          >
            +{outOfStockItems.length - 6} more items →
          </div>
        )}
      </div>
    </div>
  );
};

export default OutOfStockAlert;
