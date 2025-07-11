"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";

interface Metrics {
    totalCustomers: number;
    totalOrders: number;
    customerGrowth: number;
    orderGrowth: number;
}

const EcommerceMetrics: React.FC = () => {
    const { getAnalytics, loading, error } = useApi();
    const [metrics, setMetrics] = React.useState<Metrics | null>(null);

    React.useEffect(() => {
        const fetchMetrics = async () => {
            const response = await getAnalytics();
            if (response) {
                setMetrics({
                    totalCustomers: response.totalUsers,
                    totalOrders: response.totalOrders,
                    customerGrowth: 0, // TODO: Calculate from historical data
                    orderGrowth: 0, // TODO: Calculate from historical data
                });
            }
        };
        fetchMetrics();
    }, [getAnalytics]);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <CardTitle>
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
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
                    <div className="text-red-500">{error}</div>
                </CardContent>
            </Card>
        );
    }

    if (!metrics) {
        return (
            <Card>
                <CardContent>
                    <div className="text-gray-500">No metrics available</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader>
                    <CardTitle>Total Customers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
                    <p className="text-xs text-gray-500">
                        {metrics.customerGrowth > 0 ? '+' : ''}{metrics.customerGrowth}% from last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalOrders}</div>
                    <p className="text-xs text-gray-500">
                        {metrics.orderGrowth > 0 ? '+' : ''}{metrics.orderGrowth}% from last month
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default EcommerceMetrics;
