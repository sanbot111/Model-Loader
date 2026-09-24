"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "kotoor_saved_configs";
export const CONFIGS_UPDATED_EVENT = "kotoor-configs-updated";

export interface ModelConfig {
  id: string;
  name: string;
  gender: string;
  ageGroup: string;
  regionEthnicity: string;
  subGroup: string;
  skinTone: string;
  bodyType: string;
  hairStyle: string;
  hairColor: string;
  facialHair?: string;
  approvalStatus: "Draft" | "Pending Finalization" | "Approved & Locked";
  createdAt: number;
}

export type ConfigurationTraits = Omit<
  ModelConfig,
  "id" | "name" | "approvalStatus" | "createdAt"
>;

export type BulkImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
};

export { useConfigurationTracker, ConfigurationTrackerProvider } from "@/contexts/ConfigurationTrackerContext";
