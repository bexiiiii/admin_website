'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AddToFavoritesProps {
    userId: number;
    productId: number;
    onSuccess?: () => void;
}

export function AddToFavorites({ userId, productId, onSuccess }: AddToFavoritesProps) {
    const { toast } = useToast();

    const addToFavorites = async () => {
        try {
            const response = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, productId }),
            });

            if (!response.ok) throw new Error('Failed to add to favorites');

            toast({
                title: 'Success',
                description: 'Product added to favorites',
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add to favorites',
                variant: 'destructive',
            });
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={addToFavorites}
            className="hover:text-red-500"
        >
            <Heart className="h-4 w-4" />
        </Button>
    );
} 