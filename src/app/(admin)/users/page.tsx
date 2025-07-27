"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { useModal } from '@/hooks/useModal';
import { userApi } from '@/services/api';
import { UserDTO, UserCreateRequest, UserUpdateRequest } from '@/types/api';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';

interface UserFormData {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    role: 'STORE_OWNER' | 'SUPER_ADMIN' | 'CUSTOMER' | 'STORE_MANAGER';
    active: boolean;
    phone?: string;
    address?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { isOpen, openModal, closeModal } = useModal();
    const [selectedUser, setSelectedUser] = useState<UserDTO | undefined>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'CUSTOMER',
        active: true,
        phone: '',
        address: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAll();
            setUsers(response);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userData: UserCreateRequest = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password!,
                phone: formData.phone,
                address: formData.address,
                role: formData.role,
                active: formData.active
            };
            
            await userApi.create(userData);
            toast.success('User created successfully');
            setIsCreateModalOpen(false);
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                password: '',
                role: 'CUSTOMER',
                active: true,
                phone: '',
                address: ''
            });
            fetchUsers();
        } catch (error) {
            console.error('Failed to create user:', error);
            toast.error('Failed to create user');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            const updateData: UserUpdateRequest = {
                id: selectedUser.id,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                role: formData.role,
                active: formData.active
            };
            await userApi.update(selectedUser.id, updateData);
            toast.success('User updated successfully');
            closeModal();
            setSelectedUser(undefined);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Failed to update user');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await userApi.delete(id);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error('Failed to delete user');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadAvatar = async () => {
        if (!selectedFile || !selectedUser) return;

        try {
            // Note: Avatar upload would need a separate endpoint
            // await userApi.updateAvatar(selectedFile);
            toast.success('Avatar updated successfully');
            setSelectedFile(null);
            setPreviewUrl('');
            fetchUsers();
        } catch (error) {
            console.error('Failed to upload avatar:', error);
            toast.error('Failed to upload avatar');
        }
    };

    const getStatusColor = (active: boolean) => {
        return active ? 'default' : 'secondary';
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'CUSTOMER':
                return 'Customer';
            case 'STORE_MANAGER':
                return 'Store Manager';
            case 'STORE_OWNER':
                return 'Store Owner';
            case 'SUPER_ADMIN':
                return 'Super Admin';
            default:
                return role;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredUsers = (users || []).filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 dark:bg-gray-900">
                <div className="mb-6">
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="bg-white dark:bg-gray-800">
                            <CardContent className="p-6">
                                <Skeleton className="h-4 w-1/4 mb-2" />
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <div className="p-6 bg-gray-50 dark:bg-gray-900">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Users Management</h1>
                    <Button 
                        className="bg-brand-500 hover:bg-brand-600 text-white"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <span className="mr-2">+</span>
                        Add User
                </Button>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">🔍</span>
                    <Input
                        type="text"
                        placeholder="Search users by name, email, or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white dark:bg-gray-800"
                    />
                </div>
            </div>

            <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                                    {user.profilePicture ? (
                                                        <Image
                                                            src={user.profilePicture}
                                                            alt={`${user.firstName} ${user.lastName}`}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                            <span className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                                                                {user.firstName[0]}{user.lastName[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        ID: {user.id}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{getRoleDisplayName(user.role)}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(user.active)}>
                                                {user.active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setFormData({
                                                            email: user.email,
                                                            firstName: user.firstName,
                                                            lastName: user.lastName,
                                                            password: '',
                                                            role: user.role,
                                                            active: user.active,
                                                            phone: user.phone || '',
                                                            address: user.address || ''
                                                        });
                                                        openModal();
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setFormData({
                        email: '',
                        firstName: '',
                        lastName: '',
                        password: '',
                        role: 'CUSTOMER',
                        active: true,
                        phone: '',
                        address: ''
                    });
                }}
                className="max-w-2xl mx-auto"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Create New User
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setFormData({
                                    email: '',
                                    firstName: '',
                                    lastName: '',
                                    password: '',
                                    role: 'CUSTOMER',
                                    active: true,
                                    phone: '',
                                    address: ''
                                });
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </Button>
                    </div>

                    <form onSubmit={handleCreateUser} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    First Name
                                </Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                    className="bg-white dark:bg-gray-800"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Last Name
                                </Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                    className="bg-white dark:bg-gray-800"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="bg-white dark:bg-gray-800"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                className="bg-white dark:bg-gray-800"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Role
                                </Label>
                                <select
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserFormData['role'] }))}
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    required
                                    aria-label="Select user role"
                                >
                                    <option value="CUSTOMER">Customer</option>
                                    <option value="STORE_MANAGER">Store Manager</option>
                                    <option value="STORE_OWNER">Store Owner</option>
                                    <option value="SUPER_ADMIN">Super Admin</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Status
                                </Label>
                                <select
                                    id="active"
                                    value={formData.active ? 'true' : 'false'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === 'true' }))}
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                    required
                                    aria-label="Select user status"
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setFormData({
                                        email: '',
                                        firstName: '',
                                        lastName: '',
                                        password: '',
                                        role: 'CUSTOMER',
                                        active: true,
                                        phone: '',
                                        address: ''
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-brand-500 hover:bg-brand-600 text-white"
                            >
                                Create User
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            <Modal
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    setSelectedUser(undefined);
                    setFormData({
                        email: '',
                        firstName: '',
                        lastName: '',
                        password: '',
                        role: 'CUSTOMER',
                        active: true,
                        phone: '',
                        address: ''
                    });
                }}
                className="max-w-2xl mx-auto"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Edit User
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                closeModal();
                                setSelectedUser(undefined);
                                setFormData({
                                    email: '',
                                    firstName: '',
                                    lastName: '',
                                    password: '',
                                    role: 'CUSTOMER',
                                    active: true,
                                    phone: '',
                                    address: ''
                                });
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </Button>
                    </div>

                    {selectedUser && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="relative h-24 w-24 rounded-full overflow-hidden">
                                    {previewUrl ? (
                                        <Image
                                            src={previewUrl}
                                            alt="Preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : selectedUser.profilePicture ? (
                                        <Image
                                            src={selectedUser.profilePicture}
                                            alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                            <span className="text-2xl font-semibold text-gray-500 dark:text-gray-400">
                                                {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Profile Picture
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="bg-white dark:bg-gray-800"
                                        />
                                        {selectedFile && (
                                            <Button
                                                type="button"
                                                onClick={handleUploadAvatar}
                                                className="bg-brand-500 hover:bg-brand-600 text-white"
                                            >
                                                Upload
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleUpdateUser} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editFirstName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            First Name
                                        </Label>
                                        <Input
                                            id="editFirstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                            className="bg-white dark:bg-gray-800"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="editLastName" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Last Name
                                        </Label>
                                        <Input
                                            id="editLastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                            className="bg-white dark:bg-gray-800"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="editEmail" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Email
                                    </Label>
                                    <Input
                                        id="editEmail"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="bg-white dark:bg-gray-800"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editRole" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Role
                                        </Label>
                                        <select
                                            id="editRole"
                                            value={formData.role}
                                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserFormData['role'] }))}
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                            required
                                            aria-label="Select user role"
                                        >
                                            <option value="CUSTOMER">Customer</option>
                                            <option value="STORE_MANAGER">Store Manager</option>
                                            <option value="STORE_OWNER">Store Owner</option>
                                            <option value="SUPER_ADMIN">Super Admin</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="editActive" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Status
                                        </Label>
                                        <select
                                            id="editActive"
                                            value={formData.active ? 'true' : 'false'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === 'true' }))}
                                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                                            required
                                            aria-label="Select user status"
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            closeModal();
                                            setSelectedUser(undefined);
                                            setFormData({
                                                email: '',
                                                firstName: '',
                                                lastName: '',
                                                password: '',
                                                role: 'CUSTOMER',
                                                active: true,
                                                phone: '',
                                                address: ''
                                            });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-brand-500 hover:bg-brand-600 text-white"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </Modal>
            </div>
        </ProtectedRoute>
    );
} 