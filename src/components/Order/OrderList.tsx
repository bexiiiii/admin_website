"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';

interface Order {
    id: number;
    orderNumber: string;
    userId: number;
    storeId: number;
    items: Array<{
        id: number;
        productId: number;
        quantity: number;
        price: number;
        productName: string;
    }>;
    totalAmount: number;
    paymentMethod: 'CASH' | 'CARD' | 'KASPI';
    paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

const OrderList: React.FC = () => {
    const { getOrders, loading, error } = useApi();
    const [orders, setOrders] = React.useState<Order[]>([]);

    React.useEffect(() => {
        const fetchOrders = async () => {
            const response = await getOrders();
            if (response) {
                setOrders(response);
            }
        };
        fetchOrders();
    }, [getOrders]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="mb-4">
                            <Skeleton className="h-4 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500">{error}</div>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'secondary';
            case 'shipped':
                return 'primary';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'destructive';
            default:
                return 'default';
        }
    };

    const getPaymentStatusColor = (status: Order['paymentStatus']) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'PAID':
                return 'success';
            case 'CANCELLED':
                return 'destructive';
            default:
                return 'default';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders</CardTitle>
            </CardHeader>
            <CardContent>
                    <div className="space-y-4">
                        {orders.map((order) => (
                        <div key={order.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                    <h3 className="font-medium">Order #{order.orderNumber}</h3>
                                        <p className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                        <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                                            {order.paymentStatus}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="mt-2">
                                <p className="text-sm">
                                        Total Amount: ${order.totalAmount.toFixed(2)}
                                    </p>
                                <p className="text-sm">
                                    Payment Method: {order.paymentMethod}
                                    </p>
                                </div>
                            <div className="mt-2">
                                <h4 className="text-sm font-medium mb-1">Items:</h4>
                                <ul className="text-sm space-y-1">
                                    {order.items.map((item) => (
                                        <li key={item.id}>
                                            {item.productName} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                                </div>
                            </div>
                        ))}
                    </div>
            </CardContent>
        </Card>
    );
};

export default OrderList; 