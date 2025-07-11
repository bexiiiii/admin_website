"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from "@/components/ui/textarea";
import { storeApi } from '@/services/api';
import { categoryApi } from '@/services/api/categories';
import { useModal } from '@/hooks/useModal';
import { useToast } from "@/components/ui/use-toast";
import { StoreDTO, PageableResponse, CategoryDTO } from '@/types/api';
import { ValidationError } from '@/utils/validation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StoreFormData {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    logo: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
    openingHours: string;
    closingHours: string;
    category: string;
    active: boolean;
    user: {
        email: string;
        role: 'STORE_OWNER';
    };
}

const STORE_STATUSES = [
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-800' },
    { value: 'INACTIVE', label: 'Inactive', color: 'bg-red-100 text-red-800' },
    { value: 'SUSPENDED', label: 'Suspended', color: 'bg-gray-100 text-gray-800' }
];

export default function StoresPage() {
    const [stores, setStores] = useState<StoreDTO[]>([]);
    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [error, setError] = useState<string>('');
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const { isOpen, openModal, closeModal } = useModal();
    const [selectedStore, setSelectedStore] = useState<StoreDTO | undefined>();
    const [formData, setFormData] = useState<StoreFormData>({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        logo: '',
        openingHours: '',
        closingHours: '',
        category: '',
        active: true,
        status: 'PENDING',
        user: {
            email: '',
            role: 'STORE_OWNER'
        }
    });

    const getFieldError = (fieldName: string): string | undefined => {
        const error = validationErrors.find(err => err.field === fieldName);
        return error?.message;
    };

    const validateForm = (): boolean => {
        const errors: ValidationError[] = [];

        if (!formData.name.trim()) {
            errors.push({ field: 'name', message: 'Store name is required' });
        }

        if (!formData.user.email.trim()) {
            errors.push({ field: 'user.email', message: 'Owner email is required' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user.email)) {
            errors.push({ field: 'user.email', message: 'Invalid email format' });
        }

        if (!formData.address.trim()) {
            errors.push({ field: 'address', message: 'Address is required' });
        }

        if (!formData.phone.trim()) {
            errors.push({ field: 'phone', message: 'Phone number is required' });
        }

        if (!formData.email.trim()) {
            errors.push({ field: 'email', message: 'Store email is required' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push({ field: 'email', message: 'Invalid email format' });
        }

        if (!formData.category) {
            errors.push({ field: 'category', message: 'Category is required' });
        }

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const fetchStores = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await storeApi.getAll();
            
            if (response && typeof response === 'object' && 'content' in response) {
                // Пагинированный ответ от Spring Boot
                const pageableResponse = response as PageableResponse<StoreDTO>;
                setStores(pageableResponse.content);
            } else if (Array.isArray(response)) {
                // Обычный массив
                setStores(response as StoreDTO[]);
            } else {
                console.warn('Unexpected API response structure:', response);
                setStores([]);
            }
        } catch (error) {
            console.error('Failed to fetch stores:', error);
            setError('Не удалось загрузить магазины. Пожалуйста, попробуйте позже.');
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить магазины. Пожалуйста, попробуйте позже.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryApi.fetchActiveCategories();
            setCategories(response);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast({
                title: 'Ошибка',
                description: 'Не удалось загрузить категории',
                variant: 'destructive',
            });
        }
    };

    useEffect(() => {
        fetchStores();
        fetchCategories();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот магазин?')) {
            try {
                await storeApi.delete(id);
                toast({
                    title: 'Успех',
                    description: 'Магазин успешно удален',
                });
                fetchStores();
            } catch (error) {
                console.error('Failed to delete store:', error);
                toast({
                    title: 'Ошибка',
                    description: 'Не удалось удалить магазин',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleEdit = (store: StoreDTO) => {
        console.log('Editing store:', store);
        setSelectedStore(store);
        setFormData({
            name: store.name,
            description: store.description || '',
            address: store.address,
            phone: store.phone,
            email: store.email || '',
            logo: store.logo || '',
            status: store.status,
            openingHours: store.openingHours || '09:00',
            closingHours: store.closingHours || '18:00',
            category: store.category || '',
            active: store.active,
            user: {
                email: store.ownerName || '',
                role: 'STORE_OWNER'
            }
        });
        openModal();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast({
                title: 'Validation Error',
                description: 'Please fix the validation errors',
                variant: 'destructive',
            });
            return;
        }

        setSubmitting(true);
        try {
            // Check if store with same name exists (excluding current store when updating)
            const existingStoreByName = stores.find(
                store => store.name.toLowerCase() === formData.name.toLowerCase() && 
                (!selectedStore || store.id !== selectedStore.id)
            );
            if (existingStoreByName) {
                toast({
                    title: 'Error',
                    description: 'A store with this name already exists',
                    variant: 'destructive',
                });
                setSubmitting(false);
                return;
            }

            // Check if store with same phone exists (excluding current store when updating)
            const existingStoreByPhone = stores.find(
                store => store.phone === formData.phone && 
                (!selectedStore || store.id !== selectedStore.id)
            );
            if (existingStoreByPhone) {
                toast({
                    title: 'Error',
                    description: 'A store with this phone number already exists',
                    variant: 'destructive',
                });
                setSubmitting(false);
                return;
            }

            const formattedData = {
                ...formData,
                openingHours: formData.openingHours || '00:00:00',
                closingHours: formData.closingHours || '00:00:00',
                user: {
                    email: formData.user.email,
                    role: 'STORE_OWNER' as const
                }
            };

            console.log('Submitting store data:', formattedData);

            if (selectedStore) {
                await storeApi.update(selectedStore.id, formattedData);
                toast({
                    title: 'Success',
                    description: 'Store updated successfully',
                });
            } else {
                await storeApi.create(formattedData);
                toast({
                    title: 'Success',
                    description: 'Store created successfully',
                });
            }

            await fetchStores();
            closeModal();
            resetForm();
        } catch (error) {
            console.error('Error saving store:', error);
            toast({
                title: 'Error',
                description: 'Failed to save store',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        console.log('Form field changed:', name, value);
        if (name.startsWith('user.')) {
            const userField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    [userField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCategoryChange = (value: string) => {
        console.log('Selected category:', value);
        setFormData(prev => ({
            ...prev,
            category: value
        }));
        // Clear category validation error if it exists
        setValidationErrors(prev => prev.filter(error => error.field !== 'category'));
    };

    const handleStatusChange = (value: string) => {
        console.log('Selected status:', value);
        setFormData(prev => ({
            ...prev,
            status: value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING'
        }));
    };

    const filteredStores = Array.isArray(stores) ? stores.filter(store =>
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [];

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            address: '',
            phone: '',
            email: '',
            logo: '',
            status: 'PENDING',
            openingHours: '09:00',
            closingHours: '18:00',
            category: '',
            active: true,
            user: {
                email: '',
                role: 'STORE_OWNER'
            }
        });
        setValidationErrors([]);
    };

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

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                    onClick={fetchStores}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Stores Management</h1>
                <Button 
                    className="bg-brand-500 hover:bg-brand-600 text-white"
                    onClick={() => {
                        setSelectedStore(undefined);
                        setFormData({
                            name: '',
                            description: '',
                            address: '',
                            phone: '',
                            email: '',
                            logo: '',
                            status: 'ACTIVE',
                            openingHours: '09:00',
                            closingHours: '18:00',
                            category: '',
                            active: true,
                            user: {
                                email: '',
                                role: 'STORE_OWNER'
                            }
                        });
                        openModal();
                    }}
                >
                    <span className="mr-2">+</span>
                    Add Store
                </Button>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <span className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400">🔍</span>
                    <Input
                        type="text"
                        placeholder="Search stores by name or address..."
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
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                        No stores found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStores.map((store) => (
                                    <TableRow key={store.id}>
                                        <TableCell>
                                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                {store.logo ? (
                                                    <img
                                                        src={store.logo}
                                                        alt={store.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-400">🏪</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {store.name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {store.description}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Категория: {store.category}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{store.address}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm">{store.phone}</p>
                                                <p className="text-sm text-gray-500">{store.email}</p>
                                                <p className="text-xs text-gray-400">
                                                    Владелец: {store.ownerName}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Badge
                                                    variant={store.status === 'ACTIVE' ? 'default' : 'destructive'}
                                                >
                                                    {store.status}
                                                </Badge>
                                                <Badge
                                                    variant={store.active ? 'default' : 'destructive'}
                                                    className="ml-2"
                                                >
                                                    {store.active ? 'Активен' : 'Неактивен'}
                                            </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(store)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(store.id)}
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
                isOpen={isOpen}
                onClose={() => {
                    closeModal();
                    setSelectedStore(undefined);
                }}
                className="max-w-3xl mx-auto max-h-[90vh] overflow-y-auto"
            >
                <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">
                            {selectedStore ? 'Edit Store' : 'Add New Store'}
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                closeModal();
                                setSelectedStore(undefined);
                            }}
                        >
                            ✕
                        </Button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Store Name *</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                    type="text"
                                        value={formData.name}
                                        onChange={handleChange}
                                    placeholder="Enter store name"
                                    className={getFieldError('name') ? 'border-red-500' : ''}
                                />
                                {getFieldError('name') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('name')}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="user.email">Owner Email *</Label>
                                <Input
                                    id="user.email"
                                    name="user.email"
                                    type="email"
                                    value={formData.user.email}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        user: {
                                            ...prev.user,
                                            email: e.target.value
                                        }
                                    }))}
                                    placeholder="Enter owner's email"
                                    className={getFieldError('user.email') ? 'border-red-500' : ''}
                                />
                                {getFieldError('user.email') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('user.email')}</p>
                                )}
                            </div>
                                </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                placeholder="Enter store description"
                                rows={3}
                                className={getFieldError('description') ? 'border-red-500' : ''}
                                    />
                            {getFieldError('description') && (
                                <p className="mt-1 text-sm text-red-500">{getFieldError('description')}</p>
                            )}
                                </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="address">Address *</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                    type="text"
                                        value={formData.address}
                                        onChange={handleChange}
                                    placeholder="Enter store address"
                                    className={getFieldError('address') ? 'border-red-500' : ''}
                                    />
                                {getFieldError('address') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('address')}</p>
                                )}
                                </div>

                            <div>
                                <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                    type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                    placeholder="Enter phone number"
                                    className={getFieldError('phone') ? 'border-red-500' : ''}
                                        />
                                {getFieldError('phone') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('phone')}</p>
                                )}
                            </div>
                                    </div>

                        <div>
                            <Label htmlFor="email">Store Email *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                placeholder="Enter store email"
                                className={getFieldError('email') ? 'border-red-500' : ''}
                                        />
                            {getFieldError('email') && (
                                <p className="mt-1 text-sm text-red-500">{getFieldError('email')}</p>
                            )}
                                    </div>

                        {/* Operating Hours */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="openingHours">Opening Hours</Label>
                                    <Input
                                    id="openingHours"
                                    name="openingHours"
                                    type="time"
                                    value={formData.openingHours}
                                        onChange={handleChange}
                                    className={getFieldError('openingHours') ? 'border-red-500' : ''}
                                    />
                                {getFieldError('openingHours') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('openingHours')}</p>
                                )}
                                </div>

                            <div>
                                <Label htmlFor="closingHours">Closing Hours</Label>
                                    <Input
                                    id="closingHours"
                                    name="closingHours"
                                    type="time"
                                    value={formData.closingHours}
                                        onChange={handleChange}
                                    className={getFieldError('closingHours') ? 'border-red-500' : ''}
                                />
                                {getFieldError('closingHours') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('closingHours')}</p>
                                )}
                                    </div>
                                </div>

                        {/* Category and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <select
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer relative z-10"
                                    aria-label="Select category"
                                    style={{ WebkitAppearance: 'menulist' }}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {getFieldError('category') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('category')}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as StoreFormData['status'] }))}
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer relative z-10"
                                    aria-label="Select status"
                                    style={{ WebkitAppearance: 'menulist' }}
                                >
                                    {STORE_STATUSES.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Logo URL */}
                        <div>
                            <Label htmlFor="logo">Logo URL</Label>
                            <Input
                                id="logo"
                                name="logo"
                                type="url"
                                value={formData.logo}
                                onChange={handleChange}
                                placeholder="Enter logo URL"
                                className={getFieldError('logo') ? 'border-red-500' : ''}
                            />
                            {getFieldError('logo') && (
                                <p className="mt-1 text-sm text-red-500">{getFieldError('logo')}</p>
                            )}
                        </div>

                        {/* Active Toggle */}
                        <div className="flex items-center space-x-3">
                            <input
                                id="active"
                                name="active"
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                aria-label="Store active status"
                            />
                            <Label htmlFor="active" className="text-sm font-medium text-gray-700">
                                Active (Store will be visible to customers)
                            </Label>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {submitting ? 'Saving...' : selectedStore ? 'Update Store' : 'Create Store'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
} 