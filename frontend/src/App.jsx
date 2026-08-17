import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from './components/common/Sidebar';
import DashboardPage from './pages/DashboardPage';
import DataSensorPage from './pages/DataSensorPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 antialiased font-sans">
      {/* Toast Notification Provider từ thư viện Sonner */}
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar cố định bên trái */}
      <Sidebar />

      {/* Vùng nội dung chính */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/data-sensor" element={<DataSensorPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
