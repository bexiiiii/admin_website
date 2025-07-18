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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModal } from '@/hooks/useModal';
import { ProductService } from '@/services/productService';
import { storeApi } from '@/services/api';
import { categoryApi } from '@/services/api/categories';
import { ProductDTO, ProductCreateRequest, ProductUpdateRequest, ProductStats } from '@/types/product';
import { StoreDTO, CategoryDTO, PageableResponse } from '@/types/api';
import { ValidationError } from '@/utils/validation';
import { formatCurrency } from '@/utils/currency';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Permission } from '@/types/permission';

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    discountPercentage: number;
    stockQuantity: number;
    storeId: number | null;
    categoryId: number | null;
    images: string[];
    expiryDate: string;
    status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'PENDING';
    active: boolean;
}

const PRODUCT_STATUSES = [
    { value: 'AVAILABLE', label: 'Available', color: 'bg-green-100 text-green-800' },
    { value: 'OUT_OF_STOCK', label: 'Out of Stock', color: 'bg-red-100 text-red-800' },
    { value: 'DISCONTINUED', label: 'Discontinued', color: 'bg-gray-100 text-gray-800' },
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }
];

export default function ProductsPage() {
    const [mounted, setMounted] = useState(false);
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [stores, setStores] = useState<StoreDTO[]>([]);
    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const [stats, setStats] = useState<ProductStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStore, setFilterStore] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    
    const { isOpen, openModal, closeModal } = useModal();
    const [selectedProduct, setSelectedProduct] = useState<ProductDTO | undefined>();
    
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        discountPercentage: 0,
        stockQuantity: 0,
        storeId: null,
        categoryId: null,
        images: [''],
        expiryDate: '',
        status: 'AVAILABLE',
        active: true,
    });

    const fetchStats = async () => {
        try {
            // Calculate stats from products data instead of API call
            if (products.length > 0) {
                const totalProducts = products.length;
                const activeProducts = products.filter(p => p.status === 'AVAILABLE').length;
                const outOfStockProducts = products.filter(p => p.status === 'OUT_OF_STOCK').length;
                const lowStockProducts = products.filter(p => p.stockQuantity < 10).length;
                const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
                const averagePrice = products.reduce((sum, p) => sum + p.price, 0) / products.length;
                
                setStats({
                    totalProducts,
                    activeProducts,
                    outOfStockProducts,
                    lowStockProducts,
                    totalValue,
                    averagePrice
                });
            } else {
                setStats({
                    totalProducts: 0,
                    activeProducts: 0,
                    outOfStockProducts: 0,
                    lowStockProducts: 0,
                    totalValue: 0,
                    averagePrice: 0
                });
            }
        } catch (error) {
            console.error('Failed to calculate product stats:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            console.log('Fetching products...');
            setLoading(true);
            let response: PageableResponse<ProductDTO>;
            
            if (searchQuery.trim()) {
                response = await ProductService.searchProducts(searchQuery, currentPage);
            } else {
                response = await ProductService.getAllProducts(currentPage);
            }
            
            console.log('Products response:', response);
            setProducts(response.content);
            setTotalPages(response.totalPages);
            await fetchStats();
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchStores = async () => {
        try {
            const response = await storeApi.getAll();
            console.log('Stores response:', response);
            if (response && typeof response === 'object' && 'content' in response) {
                const pageableResponse = response as PageableResponse<StoreDTO>;
                setStores(pageableResponse.content);
                console.log('Stores set:', pageableResponse.content);
            } else if (Array.isArray(response)) {
                setStores(response as StoreDTO[]);
                console.log('Stores set (array):', response);
            }
        } catch (error) {
            console.error('Failed to fetch stores:', error);
            toast.error('Failed to fetch stores');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryApi.fetchCategories();
            console.log('Categories response:', response);
            setCategories(response);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            toast.error('Failed to fetch categories');
        }
    };

    useEffect(() => {
        console.log('ProductsPage useEffect triggered');
        setMounted(true);
        fetchProducts();
        fetchStores();
        fetchCategories();
    }, [currentPage, filterStore, filterCategory, filterStatus, searchQuery]);

    // Don't render anything until mounted
    if (!mounted) {
        return null;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? Number(value) : value 
        }));
        setErrors(prev => prev.filter(error => error.field !== name));
    };

    const handleSelectChange = (name: string, value: string) => {
        console.log('Select change:', { name, value });
        console.log('Current form data:', formData);
        
        if (name === 'categoryId') {
            const categoryId = value === '' ? null : Number(value);
            const selectedCategory = categories.find(cat => cat.id === categoryId);
            console.log('Selected category:', selectedCategory);
        }
        
        setFormData(prev => {
            if (name === 'storeId' || name === 'categoryId') {
                const newValue = value === '' ? null : Number(value);
                console.log(`Setting ${name} to:`, newValue);
                return {
                    ...prev,
                    [name]: newValue
                };
            }
            return {
                ...prev,
                [name]: value
            };
        });
    };

    const handleImageChange = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, i) => i === index ? value : img)
        }));
    };

    const addImageField = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, '']
        }));
    };

    const removeImageField = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const validateForm = (): boolean => {
        const validationErrors: ValidationError[] = [];

        if (!formData.name.trim()) {
            validationErrors.push({ field: 'name', message: 'Product name is required' });
        } else if (formData.name.length < 3 || formData.name.length > 100) {
            validationErrors.push({ field: 'name', message: 'Product name must be between 3 and 100 characters' });
        }

        if (formData.description && formData.description.length > 1000) {
            validationErrors.push({ field: 'description', message: 'Description cannot exceed 1000 characters' });
        }

        if (formData.price <= 0) {
            validationErrors.push({ field: 'price', message: 'Price must be greater than 0' });
        }

        if (formData.stockQuantity < 0) {
            validationErrors.push({ field: 'stockQuantity', message: 'Stock quantity cannot be negative' });
        }

        if (!formData.storeId) {
            validationErrors.push({ field: 'storeId', message: 'Store is required' });
        }

        if (!formData.categoryId) {
            validationErrors.push({ field: 'categoryId', message: 'Category is required' });
        }

        if (formData.originalPrice && formData.originalPrice < formData.price) {
            validationErrors.push({ field: 'originalPrice', message: 'Original price cannot be less than current price' });
        }

        if (formData.discountPercentage && (formData.discountPercentage < 0 || formData.discountPercentage > 100)) {
            validationErrors.push({ field: 'discountPercentage', message: 'Discount percentage must be between 0 and 100' });
        }

        setErrors(validationErrors);
        return validationErrors.length === 0;
    };

    const getFieldError = (fieldName: string): string | undefined => {
        return errors.find(error => error.field === fieldName)?.message;
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: 0,
            originalPrice: 0,
            discountPercentage: 0,
            stockQuantity: 0,
            storeId: null,
            categoryId: null,
            images: [''],
            expiryDate: '',
            status: 'AVAILABLE',
            active: true,
        });
        setErrors([]);
        setSelectedProduct(undefined);
    };

    const handleCreate = () => {
        resetForm();
        openModal();
    };

    const handleEdit = (product: ProductDTO) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: Number(product.price),
            originalPrice: Number(product.originalPrice) || 0,
            discountPercentage: product.discountPercentage || 0,
            stockQuantity: product.stockQuantity,
            storeId: product.storeId,
            categoryId: product.categoryId,
            images: product.images && product.images.length > 0 ? product.images : [''],
            expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
            status: product.status,
            active: product.active,
        });
        setErrors([]);
        openModal();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the validation errors');
            return;
        }

        setSaving(true);
        try {
            // Find the selected category
            const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
            if (!selectedCategory) {
                toast.error('Please select a valid category');
                return;
            }

            // Format the expiry date to include time if it exists
            // Convert null values to undefined for API compatibility
            const formattedData: ProductUpdateRequest = {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                originalPrice: formData.originalPrice,
                discountPercentage: formData.discountPercentage,
                stockQuantity: formData.stockQuantity,
                storeId: formData.storeId ?? undefined,
                categoryId: formData.categoryId ?? undefined,
                images: formData.images.filter(img => img.trim()),
                expiryDate: formData.expiryDate ? `${formData.expiryDate}T00:00:00.000Z` : undefined,
                status: formData.status,
                active: formData.active,
            };

            if (selectedProduct) {
                await ProductService.updateProduct(selectedProduct.id, formattedData);
                toast.success('Product updated successfully');
            } else {
                // For create, we need ProductCreateRequest
                const createData: ProductCreateRequest = {
                    name: formData.name,
                    description: formData.description,
                    price: formData.price,
                    originalPrice: formData.originalPrice,
                    discountPercentage: formData.discountPercentage,
                    stockQuantity: formData.stockQuantity,
                    storeId: formData.storeId ?? undefined,
                    categoryId: formData.categoryId ?? undefined,
                    images: formData.images.filter(img => img.trim()),
                    expiryDate: formData.expiryDate ? `${formData.expiryDate}T00:00:00.000Z` : undefined,
                    status: formData.status,
                    active: formData.active,
                };
                await ProductService.createProduct(createData);
                toast.success('Product created successfully');
            }

            await fetchProducts();
            await fetchStats();
            closeModal();
            resetForm();
        } catch (error: any) {
            console.error('Error saving product:', error);
            if (error.response?.data?.message) {
                toast.error(`Error: ${error.response.data.message}`);
            } else {
                toast.error('Failed to save product');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await ProductService.deleteProduct(id);
            toast.success('Product deleted successfully');
            await fetchProducts();
            await fetchStats();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = PRODUCT_STATUSES.find(s => s.value === status) || PRODUCT_STATUSES[0];
        return (
            <Badge className={`${statusConfig.color} border-0`}>
                {statusConfig.label}
            </Badge>
        );
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = !searchQuery || 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStore = !filterStore || filterStore === 'all' || product.storeId.toString() === filterStore;
        const matchesCategory = !filterCategory || filterCategory === 'all' || product.categoryId.toString() === filterCategory;
        const matchesStatus = !filterStatus || filterStatus === 'all' || product.status === filterStatus;

        return matchesSearch && matchesStore && matchesCategory && matchesStatus;
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(dateString));
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const StatsCards = () => {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats?.totalProducts || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Active Products</p>
                            <p className="text-2xl font-bold text-green-600">
                                {stats?.activeProducts || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600">
                                {stats?.outOfStockProducts || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L5.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600">Total Value</p>
                            <p className="text-2xl font-bold text-purple-600">
                                {stats?.totalValue ? formatCurrency(stats.totalValue) : formatCurrency(0)}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                </CardContent>
            </Card>
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Management</h1>
                <p className="text-gray-600">Manage your products, inventory, and pricing</p>
            </div>

            <StatsCards />

            {/* Filters and Search */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-2">
                            <Input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        
                        <Select value={filterStore} onValueChange={setFilterStore}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by store" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stores</SelectItem>
                                {stores.map((store) => (
                                    <SelectItem key={store.id} value={store.id.toString()}>
                                        {store.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {PRODUCT_STATUSES.map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                            Add New Product
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6">
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Store</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <div className="text-gray-500">
                                                <p className="text-lg font-medium">No products found</p>
                                                <p className="text-sm">Create your first product to get started</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    {product.images && product.images[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-10 h-10 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900">{product.name}</p>
                                                        <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                                            {product.description || 'No description'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{product.storeName || `Store ${product.storeId}`}</p>
                                                    {product.storeAddress && (
                                                        <p className="text-sm text-gray-500 truncate max-w-[150px]">
                                                            {product.storeAddress}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {product.categoryName || `Category ${product.categoryId}`}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>                                    <p className="font-medium">{formatCurrency(Number(product.price))}</p>
                                    {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                                        <p className="text-sm text-gray-500 line-through">
                                            {formatCurrency(Number(product.originalPrice))}
                                        </p>
                                    )}
                                                    {product.discountPercentage && product.discountPercentage > 0 && (
                                                        <p className="text-sm text-green-600">
                                                            -{product.discountPercentage}%
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className={`font-medium ${product.stockQuantity === 0 ? 'text-red-600' : product.stockQuantity < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                        {product.stockQuantity}
                                                    </p>
                                                    {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                                                        <p className="text-xs text-yellow-600">Low stock</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(product.status)}
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm text-gray-600">
                                                    {formatDate(product.createdAt)}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t">
                            <div className="text-sm text-gray-500">
                                Page {currentPage + 1} of {totalPages}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 0}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage >= totalPages - 1}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* Product Form Modal */}
            <Modal 
                isOpen={isOpen} 
                onClose={closeModal} 
                className="max-w-4xl"
            >
                <div 
                    className="bg-white dark:bg-gray-900 rounded-lg p-6 max-h-[90vh] overflow-y-auto relative"
                    style={{ zIndex: 9999 }}
                >
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedProduct ? 'Edit Product' : 'Create New Product'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {selectedProduct ? 'Update product information' : 'Add a new product to your inventory'}
                        </p>
                        {/* Debug info */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-2 text-xs text-gray-500">
                                Debug: Stores: {stores.length}, Categories: {categories.length}, 
                                StoreId: {formData.storeId}, CategoryId: {formData.categoryId}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    className={getFieldError('name') ? 'border-red-500' : ''}
                                />
                                {getFieldError('name') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('name')}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="storeId">Store *</Label>
                                <select
                                    id="storeId"
                                    name="storeId"
                                    value={formData.storeId?.toString() || ''}
                                    onChange={(e) => handleSelectChange('storeId', e.target.value)}
                                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${getFieldError('storeId') ? 'border-red-500' : 'border-input'}`}
                                >
                                    <option value="">{stores.length > 0 ? "Select store" : "No stores available"}</option>
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id.toString()}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                                {getFieldError('storeId') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('storeId')}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Enter product description"
                                rows={3}
                                className={getFieldError('description') ? 'border-red-500' : ''}
                            />
                            {getFieldError('description') && (
                                <p className="mt-1 text-sm text-red-500">{getFieldError('description')}</p>
                            )}
                        </div>

                        {/* Price and Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label htmlFor="price">Price *</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    className={getFieldError('price') ? 'border-red-500' : ''}
                                />
                                {getFieldError('price') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('price')}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="originalPrice">Original Price</Label>
                                <Input
                                    id="originalPrice"
                                    name="originalPrice"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.originalPrice}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    className={getFieldError('originalPrice') ? 'border-red-500' : ''}
                                />
                                {getFieldError('originalPrice') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('originalPrice')}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="discountPercentage">Discount %</Label>
                                <Input
                                    id="discountPercentage"
                                    name="discountPercentage"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.discountPercentage}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    className={getFieldError('discountPercentage') ? 'border-red-500' : ''}
                                />
                                {getFieldError('discountPercentage') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('discountPercentage')}</p>
                                )}
                            </div>
                        </div>

                        {/* Stock and Category */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                                <Input
                                    id="stockQuantity"
                                    name="stockQuantity"
                                    type="number"
                                    min="0"
                                    value={formData.stockQuantity}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    className={getFieldError('stockQuantity') ? 'border-red-500' : ''}
                                />
                                {getFieldError('stockQuantity') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('stockQuantity')}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="categoryId">Category *</Label>
                                <select
                                    id="categoryId"
                                    name="categoryId"
                                    value={formData.categoryId?.toString() || ''}
                                    onChange={(e) => handleSelectChange('categoryId', e.target.value)}
                                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${getFieldError('categoryId') ? 'border-red-500' : 'border-input'}`}
                                >
                                    <option value="">{categories.length > 0 ? "Select category" : "No categories available"}</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {getFieldError('categoryId') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('categoryId')}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="status">Status *</Label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={(e) => handleSelectChange('status', e.target.value)}
                                    className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${getFieldError('status') ? 'border-red-500' : 'border-input'}`}
                                >
                                    <option value="">Select status</option>
                                    {PRODUCT_STATUSES.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label}
                                        </option>
                                    ))}
                                </select>
                                {getFieldError('status') && (
                                    <p className="mt-1 text-sm text-red-500">{getFieldError('status')}</p>
                                )}
                            </div>
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                                id="expiryDate"
                                name="expiryDate"
                                type="date"
                                value={formData.expiryDate}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Images */}
                        <div>
                            <Label>Product Images</Label>
                            <div className="space-y-3">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <Input
                                            type="url"
                                            value={image}
                                            onChange={(e) => handleImageChange(index, e.target.value)}
                                            placeholder="Enter image URL"
                                            className="flex-1"
                                        />
                                        {formData.images.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeImageField(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addImageField}
                                    className="w-full"
                                >
                                    Add Another Image
                                </Button>
                            </div>
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
                            />
                            <Label htmlFor="active" className="text-sm font-medium text-gray-700">
                                Active (Product will be visible to customers)
                            </Label>
                        </div>

                        {/* Validation Errors Summary */}
                        {errors.length > 0 && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                                    Please fix the following errors:
                                </p>
                                <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
                                    {errors.map((error, index) => (
                                        <li key={index}>{error.message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {saving ? 'Saving...' : selectedProduct ? 'Update Product' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
}