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
  regionEthnicity: z.string().describe('The ethnicity of the model (e.g., Black, Asian, Hispanic, Caucasian, South Asian, Middle Eastern).'),
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
        prompt: `You are an expert AI art director specializing in creating hyperrealistic digital humans for commercial use. Your task is to generate three image generation prompts for a single, consistent human model.

        **CRITICAL GOAL:** The model MUST look like the EXACT SAME PERSON in all three images. Consistency is paramount.
        
        **METHOD FOR CONSISTENCY:**
        1.  Invent a unique, uncommon, and fictional first name for the model (e.g., "Zylia", "Kaelan", "Seraphina").
        2.  You MUST use this exact name consistently across all three prompts.
        
        **BASE CHARACTERISTICS:**
        -   Unique Name: [Your invented name]
        -   Gender: {{{gender}}}
        -   Age Group: {{{ageGroup}}}
        -   Region/Ethnicity: {{{regionEthnicity}}}
        -   Skin Tone: {{{skinTone}}}
        -   Hair Style: {{{hairStyle}}}
        -   Marketing Archetype: {{{marketingArchetype}}}
        
        **PHOTOGRAPHY & REALISM STYLE (Include in EACH prompt):**
        -   "Ultra-realistic, photorealistic commercial headshot."
        -   "Shot on a Canon EOS R5 with an 85mm f/1.2 lens, creating a soft, blurred background."
        -   "Cinematic, soft, and even studio lighting."
        -   "8k resolution, hyper-detailed, visible skin pores and fine hairs."
        -   "Neutral expression, looking confident."
        -   "Set against a seamless, plain, neutral grey studio background."
        
        **PROMPT STRUCTURE (Output three distinct prompts):**
        
        1.  **straightPrompt**: A straight-on, close-up headshot of the model looking directly into the camera lens.
        2.  **leftPrompt**: A close-up shot of the model's left profile (turned 90 degrees to their left), looking off-camera.
        3.  **rightPrompt**: A close-up shot of the model's right profile (turned 90 degrees to their right), looking off-camera.
        
        **EXAMPLE \`straightPrompt\`:**
        "Ultra-realistic, photorealistic commercial headshot of a Millennial Caucasian Female model named Anya. She has fair skin and long, wavy brown hair, embodying The Everyday Approachable archetype. Shot on a Canon EOS R5 with an 85mm f/1.2 lens. Cinematic, soft, and even studio lighting. 8k resolution, hyper-detailed, visible skin pores. Neutral expression, looking confident and directly into the camera. Set against a seamless, plain, neutral grey studio background."
        
        Adhere strictly to these instructions to ensure facial consistency and maximum realism.
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
