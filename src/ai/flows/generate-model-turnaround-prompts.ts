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
        prompt: `You are an expert AI art director. Your task is to generate three highly detailed, ultra-realistic image generation prompts for a commercial-style human model photoshoot.

        Base characteristics:
        - Gender: {{{gender}}}
        - Age Group: {{{ageGroup}}}
        - Region/Ethnicity: {{{regionEthnicity}}}
        - Skin Tone: {{{skinTone}}}
        - Hair Style: {{{hairStyle}}}
        - Marketing Archetype: {{{marketingArchetype}}}
        
        Generate three distinct prompts for a model turnaround, ensuring each prompt is tailored for a specific angle but maintains consistency in the model's appearance. The prompts should be formatted for a high-end text-to-image model.
        
        The prompts MUST include the following elements for maximum realism:
        - "Ultra-realistic commercial photography"
        - "cinematic ad campaign lighting"
        - "8k resolution, highly detailed skin pores and texture"
        - "plain studio background"
        
        Output three prompts:
        1.  **straightPrompt**: A straight-on, close-up headshot. The model should be looking directly at the camera with a neutral but confident expression.
        2.  **leftPrompt**: A close-up shot of the model's left profile. The model should be looking towards the left, off-camera.
        3.  **rightPrompt**: A close-up shot of the model's right profile. The model should be looking towards the right, off-camera.
        
        Ensure the model's specified characteristics are clearly included in EACH prompt. The output should be a JSON object with the three prompt strings.

        Example for straightPrompt: "Ultra-realistic commercial photography, face straight close-up shot of a Millennial Caucasian Female model. fair skin, long, wavy brown hair. The Everyday Approachable styling. Cinematic ad campaign lighting, 8k resolution, highly detailed pores and texture, looking at camera, on a plain studio background."
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
