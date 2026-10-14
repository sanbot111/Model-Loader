import {
  AGE_GROUPS,
  GENDERS,
  MALE_FACIAL_HAIR,
  getBodyTypes,
  getHairStyles,
  getSubGroupsForRegion,
  hairColorOptions,
  isMaleGender,
  regionEthnicityOptions,
  skinToneOptions,
  type RegionEthnicityOption,
} from "@/lib/constants";
import type {
  ConfigurationTraits,
  ModelConfig,
} from "@/hooks/useConfigurationTracker";
import type { GenerateModelTurnaroundPromptsInput } from "@/ai/flows/generate-model-turnaround-prompts";

export const ALL_REGIONS_COVERAGE_KEY = "__all_regions__";

export type CoverageSubGroupRow = {
  id: string;
  regionKey: string;
  subGroupValue: string;
  label: string;
};

/** Sub-group rows for the coverage heatmap, sourced from sidebar constants. */
export function getCoverageSubGroupRows(
  regionFilter: string
): CoverageSubGroupRow[] {
  if (regionFilter === ALL_REGIONS_COVERAGE_KEY) {
    return regionEthnicityOptions.flatMap((region) =>
      getSubGroupsForRegion(region.value).map((sub) => ({
        id: `${region.value}::${sub.value}`,
        regionKey: region.value,
        subGroupValue: sub.value,
        label: `${region.label} · ${sub.label}`,
      }))
    );
  }

  return getSubGroupsForRegion(regionFilter).map((sub) => ({
    id: sub.value,
    regionKey: regionFilter,
    subGroupValue: sub.value,
    label: sub.label,
  }));
}

export function getRecordString(
  record: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const val = record[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return "";
}

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

function resolveFromLabelValueOptions(
  input: string,
  options: RegionEthnicityOption[]
): string {
  if (!input) return "";
  const norm = normalize(input);
  const byValue = options.find((o) => normalize(o.value) === norm);
  if (byValue) return byValue.value;
  const byLabel = options.find((o) => normalize(o.label) === norm);
  if (byLabel) return byLabel.value;
  const partial = options.find(
    (o) =>
      normalize(o.label).includes(norm) || norm.includes(normalize(o.label))
  );
  return partial?.value ?? input;
}

function resolveFromStringList(input: string, options: string[]): string {
  if (!input) return "";
  const norm = normalize(input);
  const exact = options.find((o) => normalize(o) === norm);
  if (exact) return exact;
  const partial = options.find(
    (o) => normalize(o).includes(norm) || norm.includes(normalize(o))
  );
  return partial ?? input;
}

export function resolveRegionEthnicity(input: string): string {
  return resolveFromLabelValueOptions(input, regionEthnicityOptions);
}

export function resolveSubGroup(input: string, regionKey?: string): string {
  if (!input) return "";

  const resolvedRegion = regionKey
    ? resolveRegionEthnicity(regionKey)
    : undefined;

  const regionsToSearch = resolvedRegion
    ? [
        resolvedRegion,
        ...regionEthnicityOptions
          .map((r) => r.value)
          .filter((v) => v !== resolvedRegion),
      ]
    : regionEthnicityOptions.map((r) => r.value);

  for (const rk of regionsToSearch) {
    const resolved = resolveFromLabelValueOptions(
      input,
      getSubGroupsForRegion(rk)
    );
    const subGroups = getSubGroupsForRegion(rk);
    if (subGroups.some((s) => s.value === resolved)) {
      return resolved;
    }
  }

  return input;
}

export function resolveSkinTone(input: string): string {
  return resolveFromLabelValueOptions(input, skinToneOptions);
}

export function resolveHairColor(input: string): string {
  return resolveFromLabelValueOptions(input, hairColorOptions);
}

export function resolveFacialHair(input: string): string {
  return resolveFromLabelValueOptions(input, MALE_FACIAL_HAIR);
}

export function resolveGender(input: string): string {
  return resolveFromStringList(input, [...GENDERS]);
}

export function resolveAgeGroup(input: string): string {
  return resolveFromStringList(input, [...AGE_GROUPS]);
}

export function resolveBodyType(input: string, gender: string): string {
  return resolveFromStringList(input, getBodyTypes(gender));
}

export function resolveHairStyle(input: string, gender: string): string {
  return resolveFromLabelValueOptions(input, getHairStyles(gender));
}

export type ParsedLegacyConfig = {
  name: string;
  traits: ConfigurationTraits;
};

/** Map external JSON keys to internal tracker schema using sidebar constants. */
export function parseLegacyConfigRecord(
  raw: unknown,
  index = 0
): ParsedLegacyConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(
      `Invalid entry at index ${index}. Each item must be a JSON object.`
    );
  }

  const record = raw as Record<string, unknown>;
  const gender = resolveGender(getRecordString(record, "gender", "Gender"));
  if (!gender) {
    throw new Error(`Entry ${index}: Gender is required.`);
  }

  const regionRaw = getRecordString(
    record,
    "regionEthnicity",
    "Region / Ethnicity",
    "Region/Ethnicity"
  );
  const regionEthnicity = resolveRegionEthnicity(regionRaw);

  const subGroupRaw = getRecordString(
    record,
    "subGroup",
    "Specific Demographic Sub-Group",
    "Sub-Group"
  );
  const subGroup = resolveSubGroup(subGroupRaw, regionEthnicity);

  const ageGroup = resolveAgeGroup(
    getRecordString(record, "ageGroup", "Age Group")
  );
  const skinTone = resolveSkinTone(
    getRecordString(record, "skinTone", "Skin Tone")
  );
  const bodyType = resolveBodyType(
    getRecordString(record, "bodyType", "Body Type"),
    gender
  );
  const hairStyle = resolveHairStyle(
    getRecordString(record, "hairStyle", "Hair Style"),
    gender
  );
  const hairColor = resolveHairColor(
    getRecordString(record, "hairColor", "Hair Color")
  );

  const traits: ConfigurationTraits = {
    gender,
    ageGroup,
    regionEthnicity,
    subGroup,
    skinTone,
    bodyType,
    hairStyle,
    hairColor,
  };

  if (isMaleGender(gender)) {
    const facialHair = resolveFacialHair(
      getRecordString(record, "facialHair", "Facial Hair")
    );
    if (facialHair) traits.facialHair = facialHair;
  }

  const name =
    getRecordString(record, "Model Name", "name", "modelName") ||
    `Legacy Import ${index + 1}`;

  return { name, traits };
}

export function parseLegacyConfigJson(jsonString: string): ParsedLegacyConfig[] {
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

  return items.map((item, index) => parseLegacyConfigRecord(item, index));
}

function normalizeDashes(input: string): string {
  return input.replace(/-/g, "–");
}

export function normalizeConfigurationTraits(
  traits: ConfigurationTraits
): ConfigurationTraits {
  const gender = resolveGender(traits.gender);
  const regionEthnicity = resolveRegionEthnicity(traits.regionEthnicity);
  const subGroup = resolveSubGroup(traits.subGroup, regionEthnicity);
  const ageGroup = resolveAgeGroup(normalizeDashes(traits.ageGroup));

  const normalized: ConfigurationTraits = {
    gender,
    ageGroup,
    regionEthnicity,
    subGroup,
    skinTone: resolveSkinTone(traits.skinTone),
    bodyType: resolveBodyType(traits.bodyType, gender),
    hairStyle: resolveHairStyle(traits.hairStyle, gender),
    hairColor: resolveHairColor(traits.hairColor),
  };

  if (isMaleGender(gender) && traits.facialHair) {
    normalized.facialHair = resolveFacialHair(traits.facialHair);
  }

  return normalized;
}

export function normalizeModelConfig(config: ModelConfig): ModelConfig {
  return {
    ...config,
    ...normalizeConfigurationTraits(config),
  };
}

export function configCoversIntersection(
  configs: ConfigurationTraits[],
  intersection: {
    gender: string;
    regionKey: string;
    subGroupValue: string;
    ageGroup: string;
  }
): boolean {
  const target = {
    gender: resolveGender(intersection.gender),
    regionKey: resolveRegionEthnicity(intersection.regionKey),
    subGroupValue: resolveSubGroup(
      intersection.subGroupValue,
      resolveRegionEthnicity(intersection.regionKey)
    ),
    ageGroup: resolveAgeGroup(normalizeDashes(intersection.ageGroup)),
  };

  return configs.some((config) => {
    const normalized = normalizeConfigurationTraits(config);
    return (
      normalized.gender === target.gender &&
      normalized.regionEthnicity === target.regionKey &&
      normalized.subGroup === target.subGroupValue &&
      normalized.ageGroup === target.ageGroup
    );
  });
}

export function countLibraryProfilesForView(
  configs: ConfigurationTraits[],
  filters: { regionFilter: string; gender: string }
): number {
  const gender = resolveGender(filters.gender);
  const regionFilter = filters.regionFilter;

  return configs.filter((config) => {
    const normalized = normalizeConfigurationTraits(config);
    if (normalized.gender !== gender) return false;
    if (
      regionFilter !== ALL_REGIONS_COVERAGE_KEY &&
      normalized.regionEthnicity !== resolveRegionEthnicity(regionFilter)
    ) {
      return false;
    }
    return true;
  }).length;
}

export function parseBatchPromptInput(
  config: Record<string, unknown>
): GenerateModelTurnaroundPromptsInput {
  const gender = resolveGender(getRecordString(config, "gender", "Gender"));
  const regionRaw = getRecordString(
    config,
    "regionEthnicity",
    "Region / Ethnicity",
    "Region/Ethnicity"
  );
  const regionEthnicity = resolveRegionEthnicity(regionRaw);

  const input: GenerateModelTurnaroundPromptsInput = {
    gender,
    ageGroup: resolveAgeGroup(
      getRecordString(config, "ageGroup", "Age Group")
    ),
    regionEthnicity,
    subGroup: resolveSubGroup(
      getRecordString(
        config,
        "subGroup",
        "Specific Demographic Sub-Group",
        "Sub-Group"
      ),
      regionEthnicity
    ),
    skinTone: resolveSkinTone(getRecordString(config, "skinTone", "Skin Tone")),
    hairStyle: resolveHairStyle(
      getRecordString(config, "hairStyle", "Hair Style"),
      gender
    ),
    hairColor: resolveHairColor(
      getRecordString(config, "hairColor", "Hair Color")
    ),
    bodyType: resolveBodyType(
      getRecordString(config, "bodyType", "Body Type"),
      gender
    ),
    marketingArchetype: getRecordString(
      config,
      "marketingArchetype",
      "Marketing Archetype"
    ),
  };

  if (isMaleGender(gender)) {
    const facialHair = resolveFacialHair(
      getRecordString(config, "facialHair", "Facial Hair")
    );
    if (facialHair) input.facialHair = facialHair;
  }

  return input;
}

export function toConfigurationTraitsFromRecord(
  config: Record<string, unknown>
): ConfigurationTraits {
  const parsed = parseLegacyConfigRecord(config);
  return parsed.traits;
}

export function getBatchDisplayName(
  config: Record<string, unknown>,
  fallback: string
): string {
  return (
    getRecordString(config, "Model Name", "name", "modelName") || fallback
  );
}
