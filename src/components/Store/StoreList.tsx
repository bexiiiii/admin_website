"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useApi } from '@/hooks/useApi';

interface Store {
    id: number;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    type: string;
    category: string;
    location: string;
    latitude: number;
    longitude: number;
    rating: number;
    imageUrl: string;
    active: boolean;
    openingHours: string;
    createdAt: string;
    updatedAt: string;
}

const StoreList: React.FC = () => {
    const { getStores, loading, error } = useApi();
    const [stores, setStores] = React.useState<Store[]>([]);

    React.useEffect(() => {
        const fetchStores = async () => {
            const response = await getStores();
            if (response) {
                setStores(response);
            }
        };
        fetchStores();
    }, [getStores]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Stores</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="p-4 border rounded-lg">
                                <Skeleton className="h-48 w-full mb-4" />
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
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
                    <CardTitle>Stores</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500">{error}</div>
                </CardContent>
            </Card>
        );
    }

    if (stores.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Stores</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-gray-500">No stores found</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stores</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stores.map((store) => (
                        <div key={store.id} className="p-4 border rounded-lg">
                            <div className="relative h-48 w-full mb-4">
                                <Image
                                    src={store.imageUrl}
                                    alt={store.name}
                                    fill
                                    className="object-cover rounded-lg"
                                />
                            </div>
                            <div>
                                <h3 className="font-medium text-lg mb-1">{store.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{store.description}</p>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant={store.active ? 'default' : 'destructive'}>
                                        {store.active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <div className="flex items-center">
                                        <span className="text-yellow-500 mr-1">★</span>
                                        <span>{store.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <p>{store.address}</p>
                                    <p>{store.phone}</p>
                                    <p>{store.email}</p>
                                </div>
                                <div className="mt-2 text-sm">
                                    <p className="font-medium">Opening Hours:</p>
                                    <p>{store.openingHours}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default StoreList; 