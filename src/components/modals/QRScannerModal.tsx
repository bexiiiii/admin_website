"use client";

import React, { useState } from 'react';
import { Modal } from "@/components/ui/modal";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrReader } from 'react-qr-reader';
import { toast } from 'react-hot-toast';
import { orderApi } from '@/services/api';
import { OrderDTO } from '@/types/api';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOrderUpdated: () => void;
}

export function QRScannerModal({ isOpen, onClose, onOrderUpdated }: QRScannerModalProps) {
    const [scanning, setScanning] = useState(true);

    const handleScan = async (result: string | null) => {
        if (!result) return;

        try {
            const orderData = JSON.parse(result);
            if (!orderData.orderId) {
                toast.error('Invalid QR code');
                return;
            }

            // Update order status to the next one
            const currentStatus = orderData.status;
            const statusFlow = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED'];
            const currentIndex = statusFlow.indexOf(currentStatus);
            
            if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
                toast.error('Order is already in final status');
                return;
            }

            const nextStatus = statusFlow[currentIndex + 1];
            await orderApi.updateStatus(orderData.orderId, nextStatus);
            
            toast.success(`Order status updated to ${nextStatus}`);
            onOrderUpdated();
            setScanning(false);
            onClose();
        } catch (error) {
            console.error('Failed to process QR code:', error);
            toast.error('Failed to process QR code');
        }
    };

    const handleError = (error: Error) => {
        console.error('QR Scanner error:', error);
        toast.error('Failed to access camera');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[600px] p-6"
        >
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Scan Order QR Code</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Scan the QR code to update order status</p>
                </div>

                <Card>
                    <CardContent className="p-4">
                        <div className="aspect-square w-full max-w-[400px] mx-auto bg-black rounded-lg overflow-hidden">
                            {scanning && (
                                <QrReader
                                    constraints={{ facingMode: 'environment' }}
                                    onResult={(result, error) => {
                                        if (result) {
                                            handleScan(result.getText());
                                        }
                                        if (error) {
                                            handleError(error);
                                        }
                                    }}
                                    className="w-full h-full"
                                />
                            )}
                        </div>
                        <p className="mt-4 text-center text-sm text-gray-500">
                            Position the QR code within the frame to scan
                        </p>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setScanning(!scanning)}
                    >
                        {scanning ? 'Stop Scanning' : 'Start Scanning'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
} 