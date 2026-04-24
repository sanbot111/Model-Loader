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
import { Skeleton } from "@/components/ui/skeleton";
import type { ModelData } from "@/lib/types";
import { Lock, Loader2, Download } from "lucide-react";

type ActiveModelDisplayProps = {
  activeModel: ModelData | null;
  isGenerating: boolean;
  onLockModel: () => void;
  isLocked: boolean;
};

export default function ActiveModelDisplay({
  activeModel,
  isGenerating,
  onLockModel,
  isLocked,
}: ActiveModelDisplayProps) {
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Model</h2>
          {activeModel && (
            <p className="text-muted-foreground">
              Generation Seed: {activeModel.seed}
            </p>
          )}
        </div>
        {activeModel && !isGenerating && (
          <Button onClick={onLockModel} disabled={isLocked}>
            <Lock className="mr-2" />
            {isLocked ? "Model Locked" : "Lock Model"}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Straight Close-up</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <Image
                src={activeModel.imageUrls.straight}
                alt="Straight close-up of the model"
                width={500}
                height={500}
                className="rounded-md aspect-square object-cover"
                data-ai-hint="person portrait"
              />
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 pt-4">
              <div className="flex justify-between items-center w-full">
                <p className="text-sm font-medium">Prompt</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownload(
                      activeModel.imageUrls.straight,
                      `straight_${activeModel.seed}.png`
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {activeModel.prompts.straightPrompt}
              </p>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Left Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <Image
                src={activeModel.imageUrls.left}
                alt="Left profile of the model"
                width={500}
                height={500}
                className="rounded-md aspect-square object-cover"
                data-ai-hint="person profile"
              />
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 pt-4">
              <div className="flex justify-between items-center w-full">
                <p className="text-sm font-medium">Prompt</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownload(
                      activeModel.imageUrls.left,
                      `left_${activeModel.seed}.png`
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {activeModel.prompts.leftPrompt}
              </p>
            </CardFooter>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Right Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <Image
                src={activeModel.imageUrls.right}
                alt="Right profile of the model"
                width={500}
                height={500}
                className="rounded-md aspect-square object-cover"
                data-ai-hint="person profile"
              />
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 pt-4">
              <div className="flex justify-between items-center w-full">
                <p className="text-sm font-medium">Prompt</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownload(
                      activeModel.imageUrls.right,
                      `right_${activeModel.seed}.png`
                    )
                  }
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {activeModel.prompts.rightPrompt}
              </p>
            </CardFooter>
          </Card>
        </div>
      )}
    </section>
  );
}
