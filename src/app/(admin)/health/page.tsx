"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import LineChartOne from '@/components/charts/line/LineChartOne';
import BarChartOne from '@/components/charts/bar/BarChartOne';
import { systemApi } from '@/services/api';

interface SystemMetrics {
  cpu: {
    current: number;
    history: { time: string; usage: number }[];
  };
  memory: {
    current: number;
    total: number;
    used: number;
    history: { time: string; usage: number }[];
  };
  disk: {
    current: number;
    total: number;
    used: number;
    categories: { name: string; usage: number }[];
  };
  network: {
    in: number;
    out: number;
    history: { time: string; in: number; out: number }[];
  };
}

export default function HealthPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await systemApi.getSystemMetrics();
        setMetrics(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load system metrics',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Обновляем каждые 30 секунд

    return () => clearInterval(interval);
  }, [toast]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          No system metrics available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">System Health</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Badge variant={metrics.cpu.current > 80 ? "destructive" : "default"}>
              {metrics.cpu.current}%
            </Badge>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.cpu.current} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">Average: {metrics.cpu.current}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Badge variant={metrics.memory.current > 80 ? "destructive" : "default"}>
              {metrics.memory.current}%
            </Badge>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.memory.current} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {metrics.memory.used}GB / {metrics.memory.total}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <Badge variant={metrics.disk.current > 80 ? "destructive" : "default"}>
              {metrics.disk.current}%
            </Badge>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.disk.current} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {metrics.disk.used}GB / {metrics.disk.total}GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Traffic</CardTitle>
            <Badge variant="default">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p>In: {metrics.network.in} MB/s</p>
              <p>Out: {metrics.network.out} MB/s</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartOne
              data={metrics.cpu.history.map(item => ({
                name: item.time,
                value: item.usage
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartOne
              data={metrics.memory.history.map(item => ({
                name: item.time,
                value: item.usage
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disk Usage by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartOne
              data={metrics.disk.categories.map(item => ({
                name: item.name,
                value: item.usage
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Traffic</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartOne
              data={metrics.network.history.map(item => ({
                name: item.time,
                in: item.in,
                out: item.out
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 