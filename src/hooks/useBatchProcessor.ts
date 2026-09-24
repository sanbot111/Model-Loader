"use client";

import { useState, useCallback, useRef } from "react";
import { generateModelTurnaroundPrompts } from "@/ai/flows/generate-model-turnaround-prompts";
import {
  generateStraightImage,
  generateProfileImage,
} from "@/ai/flows/generate-model-images";
import {
  getBatchDisplayName,
  parseBatchPromptInput,
  toConfigurationTraitsFromRecord,
} from "@/lib/config-schema";
import {
  useConfigurationTracker,
} from "@/hooks/useConfigurationTracker";

/** Tier 1: 10 IPM → 3 models × 3 images = 9 images per wave. */
const BATCH_WAVE_SIZE = 3;
const TIER1_THROTTLE_MS = 20_000;

export type BatchItemStatus =
  | "Pending"
  | "Generating Prompts"
  | "Generating Images"
  | "Review"
  | "Approved"
  | "Failed";

export interface BatchItem {
  id: string;
  displayName: string;
  config: Record<string, unknown>;
  status: BatchItemStatus;
  seed?: string;
  prompts?: {
    straightPrompt: string;
    leftPrompt: string;
    rightPrompt: string;
  };
  images?: { straight: string; left: string; right: string };
  error?: string;
}

type BatchPrompts = NonNullable<BatchItem["prompts"]>;

function createSeed(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

async function generatePromptsForItem(
  item: BatchItem
): Promise<{ id: string; prompts: BatchPrompts } | { id: string; error: string }> {
  try {
    const prompts = await generateModelTurnaroundPrompts(
      parseBatchPromptInput(item.config)
    );
    return { id: item.id, prompts };
  } catch (err) {
    return { id: item.id, error: errorMessage(err) };
  }
}

async function generateHeroForItem(
  id: string,
  prompts: BatchPrompts
): Promise<
  | { id: string; prompts: BatchPrompts; straight: string }
  | { id: string; error: string }
> {
  try {
    const straight = await generateStraightImage(prompts.straightPrompt);
    return { id, prompts, straight };
  } catch (err) {
    return { id, error: errorMessage(err) };
  }
}

async function generateProfilesForItem(
  id: string,
  prompts: BatchPrompts,
  straight: string
): Promise<
  | {
      id: string;
      prompts: BatchPrompts;
      images: { straight: string; left: string; right: string };
    }
  | { id: string; error: string }
> {
  try {
    const [left, right] = await Promise.all([
      generateProfileImage(prompts.leftPrompt, straight),
      generateProfileImage(prompts.rightPrompt, straight),
    ]);
    return {
      id,
      prompts,
      images: { straight, left, right },
    };
  } catch (err) {
    return { id, error: errorMessage(err) };
  }
}

export function useBatchProcessor() {
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const batchQueueRef = useRef<BatchItem[]>([]);
  const processingRef = useRef(false);
  const { finalizeAndApproveConfig } = useConfigurationTracker();

  const setQueue = useCallback(
    (updater: BatchItem[] | ((prev: BatchItem[]) => BatchItem[])) => {
      setBatchQueue((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        batchQueueRef.current = next;
        return next;
      });
    },
    []
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<BatchItem>) => {
      setQueue((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    },
    [setQueue]
  );

  const loadJsonBatch = useCallback(
    (jsonString: string) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonString);
      } catch {
        throw new Error("Invalid JSON structure. Please check your formatting.");
      }

      const items = Array.isArray(parsed) ? parsed : [parsed];
      if (items.length === 0) {
        throw new Error("JSON array is empty. Add at least one model config.");
      }

      const newQueue: BatchItem[] = items.map((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          throw new Error(
            `Invalid entry at index ${index}. Each item must be a JSON object.`
          );
        }
        const config = item as Record<string, unknown>;
        return {
          id: `batch_${crypto.randomUUID()}`,
          displayName: getBatchDisplayName(config, `Model #${index + 1}`),
          config,
          status: "Pending" as BatchItemStatus,
        };
      });

      setQueue((prev) => [...prev, ...newQueue]);
      return true;
    },
    [setQueue]
  );

  const processWave = useCallback(
    async (wave: BatchItem[]) => {
      wave.forEach((item) =>
        updateItem(item.id, { status: "Generating Prompts", error: undefined })
      );

      const promptResults = await Promise.all(
        wave.map((item) => generatePromptsForItem(item))
      );

      const readyForHero: Array<{ id: string; prompts: BatchPrompts }> = [];
      for (const result of promptResults) {
        if ("error" in result) {
          updateItem(result.id, { status: "Failed", error: result.error });
        } else {
          readyForHero.push(result);
        }
      }

      if (readyForHero.length === 0) return;

      readyForHero.forEach(({ id }) =>
        updateItem(id, { status: "Generating Images" })
      );

      // Phase 2: all hero images in parallel (up to 3 IPM)
      const heroResults = await Promise.all(
        readyForHero.map(({ id, prompts }) =>
          generateHeroForItem(id, prompts)
        )
      );

      const readyForProfiles: Array<{
        id: string;
        prompts: BatchPrompts;
        straight: string;
      }> = [];
      for (const result of heroResults) {
        if ("error" in result) {
          updateItem(result.id, { status: "Failed", error: result.error });
        } else {
          readyForProfiles.push(result);
        }
      }

      if (readyForProfiles.length === 0) return;

      // Phase 3: all profile images in parallel (up to 6 IPM)
      const profileResults = await Promise.all(
        readyForProfiles.map(({ id, prompts, straight }) =>
          generateProfilesForItem(id, prompts, straight)
        )
      );

      for (const result of profileResults) {
        if ("error" in result) {
          updateItem(result.id, { status: "Failed", error: result.error });
        } else {
          updateItem(result.id, {
            status: "Review",
            prompts: result.prompts,
            images: result.images,
            seed: createSeed(),
          });
        }
      }
    },
    [updateItem]
  );

  const processBatchWaves = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    try {
      while (true) {
        const pending = batchQueueRef.current.filter(
          (item) => item.status === "Pending"
        );
        if (pending.length === 0) break;

        const wave = pending.slice(0, BATCH_WAVE_SIZE);
        await processWave(wave);

        const hasMorePending = batchQueueRef.current.some(
          (item) => item.status === "Pending"
        );
        if (hasMorePending) {
          await new Promise((resolve) => setTimeout(resolve, TIER1_THROTTLE_MS));
        }
      }
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  }, [processWave]);

  const startBatch = useCallback(() => {
    if (!processingRef.current) {
      void processBatchWaves();
    }
  }, [processBatchWaves]);

  const approveItem = useCallback(
    (id: string, name: string) => {
      const item = batchQueueRef.current.find((i) => i.id === id);
      if (!item?.images) {
        throw new Error("No images available to approve.");
      }

      finalizeAndApproveConfig(
        name,
        toConfigurationTraitsFromRecord(item.config)
      );
      updateItem(id, { status: "Approved" });
    },
    [finalizeAndApproveConfig, updateItem]
  );

  const regenerateItem = useCallback(
    (id: string) => {
      updateItem(id, {
        status: "Pending",
        images: undefined,
        prompts: undefined,
        seed: undefined,
        error: undefined,
      });
      if (!processingRef.current) {
        void processBatchWaves();
      }
    },
    [processBatchWaves, updateItem]
  );

  return {
    batchQueue,
    isProcessing,
    loadJsonBatch,
    startBatch,
    approveItem,
    regenerateItem,
  };
}
