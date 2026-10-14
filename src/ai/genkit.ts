/**
 * Legacy Genkit entrypoint retained for script compatibility.
 * Runtime AI calls now use the official @google/genai Interactions API.
 * @see ./gemini-client.ts
 * @see https://ai.google.dev/gemini-api/docs/get-started
 */
export { getGeminiClient, PROMPT_MODEL, IMAGE_MODEL } from './gemini-client';
