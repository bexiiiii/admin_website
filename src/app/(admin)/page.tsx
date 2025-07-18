"use client";

import EcommerceMetrics from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { StoreOrderStatsTable } from "@/components/stats/StoreOrderStatsTable";
import { OrderStatsCard } from "@/components/stats/OrderStatsCard";
import { MyStoreInfo } from "@/components/Store/MyStoreInfo";
import { StoreStats, StoresList } from "@/components/dashboard/StoreStats";
import { orderApi } from "@/services/api";
import { OrderStatsDTO } from "@/types/api";
import { useRoleBasedRoutes } from "@/hooks/useRoleBasedRoutes";
import { Permission } from "@/types/permission";
import { UserRole } from "@/types/roles";

const Ecommerce = () => {
  const { hasPermission, user } = useRoleBasedRoutes();
  const [orderStats, setOrderStats] = React.useState<OrderStatsDTO | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Проверяем роли пользователя
  const isStoreUser = user?.role === UserRole.STORE_OWNER || user?.role === UserRole.MANAGER;
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Более простая проверка прав доступа
  const canReadOrders = hasPermission(Permission.ORDER_READ) || isAdmin || isStoreUser;
  const canReadAnalytics = hasPermission(Permission.ANALYTICS_READ) || isAdmin;

  React.useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        if (isAdmin) {
          const stats = await orderApi.getStats();
          setOrderStats(stats);
        } else if (hasPermission(Permission.ORDER_READ)) {
          const stats = await orderApi.getMyStoreStats();
          setOrderStats(stats);
        }
      } catch (error) {
        console.error('Error fetching order stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStats();
  }, [hasPermission, isAdmin]);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      {/* Статистика магазинов (для админов) */}
      {isAdmin && (
        <div className="col-span-12">
          <StoreStats className="mb-6" />
        </div>
      )}
      
      {/* Левая колонка */}
      <div className="col-span-12 space-y-6 xl:col-span-7">
        {/* Для админов показываем общие метрики */}
        {isAdmin && <EcommerceMetrics />}
        
        {/* Статистика заказов */}
        {orderStats && (
          <OrderStatsCard
            title={isStoreUser ? "Статистика заказов моего заведения" : "Общая статистика заказов"}
            totalOrders={orderStats.totalOrders}
            successfulOrders={orderStats.successfulOrders}
            failedOrders={orderStats.failedOrders}
            pendingOrders={orderStats.pendingOrders}
          />
        )}
        
        <MonthlySalesChart />
      </div>

      {/* Правая колонка */}
      <div className="col-span-12 space-y-6 xl:col-span-5">
        {/* Для пользователей заведений показываем информацию о заведении */}
        {isStoreUser && <MyStoreInfo />}
        
        {/* Для админов показываем список магазинов */}
        {isAdmin && <StoresList className="mb-6" />}
        
        {/* Для админов показываем стандартные компоненты */}
        {isAdmin && (
          <>
            <MonthlyTarget />
            <StatisticsChart />
            <DemographicCard />
          </>
        )}
      </div>

      <div className="col-span-12">
        <RecentOrders />
      </div>

      {/* Статистика заказов по заведениям (только для админов) */}
      {isAdmin && (
        <div className="col-span-12">
          <StoreOrderStatsTable />
        </div>
      )}
    </div>
  );
};

export default Ecommerce;
