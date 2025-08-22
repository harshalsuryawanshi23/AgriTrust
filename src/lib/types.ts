export type FarmerLog = {
  id: string;
  name: string;
  crop: string;
  fertilizerUsed: string;
  quantity: number;
  date: string;
};

export type Transaction = {
  id: string;
  timestamp: string;
  farmerId: string;
  action: string;
  details: string;
};

export type PriceData = {
  month: string;
  price: number;
  type: 'Historical' | 'Predicted';
};
