"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ModelData } from "@/lib/types";
import { Trash2, ImageOff, Download, Eye } from "lucide-react";

type ModelLibraryProps = {
  models: ModelData[];
  onDelete: (seed: string) => void;
  onSelectModel: (model: ModelData) => void;
  isMounted: boolean;
};

export default function ModelLibrary({
  models,
  onDelete,
  onSelectModel,
  isMounted,
}: ModelLibraryProps) {

  const handleDownload = (e: React.MouseEvent, url: string, filename: string) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-tight mb-4">My Locked Models</h2>
      <Card className="h-[400px] md:h-[500px]">
        <ScrollArea className="h-full">
          <div className="p-6">
            {!isMounted ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] w-full rounded-lg" />
                ))}
              </div>
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
                  <Card
                    key={model.seed}
                    className="group relative overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <button onClick={() => onSelectModel(model)} className="w-full h-full aspect-[4/5] relative">
                        <Image
                          src={
                            model.imageResults.imagen?.straight ??
                            model.imageResults.openai?.straight ??
                            ""
                          }
                          alt={`Model with seed ${model.seed}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          data-ai-hint="person face"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Eye className="h-8 w-8 text-white" />
                        </div>
                      </button>

                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-white text-xs font-mono break-all">{model.seed}</p>
                      </div>
                      
                      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) =>
                            handleDownload(
                              e,
                              model.imageResults.imagen?.straight ??
                                model.imageResults.openai?.straight ??
                                "",
                              `model_${model.seed}.png`
                            )
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(model.seed)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
