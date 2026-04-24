"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ModelData } from "@/lib/types";
import { Trash2, ImageOff } from "lucide-react";

type ModelLibraryProps = {
  models: ModelData[];
  onDelete: (seed: string) => void;
  isMounted: boolean;
};

export default function ModelLibrary({ models, onDelete, isMounted }: ModelLibraryProps) {
  
  const renderSkeletons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] w-full rounded-lg" />
      ))}
    </div>
  );

  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight mb-4">My Locked Models</h2>
      <Card className="h-[400px] md:h-[500px]">
        <ScrollArea className="h-full">
          <div className="p-6">
            {!isMounted ? (
               renderSkeletons()
            ) : models.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <ImageOff className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Your library is empty.
                </p>
                <p className="text-sm text-muted-foreground/80">
                  Lock a generated model to save it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {models.map((model) => (
                  <Card key={model.seed} className="group relative overflow-hidden">
                    <CardContent className="p-0">
                      <Image
                        src={model.imageUrls.straight}
                        alt={`Model with seed ${model.seed}`}
                        width={200}
                        height={250}
                        className="aspect-[4/5] object-cover w-full"
                        data-ai-hint="person face"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0" />
                      <div className="absolute bottom-0 left-0 p-2">
                        <p className="text-white text-xs font-mono break-all">{model.seed}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDelete(model.seed)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </section>
  );
}
