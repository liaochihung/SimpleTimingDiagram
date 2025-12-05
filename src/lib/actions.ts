"use server";

import {
  suggestRelevantSymbols,
  SuggestRelevantSymbolsInput,
  SuggestRelevantSymbolsOutput,
} from "@/ai/flows/suggest-relevant-symbols";

import {
  checkForTimingErrors,
  CheckForTimingErrorsInput,
  CheckForTimingErrorsOutput,
} from "@/ai/flows/check-for-timing-errors";

export async function getSymbolSuggestions(
  input: SuggestRelevantSymbolsInput
): Promise<SuggestRelevantSymbolsOutput> {
  return await suggestRelevantSymbols(input);
}

export async function getTimingErrors(
  input: CheckForTimingErrorsInput
): Promise<CheckForTimingErrorsOutput> {
  return await checkForTimingErrors(input);
}
