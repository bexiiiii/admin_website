"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import Link from 'next/link';
import { 
  PieChartIcon, 
  BoxIcon, 
  BoxCubeIcon,
  DollarLineIcon,
  CalenderIcon
} from '@/icons/index';
import { 
  DollarSign as DollarSignIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Calendar as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Clock as ClockIcon
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TodayStats {
  todayOrders: number;
  todayCompletedOrders: number;
  todayCancelledOrders: number;
  todayRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { getAnalytics } = useApi();
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getAnalytics();
        if (response.data?.data) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'STORE_MANAGER') {
      fetchStats();
    }
  }, [user, getAnalytics]);

  if (user?.role !== 'STORE_MANAGER') {
    return null;
  }

  const StatCard = ({ title, value, icon: Icon, color, isLoading = false, subtitle }: {
    title: string;
    value: number | string;
    icon: any;
    color: string;
    isLoading?: boolean;
    subtitle?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20 mb-1" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Manager Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome, {user.name}! Manage your store operations from here.
        </p>
      </div>

      {/* Today's Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Today's Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Today's Orders"
            value={stats?.todayOrders || 0}
            icon={CalenderIcon}
            color="text-blue-600"
            isLoading={loading}
            subtitle="Orders received today"
          />
          <StatCard
            title="Completed Orders"
            value={stats?.todayCompletedOrders || 0}
            icon={CheckCircleIcon}
            color="text-green-600"
            isLoading={loading}
            subtitle="Successfully delivered"
          />
          <StatCard
            title="Cancelled Orders"
            value={stats?.todayCancelledOrders || 0}
            icon={XCircleIcon}
            color="text-red-600"
            isLoading={loading}
            subtitle="Cancelled today"
          />
          <StatCard
            title="Today's Revenue"
            value={loading ? "..." : `$${(stats?.todayRevenue || 0).toLocaleString()}`}
            icon={DollarSignIcon}
            color="text-green-600"
            isLoading={loading}
            subtitle="Revenue from completed orders"
          />
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Store Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={BoxIcon}
            color="text-blue-600"
            isLoading={loading}
            subtitle="All time orders"
          />
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={BoxCubeIcon}
            color="text-purple-600"
            isLoading={loading}
            subtitle="Products in catalog"
          />
          <StatCard
            title="Total Revenue"
            value={loading ? "..." : `$${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={TrendingUpIcon}
            color="text-green-600"
            isLoading={loading}
            subtitle="All time revenue"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                <PieChartIcon className="h-6 w-6 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">View Analytics</div>
                <p className="text-xs text-muted-foreground">
                  Track sales and performance metrics
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <BoxIcon className="h-6 w-6 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Manage Orders</div>
                <p className="text-xs text-muted-foreground">
                  View and process customer orders
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <BoxCubeIcon className="h-6 w-6 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">Manage Products</div>
                <p className="text-xs text-muted-foreground">
                  Add, edit, and organize products
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          Store Manager Access
        </h3>
        <p className="text-yellow-700 dark:text-yellow-300">
          As a store manager, you can view analytics and statistics for your store only. 
          The data shown above includes today's performance and overall store metrics.
        </p>
      </div>
    </div>
  );
}
