"use client";

import { useState, useEffect } from "react";
import type { ModelData, FormDataType } from "@/lib/types";
import { generateModelTurnaroundPrompts } from "@/ai/flows/generate-model-turnaround-prompts";
import { generateModelImages } from "@/ai/flows/generate-model-images";
import GeneratorForm from "@/components/GeneratorForm";
import ActiveModelDisplay from "@/components/ActiveModelDisplay";
import ModelLibrary from "@/components/ModelLibrary";
import { useToast } from "@/hooks/use-toast";

const initialFormData: FormDataType = {
  gender: "Female",
  ageGroup: "Gen Z",
  regionEthnicity: "Caucasian",
  skinTone: "fair",
  hairStyle: "long, wavy brown hair",
  marketingArchetype: "The Everyday Approachable",
};

export default function KotoorModelAI() {
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [activeModel, setActiveModel] = useState<ModelData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [modelLibrary, setModelLibrary] = useState<ModelData[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    try {
      const item = window.localStorage.getItem("kotoorModelLibrary");
      if (item) {
        setModelLibrary(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to load model library from localStorage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load your saved models.",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (isMounted) {
      try {
        window.localStorage.setItem(
          "kotoorModelLibrary",
          JSON.stringify(modelLibrary)
        );
      } catch (error) {
        console.error("Failed to save model library to localStorage", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not save your new model.",
        });
      }
    }
  }, [modelLibrary, isMounted, toast]);

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

  const handleLockModel = () => {
    if (activeModel) {
      if (modelLibrary.some((model) => model.seed === activeModel.seed)) {
        toast({
          title: "Model Already Locked",
          description: "This model is already in your library.",
        });
        return;
      }
      setModelLibrary((prevLibrary) => [activeModel, ...prevLibrary]);
      toast({
        title: "Model Locked!",
        description: "The model has been saved to your library.",
      });
    }
  };

  const handleDeleteModel = (seed: string) => {
    setModelLibrary((prevLibrary) =>
      prevLibrary.filter((model) => model.seed !== seed)
    );
    if (activeModel?.seed === seed) {
      setActiveModel(null);
    }
    toast({
      title: "Model Deleted",
      description: "The model has been removed from your library.",
    });
  };

  const handleSelectModel = (model: ModelData) => {
    setActiveModel(model);
  };
  
  const isModelLocked = activeModel
    ? modelLibrary.some((m) => m.seed === activeModel.seed)
    : false;

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
            onLockModel={handleLockModel}
            isLocked={isModelLocked}
          />
          
          <ModelLibrary
            models={modelLibrary}
            onDelete={handleDeleteModel}
            onSelectModel={handleSelectModel}
            isMounted={isMounted}
          />
        </div>
      </div>
    </main>
  );
}
