'use server';
/**
 * @fileOverview A Genkit flow to construct detailed 3-angle image generation prompts based on user-selected model characteristics.
 *
 * - generateModelTurnaroundPrompts - A function that handles the prompt generation process.
 * - GenerateModelTurnaroundPromptsInput - The input type for the generateModelTurnaroundPrompts function.
 * - GenerateModelTurnaroundPromptsOutput - The return type for the generateModelTurnaroundPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateModelTurnaroundPromptsInputSchema = z.object({
  gender: z.string().describe('The gender of the model (e.g., Male, Female, Non-binary).'),
  ageGroup: z.string().describe('The age group of the model (e.g., Gen Z, Millennial, Gen X, Old).'),
  regionEthnicity: z.string().describe('The region or ethnicity of the model (e.g., South Asian, East Asian, Caucasian, African, Latin American, Middle Eastern).'),
  skinTone: z.string().describe('The skin tone of the model (e.g., fair, tan, dark).'),
  hairStyle: z.string().describe('The hair style of the model (e.g., long, wavy brown hair, short, black curly hair).'),
  marketingArchetype: z.string().describe('The marketing archetype or vibe of the model (e.g., The Corporate Professional, The Urban Creative, The Health/Wellness Consumer, The Everyday Approachable, The High-Fashion/Luxury).')
});
export type GenerateModelTurnaroundPromptsInput = z.infer<typeof GenerateModelTurnaroundPromptsInputSchema>;

const GenerateModelTurnaroundPromptsOutputSchema = z.object({
  straightPrompt: z.string().describe('The prompt string for a straight close-up image generation.'),
  leftPrompt: z.string().describe('The prompt string for a left profile image generation.'),
  rightPrompt: z.string().describe('The prompt string for a right profile image generation.')
});
export type GenerateModelTurnaroundPromptsOutput = z.infer<typeof GenerateModelTurnaroundPromptsOutputSchema>;

export async function generateModelTurnaroundPrompts(
  input: GenerateModelTurnaroundPromptsInput
): Promise<GenerateModelTurnaroundPromptsOutput> {
  return generateModelTurnaroundPromptsFlow(input);
}

const generateModelTurnaroundPromptsFlow = ai.defineFlow(
  {
    name: 'generateModelTurnaroundPromptsFlow',
    inputSchema: GenerateModelTurnaroundPromptsInputSchema,
    outputSchema: GenerateModelTurnaroundPromptsOutputSchema
  },
  async (input) => {
    const { gender, ageGroup, regionEthnicity, skinTone, hairStyle, marketingArchetype } = input;

    const straightPrompt = `Ultra-realistic commercial photography, face straight close-up shot of a ${ageGroup} ${regionEthnicity} ${gender} model. ${skinTone} skin, ${hairStyle}. ${marketingArchetype} styling. Cinematic ad campaign lighting, 8k resolution, highly detailed pores and texture, looking at camera.`;

    const leftPrompt = `Ultra-realistic commercial photography, left side profile close-up shot of a ${ageGroup} ${regionEthnicity} ${gender} model. ${skinTone} skin, ${hairStyle}. ${marketingArchetype} styling. Cinematic ad campaign lighting, 8k resolution, highly detailed pores and texture, looking left.`;

    const rightPrompt = `Ultra-realistic commercial photography, right side profile close-up shot of a ${ageGroup} ${regionEthnicity} ${gender} model. ${skinTone} skin, ${hairStyle}. ${marketingArchetype} styling. Cinematic ad campaign lighting, 8k resolution, highly detailed pores and texture, looking right.`;

    return {
      straightPrompt,
      leftPrompt,
      rightPrompt
    };
  }
);
