"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useConfigurationTracker,
  type ConfigurationTraits,
} from "@/hooks/useConfigurationTracker";
import { getRegionLabel } from "@/lib/constants";

type ModelLibraryManagerProps = {
  currentFormTraits: ConfigurationTraits;
};

export function ModelLibraryManager({
  currentFormTraits,
}: ModelLibraryManagerProps) {
  const { savedConfigs, isHydrated, finalizeAndApproveConfig } =
    useConfigurationTracker();
  const [profileName, setProfileName] = useState("");
  const [errorNotification, setErrorNotification] = useState<string | null>(
    null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFormalApproval = (e: FormEvent) => {
    e.preventDefault();
    setErrorNotification(null);
    setSuccessMessage(null);

    try {
      finalizeAndApproveConfig(profileName, currentFormTraits);
      setProfileName("");
      setSuccessMessage("Configuration approved and locked to your library.");
    } catch (err) {
      setErrorNotification(
        err instanceof Error ? err.message : "Approval failed."
      );
    }
  };

  return (
    <div className="space-y-6 rounded-xl border bg-card p-4">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Model Configuration Tracker
        </h3>
        <p className="text-sm text-muted-foreground">
          Name and finalize current traits to approve for production
        </p>
      </div>

      <form onSubmit={handleFormalApproval} className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="profile-name"
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
          >
            Unique Profile Identity Name
          </Label>
          <Input
            id="profile-name"
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="e.g., Autumn Collection Elite Male - South Asian"
            required
          />
        </div>

        {errorNotification && (
          <p className="rounded bg-destructive/10 p-2 text-xs font-medium text-destructive">
            {errorNotification}
          </p>
        )}

        {successMessage && (
          <p className="rounded bg-emerald-500/10 p-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {successMessage}
          </p>
        )}

        <Button type="submit" className="w-full text-xs font-semibold">
          Verify & Issue Formal Approval
        </Button>
      </form>

      <div className="mt-6">
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Approved Model Library ({isHydrated ? savedConfigs.length : "…"})
        </h4>
        <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
          {!isHydrated ? (
            <p className="text-xs text-muted-foreground">Loading library…</p>
          ) : savedConfigs.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No approved configurations yet.
            </p>
          ) : (
            savedConfigs.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border bg-background p-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {item.gender} • {item.ageGroup} •{" "}
                    {getRegionLabel(item.regionEthnicity)} • {item.subGroup}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  {item.approvalStatus}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
