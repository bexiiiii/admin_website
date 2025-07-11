'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductFormData } from '@/types/product';
import { ProductService } from '@/services/productService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    regularPrice: 0,
    stockQuantity: 0,
    storeId: 1, // TODO: Get from context or props
    category: '',
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Product name is required');
        return;
      }
      if (!formData.description.trim()) {
        toast.error('Product description is required');
        return;
      }
      if (formData.regularPrice <= 0) {
        toast.error('Price must be greater than 0');
        return;
      }
      if (!formData.category.trim()) {
        toast.error('Category is required');
        return;
      }

      await ProductService.createProduct(formData);
      toast.success('Product created successfully');
      router.push('/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create product';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'regularPrice' || name === 'stockQuantity' ? Number(value) : value,
    }));
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'discountPrice' || name === 'discountPercentage' ? Number(value) : value,
    }));
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={formData.imageUrl || ''}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regularPrice">Regular Price</Label>
                <Input
                  id="regularPrice"
                  name="regularPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.regularPrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showDiscount"
                checked={showDiscount}
                onCheckedChange={setShowDiscount}
              />
              <Label htmlFor="showDiscount">Add Discount</Label>
            </div>

            {showDiscount && (
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-medium">Discount Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">Discount Price</Label>
                    <Input
                      id="discountPrice"
                      name="discountPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discountPrice || ''}
                      onChange={handleDiscountChange}
                      required={showDiscount}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountPercentage">Discount Percentage</Label>
                    <Input
                      id="discountPercentage"
                      name="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage || ''}
                      onChange={handleDiscountChange}
                      required={showDiscount}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountStartDate">Start Date</Label>
                    <Input
                      id="discountStartDate"
                      name="discountStartDate"
                      type="datetime-local"
                      value={formData.discountStartDate || ''}
                      onChange={handleDiscountChange}
                      required={showDiscount}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountEndDate">End Date</Label>
                    <Input
                      id="discountEndDate"
                      name="discountEndDate"
                      type="datetime-local"
                      value={formData.discountEndDate || ''}
                      onChange={handleDiscountChange}
                      required={showDiscount}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, active: checked }))
                }
              />
              <Label htmlFor="active">Active</Label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 