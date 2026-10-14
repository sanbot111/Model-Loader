'use server';
/**
 * @fileOverview Sequential 3-angle generation via Gemini Nano Banana Pro
 * (gemini-3-pro-image) using the official Interactions API.
 * @see https://ai.google.dev/gemini-api/docs/image-generation
 * @see https://ai.google.dev/gemini-api/docs/get-started
 */

import { getGeminiClient, IMAGE_MODEL } from '@/ai/gemini-client';

const IMAGE_RESPONSE_FORMAT = {
  type: 'image' as const,
  mime_type: 'image/jpeg' as const,
  aspect_ratio: '3:4' as const,
};

export interface GenerateModelImagesInput {
  prompts: {
    straightPrompt: string;
    leftPrompt: string;
    rightPrompt: string;
  };
}

export interface GenerateModelImagesOutput {
  imagen?: { straight: string; left: string; right: string };
}

function dataUriToBase64Parts(dataUri: string): {
  mimeType: string;
  data: string;
} {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid reference image data URI.');
  }
  return { mimeType: match[1], data: match[2] };
}

function extractOutputImageDataUri(
  interaction: {
    output_image?: { data?: string; mime_type?: string } | null;
  },
  fallbackMime = 'image/jpeg'
): string | undefined {
  const image = interaction.output_image;
  if (!image?.data) return undefined;
  const mime = image.mime_type || fallbackMime;
  return `data:${mime};base64,${image.data}`;
}

async function generateStraightImageInternal(
  straightPrompt: string
): Promise<string> {
  const ai = getGeminiClient();
  const interaction = await ai.interactions.create({
    model: IMAGE_MODEL,
    input: straightPrompt,
    response_format: IMAGE_RESPONSE_FORMAT,
  });

  const dataUri = extractOutputImageDataUri(interaction);
  if (!dataUri) {
    throw new Error('Failed to generate the Master Reference image.');
  }
  return dataUri;
}

/** Generate a single hero (straight) image from text prompt. */
export async function generateStraightImage(
  straightPrompt: string
): Promise<string> {
  return generateStraightImageInternal(straightPrompt);
}

/** Generate a profile angle using a hero image as identity reference. */
export async function generateProfileImage(
  promptText: string,
  referenceDataUri: string
): Promise<string> {
  const { mimeType, data } = dataUriToBase64Parts(referenceDataUri);
  const ai = getGeminiClient();

  const interaction = await ai.interactions.create({
    model: IMAGE_MODEL,
    input: [
      {
        type: 'image',
        mime_type: mimeType,
        data,
      },
      {
        type: 'text',
        text: `${promptText}\n\nUse the attached reference image as the strict identity anchor. Generate a new image that preserves the same person, clothing, and studio setup while applying only the new camera angle described above.`,
      },
    ],
    response_format: IMAGE_RESPONSE_FORMAT,
  });

  const dataUri = extractOutputImageDataUri(interaction, mimeType);
  if (!dataUri) {
    throw new Error(
      'Failed to generate profile reference image. The model may have returned text instead of an image—retry generation.'
    );
  }
  return dataUri;
}

export async function generateModelImages(
  input: GenerateModelImagesInput
): Promise<GenerateModelImagesOutput> {
  const { straightPrompt, leftPrompt, rightPrompt } = input.prompts;

  const straightImageB64 = await generateStraightImageInternal(straightPrompt);

  const [left, right] = await Promise.all([
    generateProfileImage(leftPrompt, straightImageB64),
    generateProfileImage(rightPrompt, straightImageB64),
  ]);

  return {
    imagen: {
      straight: straightImageB64,
      left,
      right,
    },
  };
}
