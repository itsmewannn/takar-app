"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Flame, LogIn, LogOut, UserCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { TargetForm } from "@/components/settings/TargetForm";
import { TkpiExplorerList } from "@/components/settings/TkpiExplorerList";
import { DEFAULT_TKPI_FOODS } from "@/lib/mock-fallback";
import { COOKING_MODIFIERS } from "@/lib/nutrition-engine";
import type { UserTargetPayload } from "@/schemas/meal-payload.schema";
import type { TkpiFood } from "@/types/nutrition.types";

const LOCAL_TARGET_CACHE_KEY = "takar_target_cache_v1";

const DEFAULT_VALUES: UserTargetPayload = {
  daily_kcal: 2200,
  daily_protein_g: 130,
  daily_carbs_g: 250,
  daily_fat_g: 65,
};

export default function SettingsPage() {
  const [targetValues, setTargetValues] =
    React.useState<UserTargetPayload>(DEFAULT_VALUES);
  const [foods, setFoods] = React.useState<TkpiFood[]>(DEFAULT_TKPI_FOODS);
  const [userProfile, setUserProfile] = React.useState<{
    name: string;
    email: string;
  } | null>(null);

  React.useEffect(() => {
    try {
      const profileRaw = localStorage.getItem("takar_user_profile_v1");
      if (profileRaw) {
        setUserProfile(
          JSON.parse(profileRaw) as { name: string; email: string }
        );
      }
      const localRaw = localStorage.getItem(LOCAL_TARGET_CACHE_KEY);
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

    Promise.all([
      fetch("/api/targets").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/foods").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(
        ([targetRes, foodsRes]: [
          { target?: UserTargetPayload; source?: string } | null,
          { foods?: TkpiFood[] } | null,
        ]) => {
          if (!active) return;

          if (targetRes?.target && targetRes.source === "supabase") {
            setTargetValues({
              daily_kcal: Number(targetRes.target.daily_kcal),
              daily_protein_g: Number(targetRes.target.daily_protein_g),
              daily_carbs_g: Number(targetRes.target.daily_carbs_g),
              daily_fat_g: Number(targetRes.target.daily_fat_g),
            });
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
  }, []);

  const handleSaveTarget = async (nextValues: UserTargetPayload) => {
    const res = await fetch("/api/targets", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextValues),
    });

    if (res.ok) {
      const data = (await res.json()) as { target: UserTargetPayload };
      setTargetValues(nextValues);
      try {
        localStorage.setItem(
          LOCAL_TARGET_CACHE_KEY,
          JSON.stringify({ id: "default-user", ...data.target })
        );
      } catch {
        // Abaikan error storage
      }
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas pb-12">
      {/* Top Header */}
      <header className="flex items-center gap-3 px-5 pb-3 pt-5">
        <Link
          href="/"
          aria-label="Kembali ke dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-soft transition-transform active:scale-95"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-ink">
            Target & Tabel TKPI
          </h1>
          <p className="text-[12px] font-medium text-ink-secondary">
            Sesuaikan sasaran harian & referensi gizi per 100g
          </p>
        </div>
      </header>

      <main className="space-y-5 px-5 pt-2">
        {/* Kartu Akun TAKAR */}
        <section className="flex items-center justify-between gap-3 rounded-3xl bg-surface p-4 shadow-soft">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emeraldBrand-soft text-emeraldBrand">
              <UserCheck className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-ink">
                {userProfile ? userProfile.name : "Akun TAKAR"}
              </p>
              <p className="truncate text-[12px] text-ink-secondary">
                {userProfile
                  ? userProfile.email
                  : "Masuk untuk sinkronisasi profil"}
              </p>
            </div>
          </div>

          {userProfile ? (
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("takar_user_profile_v1");
                setUserProfile(null);
                const supabase = getSupabaseBrowserClient();
                if (supabase) {
                  void supabase.auth.signOut();
                }
              }}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-subtle px-3 text-[12px] font-semibold text-ink-secondary hover:text-terracotta"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.8} />
              <span>Keluar</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-emeraldBrand px-3.5 text-[12px] font-semibold text-white transition-colors hover:bg-emeraldBrand-hover"
            >
              <LogIn className="h-3.5 w-3.5" strokeWidth={1.8} />
              <span>Masuk</span>
            </Link>
          )}
        </section>

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
                Tambahan minyak & bumbu per 100g bahan dasar
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
