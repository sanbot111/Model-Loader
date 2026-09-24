"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type BatchProcessorInputProps = {
  onLoadBatch: (jsonString: string) => void;
};

export function BatchProcessorInput({ onLoadBatch }: BatchProcessorInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    try {
      setError(null);
      onLoadBatch(jsonInput);
      setJsonInput("");
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load batch.");
    }
  };

  return (
    <div className="mb-2">
      <Button
        type="button"
        variant="default"
        className="w-full py-6 text-base font-bold shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Close Batch Processor" : "Batch Process JSON"}
      </Button>

      {isOpen && (
        <div className="mt-4 space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <Label className="text-xs font-semibold uppercase text-primary">
            Paste JSON Array Here
          </Label>
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="min-h-32 font-mono text-xs"
            placeholder={`[\n  {\n    "Model Name": "Simran Kaur",\n    "Gender": "Female / Woman",\n    "Age Group": "Young Adult (20–29 years)",\n    "regionEthnicity": "south_asian",\n    "subGroup": "south asian, north indian phenotype",\n    "skinTone": "type 4 medium brown",\n    "hairStyle": "long wavy",\n    "hairColor": "dark brown espresso",\n    "bodyType": "Average / Straight",\n    "marketingArchetype": "Commercial / Lifestyle"\n  }\n]`}
          />
          {error && (
            <p className="rounded bg-destructive/10 p-2 text-xs font-semibold text-destructive">
              {error}
            </p>
          )}
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleLoad}
            disabled={!jsonInput.trim()}
          >
            Load to Queue
          </Button>
        </div>
      )}
    </div>
  );
}
