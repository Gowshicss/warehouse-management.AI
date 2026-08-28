import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/Common/StatusBadge';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  Boxes,
  Edit,
  Plus,
  Bot,
  MapPin,
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  X
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stock Adjust Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustQty, setAdjustQty] = useState(50);
  const [adjustNote, setAdjustNote] = useState('Manual stock replenishment');

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/inventory/${id || 4}`);
      setProduct(res.data);
    } catch (err) {
      console.error("Product detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleAdjustStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/inventory/${product.id}/adjust`, {
        quantity_change: parseInt(adjustQty),
        note: adjustNote
      });
      setShowAdjustModal(false);
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.detail || "Error adjusting stock");
    }
  };

  if (loading || !product) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading product details...</div>;
  }

  const stockPercentage = Math.min(100, (product.current_stock / product.max_capacity) * 100);

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Top Breadcrumb Header (Matching Screenshot 4) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/inventory" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Inventory</span>
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span>{product.category}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700 font-bold">{product.name}</span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <StatusBadge status={product.status} />
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs">
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setShowAdjustModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Adjust Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Row 1: Product Details, Location, AI Insights (Matching Screenshot 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: PRODUCT DETAILS */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            PRODUCT DETAILS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-slate-400 font-semibold block">SKU</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{product.sku}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Category</span>
                <span className="text-sm font-bold text-slate-800">{product.category}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Supplier</span>
                <span className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">
                  {product.supplier}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Unit Type</span>
                <span className="text-sm font-bold text-slate-800">{product.unit_type}</span>
              </div>
            </div>

            {/* Current Stock Meter Big Display */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  CURRENT STOCK
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-blue-600">
                    {product.current_stock.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{product.unit_type}s</span>
                </div>
              </div>

              {/* Stock Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${stockPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 pt-1">
                  <span>Min: {product.min_stock}</span>
                  <span>Capacity: {product.max_capacity.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Location & AI Insights */}
        <div className="space-y-6">
          {/* Card 2: WAREHOUSE LOCATION Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>WAREHOUSE LOCATION</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                <span className="text-slate-400 font-semibold text-[10px] block uppercase">Zone</span>
                <span className="text-lg font-black text-slate-800">{product.location.zone}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                <span className="text-slate-400 font-semibold text-[10px] block uppercase">Aisle</span>
                <span className="text-lg font-black text-slate-800">{product.location.aisle}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                <span className="text-slate-400 font-semibold text-[10px] block uppercase">Rack</span>
                <span className="text-lg font-black text-slate-800">{product.location.rack}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
                <span className="text-slate-400 font-semibold text-[10px] block uppercase">Shelf</span>
                <span className="text-lg font-black text-slate-800">{product.location.shelf}</span>
              </div>
            </div>

            <div className="text-center pt-1">
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 font-mono">
                Bin: {product.location.bin}
              </span>
            </div>
          </div>

          {/* Card 3: AI INSIGHTS */}
          <div className="bg-blue-50/50 border border-blue-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <Bot className="w-4 h-4 text-blue-600" />
              <span>AI INSIGHTS</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="text-slate-600 font-medium">Avg Daily Usage</span>
                <span className="font-bold text-slate-900">{product.ai_insights.avg_daily_usage}</span>
              </div>
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="text-slate-600 font-medium">Est. Days Remaining</span>
                <span className="font-extrabold text-blue-600">{product.ai_insights.est_days_remaining}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] font-semibold block mb-1">Reorder Recommendation</span>
                <p className="text-slate-700 font-medium text-[11px] leading-relaxed">
                  {product.ai_insights.reorder_recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: INVENTORY HISTORY (30 DAYS) Line Chart (Matching Screenshot 4) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          INVENTORY HISTORY (30 DAYS)
        </h2>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={product.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 100', 'dataMax + 100']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', borderColor: '#cbd5e1', fontSize: '12px' }}
              />
              <Line
                type="monotone"
                dataKey="stock"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ fill: '#2563eb', r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Adjust Stock for {product.name}</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStockSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Quantity Adjustment (Positive to Add, Negative to Remove)
                </label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Note / Reference</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md shadow-blue-500/20 hover:bg-blue-700"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
