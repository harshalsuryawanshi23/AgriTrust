import { CropPriceData, PriceDataPoint, AVAILABLE_CROPS } from '@/types/price-forecast';

const generateHistoricalData = (crop: string, days: number): PriceDataPoint[] => {
  const data: PriceDataPoint[] = [];
  const basePrice = Math.random() * 1000 + 1000;
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const price = basePrice + Math.sin(i / 10) * 50 + Math.random() * 20;
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      type: 'Historical',
    });
  }
  return data;
};

const generatePredictedData = (historicalData: PriceDataPoint[], days: number): PriceDataPoint[] => {
  const data: PriceDataPoint[] = [];
  let lastPrice = historicalData[historicalData.length - 1].price;
  for (let i = 1; i <= days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const price = lastPrice + Math.sin(i / 5) * 30 + (Math.random() - 0.5) * 40;
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      type: 'Predicted',
    });
    lastPrice = price;
  }
  return data;
};

const generateAISummary = (crop: string, predictedData: PriceDataPoint[]): string => {
  const trend = predictedData[predictedData.length - 1].price > predictedData[0].price ? 'upward' : 'downward';
  const avgPrice = predictedData.reduce((acc, p) => acc + p.price, 0) / predictedData.length;
  return `The price of ${crop} is expected to show a slight ${trend} trend over the next month, with an average price of around ₹${avgPrice.toFixed(2)}/qtl. Market volatility is expected to be moderate.`
}

export const fetchPriceForecast = async (crop: string): Promise<CropPriceData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const historical = generateHistoricalData(crop, 30);
      const predicted = generatePredictedData(historical, 30);
      const summary = generateAISummary(crop, predicted);
      resolve({
        cropName: crop,
        historical,
        predicted,
        summary,
      });
    }, 1000);
  });
};

export const getAvailableCrops = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...AVAILABLE_CROPS]);
    }, 500);
  });
};

