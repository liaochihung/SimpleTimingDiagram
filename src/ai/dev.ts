import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-relevant-symbols.ts';
import '@/ai/flows/generate-diagram-from-prompt.ts';
import '@/ai/flows/check-for-timing-errors.ts';