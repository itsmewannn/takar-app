"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Plus, Ruler } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { DetectedFoodRow } from "@/components/review/DetectedFoodRow";
import { ManualFoodDrawer } from "@/components/review/ManualFoodDrawer";
import { StickyMacroBar } from "@/components/review/StickyMacroBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  REVIEW_SESSION_STORAGE_KEY,
  useMealCalculator,
  type StoredReviewSession,
} from "@/hooks/useMealCalculator";
import type { MealLogWithItems } from "@/types/database.types";
import type { MealType, ReferenceObjectType } from "@/types/nutrition.types";

const MEAL_TYPE_OPTIONS: Array<{ value: MealType; label: string }> = [
  { value: "sarapan", label: "Sarapan" },
  { value: "makan_siang", label: "Makan Siang" },
  { value: "makan_malam", label: "Makan Malam" },
  { value: "camilan", label: "Camilan" },
];

function calibrationLabel(
  calibrated: boolean,
  objectType: ReferenceObjectType
): string {
  if (!calibrated) return "Estimasi Standar";
  if (objectType === "sendok") return "Terkalibrasi (Sendok)";
  if (objectType === "piring") return "Terkalibrasi (Tepi Piring)";
  if (objectType === "keduanya") return "Terkalibrasi (Sendok & Piring)";
  return "Terkalibrasi";
}

function ReviewMealContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isManualMode = searchParams.get("mode") === "manual";
  const { user, getAuthHeaders } = useAuth();

  const {
    items,
    summary,
    mealType,
    setMealType,
    imageUrl,
    referenceCalibrated,
    referenceObjectType,
    source,
    hydrateSession,
    updatePortionQty,
    updateCookingMethod,
    removeItem,
    addManualFood,
  } = useMealCalculator();

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isManualMode) {
      setDrawerOpen(true);
      return;
    }

    try {
      const raw = sessionStorage.getItem(REVIEW_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredReviewSession;
        hydrateSession(parsed);
      }
    } catch {
      // Abaikan jika sessionStorage kosong
    }
  }, [hydrateSession, isManualMode]);

  const handleSaveLog = async () => {
    if (items.length === 0) return;
    setSaving(true);
    setSaveError(null);

    try {
      const payload = {
        meal_type: mealType,
        image_url: imageUrl,
        reference_calibrated: referenceCalibrated,
        total_kcal: summary.kcal,
        total_protein_g: summary.protein_g,
        total_carbs_g: summary.carbs_g,
        total_fat_g: summary.fat_g,
        items: items.map((item) => ({
          tkpi_food_id: item.tkpi_food_id,
          display_name: item.display_name,
          cooking_method: item.cooking_method,
          grams: item.grams,
          kcal: item.total_macro.kcal,
          protein_g: item.total_macro.protein_g,
          carbs_g: item.total_macro.carbs_g,
          fat_g: item.total_macro.fat_g,
          hidden_kcal: item.hidden_kcal,
        })),
      };

      const res = await fetch("/api/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan catatan makan. Silakan coba lagi.");
      }

      const data = (await res.json()) as { meal: MealLogWithItems };

      try {
        if (user?.id) {
          const userMealsKey = `takar_meals_v2_${user.id}`;
          const existingRaw = localStorage.getItem(userMealsKey);
          const existingList = existingRaw
            ? (JSON.parse(existingRaw) as MealLogWithItems[])
            : [];
          const updatedList = [
            data.meal,
            ...existingList.filter((m) => m.id !== data.meal.id),
          ];
          localStorage.setItem(userMealsKey, JSON.stringify(updatedList));
        }
        sessionStorage.removeItem(REVIEW_SESSION_STORAGE_KEY);
      } catch {
        // Abaikan jika melebihi kuota storage lokal
      }

      router.push("/");
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : "Terjadi kendala saat menyimpan log makan."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas pb-32">
      {/* Top Header */}
      <header className="flex items-center justify-between px-5 pb-2 pt-[max(1.25rem,calc(env(safe-area-inset-top)+0.5rem))]">
        <div className="flex items-center gap-3">
          <Link
            href={isManualMode ? "/" : "/scan"}
            aria-label="Kembali"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-soft transition-transform active:scale-95"
          >
            <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </Link>
          <div>
            <h1 className="text-[18px] font-bold tracking-[-0.01em] text-ink">
              {isManualMode ? "Catat Manual" : "Review Piring"}
            </h1>
            <p className="text-[12px] font-medium text-ink-secondary">
              Ketuk porsi untuk kalibrasi instan
            </p>
          </div>
        </div>

        <select
          aria-label="Waktu makan"
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className="h-9 rounded-full bg-surface px-3.5 text-[12px] font-semibold text-ink shadow-soft focus:outline-none focus:ring-2 focus:ring-emeraldBrand/30"
        >
          {MEAL_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </header>

      {/* Preview Foto Piring */}
      {imageUrl ? (
        <div className="px-5 pt-2">
          <div className="relative overflow-hidden rounded-3xl bg-surface p-2 shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Foto makanan yang dianalisis"
              className="aspect-video w-full rounded-2xl object-cover"
            />
            <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-1.5">
              <Badge
                variant={referenceCalibrated ? "calibrated" : "dark"}
              >
                <Ruler className="h-3 w-3" strokeWidth={1.8} />
                <span>
                  {calibrationLabel(referenceCalibrated, referenceObjectType)}
                </span>
              </Badge>

              {source === "mock_fallback" ? (
                <Badge variant="dark">Mode Simulasi</Badge>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* Sticky Real-Time Macro Summary Card (<16ms client update) */}
      <StickyMacroBar summary={summary} itemCount={items.length} />

      {/* Daftar Lauk */}
      <main className="flex-1 space-y-3.5 px-5 pt-1">
        {items.length === 0 ? (
          <div className="rounded-3xl bg-surface p-3 shadow-soft">
            <EmptyState
              title="Belum ada lauk di piring ini"
              description="Tambahkan lauk dari database TKPI lokal untuk menghitung protein dan kalori secara akurat."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                >
                  <Plus className="h-4 w-4" strokeWidth={1.8} />
                  <span>Pilih Lauk TKPI</span>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <DetectedFoodRow
                key={item.client_id}
                item={item}
                onChangeUnitQty={updatePortionQty}
                onChangeCookingMethod={updateCookingMethod}
                onRemove={removeItem}
              />
            ))}
          </div>
        )}

        <Button
          variant="charcoal"
          fullWidth
          onClick={() => setDrawerOpen(true)}
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          <span>Tambah Lauk Manual</span>
        </Button>

        {saveError ? (
          <p className="rounded-2xl bg-warning-bg px-4 py-3 text-[12px] font-medium text-warning">
            {saveError}
          </p>
        ) : null}
      </main>

      {/* Bottom Save Sheet */}
      <footer className="fixed bottom-0 left-1/2 z-30 w-full max-w-[460px] -translate-x-1/2 rounded-t-3xl bg-surface/95 px-5 py-3.5 shadow-sheet backdrop-blur-sm">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={items.length === 0}
          loading={saving}
          onClick={() => void handleSaveLog()}
        >
          <Check className="h-4 w-4" strokeWidth={2} />
          <span>Simpan ke Log Hari Ini</span>
        </Button>
      </footer>

      <ManualFoodDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAddFood={(food, method) => addManualFood(food, method, 1)}
      />
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-canvas p-5 text-[14px] font-medium text-ink-secondary">
          Memuat rincian takaran...
        </div>
      }
    >
      <ReviewMealContent />
    </Suspense>
  );
}
