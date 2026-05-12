"use client";

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
import { Loader2, Wand2 } from "lucide-react";
import type { FormDataType } from "@/lib/types";
import {
  GENDERS,
  AGE_GROUPS,
  REGIONS,
  SKIN_TONES,
  BODY_TYPES,
  HAIR_STYLES,
  ARCHETYPES,
} from "@/lib/constants";

type GeneratorFormProps = {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  onGenerate: () => void;
  isGenerating: boolean;
};

export default function GeneratorForm({
  formData,
  setFormData,
  onGenerate,
  isGenerating,
}: GeneratorFormProps) {
  const handleSelectChange = (field: keyof FormDataType) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={formData.gender}
            onValueChange={handleSelectChange("gender")}
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
          <Label htmlFor="region-ethnicity">Region/Ethnicity</Label>
          <Select
            value={formData.regionEthnicity}
            onValueChange={handleSelectChange("regionEthnicity")}
            disabled={isGenerating}
          >
            <SelectTrigger id="region-ethnicity">
              <SelectValue placeholder="Select region/ethnicity" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skin-tone">Skin Tone</Label>
          <Select
            value={formData.skinTone}
            onValueChange={handleSelectChange("skinTone")}
            disabled={isGenerating}
          >
            <SelectTrigger id="skin-tone">
              <SelectValue placeholder="Select skin tone" />
            </SelectTrigger>
            <SelectContent>
              {SKIN_TONES.map((tone) => (
                <SelectItem key={tone} value={tone}>
                  {tone}
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
              {BODY_TYPES.map((type) => (
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
              {HAIR_STYLES.map((style) => (
                <SelectItem key={style} value={style}>
                  {style}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {ARCHETYPES.map((archetype) => (
                <SelectItem key={archetype} value={archetype}>
                  {archetype}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onGenerate}
          disabled={isGenerating}
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
