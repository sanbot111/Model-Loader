"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfigurationTracker } from "@/hooks/useConfigurationTracker";
import {
  AGE_GROUPS,
  GENDERS,
  regionEthnicityOptions,
} from "@/lib/constants";
import {
  ALL_REGIONS_COVERAGE_KEY,
  configCoversIntersection,
  countLibraryProfilesForView,
  getCoverageSubGroupRows,
} from "@/lib/config-schema";
import { Check, X } from "lucide-react";

export function CoverageMatrix() {
  const { savedConfigs, isHydrated } = useConfigurationTracker();
  const [selectedRegion, setSelectedRegion] = useState(
    ALL_REGIONS_COVERAGE_KEY
  );
  const [selectedGender, setSelectedGender] = useState(GENDERS[0]);

  const matrixData = useMemo(() => {
    const rows = getCoverageSubGroupRows(selectedRegion);
    let covered = 0;
    const total = rows.length * AGE_GROUPS.length;

    const matrix: Record<string, Record<string, boolean>> = {};

    rows.forEach((row) => {
      matrix[row.id] = {};
      AGE_GROUPS.forEach((age) => {
        const exists = configCoversIntersection(savedConfigs, {
          gender: selectedGender,
          regionKey: row.regionKey,
          subGroupValue: row.subGroupValue,
          ageGroup: age,
        });
        matrix[row.id][age] = exists;
        if (exists) covered += 1;
      });
    });

    const libraryProfilesInView = countLibraryProfilesForView(savedConfigs, {
      regionFilter: selectedRegion,
      gender: selectedGender,
    });

    return { rows, matrix, covered, total, libraryProfilesInView };
  }, [savedConfigs, selectedRegion, selectedGender]);

  const coveragePct =
    matrixData.total > 0
      ? Math.round((matrixData.covered / matrixData.total) * 100)
      : 0;

  return (
    <div className="mt-6 space-y-6 rounded-xl border bg-card p-6">
      <div>
        <h3 className="text-lg font-bold">Demographic Coverage Matrix</h3>
        <p className="text-xs text-muted-foreground">
          Read-only heatmap of approved library coverage by sub-group and age
          group. All axes are sourced from sidebar form constants.
        </p>
        {isHydrated && (
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {matrixData.covered}/{matrixData.total} intersections covered (
            {coveragePct}%) · {matrixData.libraryProfilesInView} of{" "}
            {savedConfigs.length} library profile
            {savedConfigs.length === 1 ? "" : "s"} match this view
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="space-y-2 sm:flex-1">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Region
          </Label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_REGIONS_COVERAGE_KEY}>
                All Subcategories
              </SelectItem>
              {regionEthnicityOptions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:flex-1">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Gender
          </Label>
          <Select value={selectedGender} onValueChange={setSelectedGender}>
            <SelectTrigger>
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
      </div>

      {!isHydrated ? (
        <p className="text-sm text-muted-foreground">Loading library data…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="min-w-[180px] p-2 font-semibold">
                  Sub-Group
                </th>
                {AGE_GROUPS.map((age) => (
                  <th
                    key={age}
                    className="max-w-[100px] truncate p-2 text-center text-xs font-semibold"
                    title={age}
                  >
                    {age.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixData.rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b last:border-0 hover:bg-muted/50"
                >
                  <td className="p-2 text-xs font-medium">{row.label}</td>
                  {AGE_GROUPS.map((age) => {
                    const covered = matrixData.matrix[row.id]?.[age];
                    return (
                      <td key={age} className="p-2 text-center align-middle">
                        {covered ? (
                          <span
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            title="Covered"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                            title="Missing"
                          >
                            <X className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
