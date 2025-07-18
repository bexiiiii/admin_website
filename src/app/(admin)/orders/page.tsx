"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchIcon, FilterIcon, CalendarIcon, PlusIcon, RefreshCwIcon, QrCodeIcon, ScanIcon, PencilIcon } from 'lucide-react';
import { format } from 'date-fns';
import { orderApi } from '@/services/api';
import { OrderDTO } from '@/types/api';
import { useModal } from '@/hooks/useModal';
import { CreateOrderModal } from '@/components/modals/CreateOrderModal';
import { OrderQRModal } from '@/components/modals/OrderQRModal';
import { QROrderDetailsModal } from '@/components/modals/QROrderDetailsModal';
import { EditOrderModal } from '@/components/modals/EditOrderModal';

const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-purple-100 text-purple-800',
    READY: 'bg-green-100 text-green-800',
    PICKED_UP: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
};

export default function OrderManagementPage() {
    const { isOpen: isCreateModalOpen, openModal: openCreateModal, closeModal: closeCreateModal } = useModal();
    const { isOpen: isQRScannerOpen, openModal: openQRScanner, closeModal: closeQRScanner } = useModal();
    const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
    const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
    const [orderToEdit, setOrderToEdit] = useState<OrderDTO | null>(null);
    const [orders, setOrders] = useState<OrderDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderApi.getAll();
            const ordersData = Array.isArray(response) ? response : [];
            setOrders(ordersData);

            // Calculate statistics
            const stats = {
                totalOrders: ordersData.length,
                pendingOrders: ordersData.filter(o => o.status === 'PENDING').length,
                completedOrders: ordersData.filter(o => ['DELIVERED', 'PICKED_UP'].includes(o.status)).length,
                cancelledOrders: ordersData.filter(o => o.status === 'CANCELLED').length,
                totalRevenue: ordersData.reduce((sum, order) => sum + order.totalAmount, 0)
            };
            setStats(stats);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: number, newStatus: OrderDTO['status']) => {
        try {
            await orderApi.updateStatus(orderId, newStatus);
            toast.success('Order status updated successfully');
            fetchOrders();
        } catch (error) {
            console.error('Failed to update order status:', error);
            toast.error('Failed to update order status');
        }
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.id.toString().includes(searchQuery) ||
            order.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.items.some(item => 
                item.productName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        if (!order.orderDate) return matchesSearch && matchesStatus;
        
        const orderDate = new Date(order.orderDate);
        const now = new Date();
        const matchesDate = dateFilter === 'all' || 
            (dateFilter === 'today' && orderDate.toDateString() === now.toDateString()) ||
            (dateFilter === 'week' && (now.getTime() - orderDate.getTime()) <= 7 * 24 * 60 * 60 * 1000) ||
            (dateFilter === 'month' && (now.getTime() - orderDate.getTime()) <= 30 * 24 * 60 * 60 * 1000);

        return matchesSearch && matchesStatus && matchesDate;
    });

    const handleEditClick = (order: OrderDTO) => {
        setOrderToEdit(order);
        openEditModal();
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 dark:bg-gray-900">
                <div className="mb-6">
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="bg-white dark:bg-gray-800">
                            <CardContent className="p-6">
                                <Skeleton className="h-4 w-1/4 mb-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardContent>
                        </Card>
                    ))}
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
        <div className="p-6 bg-gray-50 dark:bg-gray-900">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Order Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage and track all customer orders</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchOrders}
                        className="flex items-center gap-2"
                    >
                        <RefreshCwIcon className="h-4 w-4" />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        onClick={openQRScanner}
                        className="flex items-center gap-2"
                    >
                        <ScanIcon className="h-4 w-4" />
                        Scan QR
                    </Button>
                    <Button
                        onClick={openCreateModal}
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Create Order
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</h3>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Orders</h3>
                        <p className="text-2xl font-semibold text-yellow-600">{stats.pendingOrders}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Orders</h3>
                        <p className="text-2xl font-semibold text-green-600">{stats.completedOrders}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-gray-800">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</h3>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatPrice(stats.totalRevenue)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-2">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search orders by ID, customer name, or product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white dark:bg-gray-800"
                        />
                    </div>
                </div>
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Filter orders by status"
                    >
                        <option value="all">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="READY">Ready</option>
                        <option value="PICKED_UP">Picked Up</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Filter orders by date"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                            <p className="text-lg font-medium mb-2">No orders found</p>
                                            <p className="text-sm">Try adjusting your search or filter criteria</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">#{order.id}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{order.userName}</p>
                                                <p className="text-sm text-gray-500">{order.userEmail}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                                        <span>{item.productName}</span>
                                                        <span className="text-gray-500">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{formatPrice(order.totalAmount)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[order.status]}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{order.orderDate ? formatDate(order.orderDate) : 'N/A'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <QrCodeIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditClick(order)}
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderDTO['status'])}
                                                    className="h-8 px-2 rounded-md border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    aria-label="Change order status"
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="CONFIRMED">Confirmed</option>
                                                    <option value="PREPARING">Preparing</option>
                                                    <option value="READY">Ready</option>
                                                    <option value="PICKED_UP">Picked Up</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Order Modal */}
            <CreateOrderModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
                onOrderCreated={fetchOrders}
            />

            {/* Order QR Modal */}
            {selectedOrder && (
                <OrderQRModal
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    order={selectedOrder}
                />
            )}

            {/* QR Scanner Modal */}
            <QROrderDetailsModal
                isOpen={isQRScannerOpen}
                onClose={closeQRScanner}
                onOrderUpdated={fetchOrders}
            />

            {/* Edit Order Modal */}
            {orderToEdit && (
                <EditOrderModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        closeEditModal();
                        setOrderToEdit(null);
                    }}
                    order={orderToEdit}
                    onOrderUpdated={fetchOrders}
                />
            )}
        </div>
    );
} 