import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Sidebar from './components/common/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DataSensorPage from './pages/DataSensorPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      {/* Toast Notification Provider từ thư viện Sonner */}
      <Toaster position="top-right" richColors closeButton />

      <Routes>
        {/* Tuyến đường Đăng nhập (Công khai) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Các tuyến đường Hệ thống (Bắt buộc phải có JWT Token) */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex min-h-screen bg-slate-100 text-slate-800 antialiased font-sans">
                {/* Sidebar cố định bên trái */}
                <Sidebar />

                {/* Vùng nội dung chính */}
                <main className="flex-1 p-3.5 md:p-5 lg:p-6 overflow-y-auto max-h-screen">
                  <div className="max-w-6xl mx-auto">
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/data-sensor" element={<DataSensorPage />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      {/* Bất kỳ route lạ nào cũng chuyển về trang chủ */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
