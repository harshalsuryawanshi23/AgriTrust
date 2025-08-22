import { Timestamp } from 'firebase/firestore';

export interface BlockchainTransaction {
  id?: string;
  transactionId: string;
  timestamp: Date | Timestamp;
  farmerId: string;
  farmerName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TRANSFER' | 'VERIFY';
  details: string;
  blockHash: string;
  previousHash: string;
  nonce: number;
  createdAt?: Date | Timestamp;
}

export interface Block {
  id: string;
  transactions: BlockchainTransaction[];
  timestamp: Date;
  hash: string;
  previousHash: string;
  nonce: number;
}

export const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  TRANSFER: 'bg-purple-100 text-purple-800',
  VERIFY: 'bg-orange-100 text-orange-800',
};
