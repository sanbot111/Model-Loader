import { GoogleGenAI } from "@google/genai";

/**
 * Official Gemini API client (@google/genai).
 * Reads GEMINI_API_KEY (preferred), GOOGLE_API_KEY, or GOOGLE_GENAI_API_KEY.
 * @see https://ai.google.dev/gemini-api/docs/get-started
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Set GEMINI_API_KEY in your environment (see https://ai.google.dev/gemini-api/docs/get-started)."
    );
  }

  return new GoogleGenAI({ apiKey });
}

/** Complex reasoning / structured art-director prompts */
export const PROMPT_MODEL = "gemini-3.1-pro-preview";

/** Nano Banana Pro — high-fidelity fashion turnaround images */
export const IMAGE_MODEL = "gemini-3-pro-image";
