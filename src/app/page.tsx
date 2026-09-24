"use client";

import { useState } from "react";
import type { ModelData, FormDataType } from "@/lib/types";
import { getActiveEngineKeys, ENGINE_LABELS } from "@/lib/types";
import {
  DEFAULT_FORM_DATA_FEMALE,
  toPromptInput,
  toConfigurationTraits,
} from "@/lib/constants";
import { generateModelTurnaroundPrompts } from "@/ai/flows/generate-model-turnaround-prompts";
import { generateModelImages } from "@/ai/flows/generate-model-images";
import { downloadModelZip, dataURItoBlob } from "@/lib/download-utils";
import GeneratorForm from "@/components/GeneratorForm";
import ActiveModelDisplay from "@/components/ActiveModelDisplay";
import { ModelLibraryManager } from "@/components/ModelLibraryManager";
import { CoverageMatrix } from "@/components/CoverageMatrix";
import { LegacyModelImporter } from "@/components/LegacyModelImporter";
import { BatchProcessorQueue } from "@/components/BatchProcessorQueue";
import { useBatchProcessor } from "@/hooks/useBatchProcessor";
import { ConfigurationTrackerProvider } from "@/hooks/useConfigurationTracker";
import { useToast } from "@/hooks/use-toast";

function KotoorModelAIContent() {
  const [formData, setFormData] = useState<FormDataType>(DEFAULT_FORM_DATA_FEMALE);
  const [activeModel, setActiveModel] = useState<ModelData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();
  const {
    batchQueue,
    isProcessing,
    loadJsonBatch,
    startBatch,
    approveItem,
    regenerateItem,
  } = useBatchProcessor();

  const handleGenerate = async () => {
    if (!formData.subGroup?.trim()) {
      toast({
        variant: "destructive",
        title: "Sub-group required",
        description:
          "Select a specific demographic sub-group before generating.",
      });
      return;
    }

    setIsGenerating(true);
    setActiveModel(null);
    try {
      const prompts = await generateModelTurnaroundPrompts(toPromptInput(formData));
      const imageResults = await generateModelImages({ prompts });

      const seed = Math.floor(
        1000000000 + Math.random() * 9000000000
      ).toString();

      const newModel: ModelData = {
        seed,
        imageResults,
        prompts,
        formData,
      };
      setActiveModel(newModel);
    } catch (error) {
      console.error("Failed to generate model", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error generating the model. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkDownload = async () => {
    if (!activeModel) return;

    toast({
      title: "Preparing Download...",
      description: "Your model assets are being zipped.",
    });

    try {
      const engineKeys = getActiveEngineKeys(activeModel.imageResults);

      if (engineKeys.length === 1 && activeModel.imageResults.imagen) {
        await downloadModelZip({
          seed: activeModel.seed,
          images: activeModel.imageResults.imagen,
          prompts: activeModel.prompts,
        });
        return;
      }

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const promptData = `Straight Prompt:\n${activeModel.prompts.straightPrompt}\n\nLeft Prompt:\n${activeModel.prompts.leftPrompt}\n\nRight Prompt:\n${activeModel.prompts.rightPrompt}`;
      zip.file("prompts.txt", promptData);

      for (const engineKey of engineKeys) {
        const images = activeModel.imageResults[engineKey];
        if (!images) continue;

        const folder =
          engineKeys.length > 1
            ? `${ENGINE_LABELS[engineKey].replace(/\s+/g, "_")}/`
            : "";

        zip.file(
          `${folder}straight_${activeModel.seed}.png`,
          dataURItoBlob(images.straight)
        );
        zip.file(
          `${folder}left_${activeModel.seed}.png`,
          dataURItoBlob(images.left)
        );
        zip.file(
          `${folder}right_${activeModel.seed}.png`,
          dataURItoBlob(images.right)
        );
      }

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
            onLoadBatch={loadJsonBatch}
          />
        </div>

        <div className="lg:w-2/3 xl:w-3/4 flex flex-col space-y-8">
          <BatchProcessorQueue
            batchQueue={batchQueue}
            isProcessing={isProcessing}
            onStartBatch={startBatch}
            onApproveItem={approveItem}
            onRegenerateItem={regenerateItem}
          />
          <ActiveModelDisplay
            activeModel={activeModel}
            isGenerating={isGenerating}
            onBulkDownload={handleBulkDownload}
          />
          <ModelLibraryManager
            currentFormTraits={toConfigurationTraits(formData)}
          />
          <LegacyModelImporter
            currentFormTraits={toConfigurationTraits(formData)}
          />
          <CoverageMatrix />
        </div>
      </div>
    </main>
  );
}

export default function KotoorModelAI() {
  return (
    <ConfigurationTrackerProvider>
      <KotoorModelAIContent />
    </ConfigurationTrackerProvider>
  );
}
