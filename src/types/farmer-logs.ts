import { Timestamp } from 'firebase/firestore';

export interface FarmerLog {
  id?: string;
  farmerName: string;
  crop: string;
  fertilizer: string;
  quantity: number;
  date: Date | Timestamp;
  location?: string;
  notes?: string;
  status: 'active' | 'completed' | 'pending';
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface FarmerLogFormData {
  farmerName: string;
  crop: string;
  fertilizer: string;
  quantity: number;
  date: Date;
  location?: string;
  notes?: string;
  status: 'active' | 'completed' | 'pending';
}

export const CROPS = [
  'Wheat',
  'Rice',
  'Corn',
  'Barley',
  'Soybeans',
  'Cotton',
  'Sugarcane',
  'Potato',
  'Tomato',
  'Onion'
] as const;

export const FERTILIZERS = [
  'Urea',
  'DAP (Diammonium Phosphate)',
  'Potash',
  'NPK (10-26-26)',
  'NPK (20-20-0)',
  'Organic Compost',
  'Vermicompost',
  'Bio-fertilizer'
] as const;

export const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' }
] as const;
