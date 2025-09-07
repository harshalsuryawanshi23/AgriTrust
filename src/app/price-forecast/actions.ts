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
    
    // Format the enhanced AI response
    const formattedSummary = formatEnhancedSummary(result);
    return { summary: formattedSummary, error: null };
  } catch (error) {
    console.error('Error getting price summary:', error);
    return { summary: null, error: 'Failed to generate summary. Please try again.' };
  }
}

/**
 * Format the enhanced AI response for display
 */
function formatEnhancedSummary(result: any): string {
  const { summary, trendAnalysis, riskAssessment, recommendations, confidenceScore } = result;
  
  let formatted = summary;
  
  if (trendAnalysis) {
    formatted += `\n\n**📈 Trend Analysis:**\n${trendAnalysis}`;
  }
  
  if (riskAssessment) {
    formatted += `\n\n**⚠️ Risk Assessment:**\n${riskAssessment}`;
  }
  
  if (recommendations) {
    formatted += `\n\n**💡 Recommendations:**\n${recommendations}`;
  }
  
  if (confidenceScore !== undefined) {
    const confidenceEmoji = confidenceScore >= 80 ? '🟢' : confidenceScore >= 60 ? '🟡' : '🔴';
    formatted += `\n\n**${confidenceEmoji} Confidence Score:** ${confidenceScore}%`;
  }
  
  return formatted;
}
