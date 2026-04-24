"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ModelData } from "@/lib/types";
import { Lock, Loader2 } from "lucide-react";

type ActiveModelDisplayProps = {
  activeModel: ModelData | null;
  isGenerating: boolean;
  onLockModel: () => void;
};

export default function ActiveModelDisplay({
  activeModel,
  isGenerating,
  onLockModel,
}: ActiveModelDisplayProps) {
  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="bg-card/80 flex flex-col">
          <CardHeader>
            <Skeleton className="h-5 w-3/4" />
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <Skeleton className="aspect-square w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

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
          <Button onClick={onLockModel}>
            <Lock className="mr-2" />
            Lock Model
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
          <Card>
            <CardHeader>
              <CardTitle>Straight Close-up</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={activeModel.imageUrls.straight}
                alt="Straight close-up of the model"
                width={500}
                height={500}
                className="rounded-md aspect-square object-cover"
                data-ai-hint="person portrait"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Left Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={activeModel.imageUrls.left}
                alt="Left profile of the model"
                width={500}
                height={500}
                className="rounded-md aspect-square object-cover"
                data-ai-hint="person profile"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Right Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={activeModel.imageUrls.right}
                alt="Right profile of the model"
                width={500}
                height={500}
                className="rounded-md aspect-square object-cover"
                data-ai-hint="person profile"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
