import { CropPriceData, PriceDataPoint, AVAILABLE_CROPS } from '@/types/price-forecast';
import { summarizePricePredictions } from '@/ai/flows/summarize-price-predictions';
import { 
  calculatePriceStatistics, 
  analyzeTrends, 
  assessRisk,
  getVolatilityCategory
} from '@/lib/price-analysis-utils';

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

/**
 * Generate AI-powered summary using advanced analysis
 */
const generateAIPoweredSummary = async (
  crop: string, 
  historical: PriceDataPoint[], 
  predicted: PriceDataPoint[]
): Promise<string> => {
  try {
    // Perform statistical analysis
    const allData = [...historical, ...predicted];
    const statistics = calculatePriceStatistics(allData);
    const trends = analyzeTrends(allData);
    const risk = assessRisk(statistics, trends);
    const volatilityCategory = getVolatilityCategory(statistics.volatility);

    // Prepare data for AI analysis with additional context
    const analysisContext = {
      statistics,
      trends,
      risk,
      volatilityCategory,
    };

    const result = await summarizePricePredictions({
      crop,
      historicalPrices: JSON.stringify(historical.map(({ type, ...rest }) => ({
        ...rest,
        analysisContext: JSON.stringify(analysisContext)
      }))),
      predictedPrices: JSON.stringify(predicted.map(({ type, ...rest }) => rest)),
    });

    // Format the structured AI response
    return formatAIResponse(result);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    // Fallback to basic analysis
    return generateBasicSummary(crop, historical, predicted);
  }
};

/**
 * Format AI response into readable summary
 */
function formatAIResponse(aiResult: any): string {
  const { summary, trendAnalysis, riskAssessment, recommendations, confidenceScore } = aiResult;
  
  return `${summary}\n\n**Trend Analysis:**\n${trendAnalysis}\n\n**Risk Assessment:**\n${riskAssessment}\n\n**Recommendations:**\n${recommendations}\n\n**Confidence Score:** ${confidenceScore}%`;
}

/**
 * Fallback basic summary when AI fails
 */
function generateBasicSummary(
  crop: string, 
  historical: PriceDataPoint[], 
  predicted: PriceDataPoint[]
): string {
  const allData = [...historical, ...predicted];
  const statistics = calculatePriceStatistics(allData);
  const trends = analyzeTrends(allData);
  const risk = assessRisk(statistics, trends);
  
  return `**${crop} Price Analysis:**\n\n` +
    `Current trend shows a ${trends.overallTrend} direction with ${trends.momentum} momentum. ` +
    `Average price is ₹${statistics.mean.toFixed(2)} with ${risk.riskLevel} risk level. ` +
    `Price volatility is ${getVolatilityCategory(statistics.volatility)} at ${statistics.volatility.toFixed(1)}%. ` +
    `\n\n**Key Insights:**\n` +
    `• Price change: ${statistics.changePercentage > 0 ? '+' : ''}${statistics.changePercentage.toFixed(1)}%\n` +
    `• Risk factors: ${risk.riskFactors.join(', ') || 'None identified'}\n` +
    `• Market stability: ${risk.stabilityScore.toFixed(0)}%`;
}

export const fetchPriceForecast = async (crop: string): Promise<CropPriceData> => {
  const historical = generateHistoricalData(crop, 30);
  const predicted = generatePredictedData(historical, 30);
  
  // Generate AI-powered summary
  const summary = await generateAIPoweredSummary(crop, historical, predicted);
  
  return {
    cropName: crop,
    historical,
    predicted,
    summary,
  };
};

export const getAvailableCrops = async (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...AVAILABLE_CROPS]);
    }, 500);
  });
};

