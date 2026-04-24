'use server';
/**
 * @fileOverview A Genkit flow to generate model images from prompts.
 *
 * - generateModelImages - A function that handles the image generation process.
 * - GenerateModelImagesInput - The input type for the generateModelImages function.
 * - GenerateModelImagesOutput - The return type for the generateModelImages function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateModelImagesInputSchema = z.object({
  straightPrompt: z.string().describe('The prompt for the straight-on image.'),
  leftPrompt: z.string().describe('The prompt for the left profile image.'),
  rightPrompt: z.string().describe('The prompt for the right profile image.'),
});
export type GenerateModelImagesInput = z.infer<typeof GenerateModelImagesInputSchema>;

const GenerateModelImagesOutputSchema = z.object({
  straight: z.string().describe('The data URI of the straight-on image.'),
  left: z.string().describe('The data URI of the left profile image.'),
  right: z.string().describe('The data URI of the right profile image.'),
});
export type GenerateModelImagesOutput = z.infer<typeof GenerateModelImagesOutputSchema>;

export async function generateModelImages(
  input: GenerateModelImagesInput
): Promise<GenerateModelImagesOutput> {
  return generateModelImagesFlow(input);
}

const generateModelImagesFlow = ai.defineFlow(
  {
    name: 'generateModelImagesFlow',
    inputSchema: GenerateModelImagesInputSchema,
    outputSchema: GenerateModelImagesOutputSchema,
  },
  async (input) => {
    const [straightImage, leftImage, rightImage] = await Promise.all([
      ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: input.straightPrompt,
        config: {
            aspectRatio: "1:1",
        }
      }),
      ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: input.leftPrompt,
        config: {
            aspectRatio: "1:1",
        }
      }),
      ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: input.rightPrompt,
        config: {
            aspectRatio: "1:1",
        }
      }),
    ]);
    
    if (!straightImage.media.url || !leftImage.media.url || !rightImage.media.url) {
        throw new Error('Image generation failed');
    }

    return {
      straight: straightImage.media.url,
      left: leftImage.media.url,
      right: rightImage.media.url,
    };
  }
);
