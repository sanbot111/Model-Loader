export interface GenerationEngines {
  imagen: boolean;
  openai: boolean;
}

export interface FormDataType {
  gender: string;
  ageGroup: string;
  regionEthnicity: string;
  subGroup: string;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  marketingArchetype: string;
  bodyType: string;
  /** Male models only */
  facialHair?: string;
  engines: GenerationEngines;
}

/** Alias for form data used in the generator sidebar */
export type GeneratorFormData = FormDataType;

export interface ThreeAngleImages {
  straight: string;
  left: string;
  right: string;
}

export interface ModelImageResults {
  imagen?: ThreeAngleImages;
  openai?: ThreeAngleImages;
}

export interface ModelData {
  seed: string;
  imageResults: ModelImageResults;
  prompts: {
    straightPrompt: string;
    leftPrompt: string;
    rightPrompt: string;
  };
  formData: FormDataType;
}

export const ENGINE_LABELS = {
  imagen: "Imagen 4",
  openai: "GPT Image 2",
} as const;

export type EngineKey = keyof typeof ENGINE_LABELS;

export function getActiveEngineKeys(
  results: ModelImageResults
): EngineKey[] {
  const keys: EngineKey[] = [];
  if (results.imagen) keys.push("imagen");
  if (results.openai) keys.push("openai");
  return keys;
}

export function hasMultipleEngines(results: ModelImageResults): boolean {
  return getActiveEngineKeys(results).length > 1;
}
