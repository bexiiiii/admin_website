"use client";

import React from 'react';
import { useHealthCheck } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface HealthMetrics {
    heapMemoryUsage: {
        used: number;
        max: number;
    };
    nonHeapMemoryUsage: {
        used: number;
        max: number;
    };
    threadCount: number;
    uptime: number;
    systemLoad: number;
    freeMemory: number;
    totalMemory: number;
    maxMemory: number;
}

const HealthDashboard: React.FC = () => {
    const { data, loading, error } = useHealthCheck<HealthMetrics>();

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent>
                    <div className="text-red-500">Failed to load health metrics</div>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card>
                <CardContent>
                    <div className="text-gray-500">No health metrics available</div>
                </CardContent>
            </Card>
        );
    }

    const formatBytes = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = bytes;
        let unitIndex = 0;
        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }
        return `${value.toFixed(2)} ${units[unitIndex]}`;
    };

    const formatUptime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
    };

    const getMemoryUsagePercentage = (used: number, max: number) => {
        return (used / max) * 100;
    };

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Heap Memory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Used:</span>
                                <span>{formatBytes(data.heapMemoryUsage.used)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Max:</span>
                                <span>{formatBytes(data.heapMemoryUsage.max)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{
                                        width: `${getMemoryUsagePercentage(
                                            data.heapMemoryUsage.used,
                                            data.heapMemoryUsage.max
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Load</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Current Load:</span>
                                <span>{data.systemLoad.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Threads:</span>
                                <span>{data.threadCount}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatUptime(data.uptime)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Total Memory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Free:</span>
                                <span>{formatBytes(data.freeMemory)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total:</span>
                                <span>{formatBytes(data.totalMemory)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Max:</span>
                                <span>{formatBytes(data.maxMemory)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Non-Heap Memory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Used:</span>
                                <span>{formatBytes(data.nonHeapMemoryUsage.used)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Max:</span>
                                <span>{formatBytes(data.nonHeapMemoryUsage.max)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-green-600 h-2.5 rounded-full"
                                    style={{
                                        width: `${getMemoryUsagePercentage(
                                            data.nonHeapMemoryUsage.used,
                                            data.nonHeapMemoryUsage.max
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HealthDashboard; 