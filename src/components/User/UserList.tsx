"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    updatedAt: string;
}

const UserList: React.FC = () => {
    const { getProfile, loading, error } = useApi();
    const [users, setUsers] = React.useState<User[]>([]);

    React.useEffect(() => {
        const fetchUsers = async () => {
            const response = await getProfile();
            if (response) {
                setUsers([response]);
            }
        };
        fetchUsers();
    }, [getProfile]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
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
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-red-500">{error}</div>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (status: User['status']) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'warning';
            case 'suspended':
                return 'destructive';
            default:
                return 'default';
        }
    };

    const getRoleColor = (role: User['role']) => {
        switch (role) {
            case 'admin':
                return 'primary';
            case 'store_owner':
                return 'info';
            case 'customer':
                return 'default';
            default:
                return 'default';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
                    <div className="space-y-4">
                        {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div>
                                <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                            <div className="flex gap-2">
                                <Badge variant={getRoleColor(user.role)}>{user.role}</Badge>
                                <Badge variant={getStatusColor(user.status)}>{user.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
            </CardContent>
        </Card>
    );
};

export default UserList; 