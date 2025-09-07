'use server';

/**
 * @fileOverview Market context analysis for agricultural price forecasting
 * 
 * Analyzes external market factors, seasonal patterns, and regional conditions
 * that may influence crop prices beyond historical trends.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketContextInputSchema = z.object({
  crop: z.string().describe('The crop to analyze market context for.'),
  region: z.string().optional().describe('Geographic region or market location.'),
  season: z.string().optional().describe('Current season or time of year.'),
  priceData: z.string().describe('Recent price data as JSON string.'),
  externalFactors: z.string().optional().describe('Known external factors affecting the market.'),
});

export type MarketContextInput = z.infer<typeof MarketContextInputSchema>;

const MarketContextOutputSchema = z.object({
  seasonalAnalysis: z.string().describe('Analysis of seasonal patterns and their impact on prices.'),
  marketConditions: z.string().describe('Current market conditions and supply-demand dynamics.'),
  externalFactors: z.string().describe('Analysis of weather, policy, and economic factors.'),
  regionalInsights: z.string().describe('Regional market characteristics and conditions.'),
  supplyChainStatus: z.string().describe('Supply chain health and potential disruptions.'),
  demandForecast: z.string().describe('Demand projections and consumption patterns.'),
});

export type MarketContextOutput = z.infer<typeof MarketContextOutputSchema>;

export async function analyzeMarketContext(
  input: MarketContextInput
): Promise<MarketContextOutput> {
  return marketContextFlow(input);
}

const marketContextPrompt = ai.definePrompt({
  name: 'marketContextPrompt',
  input: { schema: MarketContextInputSchema },
  output: { schema: MarketContextOutputSchema },
  prompt: `You are an expert agricultural market analyst with deep knowledge of crop markets, seasonal patterns, and external factors affecting agricultural prices.

Analyze the market context for the following crop:

Crop: {{{crop}}}
Region: {{{region}}}
Season: {{{season}}}
Price Data: {{{priceData}}}
External Factors: {{{externalFactors}}}

Provide comprehensive market context analysis:

**Seasonal Analysis**: 
Analyze seasonal patterns typical for this crop, including:
- Planting and harvesting seasons
- Historical seasonal price variations
- Expected seasonal demand patterns
- Weather-related seasonal risks

**Market Conditions**:
Assess current market conditions including:
- Supply and demand balance
- Inventory levels and storage capacity
- Market liquidity and trading volumes
- Competitive landscape

**External Factors**:
Analyze external influences such as:
- Weather patterns and climate conditions
- Government policies and subsidies
- Trade relations and export/import dynamics
- Economic conditions affecting purchasing power
- Input costs (fuel, fertilizers, labor)

**Regional Insights**:
Provide region-specific analysis covering:
- Local market characteristics
- Transportation and logistics factors
- Regional competition and alternatives
- Local consumption patterns

**Supply Chain Status**:
Evaluate supply chain health including:
- Processing and distribution capacity
- Transportation infrastructure
- Storage and preservation facilities
- Potential bottlenecks or disruptions

**Demand Forecast**:
Project demand patterns considering:
- Population growth and dietary changes
- Industrial and export demand
- Substitute crops and alternatives
- Economic factors affecting consumption

Focus on actionable insights that complement price trend analysis for better decision-making.`,
});

const marketContextFlow = ai.defineFlow(
  {
    name: 'marketContextFlow',
    inputSchema: MarketContextInputSchema,
    outputSchema: MarketContextOutputSchema,
  },
  async (input) => {
    const { output } = await marketContextPrompt(input);
    return output!;
  }
);
