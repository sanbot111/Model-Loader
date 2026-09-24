'use server';
/**
 * @fileOverview A Genkit flow to construct detailed 3-angle image generation prompts based on user-selected model characteristics.
 *
 * - generateModelTurnaroundPrompts - A function that handles the prompt generation process.
 * - GenerateModelTurnaroundPromptsInput - The input type for the generateModelTurnaroundPrompts function.
 * - GenerateModelTurnaroundPromptsOutput - The return type for the generateModelTurnaroundPrompts function.
 */

import {ai} from '@/ai/genkit';
import { GEMINI_SAFETY_SETTINGS } from '@/ai/gemini-safety-settings';
import {z} from 'genkit';

const GenerateModelTurnaroundPromptsInputSchema = z.object({
  gender: z.string().describe('Female / Woman or Male / Man.'),
  ageGroup: z.string().describe('Age group with approximate age range.'),
  regionEthnicity: z.string().describe('Parent region/ethnicity category key.'),
  subGroup: z.string().describe('Specific demographic sub-group phenotype string.'),
  skinTone: z.string().describe('Fitzpatrick skin tone Type 1–6 with description.'),
  hairStyle: z.string().describe('Gender-appropriate hair style from the UI.'),
  hairColor: z.string().describe('Hair color (shared male/female list, e.g., Jet Black, Auburn / Ginger).'),
  marketingArchetype: z.string().describe('Gender-appropriate marketing archetype / vibe.'),
  bodyType: z.string().describe('Gender-appropriate body type from the UI.'),
  facialHair: z
    .string()
    .optional()
    .nullable()
    .describe('Male only: facial hair style. Omitted or null for female models.'),
});
export type GenerateModelTurnaroundPromptsInput = z.infer<typeof GenerateModelTurnaroundPromptsInputSchema>;

const GenerateModelTurnaroundPromptsOutputSchema = z.object({
  straightPrompt: z.string().describe('3/4 body portrait prompt: front-facing, head to mid-thigh.'),
  leftPrompt: z.string().describe('3/4 body portrait prompt: left profile, head to mid-thigh.'),
  rightPrompt: z.string().describe('3/4 body portrait prompt: right profile, head to mid-thigh.'),
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
        config: {
          safetySettings: [...GEMINI_SAFETY_SETTINGS],
        },
        prompt: `You are acting as a precise, algorithmic Technical Art Director for Kotoor, specialized in generating consistent, professional 3-angle model turnaround catalogs for fashion and apparel visualization.

Your core objective is to output three highly descriptive image generation prompts—"straightPrompt", "leftPrompt", and "rightPrompt"—that describe the EXACT same fictional human model from three distinct, strictly locked camera angles. The straight profile is generated first as a master reference; left and right profiles are generated sequentially using that reference image, so identity, wardrobe, and camera metrics must remain absolutely locked across all three prompt strings.

### 1. INPUT TRAIT REGISTRY
Extract these exact parameter strings and map them directly into your generated outputs:
- **Gender / Sex Profile:** {{{gender}}}
- **Age Grouping:** {{{ageGroup}}}
- **Regional Category:** {{{regionEthnicity}}}
- **Specific Demographic Phenotype:** {{{subGroup}}}
- **Skin Tone & Undertone Depth:** {{{skinTone}}}
- **Hair Style & Texture Cut:** {{{hairStyle}}}
- **Hair Color Value:** {{{hairColor}}}
- **Body Silhouette Type:** {{{bodyType}}}
- **Marketing Expression / Vibe:** {{{marketingArchetype}}}
- **Facial Hair Style (Males Only):** {{{facialHair}}}

### 2. IMMUTABLE IDENTITY ANCHOR (Apply to ALL 3 Prompts)
To lock the generation model's weights on a singular identity, you must create a uniform "Identity Anchor Block" at the beginning of every prompt string. Generate a fictional, ethnically accurate name for this person (e.g., "Ananya" or "Rahul") to serve as an internal token anchor. 
Describe the face using unvarying, structural terms:
- Facial geometry must be explicitly linked to the chosen Specific Demographic Phenotype ({{{subGroup}}}).
- **CRITICAL ANTI-RACE-DRIFT GUARDRAIL:** If the model phenotype is South Asian (North/South Indian) and combined with a deep skin tone or curly hair, you MUST explicitly mandate "South Asian Indian facial morphology, distinct South Asian bone structure, sharp warm bronze features." Do NOT allow the image generation engines to drift into African/Black or Caucasian features.
- **EAST ASIAN FACIAL MORPHOLOGY & STYLING GUARDRAIL:** When the Regional Category or Specific Demographic Phenotype indicates East Asian (Chinese, Japanese, Korean, Taiwanese), you MUST mandate authentic East Asian facial morphology: monolids or epicanthic folds as appropriate, softer mid-face flatness, and jawline geometry distinct from Southeast or South Asian profiles. Do NOT allow high-fashion editorial prompts to default to Caucasian-influenced double eyelids or Westernized eye shapes. Render the Hair Style & Texture Cut ({{{hairStyle}}}) with strict regional accuracy—East Asian editorial cuts (e.g., blunt bangs, hime cut, two-block undercut, comma hair) must be described precisely and must reinforce the identity anchor rather than generic Western styling.
- Describe the apparel identically: "Wearing a black half-sleeve top and full-length black bottoms. The fabric has no patterns, logos, textures, or branding."
- **GROOMING & FACIAL HAIR CONSTRAINT:** If the Gender profile is "Male / Man" and a Facial Hair Style is provided, describe that exact facial hair asset (e.g., "sharp groomed mustache only", "evenly trimmed short beard", or "thick full barber-groomed beard with dense lined edges") with absolute descriptive uniformity across all three prompt outputs. For Thick Full Beard (Groomed) selections, mandate a sharp, professionally barber-lined dense beard—NOT a rugged, unkempt, or mountain-man beard. If the Gender profile is "Female / Woman", completely ignore the facial hair trait and ensure the face is completely clean with smooth jawlines.

### 3. MANDATORY CAMERA & LENS MATRIX (Apply to ALL 3 Prompts)
To prevent framing variations (close-ups vs. distant shots), use this exact camera specification block verbatim in all three prompts:
"Commercial studio fashion photography, captured on a high-end medium format camera, 100mm portrait lens, f/5.6 aperture, sharp focus on the skin texture, crisp clean rendering. Uniform studio setting, even soft 3-point clamshell lighting, seamless solid neutral mid-grey background color, no shadows cast on the backdrop."

### 4. CRITICAL CANVAS FRAMING (Apply to ALL 3 Prompts)
"Framing is a strict 3/4 body portrait vector composition. Vertical framing rules: The top of the head is positioned exactly 5% below the top edge of the frame canvas. The bottom edge of the image canvas cuts cleanly across the mid-thigh area, with the full hand visible. You must maintain the exact same spatial scale, pixel magnification, camera zoom, and physical distance from the lens to the model across all shots. The model must occupy the exact same vertical and horizontal volume within the canvas as seen in the straight profile."

### 5. ANGLE-SPECIFIC POSING CONSTRAINTS
Modify ONLY the pose, facial rotation, and occlusion parameters between the three output strings using these absolute coordinate terms:

#### straightPrompt Constraints:
- Append: "Full front-facing view, 0-degree orientation. The model's chest, torso, and shoulders are perfectly square to the lens camera plane. Both eyes are tracking directly forward into the camera lens. Perfect facial symmetry."
- Map the Expression: Integrate the Expression/Vibe parameter here as a natural, controlled facial look (e.g., Lifestyle = approachable subtle smile; Editorial = neutral, calm, poised commercial expression).

#### leftPrompt Constraints:
- Append: "Strict 90-degree left profile view. The model has rotated their entire body and head to their right, so their face, nose, and chest point directly toward the left edge of the image canvas. The shoulders and torso are perfectly perpendicular to the camera lens plane. Only the left side of the profile is visible."

#### rightPrompt Constraints:
- Append: "Strict 90-degree right profile view. The model has rotated their entire body and head to their left, so their face, nose, and chest point directly toward the right edge of the image canvas. This must be a perfect mirror image of the left profile. The shoulders and torso are perfectly perpendicular to the camera lens plane. Only the right side of the profile is visible."

### 6. HIGH-END AGENCY MODEL AESTHETIC PROTOCOLS (MANDATORY)
- **Casting Grade:** The generated individual must resemble a signed professional fashion agency model. They must display symmetric, striking facial geometries, pristine facial lines, and crisp, clean bone structures.
- **Visual Presentation:** Avoid an amateur, candid look, or an unpolished "everyday civilian" appearance. The output must mimic a high-fashion editorial digital portfolio.
- **Pose & Composure:** The subject must exhibit absolute physical composure. Expressions should remain controlled, highly poised, and intentional. The physical carriage should reflect high-end commercial apparel casting standards.
- **Skin Finish Rendering:** Render high-fidelity skin textures. Maintain realistic features like subtle pores and natural highlights under pristine, soft, three-point studio lights. Avoid over-smoothed, artificial wax-like or plastic looking skin textures.
- **Negative Enforcement:** Do not generate casual everyday phone snapshots, unpolished low-contrast lighting conditions, cluttered home or street backdrops, or awkward non-professional body postures.

### 7. NEGATIVE GUARDRAILS (Append to ALL 3 Prompts)
"No side-glancing eyes, no twisted neck, no partial 45-degree or 3/4 face angles, no asymmetrical shoulder lines, no background gradients, no jewelry, no clothing modifications, no multi-panel split screens, no variations in scale or aspect formatting."

Adhere strictly to these rules. Return a valid JSON object matching the requested schema with highly detailed, fully descriptive English paragraphs that combine all these constraints seamlessly.`,
    }
);


const generateModelTurnaroundPromptsFlow = ai.defineFlow(
  {
    name: 'generateModelTurnaroundPromptsFlow',
    inputSchema: GenerateModelTurnaroundPromptsInputSchema,
    outputSchema: GenerateModelTurnaroundPromptsOutputSchema
  },
  async (input) => {
    try {
      const { output } = await prompt(input, {
        config: { safetySettings: [...GEMINI_SAFETY_SETTINGS] },
      });
      if (!output) {
        throw new Error('Failed to generate model turnaround prompts.');
      }
      return output;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      if (
        message.includes('Generation blocked') ||
        message.includes('FAILED_PRECONDITION')
      ) {
        throw new Error(
          'Prompt generation was blocked by content safety filters. Try a different age group or simplify regional ancestry selections, then retry.'
        );
      }
      throw error;
    }
  }
);
