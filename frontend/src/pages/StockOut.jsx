import React, { useEffect, useState } from 'react';
import api from '../services/api';
import StatusBadge from '../components/Common/StatusBadge';
import { TrendingDown, Send, Bot, CheckCircle2, AlertTriangle } from 'lucide-react';

const StockOut = () => {
  const [products, setProducts] = useState([]);
  const [stockOuts, setStockOuts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(25);
  const [destination, setDestination] = useState('Order Dispatch Dock 2');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInit = async () => {
    try {
      const [prodRes, outRes] = await Promise.all([
        api.get('/api/inventory'),
        api.get('/api/stock/out')
      ]);
      setProducts(prodRes.data);
      setStockOuts(outRes.data);
      if (prodRes.data.length > 0 && !selectedProductId) {
        setSelectedProductId(prodRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInit();
  }, []);

  const handleStockOutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/api/stock/out', {
        product_id: parseInt(selectedProductId),
        quantity: parseInt(quantity),
        destination,
        requested_by: 'Manager'
      });
      setResult(res.data);
      fetchInit();
    } catch (err) {
      alert(err.response?.data?.detail || "Dispatch Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Stock-Out Management
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Process stock dispatch deductions and evaluate real-time depletion risks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispatch Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-blue-600" />
            <span>Process Stock Dispatch</span>
          </h2>

          <form onSubmit={handleStockOutSubmit} className="space-y-4 text-xs font-medium">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Select Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold text-slate-800"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.product_name} ({p.sku}) — Available: {p.current_stock}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Outgoing Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Destination Dock</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md shadow-blue-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Confirm Dispatch Out</span>
            </button>
          </form>
        </div>

        {/* AI Risk Outcome Card */}
        {result && (
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <Bot className="w-5 h-5 text-blue-600" />
              <span>AI DEPLETION RISK ANALYSIS</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-blue-100 pb-2">
                <span className="text-slate-600 font-medium">Previous Stock</span>
                <span className="font-bold text-slate-900">{result.previous_stock}</span>
              </div>
              <div className="flex justify-between border-b border-blue-100 pb-2">
                <span className="text-slate-600 font-medium">Dispatched</span>
                <span className="font-bold text-red-600">-{result.outgoing_quantity}</span>
              </div>
              <div className="flex justify-between border-b border-blue-100 pb-2">
                <span className="text-slate-600 font-medium">Remaining Stock</span>
                <span className="font-black text-blue-600">{result.remaining_stock}</span>
              </div>
              <div className="flex justify-between border-b border-blue-100 pb-2">
                <span className="text-slate-600 font-medium">Est. Days Remaining</span>
                <span className="font-bold text-slate-900">{result.estimated_days_remaining} Days</span>
              </div>
              <div className="pt-2">
                <p className="text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-blue-200">
                  {result.ai_risk_analysis}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockOut;
