import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Bell, AlertTriangle, Package, ShoppingCart, X, ChevronRight } from 'lucide-react';

/**
 * NotificationBell
 * Header bell icon with live out-of-stock badge count.
 * Clicking it opens a dropdown panel listing each out-of-stock product.
 */
const NotificationBell = () => {
  const navigate = useNavigate();
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchOutOfStock = useCallback(async () => {
    try {
      const res = await api.get('/api/inventory', { params: { status: 'Out of Stock' } });
      const oos = (res.data || []).filter(
        item => item.current_stock === 0 || item.status === 'OUT OF STOCK'
      );
      setOutOfStockItems(oos);
    } catch (err) {
      console.error('NotificationBell fetch error:', err);
    }
  }, []);

  useEffect(() => {
    fetchOutOfStock();
    const interval = setInterval(fetchOutOfStock, 60000);
    return () => clearInterval(interval);
  }, [fetchOutOfStock]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const count = outOfStockItems.length;

  return (
    <div ref={dropdownRef} className="relative">
      <style>{`
        @keyframes bellPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`relative p-1.5 rounded-lg border-none cursor-pointer flex items-center justify-center transition-colors ${
          open ? 'bg-slate-100' : 'bg-transparent hover:bg-slate-100'
        }`}
        title={count > 0 ? `${count} out-of-stock alert${count > 1 ? 's' : ''}` : 'No alerts'}
      >
        <Bell className="w-4 h-4 text-slate-500" />
        {count > 0 && (
          <span
            className="absolute top-1 right-1 flex items-center justify-center bg-red-600 text-white border-2 border-white rounded-full"
            style={{
              width: count > 9 ? '16px' : '14px',
              height: '14px',
              fontSize: '8px',
              fontWeight: 800,
              lineHeight: 1,
              animation: 'bellPulse 2s ease-in-out infinite'
            }}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className="absolute right-0 w-[340px] bg-white border border-slate-200 rounded-xl overflow-hidden z-[100]"
          style={{
            top: 'calc(100% + 8px)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            animation: 'dropdownSlide 0.2s cubic-bezier(0.16,1,0.3,1)',
            fontFamily: 'Inter, -apple-system, sans-serif'
          }}
        >
          {/* Panel Header */}
          <div
            className="px-3.5 py-3 border-b border-slate-100 flex items-center justify-between"
            style={{
              background: count > 0 ? 'linear-gradient(135deg, #fff1f2, #ffe4e6)' : '#f8fafc'
            }}
          >
            <div className="flex items-center gap-2">
              {count > 0
                ? <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                : <Bell className="w-3.5 h-3.5 text-slate-500" />
              }
              <span className={`text-xs font-bold ${count > 0 ? 'text-red-800' : 'text-slate-700'}`}>
                {count > 0 ? `${count} Stock Out Alert${count > 1 ? 's' : ''}` : 'Notifications'}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="bg-transparent border-none cursor-pointer text-slate-400 p-0.5 flex items-center hover:text-slate-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Notification Items */}
          <div className="max-h-80 overflow-y-auto">
            {count === 0 ? (
              <div className="py-6 px-4 text-center text-slate-400 text-xs">
                <Bell className="w-6 h-6 mx-auto mb-2 text-slate-300 block" />
                No stock alerts at this time
              </div>
            ) : (
              outOfStockItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => { navigate(`/inventory/${item.id}`); setOpen(false); }}
                  className="px-3.5 py-2.5 flex items-center gap-2.5 cursor-pointer hover:bg-red-50 transition-colors"
                  style={{ borderBottom: idx < outOfStockItems.length - 1 ? '1px solid #f8fafc' : 'none' }}
                >
                  <div className="w-[30px] h-[30px] rounded-[7px] bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-3 h-3 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-slate-800 truncate">{item.product_name}</div>
                    <div className="text-[10px] text-slate-500 mt-px">
                      SKU: {item.sku} · Reorder: {item.reorder_level} {item.unit_type}s
                    </div>
                  </div>
                  <div className="bg-red-100 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                    OUT OF STOCK
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                </div>
              ))
            )}
          </div>

          {/* Footer CTA */}
          {count > 0 && (
            <div className="px-3.5 py-2.5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => { navigate('/inventory'); setOpen(false); }}
                className="w-full py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white border-none rounded-[7px] text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShoppingCart className="w-2.5 h-2.5" />
                View All Out-of-Stock &amp; Reorder
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
