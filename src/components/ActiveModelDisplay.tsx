"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ModelData,
  ThreeAngleImages,
  EngineKey,
} from "@/lib/types";
import {
  ENGINE_LABELS,
  getActiveEngineKeys,
  hasMultipleEngines,
} from "@/lib/types";
import { Loader2, Download } from "lucide-react";

type ActiveModelDisplayProps = {
  activeModel: ModelData | null;
  isGenerating: boolean;
  onBulkDownload: () => void;
};

type AngleGridProps = {
  images: ThreeAngleImages;
  prompts: ModelData["prompts"];
  seed: string;
  enginePrefix?: string;
};

function AngleGrid({ images, prompts, seed, enginePrefix }: AngleGridProps) {
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const prefix = enginePrefix ? `${enginePrefix}_` : "";

  const angles = [
    {
      title: "Straight (3/4 Body)",
      url: images.straight,
      prompt: prompts.straightPrompt,
      alt: "Straight 3/4 body portrait of the model",
      hint: "person portrait",
      file: `straight_${prefix}${seed}.png`,
    },
    {
      title: "Left Profile (3/4 Body)",
      url: images.left,
      prompt: prompts.leftPrompt,
      alt: "Left profile 3/4 body portrait of the model",
      hint: "person profile",
      file: `left_${prefix}${seed}.png`,
    },
    {
      title: "Right Profile (3/4 Body)",
      url: images.right,
      prompt: prompts.rightPrompt,
      alt: "Right profile 3/4 body portrait of the model",
      hint: "person profile",
      file: `right_${prefix}${seed}.png`,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {angles.map((angle) => (
        <Card key={angle.title} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">{angle.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="relative w-full aspect-[3/4] max-h-[75vh] mx-auto overflow-hidden rounded-md">
              <Image
                src={angle.url}
                alt={angle.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                data-ai-hint={angle.hint}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 pt-4">
            <div className="flex justify-between items-center w-full">
              <p className="text-sm font-medium">Prompt</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(angle.url, angle.file)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{angle.prompt}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function EngineResults({
  engineKey,
  activeModel,
}: {
  engineKey: EngineKey;
  activeModel: ModelData;
}) {
  const images = activeModel.imageResults[engineKey];
  if (!images) return null;

  return (
    <AngleGrid
      images={images}
      prompts={activeModel.prompts}
      seed={activeModel.seed}
      enginePrefix={engineKey}
    />
  );
}

export default function ActiveModelDisplay({
  activeModel,
  isGenerating,
  onBulkDownload,
}: ActiveModelDisplayProps) {
  const engineKeys = activeModel ? getActiveEngineKeys(activeModel.imageResults) : [];
  const dualEngine = activeModel ? hasMultipleEngines(activeModel.imageResults) : false;

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Model</h2>
          {activeModel && (
            <p className="text-muted-foreground">
              Generation Seed: {activeModel.seed}
              {engineKeys.length > 0 && (
                <span className="ml-2">
                  · Engines:{" "}
                  {engineKeys.map((k) => ENGINE_LABELS[k]).join(", ")}
                </span>
              )}
            </p>
          )}
        </div>
        {activeModel && !isGenerating && (
          <Button onClick={onBulkDownload}>
            <Download className="mr-2" />
            Bulk Download
          </Button>
        )}
      </div>

      {isGenerating && (
        <div className="text-center p-10 flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
          <Loader2 className="w-16 h-16 animate-spin text-primary mb-4" />
          <p className="text-xl font-semibold text-primary">
            Synthesizing Realistic Angles...
          </p>
          <p className="text-muted-foreground">Please wait a moment.</p>
        </div>
      )}

      {!isGenerating && !activeModel && (
        <div className="text-center p-10 border-2 border-dashed rounded-lg">
          <p className="text-lg text-muted-foreground">
            Generate a model to see the results here.
          </p>
        </div>
      )}

      {activeModel && !isGenerating && (
        <div className="animate-in fade-in duration-500">
          {dualEngine ? (
            <Tabs defaultValue={engineKeys[0]} className="w-full">
              <TabsList className="mb-6">
                {engineKeys.map((key) => (
                  <TabsTrigger key={key} value={key}>
                    Engine: {ENGINE_LABELS[key]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {engineKeys.map((key) => (
                <TabsContent key={key} value={key}>
                  <EngineResults engineKey={key} activeModel={activeModel} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            engineKeys[0] && (
              <EngineResults engineKey={engineKeys[0]} activeModel={activeModel} />
            )
          )}
        </div>
      )}
    </section>
  );
}
