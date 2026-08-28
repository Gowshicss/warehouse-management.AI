import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/Common/StatusBadge';
import {
  Boxes,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  Edit2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X
} from 'lucide-react';

const Inventory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [activeTab, setActiveTab] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [warehouseFilter, setWarehouseFilter] = useState('All Warehouses');

  // Add Product Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    unit_type: 'Box',
    initial_stock: 100,
    min_stock: 30,
    reorder_level: 50,
    unit_cost: 15.0,
    warehouse_id: 1,
    zone_code: 'Zone A',
    aisle_code: '12',
    rack_code: '04',
    shelf_code: 'B',
    bin_code: 'A12-04-B-02'
  });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter !== 'All Categories') params.category = categoryFilter;
      if (activeTab !== 'All Items') params.status = activeTab;

      const res = await api.get('/api/inventory', { params });
      setItems(res.data);
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [activeTab, searchQuery, categoryFilter, warehouseFilter]);

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/inventory', newProduct);
      setShowAddModal(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.detail || "Error creating product");
    }
  };

  // Stock status counts calculation
  const counts = {
    all: items.length,
    healthy: items.filter(i => i.status === 'HEALTHY').length,
    low: items.filter(i => i.status === 'LOW STOCK').length,
    critical: items.filter(i => i.status === 'CRITICAL').length,
    out: items.filter(i => i.status === 'OUT OF STOCK').length,
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Inventory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage stock levels, locations, and product details.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Main Table Card (Matching Screenshot 3) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Status Filter Tabs Row */}
        <div className="border-b border-slate-200 px-6 pt-3 flex items-center gap-6 overflow-x-auto text-xs font-semibold">
          {[
            { label: 'All Items', count: counts.all, color: '' },
            { label: 'Healthy', count: counts.healthy, color: 'text-blue-600' },
            { label: 'Low Stock', count: counts.low, color: 'text-amber-600' },
            { label: 'Critical', count: counts.critical, color: 'text-red-600' },
            { label: 'Out of Stock', count: counts.out, color: 'text-slate-500' },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`pb-3 border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === tab.label
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === tab.label ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU, Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Categories">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Hardware">Hardware</option>
            <option value="Packaging">Packaging</option>
            <option value="Safety">Safety</option>
            <option value="Tools">Tools</option>
          </select>

          {/* Warehouse Filter */}
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All Warehouses">All Warehouses</option>
            <option value="WH-Alpha">WH-Alpha Primary</option>
            <option value="WH-Beta">WH-Beta High-Cap</option>
          </select>

          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>More Filters</span>
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    Loading inventory records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No matching products found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/inventory/${item.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    {/* Product Name & Icon */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          <Boxes className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight hover:text-blue-600 transition-colors">
                            {item.product_name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-normal">
                            Reorder: {item.reorder_level} {item.unit_type}s
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {item.sku}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.category}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {item.location}
                    </td>

                    {/* Current Stock */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className={
                        item.status === 'CRITICAL' || item.status === 'OUT OF STOCK'
                          ? 'text-red-600 font-black'
                          : item.status === 'LOW STOCK'
                          ? 'text-amber-600 font-black'
                          : 'text-slate-900'
                      }>
                        {item.current_stock.toLocaleString()}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={item.status} size="small" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 text-slate-400">
                        <button
                          onClick={() => navigate(`/inventory/${item.id}`)}
                          className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Showing 1 to {items.length} of {items.length} entries</span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg text-xs">1</button>
            <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Inventory Product</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Industrial Sensor Node"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    placeholder="e.g. ELC-SNR-009"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Safety">Safety</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProduct.initial_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, initial_stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Min Stock</label>
                  <input
                    type="number"
                    value={newProduct.min_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, min_stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={newProduct.reorder_level}
                    onChange={(e) => setNewProduct({ ...newProduct, reorder_level: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.unit_cost}
                    onChange={(e) => setNewProduct({ ...newProduct, unit_cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
