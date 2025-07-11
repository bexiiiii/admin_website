"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';
import { DiscountDTO } from '@/types/api';

const DiscountList: React.FC = () => {
    const { getDiscounts, loading, error } = useApi();
    const [discounts, setDiscounts] = React.useState<DiscountDTO[]>([]);

    React.useEffect(() => {
        const fetchDiscounts = async () => {
            const response = await getDiscounts();
            if (response) {
                setDiscounts(response);
            }
        };
        fetchDiscounts();
    }, [getDiscounts]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Discounts</CardTitle>
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
                    <CardTitle>Discounts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500">{error}</div>
                </CardContent>
            </Card>
        );
    }

    const formatDiscountValue = (discount: DiscountDTO) => {
        return discount.type === 'PERCENTAGE'
            ? `${discount.value}%`
            : `$${discount.value.toFixed(2)}`;
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'default' : 'destructive';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Discounts</CardTitle>
            </CardHeader>
            <CardContent>
                    <div className="space-y-4">
                        {discounts.map((discount) => (
                        <div key={discount.id} className="p-4 border rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                    <h3 className="font-medium">Code: {discount.code}</h3>
                                        <p className="text-sm text-gray-500">
                                        {formatDiscountValue(discount)}
                                    </p>
                                </div>
                                <Badge variant={getStatusColor(discount.status === 'ACTIVE')}>
                                    {discount.status === 'ACTIVE' ? 'Active' : discount.status === 'EXPIRED' ? 'Expired' : 'Inactive'}
                                </Badge>
                                    </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                    <p>Start Date: {new Date(discount.startDate).toLocaleDateString()}</p>
                                    <p>End Date: {new Date(discount.endDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p>Usage: {discount.usedCount || 0}/{discount.usageLimit || '∞'}</p>
                                    {discount.minPurchaseAmount && (
                                        <p>Min Purchase: ${discount.minPurchaseAmount.toFixed(2)}</p>
                                    )}
                                </div>
                                </div>
                            </div>
                        ))}
                    </div>
            </CardContent>
        </Card>
    );
};

export default DiscountList; 