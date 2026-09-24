"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import type { BatchItem } from "@/hooks/useBatchProcessor";
import { getRecordString } from "@/lib/config-schema";
import {
  downloadDataUri,
  downloadModelZip,
  type ThreeAngleImages,
  type ModelPrompts,
} from "@/lib/download-utils";
import { useToast } from "@/hooks/use-toast";

type BatchProcessorQueueProps = {
  batchQueue: BatchItem[];
  isProcessing: boolean;
  onStartBatch: () => void;
  onApproveItem: (id: string, name: string) => void;
  onRegenerateItem: (id: string) => void;
};

function getBatchSummary(config: Record<string, unknown>): string {
  const gender = getRecordString(config, "gender", "Gender") || "—";
  const ageGroup = getRecordString(config, "ageGroup", "Age Group") || "—";
  return `${gender} • ${ageGroup}`;
}

function BatchAngleGrid({
  images,
  prompts,
  seed,
  onBulkDownload,
}: {
  images: ThreeAngleImages;
  prompts: ModelPrompts;
  seed: string;
  onBulkDownload: () => void;
}) {
  const angles = [
    {
      title: "Straight (3/4 Body)",
      url: images.straight,
      prompt: prompts.straightPrompt,
      alt: "Straight 3/4 body portrait",
      file: `straight_${seed}.png`,
    },
    {
      title: "Left Profile (3/4 Body)",
      url: images.left,
      prompt: prompts.leftPrompt,
      alt: "Left profile 3/4 body portrait",
      file: `left_${seed}.png`,
    },
    {
      title: "Right Profile (3/4 Body)",
      url: images.right,
      prompt: prompts.rightPrompt,
      alt: "Right profile 3/4 body portrait",
      file: `right_${seed}.png`,
    },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="default" size="sm" onClick={onBulkDownload}>
          <Download className="mr-2 h-4 w-4" />
          Bulk Download
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {angles.map((angle) => (
          <Card key={angle.title} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">{angle.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="relative mx-auto aspect-[3/4] w-full max-h-[50vh] overflow-hidden rounded-md">
                <Image
                  src={angle.url}
                  alt={angle.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 pt-4">
              <div className="flex w-full items-center justify-between">
                <p className="text-sm font-medium">Prompt</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDataUri(angle.url, angle.file)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-4">
                {angle.prompt}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function BatchProcessorQueue({
  batchQueue,
  isProcessing,
  onStartBatch,
  onApproveItem,
  onRegenerateItem,
}: BatchProcessorQueueProps) {
  const { toast } = useToast();
  const [approvalErrors, setApprovalErrors] = useState<Record<string, string>>(
    {}
  );

  if (batchQueue.length === 0 && !isProcessing) {
    return null;
  }

  const handleBulkDownload = async (item: BatchItem) => {
    if (!item.images || !item.prompts || !item.seed) return;

    toast({
      title: "Preparing Download...",
      description: "Your model assets are being zipped.",
    });

    try {
      const safeName = item.displayName
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, 40);
      await downloadModelZip({
        seed: item.seed,
        images: item.images,
        prompts: item.prompts,
        zipFilename: safeName
          ? `model_${safeName}_${item.seed}.zip`
          : `model_${item.seed}.zip`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description:
          "Could not prepare your files for download. Please try again.",
      });
    }
  };

  const handleApprove = (item: BatchItem) => {
    setApprovalErrors((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
    try {
      onApproveItem(item.id, item.displayName);
    } catch (err) {
      setApprovalErrors((prev) => ({
        ...prev,
        [item.id]:
          err instanceof Error ? err.message : "Approval failed.",
      }));
    }
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Batch Queue</h2>
          <p className="text-muted-foreground">
            {batchQueue.length} item{batchQueue.length === 1 ? "" : "s"} loaded
            {isProcessing
              ? " · Processing wave (up to 3 models, 9 images)…"
              : " · Runs in waves of 3 to stay within Tier 1 (10 IPM)"}
          </p>
        </div>
        <Button
          onClick={onStartBatch}
          disabled={isProcessing}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            "Start Batch"
          )}
        </Button>
      </div>

      <div className="space-y-8">
        {batchQueue.map((item, index) => {
          const hasAssets =
            item.images && item.prompts && item.seed && item.status !== "Failed";
          const canReview = item.status === "Review";
          const isApproved = item.status === "Approved";

          return (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg">
                    {item.displayName || `Model #${index + 1}`}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getBatchSummary(item.config)}
                    {item.seed ? ` · Seed: ${item.seed}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold uppercase">
                  {item.status}
                </span>
              </CardHeader>

              <CardContent className="space-y-4">
                {(item.status === "Generating Prompts" ||
                  item.status === "Generating Images") && (
                  <div className="flex items-center gap-3 rounded-lg border border-dashed p-6 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm font-medium">{item.status}…</span>
                  </div>
                )}

                {item.error && item.status === "Failed" && (
                  <p className="rounded bg-destructive/10 p-3 text-sm text-destructive">
                    {item.error}
                  </p>
                )}

                {hasAssets && (
                  <BatchAngleGrid
                    images={item.images!}
                    prompts={item.prompts!}
                    seed={item.seed!}
                    onBulkDownload={() => void handleBulkDownload(item)}
                  />
                )}

                <div className="flex flex-wrap gap-2">
                  {canReview && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApprove(item)}
                      >
                        Verify & Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                        onClick={() => onRegenerateItem(item.id)}
                      >
                        Regenerate
                      </Button>
                    </>
                  )}

                  {isApproved && hasAssets && (
                    <Button
                      size="sm"
                      onClick={() => void handleBulkDownload(item)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Bulk Download
                    </Button>
                  )}

                  {item.status === "Failed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRegenerateItem(item.id)}
                    >
                      Retry
                    </Button>
                  )}
                </div>

                {approvalErrors[item.id] && (
                  <p className="rounded bg-destructive/10 p-2 text-xs text-destructive">
                    {approvalErrors[item.id]}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
