"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useConfigurationTracker } from "@/hooks/useConfigurationTracker";
import type { ConfigurationTraits } from "@/hooks/useConfigurationTracker";
import { useToast } from "@/hooks/use-toast";
import { getRegionLabel } from "@/lib/constants";

type LegacyModelImporterProps = {
  currentFormTraits: ConfigurationTraits;
};

export function LegacyModelImporter({
  currentFormTraits,
}: LegacyModelImporterProps) {
  const { finalizeAndApproveConfig, importLegacyFromJson } =
    useConfigurationTracker();
  const { toast } = useToast();

  const [manualName, setManualName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const handleForceAdd = () => {
    try {
      finalizeAndApproveConfig(manualName, currentFormTraits);
      setManualName("");
      setConfirmOpen(false);
      toast({
        title: "Legacy model added",
        description:
          "Current sidebar traits were locked into the approval library without generating new images.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Could not add model",
        description: err instanceof Error ? err.message : "Import failed.",
      });
    }
  };

  const handleBulkImport = () => {
    setImportError(null);
    try {
      const result = importLegacyFromJson(jsonInput);
      setJsonInput("");

      const parts = [`${result.imported} imported`, `${result.skipped} skipped`];
      if (result.errors.length > 0) {
        parts.push(`${result.errors.length} invalid`);
      }

      toast({
        title: "Bulk import complete",
        description: parts.join(" · "),
      });

      if (result.errors.length > 0) {
        setImportError(result.errors.slice(0, 5).join("\n"));
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed.");
    }
  };

  return (
    <div className="space-y-8 rounded-xl border bg-card p-6">
      <div>
        <h3 className="text-lg font-bold">Legacy Model Importer</h3>
        <p className="text-xs text-muted-foreground">
          Register already-generated models into the approval library and
          coverage matrix without triggering new API generations.
        </p>
      </div>

      <section className="space-y-4 rounded-lg border p-4">
        <div>
          <h4 className="text-sm font-semibold">Manual Override</h4>
          <p className="text-xs text-muted-foreground">
            Lock the current sidebar traits into the library. No images will be
            generated.
          </p>
        </div>

        <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>
            {currentFormTraits.gender} · {currentFormTraits.ageGroup} ·{" "}
            {getRegionLabel(currentFormTraits.regionEthnicity)} ·{" "}
            {currentFormTraits.subGroup}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="legacy-manual-name">Model Name</Label>
          <Input
            id="legacy-manual-name"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            placeholder="e.g., Legacy Archive - East Asian Teen Female"
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={!manualName.trim()}
          onClick={() => setConfirmOpen(true)}
        >
          Force Add Current
        </Button>
      </section>

      <section className="space-y-4 rounded-lg border p-4">
        <div>
          <h4 className="text-sm font-semibold">Bulk JSON Import</h4>
          <p className="text-xs text-muted-foreground">
            Paste an array of model configurations. Keys are mapped to the
            sidebar schema; duplicates are skipped automatically.
          </p>
        </div>

        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="min-h-32 font-mono text-xs"
          placeholder={`[\n  {\n    "Model Name": "Archive Model A",\n    "Gender": "Female / Woman",\n    "Age Group": "Young Adult (20–29 years)",\n    "regionEthnicity": "east_asian",\n    "subGroup": "japanese phenotype",\n    "Skin Tone": "Type 2: Light or fair",\n    "Body Type": "Average / Straight",\n    "Hair Style": "Straight with Blunt Bangs",\n    "Hair Color": "Jet Black"\n  }\n]`}
        />

        {importError && (
          <p className="whitespace-pre-wrap rounded bg-destructive/10 p-2 text-xs text-destructive">
            {importError}
          </p>
        )}

        <Button
          type="button"
          className="w-full"
          disabled={!jsonInput.trim()}
          onClick={handleBulkImport}
        >
          Import to Matrix
        </Button>
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force add without generation?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to lock the current sidebar traits into the Approval
              Library without generating new images. This entry will immediately
              appear in the approval list and coverage matrix. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceAdd}>
              Confirm & Lock
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
