import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const customModel = (apiIdentifier: string) => {
  return openai(apiIdentifier);
}; 