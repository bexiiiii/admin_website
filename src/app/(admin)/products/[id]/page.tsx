'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductFormData, ProductDiscountData } from '@/types/product';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    regularPrice: 0,
    stockQuantity: 0,
    storeId: 1,
    category: '',
    active: true,
  });

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const product: Product = await response.json();
      setFormData({
        name: product.name,
        description: product.description,
        regularPrice: product.regularPrice,
        discountPrice: product.discountPrice,
        discountPercentage: product.discountPercentage,
        discountStartDate: product.discountStartDate,
        discountEndDate: product.discountEndDate,
        stockQuantity: product.stockQuantity,
        storeId: product.storeId,
        category: product.category,
        active: product.active,
      });
      setShowDiscount(product.isDiscounted);
    } catch (error) {
      toast.error('Failed to fetch product');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      toast.success('Product updated successfully');
      router.push('/products');
    } catch (error) {
      toast.error('Failed to update product');
      console.error('Error updating product:', error);
    } finally {
      setSaving(false);
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

  const handleSetDiscount = async () => {
    if (!formData.discountPrice || !formData.discountPercentage || 
        !formData.discountStartDate || !formData.discountEndDate) {
      toast.error('Please fill in all discount fields');
      return;
    }

    setSaving(true);
    try {
      const discountData: ProductDiscountData = {
        discountPrice: formData.discountPrice,
        discountPercentage: formData.discountPercentage,
        startDate: formData.discountStartDate,
        endDate: formData.discountEndDate,
      };

      const response = await fetch(`/api/products/${params.id}/discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discountData),
      });

      if (!response.ok) {
        throw new Error('Failed to set discount');
      }

      toast.success('Discount set successfully');
      fetchProduct();
    } catch (error) {
      toast.error('Failed to set discount');
      console.error('Error setting discount:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDiscount = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/products/${params.id}/discount`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove discount');
      }

      toast.success('Discount removed successfully');
      setShowDiscount(false);
      setFormData((prev) => ({
        ...prev,
        discountPrice: undefined,
        discountPercentage: undefined,
        discountStartDate: undefined,
        discountEndDate: undefined,
      }));
    } catch (error) {
      toast.error('Failed to remove discount');
      console.error('Error removing discount:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
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
              <Label htmlFor="showDiscount">Manage Discount</Label>
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

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveDiscount}
                    disabled={saving}
                  >
                    Remove Discount
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSetDiscount}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Set Discount'}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked: boolean) =>
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
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 