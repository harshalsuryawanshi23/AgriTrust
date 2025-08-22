'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { FarmerLog, FarmerLogFormData, CROPS, FERTILIZERS, STATUSES } from '@/types/farmer-logs';
import { Badge } from '@/components/ui/badge';

const farmerLogSchema = z.object({
  farmerName: z.string().min(2, 'Farmer name must be at least 2 characters'),
  crop: z.string().min(1, 'Please select a crop'),
  fertilizer: z.string().min(1, 'Please select a fertilizer'),
  quantity: z.number().min(0.1, 'Quantity must be greater than 0'),
  date: z.date(),
  location: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'completed', 'pending']),
});

interface FarmerLogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FarmerLogFormData) => Promise<void>;
  editData?: FarmerLog | null;
  isLoading?: boolean;
}

export default function FarmerLogFormModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isLoading = false,
}: FarmerLogFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FarmerLogFormData>({
    resolver: zodResolver(farmerLogSchema),
    defaultValues: {
      farmerName: '',
      crop: '',
      fertilizer: '',
      quantity: 0,
      date: new Date(),
      location: '',
      notes: '',
      status: 'active',
    },
  });

  const selectedStatus = watch('status');

  React.useEffect(() => {
    if (editData) {
      reset({
        farmerName: editData.farmerName,
        crop: editData.crop,
        fertilizer: editData.fertilizer,
        quantity: editData.quantity,
        date: editData.date instanceof Date ? editData.date : editData.date.toDate(),
        location: editData.location || '',
        notes: editData.notes || '',
        status: editData.status,
      });
    } else {
      reset({
        farmerName: '',
        crop: '',
        fertilizer: '',
        quantity: 0,
        date: new Date(),
        location: '',
        notes: '',
        status: 'active',
      });
    }
  }, [editData, reset]);

  const onFormSubmit = async (data: FarmerLogFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? 'Edit Farmer Log' : 'Add New Farmer Log'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="farmerName">Farmer Name *</Label>
              <Input
                id="farmerName"
                {...register('farmerName')}
                placeholder="Enter farmer name"
              />
              {errors.farmerName && (
                <p className="text-sm text-red-500">{errors.farmerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crop">Crop *</Label>
              <Select onValueChange={(value) => setValue('crop', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {CROPS.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.crop && (
                <p className="text-sm text-red-500">{errors.crop.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fertilizer">Fertilizer *</Label>
              <Select onValueChange={(value) => setValue('fertilizer', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fertilizer" />
                </SelectTrigger>
                <SelectContent>
                  {FERTILIZERS.map((fertilizer) => (
                    <SelectItem key={fertilizer} value={fertilizer}>
                      {fertilizer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fertilizer && (
                <p className="text-sm text-red-500">{errors.fertilizer.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date', { valueAsDate: true })}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <Badge className={getStatusColor(status.value)}>
                        {status.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Enter location (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter any additional notes (optional)"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {editData ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
