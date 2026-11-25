import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Database,
  History,
  User,
  Cpu,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất khỏi hệ thống!');
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Data Sensor',
      path: '/data-sensor',
      icon: Database,
    },
    {
      name: 'History',
      path: '/history',
      icon: History,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
    },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between p-4 min-h-screen select-none shrink-0">
      <div>
        {/* Brand Header gọn gàng */}
        <div className="flex items-center gap-2.5 px-2 py-3 mb-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 tracking-tight leading-none">
              IoT Dashboard
            </h1>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3" /> Đã xác thực
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Thông tin User & Nút Đăng xuất */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
          <img
            src={user?.avatarUrl || '/avatar.JPG'}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
            onError={(e) => {
              e.target.src = 'https://ui-avatars.com/api/?name=Nguyen+Tuan+Tai&background=0D8ABC&color=fff';
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate leading-tight">
              {user?.fullName || 'Nguyễn Tuấn Tài'}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {user?.studentId || 'B23DCCN731'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
