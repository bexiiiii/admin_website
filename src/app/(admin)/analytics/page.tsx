"use client";
import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { toast as hotToast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from 'xlsx';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import ChartTab from "@/components/common/ChartTab";
import ProtectedRoute from '@/components/ProtectedRoute';
import LineChartOne from "@/components/charts/line/LineChartOne";
import BarChartOne from "@/components/charts/bar/BarChartOne";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import AdvancedMetrics from "@/components/analytics/AdvancedMetrics";
import SalesOverview from "@/components/analytics/SalesOverview";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { StoreOrderStatsTable } from "@/components/stats/StoreOrderStatsTable";
import { OrderStatsCard } from "@/components/stats/OrderStatsCard";
import { AnalyticsData, OrderStatsDTO } from "@/types/api";
import { orderApi } from "@/services/api";
import { useRoleBasedRoutes } from "@/hooks/useRoleBasedRoutes";
import { useAuth } from "@/hooks/useAuth";
import { Permission } from "@/types/permission";
import { RoleGuard, AdminOnly, StoreManagementRoles } from "@/components/auth/RoleGuard";
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  UsersIcon, 
  ShoppingCartIcon, 
  DollarSignIcon,
  PackageIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  StoreIcon,
  CreditCardIcon,
  EyeIcon,
  RefreshCwIcon,
  DownloadIcon
} from "lucide-react";

interface DailySalesAnalytics {
    storeId: number;
    storeName: string;
    date: string;
    totalOrders: number;
    completedOrders: number;
    canceledOrders: number;
    totalRevenue: number;
    completedRevenue: number;
    canceledRevenue: number;
}

const defaultAnalyticsData: AnalyticsData = {
  totalSales: 0,
  totalOrders: 0,
  totalProducts: 0,
  totalUsers: 0,
  totalStores: 0,
  totalRevenue: 0,
  revenue: 0,
  salesByDay: [],
  salesByMonth: [],
  topProducts: [],
  topStores: [],
  topCategories: [],
  orderStatusDistribution: [],
  paymentMethodDistribution: []
};

// MetricCard component
interface MetricCardProps {
  title: string;
  value: number;
  icon: any;
  growth?: number;
  color: string;
  formatValue?: (val: number) => string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  growth, 
  color,
  formatValue = (val) => val.toLocaleString()
}) => (
  <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-0 shadow-sm hover:shadow-md transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </CardTitle>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatValue(value)}
          </div>
          {growth !== undefined && (
            <div className="flex items-center mt-1">
              {growth >= 0 ? (
                <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs font-medium ${
                growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(growth).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(defaultAnalyticsData);
  const [orderStats, setOrderStats] = useState<OrderStatsDTO | null>(null);
  const [dailySalesAnalytics, setDailySalesAnalytics] = useState<DailySalesAnalytics[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [availableStores, setAvailableStores] = useState<{id: number, name: string}[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const { getAnalytics } = useApi();
  const { hasPermission } = useRoleBasedRoutes();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
    fetchStores();
  }, [getAnalytics]);

  // Auto-select first store for managers
  useEffect(() => {
    if (user?.role === 'STORE_MANAGER' && availableStores.length > 0 && selectedStoreId === 'all') {
      setSelectedStoreId(availableStores[0].id.toString());
    }
  }, [user?.role, availableStores, selectedStoreId]);

  // Fetch available stores
  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://foodsave/api/stores', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      // Extract stores from paginated response
      const stores = data.content || data || [];
      setAvailableStores(stores.map((store: any) => ({
        id: store.id,
        name: store.name
      })));
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast({
        title: "Error",
        description: "Failed to load stores list",
        variant: "destructive",
      });
    } finally {
      setStoresLoading(false);
    }
  };

  const fetchDailySalesAnalytics = async () => {
    setSalesLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `https://foodsave/api/analytics/daily-sales?startDate=${startDate}&endDate=${endDate}`;

      // For STORE_MANAGER, always use their specific store
      // For others, add store filter if specific store is selected
      if (user?.role === 'STORE_MANAGER' || selectedStoreId !== 'all') {
        const storeIdToUse = user?.role === 'STORE_MANAGER' 
          ? availableStores.length > 0 ? availableStores[0].id : selectedStoreId
          : selectedStoreId;
        url += `&storeId=${storeIdToUse}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch daily sales analytics');
      }

      const data = await response.json();
      
      // Filter data on frontend if backend doesn't support store filtering yet
      let filteredData = data;
      if (selectedStoreId !== 'all') {
        filteredData = data.filter((item: DailySalesAnalytics) => 
          item.storeId.toString() === selectedStoreId
        );
      }
      
      setDailySalesAnalytics(filteredData);
    } catch (error) {
      console.error('Error fetching daily sales analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load daily sales analytics",
        variant: "destructive",
      });
    } finally {
      setSalesLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('kk-KZ', {
      style: 'currency',
      currency: 'KZT'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('kk-KZ');
  };

  // Подсчет общих показателей для ежедневной аналитики
  const totalSalesStats = dailySalesAnalytics.reduce((acc, item) => {
    acc.totalOrders += item.totalOrders;
    acc.completedOrders += item.completedOrders;
    acc.canceledOrders += item.canceledOrders;
    acc.totalRevenue += item.totalRevenue;
    acc.completedRevenue += item.completedRevenue;
    acc.canceledRevenue += item.canceledRevenue;
    return acc;
  }, {
    totalOrders: 0,
    completedOrders: 0,
    canceledOrders: 0,
    totalRevenue: 0,
    completedRevenue: 0,
    canceledRevenue: 0
  });

  // Excel export function
  const exportToExcel = () => {
    if (dailySalesAnalytics.length === 0) {
      toast({
        title: "No Data",
        description: "No data available to export. Please load data first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Helper function to format currency properly
      const formatCurrencyForExcel = (amount: number) => {
        return new Intl.NumberFormat('kk-KZ', {
          style: 'currency',
          currency: 'KZT'
        }).format(amount);
      };

      // Prepare the main data exactly as shown in the table
      const excelData = [
        // Header row
        ['Date', 'Store', 'Total Orders', 'Completed', 'Canceled', 'Total Revenue', 'Completed Revenue', 'Canceled Revenue'],
        
        // Data rows - exactly as they appear in the table
        ...dailySalesAnalytics.map(item => [
          formatDate(item.date),
          item.storeName,
          item.totalOrders,
          item.completedOrders,
          item.canceledOrders,
          formatCurrencyForExcel(item.totalRevenue),
          formatCurrencyForExcel(item.completedRevenue),
          formatCurrencyForExcel(item.canceledRevenue)
        ]),
        
        // Empty row for separation
        ['', '', '', '', '', '', '', ''],
        
        // Summary section
        ['SUMMARY STATISTICS', '', '', '', '', '', '', ''],
        ['Total Orders:', totalSalesStats.totalOrders, '', '', '', '', '', ''],
        ['Completed Orders:', totalSalesStats.completedOrders, '', '', '', '', '', ''],
        ['Canceled Orders:', totalSalesStats.canceledOrders, '', '', '', '', '', ''],
        ['Total Revenue:', formatCurrencyForExcel(totalSalesStats.totalRevenue), '', '', '', '', '', ''],
        ['Completed Revenue:', formatCurrencyForExcel(totalSalesStats.completedRevenue), '', '', '', '', '', ''],
        ['Canceled Revenue:', formatCurrencyForExcel(totalSalesStats.canceledRevenue), '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['Export Parameters:', '', '', '', '', '', '', ''],
        ['Start Date:', startDate, '', '', '', '', '', ''],
        ['End Date:', endDate, '', '', '', '', '', ''],
        ['Store Filter:', selectedStoreId === 'all' ? 'All Stores' : availableStores.find(s => s.id.toString() === selectedStoreId)?.name || 'Unknown', '', '', '', '', '', ''],
        ['Export Date:', new Date().toLocaleDateString('en-GB'), '', '', '', '', '', '']
      ];

      // Create worksheet from array of arrays
      const worksheet = XLSX.utils.aoa_to_sheet(excelData);
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 12 }, // Date
        { wch: 20 }, // Store
        { wch: 14 }, // Total Orders
        { wch: 12 }, // Completed
        { wch: 10 }, // Canceled
        { wch: 16 }, // Total Revenue
        { wch: 18 }, // Completed Revenue
        { wch: 16 }, // Canceled Revenue
      ];
      worksheet['!cols'] = columnWidths;

      // Style the header row (make it bold)
      const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'];
      headerCells.forEach(cell => {
        if (worksheet[cell]) {
          worksheet[cell].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "E3F2FD" } }
          };
        }
      });

      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Sales Analytics');

      // Generate filename with current parameters
      const storeInfo = selectedStoreId === 'all' ? 'All_Stores' : 
        (availableStores.find(s => s.id.toString() === selectedStoreId)?.name || 'Unknown_Store').replace(/\s+/g, '_');
      const filename = `Daily_Sales_Analytics_${storeInfo}_${startDate}_to_${endDate}_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save the file
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Экспорт успешен",
        description: `Данные аналитики экспортированы в файл ${filename}`,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось экспортировать данные в Excel. Попробуйте еще раз.",
        variant: "destructive",
      });
    }
  };

  const fetchAnalytics = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      }
      
      const response = await getAnalytics();
      console.log('API Response:', response);
      console.log('totalStores:', response?.totalStores);
      console.log('totalUsers:', response?.totalUsers);
      console.log('totalProducts:', response?.totalProducts);
      console.log('totalOrders:', response?.totalOrders);
      console.log('totalRevenue:', response?.totalRevenue);
      
      if (response) {
        // Merge the API response with default values to ensure all arrays exist
        const mergedData = {
          ...defaultAnalyticsData,
          ...response,
          // Ensure these fields exist even if not in API response
          salesByDay: response.salesByDay || [],
          salesByMonth: response.salesByMonth || [],
          topProducts: response.topProducts || [],
          topStores: response.topStores || [],
          topCategories: response.topCategories || [],
          orderStatusDistribution: response.orderStatusDistribution || [],
          paymentMethodDistribution: response.paymentMethodDistribution || []
        };
        setAnalyticsData(mergedData);
      } else {
        console.warn('Invalid API response structure:', response);
        setAnalyticsData(defaultAnalyticsData);
      }

      // Загружаем статистику заказов
      try {
        if (hasPermission(Permission.ANALYTICS_READ)) {
          const stats = await orderApi.getStats();
          setOrderStats(stats);
        } else if (hasPermission(Permission.ORDER_READ)) {
          const stats = await orderApi.getMyStoreStats();
          setOrderStats(stats);
        }
      } catch (orderStatsError) {
        console.error("Failed to load order stats:", orderStatsError);
        // Не показываем ошибку пользователю, так как это дополнительная информация
      }
      
    } catch (err) {
      console.error("Failed to load analytics:", err);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
      setAnalyticsData(defaultAnalyticsData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100);
  };

  const safeNumber = (value: any): number => {
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Metric Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Charts Skeleton */}
        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4 bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3 bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
        
        {/* Additional Cards Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-white dark:bg-gray-800 border-0 shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'STORE_MANAGER', 'STORE_OWNER']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your business performance and insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCwIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <DownloadIcon className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Time Range:</span>
          <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '90d', label: '90 Days' },
              { value: '1y', label: '1 Year' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  timeRange === option.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard
            title="Total Revenue"
            value={safeNumber(analyticsData.totalRevenue || analyticsData.revenue || 0)}
            icon={DollarSignIcon}
            growth={12.5}
            color="bg-green-500"
            formatValue={(val) => `$${val.toLocaleString()}`}
          />
          <MetricCard
            title="Total Orders"
            value={safeNumber(analyticsData.totalOrders)}
            icon={ShoppingCartIcon}
            growth={8.2}
            color="bg-blue-500"
          />
          <MetricCard
            title="Total Products"
            value={safeNumber(analyticsData.totalProducts)}
            icon={PackageIcon}
            growth={6.8}
            color="bg-indigo-500"
          />
          <MetricCard
            title="Total Users"
            value={safeNumber(analyticsData.totalUsers)}
            icon={UsersIcon}
            growth={15.3}
            color="bg-purple-500"
          />
          <MetricCard
            title="Total Stores"
            value={safeNumber(analyticsData.totalStores)}
            icon={StoreIcon}
            growth={5.1}
            color="bg-orange-500"
          />
        </div>

        {/* Order Statistics Cards */}
        {orderStats && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Order Statistics
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <OrderStatsCard
                title="Overall Order Statistics"
                totalOrders={orderStats.totalOrders}
                successfulOrders={orderStats.successfulOrders}
                failedOrders={orderStats.failedOrders}
                pendingOrders={orderStats.pendingOrders}
                icon={<ShoppingCartIcon className="h-4 w-4" />}
              />
              
              <MetricCard
                title="Success Rate"
                value={orderStats.totalOrders > 0 ? (orderStats.successfulOrders / orderStats.totalOrders) * 100 : 0}
                icon={TrendingUpIcon}
                color="bg-green-500"
                formatValue={(val) => `${val.toFixed(1)}%`}
              />
              
              <MetricCard
                title="Pending Orders"
                value={orderStats.pendingOrders + orderStats.confirmedOrders + orderStats.preparingOrders + orderStats.readyOrders}
                icon={ActivityIcon}
                color="bg-yellow-500"
                formatValue={(val) => `${val}`}
              />
            </div>
          </div>
        )}

        {/* Store Order Statistics Table (only for admins) */}
        {hasPermission(Permission.ANALYTICS_READ) && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Store Performance
            </h2>
            <AdminOnly>
              <StoreOrderStatsTable />
            </AdminOnly>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Sales Trend Chart */}
          <Card className="lg:col-span-4 bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5 text-blue-500" />
                  Sales Trend
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Monthly sales performance overview
                </p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                +12.5% vs last period
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <LineChartOne 
                  data={(analyticsData.salesByMonth || []).map(item => ({
                    month: item.month,
                    amount: item.amount,
                    orders: item.orders || 0
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Top Categories Chart */}
          <Card className="lg:col-span-3 bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3Icon className="h-5 w-5 text-purple-500" />
                Top Categories
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Revenue by category
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <BarChartOne 
                  data={(analyticsData.topCategories || []).map(item => ({
                    name: item.name,
                    value: item.revenue
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Products */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <PackageIcon className="h-5 w-5 text-green-500" />
                Top Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analyticsData.topProducts || []).slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.sales} sales
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${product.revenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ActivityIcon className="h-5 w-5 text-orange-500" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analyticsData.orderStatusDistribution || []).map((status, index) => (
                  <div key={status.status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {status.status}
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {status.count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${status.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5 text-indigo-500" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analyticsData.paymentMethodDistribution || []).map((method) => (
                  <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {method.method}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {method.count}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {method.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Metrics */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Advanced Metrics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Detailed performance indicators for deeper insights
          </p>
        </div>
        <AdvancedMetrics 
          data={{
            averageOrderValue: (analyticsData.totalRevenue || analyticsData.revenue || 0) / Math.max(analyticsData.totalOrders, 1),
            conversionRate: 0.12, // This would need to be calculated from actual data
            customerRetention: 0.68, // This would need to be calculated from actual data
            monthlyRecurringRevenue: (analyticsData.totalRevenue || analyticsData.revenue || 0) * 0.7 // Estimated based on revenue
          }}
        />

        {/* Sales Overview */}
        <SalesOverview 
          salesData={analyticsData.salesByDay || []}
          topStores={analyticsData.topStores || []}
        />

        {/* Additional Analytics Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DemographicCard />
          <MonthlyTarget />
        </div>

        {/* Daily Sales Analytics - Only for SUPER_ADMIN */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Daily Sales Analytics
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Daily breakdown of sales and orders by store
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="storeSelect">
                  Store {user?.role === 'STORE_MANAGER' && "(Your Store)"}
                </Label>
                <select
                  id="storeSelect"
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className={`w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    user?.role === 'STORE_MANAGER' ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={storesLoading || user?.role === 'STORE_MANAGER'}
                >
                  {user?.role !== 'STORE_MANAGER' && (
                    <option value="all">All Stores</option>
                  )}
                  {availableStores.map((store) => (
                    <option key={store.id} value={store.id.toString()}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button 
                onClick={fetchDailySalesAnalytics} 
                disabled={salesLoading || storesLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {salesLoading ? (
                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <ActivityIcon className="h-4 w-4" />
                )}
                {salesLoading ? 'Loading...' : 'Load Data'}
              </Button>
              <Button 
                onClick={exportToExcel} 
                disabled={salesLoading || dailySalesAnalytics.length === 0}
                variant="outline"
                className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100 flex items-center gap-2"
              >
                <DownloadIcon className="h-4 w-4" />
                Export Excel
              </Button>
              <Button 
                onClick={() => {
                  setDailySalesAnalytics([]);
                  // Only reset to 'all' if user is not a STORE_MANAGER
                  if (user?.role !== 'STORE_MANAGER') {
                    setSelectedStoreId('all');
                  } else if (availableStores.length > 0) {
                    setSelectedStoreId(availableStores[0].id.toString());
                  }
                }} 
                variant="outline"
                disabled={salesLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Summary Cards for Daily Sales */}
          {dailySalesAnalytics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSalesStats.totalOrders}</div>
                  <div className="text-xs text-muted-foreground">
                    Completed: {totalSalesStats.completedOrders} | Canceled: {totalSalesStats.canceledOrders}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(totalSalesStats.totalRevenue)}</div>
                  <div className="text-xs text-muted-foreground">
                    From all orders
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Canceled Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSalesStats.canceledRevenue)}</div>
                  <div className="text-xs text-muted-foreground">
                    Lost from canceled orders
                  </div>
                </CardContent>
              </Card>
            </div>
          )}            {/* Daily Sales Table */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales by Store</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Store</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Canceled</TableHead>
                        <TableHead>Total Revenue</TableHead>
                        <TableHead>Completed Revenue</TableHead>
                        <TableHead>Canceled Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailySalesAnalytics.length > 0 ? (
                        dailySalesAnalytics.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {formatDate(item.date)}
                            </TableCell>
                            <TableCell>{item.storeName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.totalOrders}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                {item.completedOrders}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-red-100 text-red-800">
                                {item.canceledOrders}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(item.totalRevenue)}
                            </TableCell>
                            <TableCell className="text-green-600">
                              {formatCurrency(item.completedRevenue)}
                            </TableCell>
                            <TableCell className="text-red-600">
                              {formatCurrency(item.canceledRevenue)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-gray-500 dark:text-gray-400">
                                {salesLoading ? 'Loading analytics data...' : 'No data loaded yet.'}
                              </p>
                              {!salesLoading && (
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                  Select date range and click &quot;Load Data&quot; to see analytics
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}