"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { NotificationDTO } from '@/types/api';
import { format } from 'date-fns';
import { API_ENDPOINTS } from '@/config/api';
import { api } from '@/services/api';

interface NotificationFormData {
    title: string;
    message: string;
    type: NotificationDTO['type'];
    userId?: number;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState<NotificationFormData>({
        title: '',
        message: '',
        type: 'INFO',
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.BASE);
            setNotifications(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await api.put(`${API_ENDPOINTS.NOTIFICATIONS.MARK_READ}/${notificationId}`);
            toast.success('Notification marked as read');
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            toast.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
            toast.success('All notifications marked as read');
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            toast.error('Failed to mark all notifications as read');
        }
    };

    const handleCreateNotification = async () => {
        try {
            await api.post(API_ENDPOINTS.NOTIFICATIONS.BASE, formData);
            toast.success('Notification created successfully');
            setIsCreateModalOpen(false);
            resetForm();
            fetchNotifications();
        } catch (error) {
            console.error('Failed to create notification:', error);
            toast.error('Failed to create notification');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            type: 'INFO',
        });
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    };

    const getTypeColor = (type: NotificationDTO['type']) => {
        switch (type) {
            case 'SUCCESS':
                return 'text-green-600 dark:text-green-500';
            case 'WARNING':
                return 'text-yellow-600 dark:text-yellow-500';
            case 'ERROR':
                return 'text-red-600 dark:text-red-500';
            case 'ORDER_UPDATE':
                return 'text-blue-600 dark:text-blue-500';
            case 'PROMOTION':
                return 'text-purple-600 dark:text-purple-500';
            default:
                return 'text-gray-600 dark:text-gray-400';
        }
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

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Notifications</h1>
                    <p className="text-gray-600 dark:text-gray-400">View and manage your notifications</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Create Notification
                    </Button>
                    {notifications.length > 0 && (
                        <Button
                            onClick={handleMarkAllAsRead}
                            variant="outline"
                            className="bg-white dark:bg-gray-800"
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <Card className="bg-white dark:bg-gray-800">
                        <CardContent className="p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No notifications found</p>
                        </CardContent>
                    </Card>
                ) : (
                    notifications.map((notification) => (
                        <Card 
                            key={notification.id} 
                            className={`bg-white dark:bg-gray-800 ${notification.status === 'unread' ? 'border-l-4 border-blue-500' : ''}`}
                        >
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {notification.title}
                                            </h3>
                                            <span className={`text-sm ${getTypeColor(notification.type)}`}>
                                                {notification.type}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(notification.createdAt)}
                                        </p>
                                    </div>
                                    {notification.status === 'unread' && (
                                        <Button
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            variant="ghost"
                                            size="sm"
                                        >
                                            Mark as read
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                }}
                className="max-w-[425px] p-5 lg:p-10"
            >
                <div>
                    <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
                        Create Notification
                    </h4>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter notification title"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="message">Message</Label>
                            <Input
                                id="message"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Enter notification message"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <select
                                id="type"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as NotificationDTO['type'] })}
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="INFO">Info</option>
                                <option value="SUCCESS">Success</option>
                                <option value="WARNING">Warning</option>
                                <option value="ERROR">Error</option>
                                <option value="ORDER_UPDATE">Order Update</option>
                                <option value="PROMOTION">Promotion</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end w-full gap-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateNotification}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Create
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
} 