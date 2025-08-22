'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, PlusCircle, Download, Upload, Settings, Users, FileDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, createSortableHeader } from '@/components/ui/data-table';
import { LoadingOverlay, LoadingScreen } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FirestoreService } from '@/lib/firestore-utils';
import { UserProfile, UserRole, useAuth } from '@/contexts/AuthContext';
import { FarmerLog } from '@/types/farmer-logs';
import { BlockchainTransaction } from '@/types/blockchain';
import UserManagementModal from './admin/user-management-modal';
import { exportToCSV, importFromCSV, validateCSVData } from '@/lib/csv-utils';
import { generateReportPDF } from '@/lib/pdf-utils';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const userService = new FirestoreService<UserProfile>('users');
const farmerLogService = new FirestoreService<FarmerLog>('farmer-logs');
const transactionService = new FirestoreService<BlockchainTransaction>('blockchain-transactions');

export default function AdminClient() {
  const { hasPermission, userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [farmerLogs, setFarmerLogs] = useState<FarmerLog[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!hasPermission('admin')) {
      return;
    }

    const loadData = async () => {
      try {
        const [usersData, logsData, txData] = await Promise.all([
          userService.getAll(),
          farmerLogService.getAll(),
          transactionService.getAll(),
        ]);
        
        setUsers(usersData);
        setFarmerLogs(logsData);
        setTransactions(txData);
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast({ title: 'Error', description: 'Failed to load admin data.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [hasPermission]);

  const handleAddUser = () => {
    setEditUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setEditUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    try {
      await userService.delete(deleteUser.uid);
      setUsers(users.filter(user => user.uid !== deleteUser.uid));
      toast({ title: 'Success', description: 'User deleted successfully.' });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
    } finally {
      setDeleteUser(null);
    }
  };

  const handleUserFormSubmit = async (data: any) => {
    setIsFormLoading(true);
    try {
      if (editUser) {
        await userService.update(editUser.uid, {
          displayName: data.displayName,
          role: data.role,
        });
        setUsers(users.map(user => 
          user.uid === editUser.uid 
            ? { ...user, displayName: data.displayName, role: data.role }
            : user
        ));
        toast({ title: 'Success', description: 'User updated successfully.' });
      } else {
        // In a real app, you'd create the user via Firebase Auth
        const newUser = {
          uid: `user_${Date.now()}`,
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        await userService.create(newUser);
        setUsers([newUser, ...users]);
        toast({ title: 'Success', description: 'User created successfully.' });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast({ title: 'Error', description: 'Failed to save user.', variant: 'destructive' });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleBulkUserImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromCSV<any>(
        file,
        async (data) => {
          const { valid, invalid } = validateCSVData<any>(
            data,
            ['Email', 'Display Name', 'Role'] as any,
            (item) => {
              try {
                return {
                  email: item['Email'],
                  displayName: item['Display Name'],
                  role: item['Role'],
                };
              } catch {
                return null;
              }
            }
          );

          if (valid.length > 0) {
            try {
              const newUsers = valid.map(user => ({
                uid: `user_${Date.now()}_${Math.random()}`,
                ...user,
                createdAt: new Date(),
                lastLogin: new Date(),
              }));
              
              await userService.createBatch(newUsers);
              const updatedUsers = await userService.getAll();
              setUsers(updatedUsers);
              
              toast({ 
                title: 'Success', 
                description: `Imported ${valid.length} users successfully.` + 
                  (invalid.length > 0 ? ` ${invalid.length} users failed validation.` : '') 
              });
            } catch (error) {
              console.error('Error importing users:', error);
              toast({ title: 'Error', description: 'Failed to import users.', variant: 'destructive' });
            }
          } else {
            toast({ title: 'Error', description: 'No valid data found in CSV file.', variant: 'destructive' });
          }
        },
        (error) => {
          toast({ title: 'Error', description: error, variant: 'destructive' });
        }
      );
      event.target.value = '';
    }
  };

  const handleExportUsers = () => {
    const exportData = users.map(user => ({
      'Email': user.email,
      'Display Name': user.displayName,
      'Role': user.role,
      'Created At': user.createdAt instanceof Date ? user.createdAt.toLocaleDateString() : new Date((user.createdAt as any).seconds * 1000).toLocaleDateString(),
      'Last Login': user.lastLogin instanceof Date ? user.lastLogin.toLocaleDateString() : new Date((user.lastLogin as any).seconds * 1000).toLocaleDateString(),
    }));
    exportToCSV(exportData, `users-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportFarmerLogs = () => {
    generateReportPDF(
      farmerLogs,
      'Farmer Logs Report',
      [
        { key: 'farmerName', label: 'Farmer Name' },
        { key: 'crop', label: 'Crop' },
        { key: 'fertilizer', label: 'Fertilizer' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'status', label: 'Status' },
      ],
      `farmer-logs-report-${new Date().toISOString().split('T')[0]}.pdf`
    );
  };

  const handleExportTransactions = () => {
    generateReportPDF(
      transactions,
      'Blockchain Transactions Report',
      [
        { key: 'transactionId', label: 'Transaction ID' },
        { key: 'farmerName', label: 'Farmer' },
        { key: 'action', label: 'Action' },
        { key: 'details', label: 'Details' },
      ],
      `blockchain-transactions-report-${new Date().toISOString().split('T')[0]}.pdf`
    );
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

  const userColumns: ColumnDef<UserProfile>[] = useMemo(
    () => [
      {
        accessorKey: 'email',
        header: createSortableHeader('Email'),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('email')}</div>
        ),
      },
      {
        accessorKey: 'displayName',
        header: createSortableHeader('Display Name'),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge className={getRoleBadgeColor(row.getValue('role'))}>
            {row.getValue('role')}
          </Badge>
        ),
      },
      {
        accessorKey: 'lastLogin',
        header: createSortableHeader('Last Login'),
        cell: ({ row }) => {
          const date = row.getValue('lastLogin') as any;
          const dateObj = date?.seconds ? new Date(date.seconds * 1000) : new Date(date);
          return <div className="text-sm">{dateObj.toLocaleDateString()}</div>;
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setDeleteUser(user)}
                  className="text-red-600"
                  disabled={user.uid === userProfile?.uid}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [userProfile]
  );

  if (!hasPermission('admin')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen message="Loading admin panel..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Farmer Logs</CardTitle>
            <FileDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farmerLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">User Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage user accounts and permissions
              </p>
            </div>
            <Button onClick={handleAddUser}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <DataTable
                columns={userColumns}
                data={users}
                searchKey="email"
                searchPlaceholder="Search by email..."
                onRowClick={handleEditUser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Bulk Operations</h3>
            <p className="text-sm text-muted-foreground">
              Import and export data in bulk
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Import Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a CSV file with user data (Email, Display Name, Role)
                </p>
                <div className="relative">
                  <Button variant="outline" asChild>
                    <label htmlFor="user-csv-import" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose CSV File
                    </label>
                  </Button>
                  <input
                    id="user-csv-import"
                    type="file"
                    accept=".csv"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleBulkUserImport}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all user data as CSV
                </p>
                <Button onClick={handleExportUsers}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">System Reports</h3>
            <p className="text-sm text-muted-foreground">
              Generate and download system reports
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Farmer Logs Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate PDF report of all farmer logs
                </p>
                <Button onClick={handleExportFarmerLogs}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Generate PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Blockchain Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate PDF report of blockchain transactions
                </p>
                <Button onClick={handleExportTransactions}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Generate PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Export user data as CSV
                </p>
                <Button onClick={handleExportUsers}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">System Settings</h3>
            <p className="text-sm text-muted-foreground">
              Configure application settings
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Application Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                System settings and configuration options will be available here.
                This can include API keys, notification settings, backup configurations, etc.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditUser(null);
        }}
        onSubmit={handleUserFormSubmit}
        editUser={editUser}
        isLoading={isFormLoading}
      />

      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              {deleteUser && ` "${deleteUser.email}"`} from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
