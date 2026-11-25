"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { UserTargetPayload } from "@/schemas/meal-payload.schema";

interface MacroPreset {
  key: "cutting" | "recomp" | "bulking";
  label: string;
  values: UserTargetPayload;
}

const PRESETS: MacroPreset[] = [
  {
    key: "cutting",
    label: "Cutting",
    values: {
      daily_kcal: 1750,
      daily_protein_g: 135,
      daily_carbs_g: 165,
      daily_fat_g: 52,
    },
  },
  {
    key: "recomp",
    label: "Recomp",
    values: {
      daily_kcal: 2200,
      daily_protein_g: 130,
      daily_carbs_g: 250,
      daily_fat_g: 65,
    },
  },
  {
    key: "bulking",
    label: "Bulking",
    values: {
      daily_kcal: 2650,
      daily_protein_g: 145,
      daily_carbs_g: 330,
      daily_fat_g: 75,
    },
  },
];

export interface TargetFormProps {
  initialValues: UserTargetPayload;
  onSave: (values: UserTargetPayload) => Promise<void>;
}

export function TargetForm({ initialValues, onSave }: TargetFormProps) {
  const [values, setValues] = React.useState<UserTargetPayload>(initialValues);
  const [saving, setSaving] = React.useState(false);
  const [savedNotice, setSavedNotice] = React.useState(false);

  React.useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      await onSave(values);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof UserTargetPayload, raw: string) => {
    const parsed = Number.parseInt(raw || "0", 10);
    setValues((prev) => ({
      ...prev,
      [field]: Number.isNaN(parsed) ? 0 : parsed,
    }));
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-4 rounded-3xl bg-surface p-5 shadow-soft"
    >
      {/* Segmented Preset Control */}
      <div>
        <p className="mb-2 text-[12px] font-semibold text-ink-secondary">
          Preset Kebutuhan Fisik
        </p>
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-subtle p-1.5">
          {PRESETS.map((preset) => {
            const isMatch =
              values.daily_kcal === preset.values.daily_kcal &&
              values.daily_protein_g === preset.values.daily_protein_g;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => setValues(preset.values)}
                className={[
                  "h-9 rounded-xl text-[13px] font-semibold transition-all",
                  isMatch
                    ? "bg-emeraldBrand text-white shadow-[0_4px_12px_rgb(27,107,74,0.22)]"
                    : "text-ink-secondary hover:text-ink",
                ].join(" ")}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Tiles Tanpa Spinner Bawaan Browser */}
      <div className="grid grid-cols-2 gap-3">
        <label className="rounded-2xl bg-emeraldBrand-soft/65 p-3.5 transition-shadow focus-within:ring-2 focus-within:ring-emeraldBrand/35">
          <span className="block text-[12px] font-semibold text-emeraldBrand">
            Protein Harian
          </span>
          <div className="mt-1 flex items-baseline justify-between gap-1">
            <input
              type="number"
              inputMode="numeric"
              min={30}
              max={500}
              required
              value={values.daily_protein_g || ""}
              onChange={(e) => updateField("daily_protein_g", e.target.value)}
              className="w-full bg-transparent font-mono text-[22px] font-bold tabular-nums text-emeraldBrand focus:outline-none"
            />
            <span className="font-mono text-[13px] font-semibold text-emeraldBrand/75">
              gram
            </span>
          </div>
        </label>

        <label className="rounded-2xl bg-canvas p-3.5 transition-shadow focus-within:ring-2 focus-within:ring-emeraldBrand/30">
          <span className="block text-[12px] font-semibold text-ink-secondary">
            Batas Kalori
          </span>
          <div className="mt-1 flex items-baseline justify-between gap-1">
            <input
              type="number"
              inputMode="numeric"
              min={800}
              max={8000}
              required
              value={values.daily_kcal || ""}
              onChange={(e) => updateField("daily_kcal", e.target.value)}
              className="w-full bg-transparent font-mono text-[22px] font-bold tabular-nums text-ink focus:outline-none"
            />
            <span className="font-mono text-[13px] font-medium text-ink-secondary">
              kkal
            </span>
          </div>
        </label>

        <label className="rounded-2xl bg-canvas p-3.5 transition-shadow focus-within:ring-2 focus-within:ring-emeraldBrand/30">
          <span className="block text-[12px] font-semibold text-ink-secondary">
            Karbohidrat
          </span>
          <div className="mt-1 flex items-baseline justify-between gap-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={1000}
              required
              value={values.daily_carbs_g || ""}
              onChange={(e) => updateField("daily_carbs_g", e.target.value)}
              className="w-full bg-transparent font-mono text-[20px] font-bold tabular-nums text-ink focus:outline-none"
            />
            <span className="font-mono text-[13px] font-medium text-ink-secondary">
              gram
            </span>
          </div>
        </label>

        <label className="rounded-2xl bg-canvas p-3.5 transition-shadow focus-within:ring-2 focus-within:ring-emeraldBrand/30">
          <span className="block text-[12px] font-semibold text-ink-secondary">
            Lemak
          </span>
          <div className="mt-1 flex items-baseline justify-between gap-1">
            <input
              type="number"
              inputMode="numeric"
              min={10}
              max={400}
              required
              value={values.daily_fat_g || ""}
              onChange={(e) => updateField("daily_fat_g", e.target.value)}
              className="w-full bg-transparent font-mono text-[20px] font-bold tabular-nums text-ink focus:outline-none"
            />
            <span className="font-mono text-[13px] font-medium text-ink-secondary">
              gram
            </span>
          </div>
        </label>
      </div>

      <Button type="submit" variant="primary" size="lg" loading={saving} fullWidth>
        {savedNotice ? (
          <>
            <Check className="h-4 w-4" strokeWidth={2} />
            <span>Target Berhasil Disimpan</span>
          </>
        ) : (
          "Simpan Target Harian"
        )}
      </Button>
    </form>
  );
}
