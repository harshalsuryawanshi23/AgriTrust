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
  summary: z.string().describe('A summary of the price predictions, highlighting key trends and insights.'),
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
  prompt: `You are an expert agricultural economist.  You are tasked with summarizing price predictions for a given crop.

Crop: {{{crop}}}
Historical Prices: {{{historicalPrices}}}
Predicted Prices: {{{predictedPrices}}}

Provide a concise summary of the price predictions, highlighting key trends and insights that would be useful for a farmer. Focus on major price changes and provide possible explanations for these changes.
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
