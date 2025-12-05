'use server';

/**
 * @fileOverview A timing diagram error checker AI agent.
 *
 * - checkForTimingErrors - A function that handles the timing error checking process.
 * - CheckForTimingErrorsInput - The input type for the checkForTimingErrors function.
 * - CheckForTimingErrorsOutput - The return type for the checkForTimingErrors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckForTimingErrorsInputSchema = z.object({
  diagramDescription: z
    .string()
    .describe('A detailed description of the timing diagram.'),
});
export type CheckForTimingErrorsInput = z.infer<typeof CheckForTimingErrorsInputSchema>;

const CheckForTimingErrorsOutputSchema = z.object({
  errors: z
    .array(z.string())
    .describe("A list of potential timing errors or inconsistencies found in the diagram."),
  isConsistent: z.boolean().describe('Whether the timing diagram is consistent.'),
});
export type CheckForTimingErrorsOutput = z.infer<typeof CheckForTimingErrorsOutputSchema>;

export async function checkForTimingErrors(input: CheckForTimingErrorsInput): Promise<CheckForTimingErrorsOutput> {
  return checkForTimingErrorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'checkForTimingErrorsPrompt',
  input: {schema: CheckForTimingErrorsInputSchema},
  output: {schema: CheckForTimingErrorsOutputSchema},
  prompt: `You are an expert in timing diagrams, capable of identifying potential timing errors and inconsistencies.

You will analyze the provided diagram description and identify any potential timing errors or inconsistencies.

Diagram Description: {{{diagramDescription}}}

Based on your analysis, provide a list of errors found (if any) and a boolean value indicating whether the diagram is consistent.

Output the errors in a concise and clear manner.
`,
});

const checkForTimingErrorsFlow = ai.defineFlow(
  {
    name: 'checkForTimingErrorsFlow',
    inputSchema: CheckForTimingErrorsInputSchema,
    outputSchema: CheckForTimingErrorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
