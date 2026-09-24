import type { FormDataType } from "@/lib/types";

export const FEMALE_GENDER = "Female / Woman";
export const MALE_GENDER = "Male / Man";

export const GENDERS = [FEMALE_GENDER, MALE_GENDER];

export const AGE_GROUPS = [
  "Child (4–12 years)",
  "Teen (13–19 years)",
  "Young Adult (20–29 years)",
  "Adult (30–45 years)",
  "Middle-Aged (46–60 years)",
  "Senior / Mature (60+ years)",
];

export type RegionEthnicityOption = {
  label: string;
  value: string;
};

export const regionEthnicityOptions: RegionEthnicityOption[] = [
  { label: "African / Black", value: "african_black" },
  { label: "East Asian", value: "east_asian" },
  { label: "South Asian", value: "south_asian" },
  { label: "Southeast Asian", value: "southeast_asian" },
  {
    label: "Middle Eastern / North African (MENA)",
    value: "mena",
  },
  { label: "Caucasian / White", value: "caucasian_white" },
  { label: "Hispanic / Latin American", value: "hispanic_latin" },
  { label: "Indigenous / First Nations", value: "indigenous" },
  { label: "Mixed / Multiracial", value: "mixed_multiracial" },
];

export const subGroupOptionsMap: Record<string, RegionEthnicityOption[]> = {
  african_black: [
    {
      label: "West African (e.g., Nigerian, Ghanaian)",
      value: "west african phenotype",
    },
    {
      label: "East African (e.g., Ethiopian, Somali)",
      value: "east african phenotype",
    },
    { label: "Afro-Caribbean", value: "afro-caribbean phenotype" },
    { label: "African-American", value: "african-american phenotype" },
  ],
  east_asian: [
    { label: "Chinese", value: "chinese phenotype" },
    { label: "Japanese", value: "japanese phenotype" },
    { label: "Korean", value: "korean phenotype" },
    { label: "Taiwanese", value: "taiwanese phenotype" },
  ],
  south_asian: [
    {
      label: "South Asian (North Indian)",
      value: "south asian, north indian phenotype",
    },
    {
      label: "South Asian (South Indian)",
      value: "south asian, south indian phenotype",
    },
    { label: "Pakistani", value: "pakistani phenotype" },
    { label: "Bangladeshi", value: "bangladeshi phenotype" },
    { label: "Sri Lankan", value: "sri lankan phenotype" },
  ],
  southeast_asian: [
    { label: "Thai", value: "thai phenotype" },
    { label: "Vietnamese", value: "vietnamese phenotype" },
    { label: "Filipino", value: "filipino phenotype" },
    {
      label: "Indonesian / Malaysian",
      value: "indonesian malaysian phenotype",
    },
  ],
  mena: [
    { label: "Egyptian", value: "egyptian phenotype" },
    {
      label: "Levantine (e.g., Lebanese, Syrian)",
      value: "levantine arab phenotype",
    },
    { label: "Persian / Iranian", value: "persian iranian phenotype" },
    {
      label: "North African Maghrebi",
      value: "maghrebi arab phenotype",
    },
  ],
  caucasian_white: [
    {
      label: "Northern European / Nordic",
      value: "northern european nordic phenotype",
    },
    {
      label: "Southern European / Mediterranean",
      value: "southern european mediterranean phenotype",
    },
    {
      label: "Eastern European / Slavic",
      value: "eastern european slavic phenotype",
    },
    {
      label: "Celtic / Anglo-Saxon",
      value: "celtic anglo-saxon phenotype",
    },
  ],
  hispanic_latin: [
    {
      label: "Mexican / Central American",
      value: "mexican central american phenotype",
    },
    {
      label: "South American (Andean / Mestizo)",
      value: "andean mestizo phenotype",
    },
    { label: "Afro-Latino", value: "afro-latino phenotype" },
    { label: "Caribbean Hispanic", value: "caribbean hispanic phenotype" },
  ],
  indigenous: [
    {
      label: "Native American / First Nations",
      value: "native american first nations phenotype",
    },
    {
      label: "Māori / Pacific Islander",
      value: "maori pacific islander phenotype",
    },
    {
      label: "Aboriginal Australian",
      value: "aboriginal australian phenotype",
    },
  ],
  mixed_multiracial: [
    {
      label: "Eurasian (East Asian + White)",
      value: "eurasian mixed phenotype",
    },
    { label: "Afro-Asian (Blasian)", value: "afro-asian mixed phenotype" },
    {
      label: "Multiracial South Asian",
      value: "multiracial south asian phenotype",
    },
  ],
};

/** @deprecated Use regionEthnicityOptions */
export const REGIONS = regionEthnicityOptions;

export function getSubGroupsForRegion(regionKey: string): RegionEthnicityOption[] {
  return subGroupOptionsMap[regionKey] ?? [];
}

export function getDefaultSubGroup(regionKey: string): string {
  return getSubGroupsForRegion(regionKey)[0]?.value ?? "";
}

export function getRegionLabel(regionKey: string): string {
  return (
    regionEthnicityOptions.find((r) => r.value === regionKey)?.label ?? regionKey
  );
}

export type SkinToneOption = {
  label: string;
  value: string;
};

export const skinToneOptions: SkinToneOption[] = [
  {
    label: "Type 1: Very light, pale, or porcelain",
    value: "type 1 very light pale porcelain",
  },
  { label: "Type 2: Light or fair", value: "type 2 light fair" },
  {
    label: "Type 3: Medium, wheatish to light olive",
    value: "type 3 medium wheatish light olive warm undertone",
  },
  {
    label: "Type 4: Olive, warm tan to caramel",
    value: "type 4 olive warm tan caramel undertone",
  },
  {
    label: "Type 5: Rich bronze, medium-dark warm brown",
    value: "type 5 rich bronze medium-dark warm brown undertone",
  },
  {
    label: "Type 6: Deep, dark mahogany to rich espresso brown",
    value: "type 6 deep dark mahogany rich espresso brown warm undertone",
  },
];

/** @deprecated Use skinToneOptions */
export const SKIN_TONES = skinToneOptions;

export type HairColorOption = {
  label: string;
  value: string;
};

export const hairColorOptions: HairColorOption[] = [
  { label: "Jet Black", value: "jet black" },
  { label: "Natural Soft Black", value: "natural soft black" },
  { label: "Dark Brown / Espresso", value: "dark brown espresso" },
  { label: "Medium Brown / Chestnut", value: "medium brown chestnut" },
  { label: "Burgundy / Henna Red Tone", value: "burgundy henna red tone" },
  {
    label: "Honey Blonde / Golden Brown Highlights",
    value: "honey blonde golden brown highlights",
  },
  { label: "Platinum Blonde", value: "platinum blonde" },
  { label: "Auburn / Ginger", value: "auburn ginger" },
  { label: "Grey / Salt & Pepper", value: "grey salt and pepper" },
  { label: "White / Silver", value: "white silver" },
];

/** @deprecated Use hairColorOptions */
export const HAIR_COLORS = hairColorOptions;

export const FEMALE_BODY_TYPES = [
  "Slim / Petite",
  "Average / Straight",
  "Athletic / Toned",
  "Curvy / Hourglass",
  "Plus Size / Curve",
  "Maternity",
];

export const MALE_BODY_TYPES = [
  "Slim / Slender",
  "Average / Straight",
  "Athletic / Muscular",
  "Broad / Brawn",
  "Plus Size / Big & Tall",
];

export type HairStyleOption = {
  label: string;
  value: string;
};

export const femaleHairStyleOptions: HairStyleOption[] = [
  { label: "Buzz Cut / Shaved", value: "buzz cut shaved" },
  {
    label: "Short & Straight (Pixie/Crop)",
    value: "short straight pixie crop",
  },
  { label: "Short & Wavy", value: "short wavy" },
  {
    label: "Short & Thick Indian Curls",
    value: "short thick indian curls",
  },
  {
    label: "Medium & Straight (Bob/Lob)",
    value: "medium length straight bob lob",
  },
  { label: "Medium & Wavy", value: "medium length wavy" },
  {
    label: "Medium & Thick Indian Curls",
    value: "medium length thick indian curls",
  },
  { label: "Long & Straight", value: "long straight" },
  { label: "Long & Wavy", value: "long wavy" },
  {
    label: "Long & Thick Indian Curls",
    value: "long thick indian curls",
  },
  {
    label: "Straight with Blunt Bangs",
    value: "straight with blunt bangs",
  },
  {
    label: "Hime Cut / Front Layers",
    value: "hime cut front layers straight",
  },
  { label: "Coily / Type 4 Natural", value: "coily type 4 natural" },
  {
    label: "Short Natural / TWA (Teeny Weeny Afro)",
    value: "short natural twa teeny weeny afro",
  },
  {
    label: "Silk Press / Sleek Straight",
    value: "silk press sleek straight voluminous textured hair",
  },
  {
    label: "Voluminous Blowout",
    value: "voluminous blowout styled",
  },
  { label: "Braids / Locs", value: "braids locs" },
  {
    label: "Long Single Braid",
    value: "long single braid",
  },
  {
    label: "Twin Braids",
    value: "twin braids indigenous style",
  },
];

/** @deprecated Use femaleHairStyleOptions */
export const FEMALE_HAIR_STYLES = femaleHairStyleOptions;

export const maleHairStyleOptions: HairStyleOption[] = [
  { label: "Bald / Clean Shaved", value: "bald clean shaved" },
  { label: "Buzz Cut / Fade", value: "buzz cut fade" },
  {
    label: "Short & Straight (Textured Crop)",
    value: "short straight textured crop",
  },
  {
    label: "Two-Block / Undercut",
    value: "two block undercut",
  },
  {
    label: "Textured Comma Hair",
    value: "textured comma hair inward fringe",
  },
  { label: "Short & Wavy", value: "short wavy" },
  {
    label: "Short & Thick Indian Curls",
    value: "short thick indian curls",
  },
  { label: "Medium Length & Straight", value: "medium length straight" },
  {
    label: "Medium Length & Wavy / Thick Curls",
    value: "medium length wavy thick curls",
  },
  { label: "Long & Straight", value: "long straight" },
  { label: "Long & Wavy / Curly", value: "long wavy curly" },
  { label: "Coily / Type 4 Natural", value: "coily type 4 natural" },
  {
    label: "360 Waves",
    value: "360 waves short grooming",
  },
  { label: "Braids / Locs / Cornrows", value: "braids locs cornrows" },
  {
    label: "Long Single Braid",
    value: "long single braid",
  },
];

/** @deprecated Use maleHairStyleOptions */
export const MALE_HAIR_STYLES = maleHairStyleOptions;

export type FacialHairOption = {
  label: string;
  value: string;
};

export const MALE_FACIAL_HAIR: FacialHairOption[] = [
  { label: "Clean-Shaven", value: "Clean-Shaven" },
  { label: "Stubble / 5 O'Clock Shadow", value: "Stubble / 5 O'Clock Shadow" },
  { label: "Short Beard / Trimmed", value: "Short Beard / Trimmed" },
  { label: "Long Beard / Full", value: "Long Beard / Full" },
  {
    label: "Thick Full Beard (Groomed)",
    value:
      "thick full barber-groomed beard, dense MENA beard genetics, sharp lined edges, professionally trimmed",
  },
  { label: "Mustache Only", value: "Mustache Only" },
  {
    label: "Thick Mustache / Handlebar",
    value: "thick, prominent traditional mustache, handlebar style",
  },
];

export const FEMALE_ARCHETYPES = [
  "High Fashion / Editorial",
  "Commercial / Lifestyle",
  "Corporate / Professional",
  "Athleisure / Fitness",
  "Streetwear / Urban",
  "Luxury / Glamour",
  "Bohemian / Earthy",
];

export const MALE_ARCHETYPES = [
  "High Fashion / Editorial",
  "Commercial / Lifestyle",
  "Corporate / Professional",
  "Athleisure / Fitness",
  "Streetwear / Urban",
  "Luxury / Dapper",
  "Rugged / Outdoorsy",
];

export function isMaleGender(gender: string): boolean {
  return gender === MALE_GENDER;
}

export function getBodyTypes(gender: string): string[] {
  return isMaleGender(gender) ? MALE_BODY_TYPES : FEMALE_BODY_TYPES;
}

export function getHairStyles(gender: string): HairStyleOption[] {
  return isMaleGender(gender)
    ? maleHairStyleOptions
    : femaleHairStyleOptions;
}

export function getArchetypes(gender: string): string[] {
  return isMaleGender(gender) ? MALE_ARCHETYPES : FEMALE_ARCHETYPES;
}

export const DEFAULT_ENGINES: FormDataType["engines"] = {
  imagen: true,
  openai: false,
};

export const DEFAULT_FORM_DATA_FEMALE: FormDataType = {
  gender: FEMALE_GENDER,
  ageGroup: "Young Adult (20–29 years)",
  regionEthnicity: "caucasian_white",
  subGroup: "celtic anglo-saxon phenotype",
  skinTone: "type 2 light fair",
  bodyType: "Average / Straight",
  hairStyle: "long wavy",
  hairColor: "dark brown espresso",
  marketingArchetype: "Commercial / Lifestyle",
  engines: DEFAULT_ENGINES,
};

export const DEFAULT_FORM_DATA_MALE: FormDataType = {
  gender: MALE_GENDER,
  ageGroup: "Young Adult (20–29 years)",
  regionEthnicity: "caucasian_white",
  subGroup: "celtic anglo-saxon phenotype",
  skinTone: "type 2 light fair",
  bodyType: "Average / Straight",
  hairStyle: "short straight textured crop",
  hairColor: "dark brown espresso",
  marketingArchetype: "Commercial / Lifestyle",
  facialHair: "Clean-Shaven",
  engines: DEFAULT_ENGINES,
};

export function hasAtLeastOneEngine(engines: FormDataType["engines"]): boolean {
  return engines.imagen || engines.openai;
}

/** Defaults for gender-specific fields when switching gender (keeps age, region, skin). */
export function getGenderSpecificDefaults(gender: string): Pick<
  FormDataType,
  "bodyType" | "hairStyle" | "marketingArchetype" | "facialHair"
> {
  if (isMaleGender(gender)) {
    return {
      bodyType: DEFAULT_FORM_DATA_MALE.bodyType,
      hairStyle: DEFAULT_FORM_DATA_MALE.hairStyle,
      marketingArchetype: DEFAULT_FORM_DATA_MALE.marketingArchetype,
      facialHair: DEFAULT_FORM_DATA_MALE.facialHair,
    };
  }
  return {
    bodyType: DEFAULT_FORM_DATA_FEMALE.bodyType,
    hairStyle: DEFAULT_FORM_DATA_FEMALE.hairStyle,
    marketingArchetype: DEFAULT_FORM_DATA_FEMALE.marketingArchetype,
  };
}

/** Strip male-only fields before sending female profiles to the prompt flow. */
export function toPromptInput(formData: FormDataType): FormDataType {
  const base = isMaleGender(formData.gender)
    ? formData
    : (() => {
        const { facialHair: _removed, ...rest } = formData;
        return rest;
      })();
  return base;
}

/** Traits for configuration tracker (excludes engine flags). */
export function toConfigurationTraits(
  formData: FormDataType
): import("@/hooks/useConfigurationTracker").ConfigurationTraits {
  const { engines: _engines, ...traits } = formData;
  if (!isMaleGender(formData.gender)) {
    const { facialHair: _removed, ...rest } = traits;
    return rest;
  }
  return traits;
}
