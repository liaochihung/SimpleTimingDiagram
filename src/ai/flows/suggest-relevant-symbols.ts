'use server';

/**
 * @fileOverview A flow for suggesting relevant symbols based on the current context of the diagram and user input.
 *
 * - suggestRelevantSymbols - A function that suggests relevant symbols.
 * - SuggestRelevantSymbolsInput - The input type for the suggestRelevantSymbols function.
 * - SuggestRelevantSymbolsOutput - The return type for the suggestRelevantSymbols function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantSymbolsInputSchema = z.object({
  currentDiagramContext: z
    .string()
    .describe(
      'The current context of the diagram, including the symbols already used and their arrangement.'
    ),
  userInput: z.string().describe('The user input, i.e. the last symbol entered.'),
});
export type SuggestRelevantSymbolsInput = z.infer<typeof SuggestRelevantSymbolsInputSchema>;

const SuggestRelevantSymbolsOutputSchema = z.object({
  suggestedSymbols: z
    .array(z.string())
    .describe('An array of symbols suggested based on the current context and user input.'),
});
export type SuggestRelevantSymbolsOutput = z.infer<typeof SuggestRelevantSymbolsOutputSchema>;

export async function suggestRelevantSymbols(
  input: SuggestRelevantSymbolsInput
): Promise<SuggestRelevantSymbolsOutput> {
  return suggestRelevantSymbolsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantSymbolsPrompt',
  input: {schema: SuggestRelevantSymbolsInputSchema},
  output: {schema: SuggestRelevantSymbolsOutputSchema},
  prompt: `You are an expert in timing diagrams. Given the current diagram context and the user input, suggest relevant symbols that the user might want to use next.

Current Diagram Context: {{{currentDiagramContext}}}
User Input: {{{userInput}}}

Suggest a list of symbols that would be relevant in this context:
`,
});

const suggestRelevantSymbolsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantSymbolsFlow',
    inputSchema: SuggestRelevantSymbolsInputSchema,
    outputSchema: SuggestRelevantSymbolsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
