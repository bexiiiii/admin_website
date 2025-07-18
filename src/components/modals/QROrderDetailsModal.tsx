"use client";

import React, { useState } from 'react';
import { Modal } from "@/components/ui/modal";
import { QROrderScanner } from '@/components/qr/QROrderScanner';

interface QROrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOrderUpdated?: () => void;
}

export function QROrderDetailsModal({ isOpen, onClose, onOrderUpdated }: QROrderDetailsModalProps) {
    const [scannedData, setScannedData] = useState<string>('');

    const handleScan = (qrData: string) => {
        setScannedData(qrData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">QR Order Scanner</h2>
                <p className="text-gray-600 mb-6">Scan QR code to view and confirm order details</p>
                
                <QROrderScanner 
                    isOpen={isOpen}
                    onClose={onClose}
                    onScan={handleScan}
                />
            </div>
        </Modal>
    );
}
