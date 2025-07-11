"use client";

import React from 'react';
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { OrderDTO } from "@/types/api";

interface Order extends OrderDTO {
    orderNumber: string;
    qrCode: string;
    createdAt: string;
    updatedAt: string;
}

interface OrderDetailsModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
    order,
    isOpen,
    onClose,
}) => {
    if (!order) return null;

    const getPaymentStatusColor = (status: Order['paymentStatus']) => {
        switch (status) {
            case 'PAID':
                return 'default';
            case 'PENDING':
                return 'secondary';
            case 'FAILED':
            case 'REFUNDED':
                return 'destructive';
            default:
                return 'default';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-3xl p-6"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Order Details - {order.orderNumber}</h2>
                    <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                    </Badge>
                </div>

                {/* Order Status and Date */}
                <div>
                    <p className="text-sm text-muted-foreground">
                        Created: {format(new Date(order.createdAt), 'PPpp')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Last Updated: {format(new Date(order.updatedAt), 'PPpp')}
                    </p>
                </div>

                {/* Customer Information */}
                <div className="space-y-2">
                    <h3 className="font-semibold">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p>{order.userName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p>{order.userPhone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p>{order.userEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                    <h3 className="font-semibold">Order Items</h3>
                    <div className="border rounded-lg">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3">Product</th>
                                    <th className="text-right p-3">Quantity</th>
                                    <th className="text-right p-3">Price</th>
                                    <th className="text-right p-3">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr key={item.id} className="border-b last:border-0">
                                        <td className="p-3">{item.productName}</td>
                                        <td className="text-right p-3">{item.quantity}</td>
                                        <td className="text-right p-3">
                                            ${item.unitPrice.toFixed(2)}
                                        </td>
                                        <td className="text-right p-3">
                                            ${(item.unitPrice * item.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t">
                                    <td colSpan={3} className="text-right p-3 font-semibold">
                                        Total Amount:
                                    </td>
                                    <td className="text-right p-3 font-semibold">
                                        ${order.totalAmount?.toFixed(2) || '0.00'}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-2">
                    <h3 className="font-semibold">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Payment Method</p>
                            <p>{order.paymentMethod}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Order ID</p>
                            <p>{order.id}</p>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {order.notes && (
                    <div className="space-y-2">
                        <h3 className="font-semibold">Notes</h3>
                        <p className="text-sm">{order.notes}</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default OrderDetailsModal; 