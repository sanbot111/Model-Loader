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

const prompt = ai.definePrompt(
    {
        name: 'generateModelTurnaroundPromptsPrompt',
        input: { schema: GenerateModelTurnaroundPromptsInputSchema },
        output: { schema: GenerateModelTurnaroundPromptsOutputSchema },
        prompt: `You are an AI assistant that generates image generation prompts for a realistic human model based on the following characteristics.

        Gender: {{{gender}}}
        Age Group: {{{ageGroup}}}
        Region/Ethnicity: {{{regionEthnicity}}}
        Skin Tone: {{{skinTone}}}
        Hair Style: {{{hairStyle}}}
        Marketing Archetype: {{{marketingArchetype}}}
        
        Generate three prompts for a model turnaround:
        1.  **straightPrompt**: A straight close-up shot, looking at the camera.
        2.  **leftPrompt**: A left side profile close-up shot, looking left.
        3.  **rightPrompt**: A right side profile close-up shot, looking right.
        
        Each prompt must include all the characteristics provided and describe a realistic, commercial-style photograph with cinematic lighting and high detail. The output should be a JSON object with the three prompt strings.
        For example:
        straightPrompt: "Ultra-realistic commercial photography, face straight close-up shot of a Millennial Caucasian Female model. fair skin, long, wavy brown hair. The Everyday Approachable styling. Cinematic ad campaign lighting, 8k resolution, highly detailed pores and texture, looking at camera."
        `,
    }
);


const generateModelTurnaroundPromptsFlow = ai.defineFlow(
  {
    name: 'generateModelTurnaroundPromptsFlow',
    inputSchema: GenerateModelTurnaroundPromptsInputSchema,
    outputSchema: GenerateModelTurnaroundPromptsOutputSchema
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate model turnaround prompts.');
    }
    return output;
  }
);
