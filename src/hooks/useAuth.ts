import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // TODO: Implement actual login logic with your backend
      const mockUser: User = {
        id: '1',
        email: email,
        name: 'Admin User',
        role: 'ADMIN'
      };
      setUser(mockUser);
      return mockUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // TODO: Implement actual logout logic with your backend
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      // TODO: Implement actual auth check with your backend
      const mockUser: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN'
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
}; 