'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, PlusCircle, Download, Upload, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, createSortableHeader } from '@/components/ui/data-table';
import { LoadingOverlay } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { FirestoreService, firestoreTimestamp, queryBuilders } from '@/lib/firestore-utils';
import { FarmerLog, FarmerLogFormData, CROPS } from '@/types/farmer-logs';
import FarmerLogFormModal from './farmer-logs/farmer-log-form-modal';
import { useAuth } from '@/contexts/AuthContext';
import { exportToCSV, importFromCSV, validateCSVData } from '@/lib/csv-utils';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const farmerLogService = new FirestoreService<FarmerLog>('farmer-logs');

export default function FarmerLogsClient() {
  const { hasPermission } = useAuth();
  const [logs, setLogs] = useState<FarmerLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLog, setEditLog] = useState<FarmerLog | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await farmerLogService.getAll();
        setLogs(data);
      } catch (error) {
        console.error('Error loading logs:', error);
        toast({ title: 'Error', description: 'Failed to load farmer logs.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const cropMatch = filterCrop === 'all' || log.crop === filterCrop;
      const statusMatch = filterStatus === 'all' || log.status === filterStatus;
      return cropMatch && statusMatch;
    });
  }, [logs, filterCrop, filterStatus]);

  const handleAddClick = () => {
    setEditLog(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (log: FarmerLog) => {
    setEditLog(log);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this log?')) {
      try {
        await farmerLogService.delete(id);
        setLogs(logs.filter(log => log.id !== id));
        toast({ title: 'Success', description: 'Log deleted successfully.' });
      } catch (error) {
        console.error('Error deleting log:', error);
        toast({ title: 'Error', description: 'Failed to delete log.', variant: 'destructive' });
      }
    }
  };

  const handleFormSubmit = async (data: FarmerLogFormData) => {
    setIsFormLoading(true);
    try {
      const logData = {
        ...data,
        date: firestoreTimestamp.fromDate(data.date),
      };

      if (editLog?.id) {
        await farmerLogService.update(editLog.id, logData);
        setLogs(logs.map(log => log.id === editLog.id ? { ...log, ...logData } : log));
        toast({ title: 'Success', description: 'Log updated successfully.' });
      } else {
        const newId = await farmerLogService.create(logData);
        const newLog = { id: newId, ...logData };
        setLogs([newLog, ...logs]);
        toast({ title: 'Success', description: 'Log created successfully.' });
      }
    } catch (error) {
      console.error('Error saving log:', error);
      toast({ title: 'Error', description: 'Failed to save log.', variant: 'destructive' });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleExportCSV = () => {
    const exportData = filteredLogs.map(log => ({
      'Farmer Name': log.farmerName,
      'Crop': log.crop,
      'Fertilizer': log.fertilizer,
      'Quantity': log.quantity,
      'Date': log.date instanceof Date ? log.date.toLocaleDateString() : new Date(log.date.seconds * 1000).toLocaleDateString(),
      'Location': log.location || '',
      'Status': log.status,
      'Notes': log.notes || '',
    }));
    exportToCSV(exportData, `farmer-logs-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromCSV<any>(
        file,
        async (data) => {
          const { valid, invalid } = validateCSVData<any>(
            data,
            ['Farmer Name', 'Crop', 'Fertilizer', 'Quantity', 'Date'] as any,
            (item) => {
              try {
                return {
                  farmerName: item['Farmer Name'],
                  crop: item['Crop'],
                  fertilizer: item['Fertilizer'],
                  quantity: parseFloat(item['Quantity']),
                  date: new Date(item['Date']),
                  location: item['Location'] || '',
                  status: item['Status'] || 'active',
                  notes: item['Notes'] || '',
                };
              } catch {
                return null;
              }
            }
          );

          if (valid.length > 0) {
            try {
              await farmerLogService.createBatch(valid);
              const newLogs = await farmerLogService.getAll();
              setLogs(newLogs);
              toast({ 
                title: 'Success', 
                description: `Imported ${valid.length} logs successfully.` + 
                  (invalid.length > 0 ? ` ${invalid.length} logs failed validation.` : '') 
              });
            } catch (error) {
              console.error('Error importing data:', error);
              toast({ title: 'Error', description: 'Failed to import data.', variant: 'destructive' });
            }
          } else {
            toast({ title: 'Error', description: 'No valid data found in CSV file.', variant: 'destructive' });
          }
        },
        (error) => {
          toast({ title: 'Error', description: error, variant: 'destructive' });
        }
      );
      // Reset file input
      event.target.value = '';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const columns: ColumnDef<FarmerLog>[] = useMemo(
    () => [
      {
        accessorKey: 'farmerName',
        header: createSortableHeader('Farmer Name'),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('farmerName')}</div>
        ),
      },
      {
        accessorKey: 'crop',
        header: 'Crop',
        cell: ({ row }) => (
          <Badge variant="outline">{row.getValue('crop')}</Badge>
        ),
      },
      {
        accessorKey: 'fertilizer',
        header: 'Fertilizer',
      },
      {
        accessorKey: 'quantity',
        header: createSortableHeader('Quantity (kg)'),
        cell: ({ row }) => (
          <div className="text-right">{row.getValue('quantity')} kg</div>
        ),
      },
      {
        accessorKey: 'date',
        header: createSortableHeader('Date'),
        cell: ({ row }) => {
          const date = row.getValue('date') as any;
          const dateObj = date?.seconds ? new Date(date.seconds * 1000) : new Date(date);
          return <div className="text-sm">{dateObj.toLocaleDateString()}</div>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.getValue('status')),
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const log = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditClick(log)}>
                  Edit
                </DropdownMenuItem>
                {hasPermission('admin') && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClick(log.id!)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [hasPermission]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Farmer Logs</h2>
          <p className="text-muted-foreground">
            Manage and track farmer activities and fertilizer usage
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button onClick={handleAddClick} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Log
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportCSV}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="relative">
            <Button variant="outline" asChild>
              <label htmlFor="csv-import" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" /> Import
              </label>
            </Button>
            <input
              id="csv-import"
              type="file"
              accept=".csv"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImportCSV}
            />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Crop:</label>
              <Select value={filterCrop} onValueChange={setFilterCrop}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All crops" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {CROPS.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Status:</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Badge variant="secondary" className="ml-auto">
              {filteredLogs.length} logs found
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <LoadingOverlay isLoading={isLoading}>
            <DataTable
              columns={columns}
              data={filteredLogs}
              searchKey="farmerName"
              searchPlaceholder="Search by farmer name..."
              onRowClick={(log) => handleEditClick(log)}
            />
          </LoadingOverlay>
        </CardContent>
      </Card>

      <FarmerLogFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditLog(null);
        }}
        onSubmit={handleFormSubmit}
        editData={editLog}
        isLoading={isFormLoading}
      />
    </motion.div>
  );
}
