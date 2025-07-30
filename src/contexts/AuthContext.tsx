"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types/roles';
import { Permission } from '@/types/permission';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  storeId?: number; // For store owners and managers
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuthStatus = async () => {
    try {
      // Check both token and admin_token for compatibility
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      console.log('Auth token:', token);
      
      if (!token) {
        console.log('No token found');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data from API:', userData);
        
        setUser({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role as UserRole,
          permissions: userData.permissions || [],
          storeId: userData.storeId
        });
      } else {
        console.log('Auth response not ok:', response.status);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      // Store token in both locations for compatibility
      const token = data.accessToken || data.token;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('token', token);
      
      setUser({
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role as UserRole,
        permissions: data.user.permissions || [],
        storeId: data.user.storeId
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    console.log('AuthContext logout called');
    try {
      // Попытаться вызвать API logout если токен есть
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      console.log('Token found for logout:', !!token);
      
      if (token) {
        console.log('Calling backend logout API');
        try {
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('Backend logout response status:', response.status);
        } catch (apiError) {
          console.error('Backend logout API failed:', apiError);
          // Продолжаем выполнение даже если API вызов не удался
        }
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    console.log('Clearing local storage and redirecting...');
    // Всегда очищаем локальное состояние
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    
    // Также очищаем cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setUser(null);
    
    // Более надежный способ перенаправления с Next.js router
    console.log('Redirecting to /signin');
    
    try {
      router.push('/signin');
    } catch (routerError) {
      console.error('Router redirect failed, using window.location:', routerError);
      // Fallback на window.location если router не работает
      setTimeout(() => {
        window.location.replace('/signin');
      }, 100);
    }
  };

  const refreshUser = async () => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
