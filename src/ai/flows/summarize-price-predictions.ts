'use server';

/**
 * @fileOverview Summarizes price predictions for a selected crop, highlighting key trends and insights.
 *
 * - summarizePricePredictions - A function that handles the price prediction summarization process.
 * - SummarizePricePredictionsInput - The input type for the summarizePricePredictions function.
 * - SummarizePricePredictionsOutput - The return type for the summarizePricePredictions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePricePredictionsInputSchema = z.object({
  crop: z.string().describe('The crop for which to summarize price predictions.'),
  historicalPrices: z.string().describe('The historical prices data as a JSON string.'),
  predictedPrices: z.string().describe('The predicted prices data as a JSON string.'),
});
export type SummarizePricePredictionsInput = z.infer<typeof SummarizePricePredictionsInputSchema>;

const SummarizePricePredictionsOutputSchema = z.object({
  summary: z.string().describe('A comprehensive summary of the price predictions with market insights.'),
  trendAnalysis: z.string().describe('Analysis of price trends and patterns.'),
  riskAssessment: z.string().describe('Risk assessment and volatility analysis.'),
  recommendations: z.string().describe('Actionable recommendations for farmers.'),
  confidenceScore: z.number().min(0).max(100).describe('Confidence score of the prediction (0-100).'),
});
export type SummarizePricePredictionsOutput = z.infer<typeof SummarizePricePredictionsOutputSchema>;

export async function summarizePricePredictions(
  input: SummarizePricePredictionsInput
): Promise<SummarizePricePredictionsOutput> {
  return summarizePricePredictionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePricePredictionsPrompt',
  input: {schema: SummarizePricePredictionsInputSchema},
  output: {schema: SummarizePricePredictionsOutputSchema},
  prompt: `You are an expert agricultural economist and market analyst specializing in crop price forecasting. Analyze the following price data and provide comprehensive insights.

Crop: {{{crop}}}
Historical Prices: {{{historicalPrices}}}
Predicted Prices: {{{predictedPrices}}}

Provide your analysis in the following structured format:

**Summary**: A comprehensive overview of the price trajectory, highlighting the most significant patterns and expected changes. Include percentage changes and price ranges.

**Trend Analysis**: Detailed analysis of price trends, identifying:
- Overall direction (upward/downward/stable)
- Seasonal patterns if apparent
- Rate of change and momentum
- Key inflection points
- Comparison with typical market cycles

**Risk Assessment**: Evaluate market volatility and risks:
- Price volatility assessment (high/medium/low)
- Potential risk factors (weather, demand, supply chain)
- Market stability indicators
- External factors that could impact prices

**Recommendations**: Actionable advice for farmers:
- Optimal timing for selling/buying
- Risk mitigation strategies
- Market entry/exit recommendations
- Storage and inventory management suggestions
- Financial planning considerations

**Confidence Score**: Provide a confidence score (0-100) based on:
- Data quality and completeness
- Market stability
- Predictive model reliability
- External uncertainty factors

Focus on practical insights that help farmers make informed decisions about planting, harvesting, selling, and financial planning.
`,
});

const summarizePricePredictionsFlow = ai.defineFlow(
  {
    name: 'summarizePricePredictionsFlow',
    inputSchema: SummarizePricePredictionsInputSchema,
    outputSchema: SummarizePricePredictionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
