"use client";
import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ChartTab from "@/components/common/ChartTab";
import LineChartOne from "@/components/charts/line/LineChartOne";
import BarChartOne from "@/components/charts/bar/BarChartOne";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import AdvancedMetrics from "@/components/analytics/AdvancedMetrics";
import SalesOverview from "@/components/analytics/SalesOverview";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { AnalyticsData } from "@/types/api";
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

const defaultAnalyticsData: AnalyticsData = {
  totalSales: 0,
  totalOrders: 0,
  totalProducts: 0,
  totalUsers: 0,
  totalStores: 0,
  revenue: 0,
  salesByDay: [],
  salesByMonth: [],
  topProducts: [],
  topStores: [],
  topCategories: [],
  orderStatusDistribution: [],
  paymentMethodDistribution: []
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(defaultAnalyticsData);
  const { getAnalytics } = useApi();

  useEffect(() => {
    fetchAnalytics();
  }, [getAnalytics]);

  const fetchAnalytics = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      }
      
      const response = await getAnalytics();
      console.log('API Response:', response);
      
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
    } catch (err) {
      console.error("Failed to load analytics:", err);
      toast.error("Failed to load analytics data");
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

  const safeNumber = (value: number | undefined | null): number => {
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  };

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    growth, 
    color,
    formatValue = (val) => val.toLocaleString()
  }: {
    title: string;
    value: number;
    icon: any;
    growth?: number;
    color: string;
    formatValue?: (val: number) => string;
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={safeNumber(analyticsData.revenue)}
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
                    name: item.month,
                    value: item.amount
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
            averageOrderValue: analyticsData.revenue / Math.max(analyticsData.totalOrders, 1),
            conversionRate: 3.2, // This would come from analytics API
            customerRetention: 68.5, // This would come from analytics API
            monthlyRecurringRevenue: analyticsData.revenue * 0.7 // Estimated based on revenue
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
      </div>
    </div>
  );
} 