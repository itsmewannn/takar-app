"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Flame, LogOut, ScanLine, UserCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { TargetForm } from "@/components/settings/TargetForm";
import { TkpiExplorerList } from "@/components/settings/TkpiExplorerList";
import { DEFAULT_TKPI_FOODS } from "@/lib/mock-fallback";
import { COOKING_MODIFIERS } from "@/lib/nutrition-engine";
import type { UserTargetPayload } from "@/schemas/meal-payload.schema";
import type { TkpiFood } from "@/types/nutrition.types";

const DEFAULT_VALUES: UserTargetPayload = {
  daily_kcal: 2200,
  daily_protein_g: 130,
  daily_carbs_g: 250,
  daily_fat_g: 65,
};

export default function SettingsPage() {
  const { user, getAuthHeaders, signOut } = useAuth();

  const [targetValues, setTargetValues] =
    React.useState<UserTargetPayload>(DEFAULT_VALUES);
  const [foods, setFoods] = React.useState<TkpiFood[]>(DEFAULT_TKPI_FOODS);

  const userId = user?.id ?? "";
  const targetCacheKey = userId ? `takar_target_v2_${userId}` : "";

  React.useEffect(() => {
    if (!userId) return;

    try {
      const localRaw = localStorage.getItem(targetCacheKey);
      if (localRaw) {
        const parsed = JSON.parse(localRaw) as UserTargetPayload;
        setTargetValues({
          daily_kcal: parsed.daily_kcal,
          daily_protein_g: parsed.daily_protein_g,
          daily_carbs_g: parsed.daily_carbs_g,
          daily_fat_g: parsed.daily_fat_g,
        });
      }
    } catch {
      // Abaikan bila localStorage tidak aktif
    }

    let active = true;
    const headers = getAuthHeaders();

    Promise.all([
      fetch("/api/targets", { headers }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/foods").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(
        ([targetRes, foodsRes]: [
          { target?: UserTargetPayload; source?: string } | null,
          { foods?: TkpiFood[] } | null,
        ]) => {
          if (!active) return;

          if (targetRes?.target && targetRes.source === "supabase") {
            const synced: UserTargetPayload = {
              daily_kcal: Number(targetRes.target.daily_kcal),
              daily_protein_g: Number(targetRes.target.daily_protein_g),
              daily_carbs_g: Number(targetRes.target.daily_carbs_g),
              daily_fat_g: Number(targetRes.target.daily_fat_g),
            };
            setTargetValues(synced);
            localStorage.setItem(
              targetCacheKey,
              JSON.stringify({ id: userId, user_id: userId, ...synced })
            );
          }

          if (foodsRes?.foods && foodsRes.foods.length > 0) {
            setFoods(foodsRes.foods);
          }
        }
      )
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [userId, targetCacheKey, getAuthHeaders]);

  const handleSaveTarget = async (nextValues: UserTargetPayload) => {
    const res = await fetch("/api/targets", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(nextValues),
    });

    if (res.ok) {
      const data = (await res.json()) as { target: UserTargetPayload };
      setTargetValues(nextValues);
      if (targetCacheKey) {
        try {
          localStorage.setItem(
            targetCacheKey,
            JSON.stringify({ id: userId, user_id: userId, ...data.target })
          );
        } catch {
          // Abaikan error storage
        }
      }
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas pb-12">
      {/* Top Header */}
      <header className="flex items-center gap-3 px-5 pb-3 pt-[max(1.25rem,calc(env(safe-area-inset-top)+0.5rem))]">
        <Link
          href="/"
          aria-label="Kembali ke dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-soft transition-transform active:scale-95"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-ink">
            Target &amp; Tabel TKPI
          </h1>
          <p className="text-[12px] font-medium text-ink-secondary">
            Sesuaikan sasaran harian &amp; kelola akun TAKAR
          </p>
        </div>
      </header>

      <main className="space-y-5 px-5 pt-2">
        {/* Kartu Akun TAKAR & Tombol Logout */}
        <section className="flex items-center justify-between gap-3 rounded-3xl bg-surface p-4 shadow-soft">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emeraldBrand-soft text-emeraldBrand">
              <UserCheck className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-ink">
                {user.name}
              </p>
              <p className="truncate text-[12px] text-ink-secondary">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-2xl bg-terracotta-soft px-3.5 text-[12.5px] font-semibold text-terracotta transition-colors hover:bg-terracotta hover:text-white"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
            <span>Keluar Akun</span>
          </button>
        </section>

        {/* Pintasan ke 3D Body Scanner & Profil Tubuh */}
        <Link
          href="/profile"
          className="flex items-center justify-between gap-3 rounded-3xl bg-[#0B1220] p-4 text-white shadow-soft transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/30">
              <ScanLine className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-white">
                Buka 3D Body Scanner &amp; Program
              </p>
              <p className="text-[12px] text-slate-300">
                Kalibrasi ulang BB, TB, BMI &amp; rumus Mifflin-St Jeor
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-cyan-300" strokeWidth={1.8} />
        </Link>

        {/* Form Target Makro */}
        <section className="space-y-2.5">
          <TargetForm
            initialValues={targetValues}
            onSave={handleSaveTarget}
          />
        </section>

        {/* Acuan Kalori Minyak & Cara Masak */}
        <section className="rounded-3xl bg-surface p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta-soft text-terracotta">
              <Flame className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-ink">
                Pengali Cara Masak
              </h2>
              <p className="text-[12px] text-ink-secondary">
                Tambahan minyak &amp; bumbu per 100g bahan dasar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.values(COOKING_MODIFIERS).map((mod) => (
              <div
                key={mod.method_key}
                className="flex items-center justify-between rounded-2xl bg-canvas px-3 py-2.5"
              >
                <span className="text-[12px] font-semibold text-ink">
                  {mod.label}
                </span>
                <span
                  className={[
                    "font-mono text-[11px] font-bold tabular-nums",
                    mod.extra_kcal_per_100g === 0
                      ? "text-emeraldBrand"
                      : "text-terracotta",
                  ].join(" ")}
                >
                  +{mod.extra_kcal_per_100g} kkal
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Explorer Database TKPI */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[16px] font-bold text-ink">
              Database Makanan TKPI
            </h2>
            <span className="rounded-full bg-emeraldBrand-soft px-2.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-emeraldBrand">
              {foods.length} item
            </span>
          </div>
          <TkpiExplorerList foods={foods} />
        </section>
      </main>
    </div>
  );
}
