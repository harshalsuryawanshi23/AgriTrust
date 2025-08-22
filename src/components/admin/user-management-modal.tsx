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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { UserProfile, UserRole } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const userSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  role: z.enum(['admin', 'farmer', 'viewer']),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  editUser?: UserProfile | null;
  isLoading?: boolean;
}

export default function UserManagementModal({
  isOpen,
  onClose,
  onSubmit,
  editUser,
  isLoading = false,
}: UserManagementModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      displayName: '',
      role: 'farmer',
    },
  });

  const selectedRole = watch('role');

  React.useEffect(() => {
    if (editUser) {
      reset({
        email: editUser.email,
        displayName: editUser.displayName,
        role: editUser.role,
      });
    } else {
      reset({
        email: '',
        displayName: '',
        role: 'farmer',
      });
    }
  }, [editUser, reset]);

  const onFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'farmer':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>
            {editUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Enter email address"
              disabled={!!editUser} // Don't allow email changes for existing users
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              {...register('displayName')}
              placeholder="Enter display name"
            />
            {errors.displayName && (
              <p className="text-sm text-red-500">{errors.displayName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select onValueChange={(value) => setValue('role', value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor('admin')}>
                      Admin
                    </Badge>
                    <span className="text-sm text-muted-foreground">Full access</span>
                  </div>
                </SelectItem>
                <SelectItem value="farmer">
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor('farmer')}>
                      Farmer
                    </Badge>
                    <span className="text-sm text-muted-foreground">Create & edit</span>
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeColor('viewer')}>
                      Viewer
                    </Badge>
                    <span className="text-sm text-muted-foreground">Read only</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {selectedRole && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Role permissions:</strong>
                {selectedRole === 'admin' && ' Full system access including user management'}
                {selectedRole === 'farmer' && ' Can create and edit logs, view reports'}
                {selectedRole === 'viewer' && ' Read-only access to dashboards and reports'}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {editUser ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
