"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Wand2 } from "lucide-react";
import { BatchProcessorInput } from "@/components/BatchProcessorInput";
import type { FormDataType } from "@/lib/types";
import {
  GENDERS,
  AGE_GROUPS,
  regionEthnicityOptions,
  subGroupOptionsMap,
  skinToneOptions,
  hairColorOptions,
  MALE_FACIAL_HAIR,
  getBodyTypes,
  getHairStyles,
  getArchetypes,
  getGenderSpecificDefaults,
  getDefaultSubGroup,
  hasAtLeastOneEngine,
  isMaleGender,
} from "@/lib/constants";

type GeneratorFormProps = {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  onGenerate: () => void;
  isGenerating: boolean;
  onLoadBatch: (jsonString: string) => void;
};

export default function GeneratorForm({
  formData,
  setFormData,
  onGenerate,
  isGenerating,
  onLoadBatch,
}: GeneratorFormProps) {
  const isMale = isMaleGender(formData.gender);
  const bodyTypes = getBodyTypes(formData.gender);
  const hairStyles = getHairStyles(formData.gender);
  const archetypes = getArchetypes(formData.gender);
  const subGroupOptions =
    subGroupOptionsMap[formData.regionEthnicity] ?? [];

  useEffect(() => {
    const options = subGroupOptionsMap[formData.regionEthnicity] ?? [];
    if (options.length === 0) return;
    setFormData((prev) => {
      if (options.some((o) => o.value === prev.subGroup)) return prev;
      return { ...prev, subGroup: options[0].value };
    });
  }, [formData.regionEthnicity, setFormData]);

  const handleSelectChange =
    (field: keyof FormDataType) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleGenderChange = (value: string) => {
    const genderDefaults = getGenderSpecificDefaults(value);
    setFormData((prev) => {
      const next: FormDataType = {
        ...prev,
        gender: value,
        ...genderDefaults,
      };
      if (!isMaleGender(value)) {
        delete next.facialHair;
      }
      return next;
    });
  };

  const handleRegionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      regionEthnicity: value,
      subGroup: getDefaultSubGroup(value),
    }));
  };

  const handleEngineChange = (
    engine: keyof FormDataType["engines"],
    checked: boolean
  ) => {
    setFormData((prev) => {
      const nextEngines = { ...prev.engines, [engine]: checked };
      if (!hasAtLeastOneEngine(nextEngines)) {
        return prev;
      }
      return { ...prev, engines: nextEngines };
    });
  };

  const canGenerate = hasAtLeastOneEngine(formData.engines);
  const onlyImagen =
    formData.engines.imagen && !formData.engines.openai;
  const onlyOpenai =
    formData.engines.openai && !formData.engines.imagen;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Wand2 className="mr-3 text-primary" />
          Kotoor Model AI
        </CardTitle>
        <CardDescription>
          Design and generate your next virtual avatar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <BatchProcessorInput onLoadBatch={onLoadBatch} />

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={handleGenderChange}
            disabled={isGenerating}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="age-group">Age Group</Label>
          <Select
            value={formData.ageGroup}
            onValueChange={handleSelectChange("ageGroup")}
            disabled={isGenerating}
          >
            <SelectTrigger id="age-group">
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              {AGE_GROUPS.map((age) => (
                <SelectItem key={age} value={age}>
                  {age}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="region-ethnicity">Region / Ethnicity</Label>
          <Select
            value={formData.regionEthnicity}
            onValueChange={handleRegionChange}
            disabled={isGenerating}
          >
            <SelectTrigger id="region-ethnicity">
              <SelectValue placeholder="Select region/ethnicity" />
            </SelectTrigger>
            <SelectContent>
              {regionEthnicityOptions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.regionEthnicity && subGroupOptions.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="sub-group">Specific Demographic Sub-Group</Label>
            <Select
              value={formData.subGroup}
              onValueChange={handleSelectChange("subGroup")}
              disabled={isGenerating}
            >
              <SelectTrigger id="sub-group">
                <SelectValue placeholder="Select specific demographic profile..." />
              </SelectTrigger>
              <SelectContent>
                {subGroupOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="skin-tone">Skin Tone (Fitzpatrick Scale)</Label>
          <Select
            value={formData.skinTone}
            onValueChange={handleSelectChange("skinTone")}
            disabled={isGenerating}
          >
            <SelectTrigger id="skin-tone">
              <SelectValue placeholder="Select skin tone" />
            </SelectTrigger>
            <SelectContent>
              {skinToneOptions.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="body-type">Body Type</Label>
          <Select
            value={formData.bodyType}
            onValueChange={handleSelectChange("bodyType")}
            disabled={isGenerating}
          >
            <SelectTrigger id="body-type">
              <SelectValue placeholder="Select body type" />
            </SelectTrigger>
            <SelectContent>
              {bodyTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hair-style">Hair Style</Label>
          <Select
            value={formData.hairStyle}
            onValueChange={handleSelectChange("hairStyle")}
            disabled={isGenerating}
          >
            <SelectTrigger id="hair-style">
              <SelectValue placeholder="Select hair style" />
            </SelectTrigger>
            <SelectContent>
              {hairStyles.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hair-color">Hair Color</Label>
          <Select
            value={formData.hairColor}
            onValueChange={handleSelectChange("hairColor")}
            disabled={isGenerating}
          >
            <SelectTrigger id="hair-color">
              <SelectValue placeholder="Select hair color" />
            </SelectTrigger>
            <SelectContent>
              {hairColorOptions.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  {color.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isMale && (
          <div className="space-y-2">
            <Label htmlFor="facial-hair">Facial Hair</Label>
            <Select
              value={formData.facialHair ?? MALE_FACIAL_HAIR[0].value}
              onValueChange={handleSelectChange("facialHair")}
              disabled={isGenerating}
            >
              <SelectTrigger id="facial-hair">
                <SelectValue placeholder="Select facial hair" />
              </SelectTrigger>
              <SelectContent>
                {MALE_FACIAL_HAIR.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-3 rounded-lg border p-4">
          <Label className="text-base font-semibold">Generation Engine</Label>
          <p className="text-xs text-muted-foreground">
            Select at least one engine. Both run in parallel for side-by-side
            comparison.
          </p>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="engine-imagen"
              checked={formData.engines.imagen}
              disabled={isGenerating || onlyImagen}
              onCheckedChange={(checked) =>
                handleEngineChange("imagen", checked === true)
              }
            />
            <Label
              htmlFor="engine-imagen"
              className="font-normal cursor-pointer"
            >
              Google Imagen 4 Fast
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="engine-openai"
              checked={formData.engines.openai}
              disabled={isGenerating || onlyOpenai}
              onCheckedChange={(checked) =>
                handleEngineChange("openai", checked === true)
              }
            />
            <Label
              htmlFor="engine-openai"
              className="font-normal cursor-pointer"
            >
              OpenAI GPT Image 2
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="archetype">Marketing Archetype (Vibe)</Label>
          <Select
            value={formData.marketingArchetype}
            onValueChange={handleSelectChange("marketingArchetype")}
            disabled={isGenerating}
          >
            <SelectTrigger id="archetype">
              <SelectValue placeholder="Select archetype" />
            </SelectTrigger>
            <SelectContent>
              {archetypes.map((archetype) => (
                <SelectItem key={archetype} value={archetype}>
                  {archetype}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onGenerate}
          disabled={isGenerating || !canGenerate}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          size="lg"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate 3-Angle Turnaround
        </Button>
      </CardContent>
    </Card>
  );
}
