import { nextHandler } from '@genkit-ai/next';
import '@/ai/flows/suggest-relevant-symbols';
import '@/ai/flows/generate-diagram-from-prompt';
import '@/ai/flows/check-for-timing-errors';

export const POST = nextHandler();
