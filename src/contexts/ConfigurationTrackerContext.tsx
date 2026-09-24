"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  BulkImportResult,
  ConfigurationTraits,
  ModelConfig,
} from "@/hooks/useConfigurationTracker";
import {
  parseLegacyConfigJson,
  normalizeModelConfig,
  normalizeConfigurationTraits,
} from "@/lib/config-schema";

const STORAGE_KEY = "kotoor_saved_configs";
export const CONFIGS_UPDATED_EVENT = "kotoor-configs-updated";

type ConfigurationTrackerContextValue = {
  savedConfigs: ModelConfig[];
  isHydrated: boolean;
  verifyUniqueConfig: (traits: ConfigurationTraits) => boolean;
  finalizeAndApproveConfig: (
    name: string,
    traits: ConfigurationTraits
  ) => ModelConfig;
  bulkImportLegacyConfigs: (
    entries: Array<{ name: string; traits: ConfigurationTraits }>
  ) => BulkImportResult;
  importLegacyFromJson: (jsonString: string) => BulkImportResult;
};

const ConfigurationTrackerContext =
  createContext<ConfigurationTrackerContextValue | null>(null);

function loadConfigsFromStorage(): ModelConfig[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as ModelConfig[];
    return parsed.map(normalizeModelConfig);
  } catch {
    return [];
  }
}

function persistConfigs(configs: ModelConfig[]) {
  const normalized = configs.map(normalizeModelConfig);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(CONFIGS_UPDATED_EVENT));
}

export function ConfigurationTrackerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [savedConfigs, setSavedConfigs] = useState<ModelConfig[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const reloadFromStorage = () => {
      setSavedConfigs(loadConfigsFromStorage());
    };

    const initial = loadConfigsFromStorage();
    setSavedConfigs(initial);
    setIsHydrated(true);

    // One-time migration: rewrite legacy label-based keys to canonical schema values
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const normalized = (JSON.parse(raw) as ModelConfig[]).map(
          normalizeModelConfig
        );
        if (JSON.stringify(normalized) !== raw) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        }
      }
    } catch {
      // ignore migration errors
    }

    window.addEventListener(CONFIGS_UPDATED_EVENT, reloadFromStorage);
    return () =>
      window.removeEventListener(CONFIGS_UPDATED_EVENT, reloadFromStorage);
  }, []);

  const generateConfigHash = useCallback((config: ConfigurationTraits) => {
    const normalized = normalizeConfigurationTraits(config);
    return [
      normalized.gender,
      normalized.ageGroup,
      normalized.regionEthnicity,
      normalized.subGroup,
      normalized.skinTone,
      normalized.bodyType,
      normalized.hairStyle,
      normalized.hairColor,
      normalized.facialHair ?? "",
    ].join("|");
  }, []);

  const verifyUniqueConfig = useCallback(
    (newConfig: ConfigurationTraits) => {
      const newHash = generateConfigHash(newConfig);
      return !savedConfigs.some(
        (existing) => generateConfigHash(existing) === newHash
      );
    },
    [generateConfigHash, savedConfigs]
  );

  const finalizeAndApproveConfig = useCallback(
    (name: string, traits: ConfigurationTraits) => {
      if (!traits.subGroup?.trim()) {
        throw new Error(
          "Sub-group required: select a specific demographic profile before approval."
        );
      }

      const normalizedTraits = normalizeConfigurationTraits(traits);

      if (!verifyUniqueConfig(normalizedTraits)) {
        throw new Error(
          "Duplicate Configuration Detected: A model profile with these exact traits already exists in your library."
        );
      }

      const approvedModel: ModelConfig = normalizeModelConfig({
        ...normalizedTraits,
        id: `cfg_${crypto.randomUUID()}`,
        name:
          name.trim() || `Model Profile - ${new Date().toLocaleDateString()}`,
        approvalStatus: "Approved & Locked",
        createdAt: Date.now(),
      });

      const updatedList = [...savedConfigs, approvedModel];
      setSavedConfigs(updatedList);
      persistConfigs(updatedList);
      return approvedModel;
    },
    [savedConfigs, verifyUniqueConfig]
  );

  const bulkImportLegacyConfigs = useCallback(
    (
      entries: Array<{ name: string; traits: ConfigurationTraits }>
    ): BulkImportResult => {
      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];
      const nextList = [...savedConfigs];
      const hashes = new Set(nextList.map((c) => generateConfigHash(c)));

      for (const { name, traits } of entries) {
        const normalizedTraits = normalizeConfigurationTraits(traits);

        if (!normalizedTraits.subGroup?.trim()) {
          errors.push(`${name}: sub-group is required.`);
          continue;
        }

        const hash = generateConfigHash(normalizedTraits);
        if (hashes.has(hash)) {
          skipped += 1;
          continue;
        }

        nextList.push(
          normalizeModelConfig({
            ...normalizedTraits,
            id: `cfg_${crypto.randomUUID()}`,
            name:
              name.trim() ||
              `Model Profile - ${new Date().toLocaleDateString()}`,
            approvalStatus: "Approved & Locked",
            createdAt: Date.now(),
          })
        );
        hashes.add(hash);
        imported += 1;
      }

      if (imported > 0) {
        setSavedConfigs(nextList);
        persistConfigs(nextList);
      }

      return { imported, skipped, errors };
    },
    [generateConfigHash, savedConfigs]
  );

  const importLegacyFromJson = useCallback(
    (jsonString: string) => {
      const parsed = parseLegacyConfigJson(jsonString);
      return bulkImportLegacyConfigs(parsed);
    },
    [bulkImportLegacyConfigs]
  );

  const value = useMemo(
    () => ({
      savedConfigs,
      isHydrated,
      verifyUniqueConfig,
      finalizeAndApproveConfig,
      bulkImportLegacyConfigs,
      importLegacyFromJson,
    }),
    [
      savedConfigs,
      isHydrated,
      verifyUniqueConfig,
      finalizeAndApproveConfig,
      bulkImportLegacyConfigs,
      importLegacyFromJson,
    ]
  );

  return (
    <ConfigurationTrackerContext.Provider value={value}>
      {children}
    </ConfigurationTrackerContext.Provider>
  );
}

export function useConfigurationTracker(): ConfigurationTrackerContextValue {
  const context = useContext(ConfigurationTrackerContext);
  if (!context) {
    throw new Error(
      "useConfigurationTracker must be used within ConfigurationTrackerProvider"
    );
  }
  return context;
}
