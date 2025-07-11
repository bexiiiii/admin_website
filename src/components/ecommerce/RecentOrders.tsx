"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/hooks/useApi";
import { OrderDTO } from "@/types/api";

const RecentOrders: React.FC = () => {
    const { getOrders, loading, error } = useApi();
    const [orders, setOrders] = React.useState<OrderDTO[]>([]);

    React.useEffect(() => {
        const fetchOrders = async () => {
            const response = await getOrders();
            if (response) {
                setOrders(response.slice(0, 5));
            }
        };
        fetchOrders();
    }, [getOrders]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                            </div>
                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500">{error}</div>
                </CardContent>
            </Card>
        );
    }

    if (!orders.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-gray-500">No recent orders</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    Order #{order.id}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {order.userName || 'Unknown Customer'}
                            </p>
                        </div>
                            <div className="flex items-center gap-4">
                                <p className="text-sm font-medium">
                                    ${(order.totalAmount || 0).toFixed(2)}
                            </p>
                                <Badge variant={
                                    order.status === 'DELIVERED' ? 'default' :
                                    order.status === 'PENDING' ? 'secondary' :
                                    order.status === 'CANCELLED' ? 'destructive' : 'outline'
                                }>
                                {order.status}
                                </Badge>
                        </div>
                    </div>
                ))}
            </div>
            </CardContent>
        </Card>
    );
};

export default RecentOrders;
