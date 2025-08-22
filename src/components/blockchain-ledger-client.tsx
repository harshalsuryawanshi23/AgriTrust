'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, createSortableHeader } from '@/components/ui/data-table';
import { LoadingOverlay } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FirestoreService } from '@/lib/firestore-utils';
import { BlockchainTransaction, Block, ACTION_COLORS } from '@/types/blockchain';
import BlockchainVisualization from './blockchain/blockchain-visualization';
import { toast } from '@/hooks/use-toast';

const transactionService = new FirestoreService<BlockchainTransaction>('blockchain-transactions');

const createHash = async (data: string) => {
  const buffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const groupTransactionsIntoBlocks = (transactions: BlockchainTransaction[]): Block[] => {
  const blocks: Block[] = [];
  let currentBlockTransactions: BlockchainTransaction[] = [];
  
  transactions.forEach((tx, index) => {
    currentBlockTransactions.push(tx);
    if ((index + 1) % 5 === 0 || index === transactions.length - 1) {
      const previousHash = blocks.length > 0 ? blocks[blocks.length - 1].hash : '0'.repeat(64);
      const blockId = `block-${blocks.length + 1}`;
      const timestamp = new Date();
      const nonce = Math.floor(Math.random() * 100000);
      
      const hash = 'temporary-hash'; // In a real scenario, this would be computed

      blocks.push({
        id: blockId,
        transactions: [...currentBlockTransactions],
        timestamp,
        previousHash,
        hash,
        nonce,
      });
      currentBlockTransactions = [];
    }
  });

  return blocks;
};

export default function BlockchainLedgerClient() {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = transactionService.subscribe((data) => {
      setTransactions(data);
      setBlocks(groupTransactionsIntoBlocks(data));
      setIsLoading(false);
    }, ['orderBy("timestamp", "desc")']);

    return () => unsubscribe();
  }, []);

  const columns: ColumnDef<BlockchainTransaction>[] = useMemo(
    () => [
      {
        accessorKey: 'transactionId',
        header: createSortableHeader('Transaction ID'),
        cell: ({ row }) => <span className="font-mono text-xs">{row.getValue('transactionId')}</span>,
      },
      {
        accessorKey: 'timestamp',
        header: createSortableHeader('Timestamp'),
        cell: ({ row }) => {
          const date = row.getValue('timestamp') as any;
          return new Date(date.seconds * 1000).toLocaleString();
        },
      },
      {
        accessorKey: 'farmerName',
        header: 'Farmer',
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => {
          const action = row.getValue('action') as string;
          return (
            <Badge className={ACTION_COLORS[action as keyof typeof ACTION_COLORS]}>
              {action}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'details',
        header: 'Details',
        cell: ({ row }) => (
          <div className="max-w-xs truncate">{row.getValue('details')}</div>
        ),
      },
      {
        accessorKey: 'blockHash',
        header: createSortableHeader('Block Hash'),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{(row.getValue('blockHash') as string)?.substring(0, 10)}...</span>
        ),
      },
    ],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <BlockchainVisualization blocks={blocks} />

      <Card>
        <CardHeader>
          <CardTitle>Transaction Logs</CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed log of all blockchain transactions
          </p>
        </CardHeader>
        <CardContent>
          <LoadingOverlay isLoading={isLoading}>
            <DataTable
              columns={columns}
              data={transactions}
              searchKey="transactionId"
              searchPlaceholder="Search by Transaction ID..."
            />
          </LoadingOverlay>
        </CardContent>
      </Card>
    </motion.div>
  );
}
