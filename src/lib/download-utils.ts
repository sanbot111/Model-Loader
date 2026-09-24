import JSZip from "jszip";

export type ModelPrompts = {
  straightPrompt: string;
  leftPrompt: string;
  rightPrompt: string;
};

export type ThreeAngleImages = {
  straight: string;
  left: string;
  right: string;
};

export function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export function downloadDataUri(dataUri: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadModelZip(options: {
  seed: string;
  images: ThreeAngleImages;
  prompts: ModelPrompts;
  zipFilename?: string;
}): Promise<void> {
  const { seed, images, prompts, zipFilename } = options;
  const zip = new JSZip();

  const promptData = `Straight Prompt:\n${prompts.straightPrompt}\n\nLeft Prompt:\n${prompts.leftPrompt}\n\nRight Prompt:\n${prompts.rightPrompt}`;
  zip.file("prompts.txt", promptData);

  zip.file(`straight_${seed}.png`, dataURItoBlob(images.straight));
  zip.file(`left_${seed}.png`, dataURItoBlob(images.left));
  zip.file(`right_${seed}.png`, dataURItoBlob(images.right));

  const content = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = zipFilename ?? `model_${seed}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
