"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from "next/navigation";

export default function DevAuthPage() {
  const { user, loading } = useAuth();
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  const authenticateAs = async (role: string) => {
    setAuthLoading(true);
    try {
      const response = await fetch(`https://foodsave/api/auth/dev-login?role=${role}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const authData = await response.json();
        const { accessToken, user: devUser } = authData;

        document.cookie = `token=${accessToken}; path=/; max-age=86400`;
        localStorage.setItem('token', accessToken);
        if (devUser) {
          localStorage.setItem('user', JSON.stringify(devUser));
          document.cookie = `userRole=${devUser.role}; path=/; max-age=86400`;
        }

        window.location.reload();
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    // Удаляем токены и данные пользователя
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Удаляем cookie с разными путями
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "token=; path=/; domain=" + window.location.hostname + "; max-age=0";
    document.cookie = "userRole=; path=/; max-age=0";
    document.cookie = "userRole=; path=/; domain=" + window.location.hostname + "; max-age=0";

    // Можно вызвать logout из useAuth, если он есть
    // logout();

    // Перенаправляем на логин (replace, чтобы нельзя было вернуться назад)
    window.location.replace("/auth/sign-in");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Development Authentication</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> <span className="bg-blue-100 px-2 py-1 rounded">{user.role}</span></p>
                <p><strong>ID:</strong> {user.id}</p>
              </div>
            ) : (
              null
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Switch Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                onClick={() => authenticateAs('STORE_MANAGER')}
                disabled={authLoading}
                className="w-full"
                variant={user?.role === 'STORE_MANAGER' ? 'default' : 'outline'}
              >
                Store Manager
              </Button>
              <Button 
                onClick={() => authenticateAs('STORE_OWNER')}
                disabled={authLoading}
                className="w-full"
                variant={user?.role === 'STORE_OWNER' ? 'default' : 'outline'}
              >
                Store Owner
              </Button>
              <Button 
                onClick={() => authenticateAs('SUPER_ADMIN')}
                disabled={authLoading}
                className="w-full"
                variant={user?.role === 'SUPER_ADMIN' ? 'default' : 'outline'}
              >
                Super Admin
              </Button>
              <Button 
                onClick={() => authenticateAs('CUSTOMER')}
                disabled={authLoading}
                className="w-full"
                variant={user?.role === 'CUSTOMER' ? 'default' : 'outline'}
              >
                Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Role Access Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-600">STORE_MANAGER</h4>
              <p className="text-sm text-gray-600">Access: Manager Dashboard, Analytics, Orders, Products, Profile</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600">STORE_OWNER</h4>
              <p className="text-sm text-gray-600">Access: Dashboard, Analytics, Orders, Products, Categories, Stores, etc.</p>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600">SUPER_ADMIN</h4>
              <p className="text-sm text-gray-600">Access: All pages including Users, Roles, System Health</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-600">CUSTOMER</h4>
              <p className="text-sm text-gray-600">Limited access for testing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-4">
        {user && (
          <Button onClick={handleLogout} variant="destructive" className="ml-auto">
            Выйти
          </Button>
        )}
      </div>
    </div>
  );
}
