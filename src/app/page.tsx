"use client";

import { useState } from "react";
import JSZip from "jszip";
import type { ModelData, FormDataType } from "@/lib/types";
import { generateModelTurnaroundPrompts } from "@/ai/flows/generate-model-turnaround-prompts";
import { generateModelImages } from "@/ai/flows/generate-model-images";
import GeneratorForm from "@/components/GeneratorForm";
import ActiveModelDisplay from "@/components/ActiveModelDisplay";
import { useToast } from "@/hooks/use-toast";

const initialFormData: FormDataType = {
  gender: "Female",
  ageGroup: "Gen Z",
  regionEthnicity: "Caucasian",
  skinTone: "Fair",
  hairStyle: "Long, wavy brown hair",
  marketingArchetype: "The Everyday Approachable",
  bodyType: "Average",
};

export default function KotoorModelAI() {
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [activeModel, setActiveModel] = useState<ModelData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setActiveModel(null);
    try {
      const prompts = await generateModelTurnaroundPrompts(formData);
      const imageUrls = await generateModelImages(prompts);
      
      const seed = Math.floor(
        1000000000 + Math.random() * 9000000000
      ).toString();
      
      const newModel: ModelData = {
        seed,
        imageUrls: {
          straight: imageUrls.straight,
          left: imageUrls.left,
          right: imageUrls.right,
        },
        prompts,
        formData,
      };
      setActiveModel(newModel);
      
    } catch (error) {
      console.error("Failed to generate model", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an error generating the model. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
  }

  const handleBulkDownload = async () => {
    if (!activeModel) return;

    toast({
      title: "Preparing Download...",
      description: "Your model assets are being zipped.",
    });

    try {
      const zip = new JSZip();

      // Create a text file with prompts
      const promptData = `Straight Prompt:\n${activeModel.prompts.straightPrompt}\n\nLeft Prompt:\n${activeModel.prompts.leftPrompt}\n\nRight Prompt:\n${activeModel.prompts.rightPrompt}`;
      zip.file("prompts.txt", promptData);

      // Add images to zip
      zip.file(`straight_${activeModel.seed}.png`, dataURItoBlob(activeModel.imageUrls.straight));
      zip.file(`left_${activeModel.seed}.png`, dataURItoBlob(activeModel.imageUrls.left));
      zip.file(`right_${activeModel.seed}.png`, dataURItoBlob(activeModel.imageUrls.right));

      // Generate zip and trigger download
      const content = await zip.generateAsync({ type: "blob" });
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `model_${activeModel.seed}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (error) {
      console.error("Failed to create zip for download", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not prepare your files for download. Please try again.",
      });
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col lg:flex-row lg:space-x-8">
        <div className="lg:w-1/3 xl:w-1/4 mb-8 lg:mb-0">
          <GeneratorForm
            formData={formData}
            setFormData={setFormData}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        <div className="lg:w-2/3 xl:w-3/4 flex flex-col space-y-8">
          <ActiveModelDisplay
            activeModel={activeModel}
            isGenerating={isGenerating}
            onBulkDownload={handleBulkDownload}
          />
        </div>
      </div>
    </main>
  );
}
