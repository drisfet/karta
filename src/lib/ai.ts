import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Configure Google Gemini
export const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Export providers for use in components
export const providers = {
  gemini,
};

// Default provider (can be configured per user/workspace)
export const defaultProvider = gemini;