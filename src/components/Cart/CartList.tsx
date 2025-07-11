"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';

interface CartItem {
    id: number;
    productId: number;
    quantity: number;
    product: {
        id: number;
        name: string;
    price: number;
        image?: string;
    };
}

interface Cart {
    id: number;
    userId: number;
    items: CartItem[];
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

const CartList: React.FC = () => {
    const { getCart, loading, error } = useApi();
    const [cart, setCart] = React.useState<Cart | null>(null);

    React.useEffect(() => {
        const fetchCart = async () => {
            const response = await getCart();
            if (response) {
                setCart(response);
            }
        };
        fetchCart();
    }, [getCart]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Shopping Cart</CardTitle>
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
                    <CardTitle>Shopping Cart</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500">{error}</div>
                </CardContent>
            </Card>
        );
    }

    if (!cart) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Shopping Cart</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-gray-500">Your cart is empty</div>
                </CardContent>
            </Card>
        );
        }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
            </CardHeader>
            <CardContent>
                    <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                                    <div>
                            <h3 className="font-medium">Customer</h3>
                                        <p className="text-sm text-gray-500">
                                {cart.user.firstName} {cart.user.lastName}
                                        </p>
                            <p className="text-sm text-gray-500">{cart.user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium">Total Amount</p>
                            <p className="text-lg font-bold">${cart.totalAmount.toFixed(2)}</p>
                        </div>
                                    </div>
                    <div className="space-y-2">
                        {cart.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                    <h4 className="font-medium">{item.product.name}</h4>
                                    <p className="text-sm text-gray-500">
                                        Quantity: {item.quantity}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">
                                        ${(item.product.price * item.quantity).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        ${item.product.price.toFixed(2)} each
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CartList; 