'use server';
/**
 * @fileOverview Sequential 3-angle generation via gemini-3-pro-image with hero-image reference.
 */

import { ai } from '@/ai/genkit';

const IMAGE_MODEL = 'googleai/gemini-3-pro-image';

/** Gemini native image models use imageConfig, not Imagen's top-level aspectRatio. */
const GEMINI_IMAGE_CONFIG = {
  responseModalities: ['TEXT', 'IMAGE'],
  imageConfig: {
    aspectRatio: '3:4',
  },
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

type GenerateResult = Awaited<ReturnType<typeof ai.generate>>;

function extractImageDataUri(result: GenerateResult): string | undefined {
  if (result.media?.url) {
    return result.media.url;
  }

  const content = result.message?.content;
  if (Array.isArray(content)) {
    for (const part of content) {
      if (
        part &&
        typeof part === 'object' &&
        'media' in part &&
        part.media &&
        typeof part.media === 'object' &&
        'url' in part.media &&
        typeof part.media.url === 'string'
      ) {
        return part.media.url;
      }
    }
  }

  if (result.text?.startsWith('data:image')) {
    return result.text;
  }

  return undefined;
}

function referenceImageContentType(dataUri: string): string {
  const match = dataUri.match(/^data:([^;]+);/);
  return match?.[1] ?? 'image/png';
}

async function generateWithReference(
  promptText: string,
  referenceDataUri: string
): Promise<GenerateResult> {
  const contentType = referenceImageContentType(referenceDataUri);

  return ai.generate({
    model: IMAGE_MODEL,
    output: { format: 'media' },
    prompt: [
      {
        media: {
          url: referenceDataUri,
          contentType,
        },
      },
      {
        text: `${promptText}\n\nUse the attached reference image as the strict identity anchor. Generate a new image that preserves the same person, clothing, and studio setup while applying only the new camera angle described above.`,
      },
    ],
    config: GEMINI_IMAGE_CONFIG,
  });
}

async function generateStraightImageInternal(
  straightPrompt: string
): Promise<string> {
  const straightResponse = await ai.generate({
    model: IMAGE_MODEL,
    output: { format: 'media' },
    prompt: straightPrompt,
    config: GEMINI_IMAGE_CONFIG,
  });

  const straightImageB64 = extractImageDataUri(straightResponse);
  if (!straightImageB64) {
    throw new Error('Failed to generate the Master Reference image.');
  }
  return straightImageB64;
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
  const response = await generateWithReference(promptText, referenceDataUri);
  const image = extractImageDataUri(response);
  if (!image) {
    throw new Error(
      'Failed to generate profile reference image. The model may have returned text instead of an image—retry generation.'
    );
  }
  return image;
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
