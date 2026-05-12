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
  gender: z.string().describe('The gender of the model (e.g., Male, Female).'),
  ageGroup: z.string().describe('The age group of the model (e.g., Gen Z, Millennial, Gen X, Senior).'),
  regionEthnicity: z.string().describe('The ethnicity of the model (e.g., Black, Asian, Hispanic, Caucasian, South Asian, Middle Eastern).'),
  skinTone: z.string().describe('The skin tone of the model (e.g., Fair, Tan, Dark).'),
  hairStyle: z.string().describe('The hair style of the model.'),
  marketingArchetype: z.string().describe('The marketing archetype or vibe of the model.'),
  bodyType: z.string().describe('The body type of the model (e.g., Slender, Athletic, Average, Full-figured).')
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
        1. Invent a unique, fictional first name for the model.
        2. Use this name consistently in all prompts to anchor the identity.
        
        **BASE CHARACTERISTICS:**
        - Gender: {{{gender}}}
        - Age Group: {{{ageGroup}}}
        - Region/Ethnicity: {{{regionEthnicity}}} (Facial features MUST strictly reflect this ethnicity with extreme accuracy)
        - Skin Tone: {{{skinTone}}}
        - Hair Style: {{{hairStyle}}}
        - Marketing Archetype: {{{marketingArchetype}}}
        - Body Type: {{{bodyType}}} (Incorporate this into the facial and neck structure: Slender models have high definition, Athletic models have strong jawlines, Full-figured models have softer facial contours.)
        
        **CONSISTENT ATTIRE (Include in EACH prompt):**
        - "The model is wearing a simple, solid black, professional high-neck top or dress."
        - "This black attire ensures a clean, uniform look across all angles, focusing attention on the face."
        
        **PHOTOGRAPHY & REALISM STYLE (Include in EACH prompt):**
        - "Hyper-realistic, photorealistic commercial beauty headshot."
        - "Shot on a Sony A7R IV with a 100mm f/2.8 Macro GM lens for extreme detail."
        - "Professional Rembrandt lighting, soft key light with a subtle rim light to define shape."
        - "8k resolution, raw photo quality, high-frequency skin textures, visible pores, realistic micro-sweat and fine facial hairs."
        - "Extremely sharp focus on the eyes, natural catchlights."
        - "Neutral, professional expression."
        - "Plain, solid, medium-grey studio backdrop with soft depth of field."
        
        **PROMPT STRUCTURE:**
        1. **straightPrompt**: Front-facing, looking directly into the lens, shoulders square.
        2. **leftPrompt**: 90-degree left profile shot, looking straight ahead off-camera.
        3. **rightPrompt**: 90-degree right profile shot, looking straight ahead off-camera.
        
        Adhere strictly to these instructions to ensure total facial consistency and uncanny realism.
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
