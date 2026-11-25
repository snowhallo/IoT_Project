import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('iot_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('iot_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra tính hợp lệ của token khi khởi động ứng dụng
    const initAuth = async () => {
      const savedToken = localStorage.getItem('iot_token');
      if (savedToken) {
        try {
          const profile = await apiService.getMe();
          if (profile) {
            setUser(profile);
            localStorage.setItem('iot_user', JSON.stringify(profile));
          }
        } catch {
          // Token không hợp lệ hoặc đã hết hạn
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const result = await apiService.login(username, password);
    if (result && result.token) {
      setToken(result.token);
      setUser(result.user);
      localStorage.setItem('iot_token', result.token);
      localStorage.setItem('iot_user', JSON.stringify(result.user));
      return result.user;
    }
    throw new Error(result?.message || 'Đăng nhập không thành công');
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.warn('Lỗi khi gọi API đăng xuất:', err.message);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('iot_token');
      localStorage.removeItem('iot_user');
    }
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
