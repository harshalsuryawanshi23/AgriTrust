'use server';

import { summarizePricePredictions } from '@/ai/flows/summarize-price-predictions';
import type { PriceData } from '@/lib/types';

export async function getPriceSummary(crop: string, priceData: PriceData[]) {
  const historicalPrices = priceData.filter(p => p.type === 'Historical').map(({ type, ...rest }) => rest);
  const predictedPrices = priceData.filter(p => p.type === 'Predicted').map(({ type, ...rest }) => rest);

  try {
    const result = await summarizePricePredictions({
      crop,
      historicalPrices: JSON.stringify(historicalPrices),
      predictedPrices: JSON.stringify(predictedPrices),
    });
    return { summary: result.summary, error: null };
  } catch (error) {
    console.error('Error getting price summary:', error);
    return { summary: null, error: 'Failed to generate summary. Please try again.' };
  }
}
