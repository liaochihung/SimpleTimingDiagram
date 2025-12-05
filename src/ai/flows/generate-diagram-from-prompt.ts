'use server';

/**
 * @fileOverview Generates a timing diagram from a text prompt.
 *
 * - generateDiagramFromPrompt - A function that generates a timing diagram based on a user-provided text prompt.
 * - GenerateDiagramFromPromptInput - The input type for the generateDiagramFromPrompt function.
 * - GenerateDiagramFromPromptOutput - The return type for the generateDiagramFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagramFromPromptInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A text prompt describing the desired timing diagram. Be as specific as possible, including the number of signals, their names, and timing relationships.'
    ),
});
export type GenerateDiagramFromPromptInput = z.infer<
  typeof GenerateDiagramFromPromptInputSchema
>;

const GenerateDiagramFromPromptOutputSchema = z.object({
  diagram: z
    .string()
    .describe(
      'A textual representation of the timing diagram, suitable for rendering in the WebJackTimer application.'
    ),
});
export type GenerateDiagramFromPromptOutput = z.infer<
  typeof GenerateDiagramFromPromptOutputSchema
>;

export async function generateDiagramFromPrompt(
  input: GenerateDiagramFromPromptInput
): Promise<GenerateDiagramFromPromptOutput> {
  return generateDiagramFromPromptFlow(input);
}

const generateDiagramPrompt = ai.definePrompt({
  name: 'generateDiagramPrompt',
  input: {schema: GenerateDiagramFromPromptInputSchema},
  output: {schema: GenerateDiagramFromPromptOutputSchema},
  prompt: `You are a diagramming assistant that generates timing diagrams from text.

  Given the following prompt, create a timing diagram that can be displayed in the WebJackTimer application.
  Ensure that the generated diagram is clear, concise, and accurately reflects the user's request.

  Prompt: {{{prompt}}}
  Diagram: `,
});

const generateDiagramFromPromptFlow = ai.defineFlow(
  {
    name: 'generateDiagramFromPromptFlow',
    inputSchema: GenerateDiagramFromPromptInputSchema,
    outputSchema: GenerateDiagramFromPromptOutputSchema,
  },
  async input => {
    const {output} = await generateDiagramPrompt(input);
    return output!;
  }
);
