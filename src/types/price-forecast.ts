export interface PriceDataPoint {
  date: string;
  price: number;
  type: 'Historical' | 'Predicted';
}

export interface CropPriceData {
  cropName: string;
  historical: PriceDataPoint[];
  predicted: PriceDataPoint[];
  summary?: string; // AI-generated summary
}

export const AVAILABLE_CROPS = [
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

