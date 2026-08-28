import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ProductDetail from './pages/ProductDetail';
import Receiving from './pages/Receiving';
import CCTV from './pages/CCTV';
import Attendance from './pages/Attendance';
import Vehicles from './pages/Vehicles';
import WarehouseMapPage from './pages/WarehouseMapPage';
import Energy from './pages/Energy';
import StockOut from './pages/StockOut';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const OwnerRoute = ({ children }) => {
  const { isOwner } = useAuth();
  if (!isOwner) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const ProtectedLayout = () => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/inventory/:id" element={<ProductDetail />} />
            <Route path="/receiving" element={<Receiving />} />
            <Route path="/cctv" element={<CCTV />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/warehouse" element={<WarehouseMapPage />} />
            <Route path="/energy" element={<OwnerRoute><Energy /></OwnerRoute>} />
            <Route path="/stock-out" element={<StockOut />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/reports" element={<OwnerRoute><Reports /></OwnerRoute>} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
