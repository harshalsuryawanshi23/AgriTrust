import { PriceDataPoint } from '@/types/price-forecast';

export interface PriceStatistics {
  mean: number;
  median: number;
  standardDeviation: number;
  variance: number;
  minPrice: number;
  maxPrice: number;
  priceRange: number;
  volatility: number;
  trend: 'upward' | 'downward' | 'stable';
  trendStrength: number; // 0-1, where 1 is strongest trend
  changePercentage: number;
}

export interface TrendAnalysis {
  overallTrend: 'upward' | 'downward' | 'stable';
  trendStrength: number;
  averageChange: number;
  maxIncrease: number;
  maxDecrease: number;
  inflectionPoints: number[];
  momentum: 'accelerating' | 'decelerating' | 'consistent';
}

/**
 * Calculate comprehensive price statistics
 */
export function calculatePriceStatistics(prices: PriceDataPoint[]): PriceStatistics {
  if (prices.length === 0) {
    throw new Error('Price data array cannot be empty');
  }

  const priceValues = prices.map(p => p.price);
  const sortedPrices = [...priceValues].sort((a, b) => a - b);
  
  // Basic statistics
  const mean = priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length;
  const median = sortedPrices.length % 2 === 0
    ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
    : sortedPrices[Math.floor(sortedPrices.length / 2)];
  
  const variance = priceValues.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / priceValues.length;
  const standardDeviation = Math.sqrt(variance);
  
  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);
  const priceRange = maxPrice - minPrice;
  
  // Volatility (coefficient of variation)
  const volatility = (standardDeviation / mean) * 100;
  
  // Trend calculation
  const firstPrice = priceValues[0];
  const lastPrice = priceValues[priceValues.length - 1];
  const changePercentage = ((lastPrice - firstPrice) / firstPrice) * 100;
  
  let trend: 'upward' | 'downward' | 'stable';
  if (Math.abs(changePercentage) < 2) {
    trend = 'stable';
  } else if (changePercentage > 0) {
    trend = 'upward';
  } else {
    trend = 'downward';
  }
  
  // Trend strength based on R-squared of linear regression
  const trendStrength = calculateTrendStrength(priceValues);
  
  return {
    mean,
    median,
    standardDeviation,
    variance,
    minPrice,
    maxPrice,
    priceRange,
    volatility,
    trend,
    trendStrength,
    changePercentage,
  };
}

/**
 * Calculate trend strength using linear regression R-squared
 */
function calculateTrendStrength(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const n = prices.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = prices;
  
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  const sumYY = y.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  if (denominator === 0) return 0;
  
  const r = numerator / denominator;
  return Math.abs(r); // Return absolute value for trend strength
}

/**
 * Perform detailed trend analysis
 */
export function analyzeTrends(prices: PriceDataPoint[]): TrendAnalysis {
  if (prices.length < 2) {
    return {
      overallTrend: 'stable',
      trendStrength: 0,
      averageChange: 0,
      maxIncrease: 0,
      maxDecrease: 0,
      inflectionPoints: [],
      momentum: 'consistent',
    };
  }

  const priceValues = prices.map(p => p.price);
  const changes = [];
  
  // Calculate price changes
  for (let i = 1; i < priceValues.length; i++) {
    changes.push(priceValues[i] - priceValues[i - 1]);
  }
  
  const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
  const maxIncrease = Math.max(...changes.filter(change => change > 0), 0);
  const maxDecrease = Math.min(...changes.filter(change => change < 0), 0);
  
  // Determine overall trend
  let overallTrend: 'upward' | 'downward' | 'stable';
  if (Math.abs(averageChange) < priceValues[0] * 0.001) { // Less than 0.1% of initial price
    overallTrend = 'stable';
  } else if (averageChange > 0) {
    overallTrend = 'upward';
  } else {
    overallTrend = 'downward';
  }
  
  const trendStrength = calculateTrendStrength(priceValues);
  
  // Find inflection points (where trend changes direction)
  const inflectionPoints = [];
  for (let i = 1; i < changes.length - 1; i++) {
    if ((changes[i] > 0 && changes[i + 1] < 0) || (changes[i] < 0 && changes[i + 1] > 0)) {
      inflectionPoints.push(i + 1);
    }
  }
  
  // Determine momentum by comparing first and second half trends
  const midPoint = Math.floor(priceValues.length / 2);
  const firstHalfTrend = calculateTrendStrength(priceValues.slice(0, midPoint));
  const secondHalfTrend = calculateTrendStrength(priceValues.slice(midPoint));
  
  let momentum: 'accelerating' | 'decelerating' | 'consistent';
  const momentumDiff = secondHalfTrend - firstHalfTrend;
  if (Math.abs(momentumDiff) < 0.1) {
    momentum = 'consistent';
  } else if (momentumDiff > 0) {
    momentum = 'accelerating';
  } else {
    momentum = 'decelerating';
  }
  
  return {
    overallTrend,
    trendStrength,
    averageChange,
    maxIncrease,
    maxDecrease,
    inflectionPoints,
    momentum,
  };
}

/**
 * Calculate price volatility category
 */
export function getVolatilityCategory(volatility: number): 'low' | 'medium' | 'high' {
  if (volatility < 5) return 'low';
  if (volatility < 15) return 'medium';
  return 'high';
}

/**
 * Generate risk assessment based on price data
 */
export function assessRisk(statistics: PriceStatistics, trends: TrendAnalysis): {
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  stabilityScore: number; // 0-100
} {
  const riskFactors: string[] = [];
  let riskScore = 0;
  
  // Volatility risk
  if (statistics.volatility > 15) {
    riskFactors.push('High price volatility');
    riskScore += 30;
  } else if (statistics.volatility > 5) {
    riskFactors.push('Moderate price volatility');
    riskScore += 15;
  }
  
  // Trend risk
  if (trends.trendStrength > 0.8) {
    riskFactors.push('Strong directional trend');
    riskScore += 20;
  }
  
  // Inflection points (market instability)
  if (trends.inflectionPoints.length > 3) {
    riskFactors.push('Frequent trend reversals');
    riskScore += 25;
  }
  
  // Price range risk
  if (statistics.priceRange / statistics.mean > 0.5) {
    riskFactors.push('Wide price range');
    riskScore += 15;
  }
  
  let riskLevel: 'low' | 'medium' | 'high';
  if (riskScore < 20) {
    riskLevel = 'low';
  } else if (riskScore < 50) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }
  
  const stabilityScore = Math.max(0, 100 - riskScore);
  
  return {
    riskLevel,
    riskFactors,
    stabilityScore,
  };
}
