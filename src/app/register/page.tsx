"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  LiquidGlassBackdrop,
  LiquidMascotOrb,
} from "@/components/auth/LiquidGlassBackdrop";
import { TRIGGER_LOADING_EVENT } from "@/components/SplashScreen";
import type { TakaMood } from "@/components/TakaMascot";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const GOAL_TARGET_PRESETS = {
  Cutting: {
    daily_kcal: 1750,
    daily_protein_g: 135,
    daily_carbs_g: 165,
    daily_fat_g: 52,
  },
  Rekomposisi: {
    daily_kcal: 2200,
    daily_protein_g: 130,
    daily_carbs_g: 250,
    daily_fat_g: 65,
  },
  Bulking: {
    daily_kcal: 2650,
    daily_protein_g: 145,
    daily_carbs_g: 330,
    daily_fat_g: 75,
  },
} as const;

type GoalKey = keyof typeof GOAL_TARGET_PRESETS;

export default function RegisterPage() {
  const router = useRouter();
  const { setDevFallbackSession } = useAuth();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [selectedGoal, setSelectedGoal] =
    React.useState<GoalKey>("Rekomposisi");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [infoMessage, setInfoMessage] = React.useState<string | null>(null);
  const [mascotMood, setMascotMood] = React.useState<TakaMood>("excited");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setLoading(true);
    setMascotMood("thinking");

    try {
      const cleanName = fullName.trim() || "Sobat Takar";
      const cleanEmail = email.trim().toLowerCase();
      const targetPreset = GOAL_TARGET_PRESETS[selectedGoal];
      const supabase = getSupabaseBrowserClient();

      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              goal_mode: selectedGoal,
            },
          },
        });

        if (error) {
          setMascotMood("worried");
          setErrorMessage(
            error.message || "Gagal mendaftarkan akun TAKAR. Coba email lain."
          );
          return;
        }

        if (data.user?.id) {
          localStorage.setItem(
            `takar_target_v2_${data.user.id}`,
            JSON.stringify({
              id: data.user.id,
              user_id: data.user.id,
              ...targetPreset,
            })
          );
        }

        if (data.session?.access_token) {
          await fetch("/api/targets", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify(targetPreset),
          }).catch(() => undefined);

          try {
            sessionStorage.setItem("takar_trigger_welcome_v1", "1");
          } catch {
            // Abaikan error sessionStorage
          }

          setMascotMood("excited");
          window.dispatchEvent(
            new CustomEvent(TRIGGER_LOADING_EVENT, {
              detail: {
                message: "Menyiapkan profil nutrisimu...",
                durationMs: 1250,
              },
            })
          );
          router.replace("/");
          return;
        }

        setMascotMood("happy");
        setInfoMessage(
          "Akun TAKAR berhasil dibuat! Silakan cek kotak masuk emailmu untuk konfirmasi lalu masuk."
        );
        return;
      }

      const devUserId = `dev-${cleanEmail.replace(/[^a-z0-9]/g, "-")}`;
      setDevFallbackSession({
        id: devUserId,
        email: cleanEmail,
        name: cleanName,
      });

      localStorage.setItem(
        `takar_target_v2_${devUserId}`,
        JSON.stringify({
          id: devUserId,
          user_id: devUserId,
          ...targetPreset,
        })
      );

      await fetch("/api/targets", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-takar-dev-user-id": devUserId,
        },
        body: JSON.stringify(targetPreset),
      }).catch(() => undefined);

      try {
        sessionStorage.setItem("takar_trigger_welcome_v1", "1");
      } catch {
        // Abaikan error sessionStorage
      }

      setMascotMood("excited");
      window.dispatchEvent(
        new CustomEvent(TRIGGER_LOADING_EVENT, {
          detail: {
            message: "Menyiapkan profil nutrisimu...",
            durationMs: 1250,
          },
        })
      );
      router.replace("/");
    } catch {
      setMascotMood("worried");
      setErrorMessage("Terjadi kendala saat membuat akun TAKAR.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F0FDF4] via-[#E8FAF0] to-[#DCFCE7] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.75rem))]">
      {/* Elemen Dekoratif Cairan Gel & Tetesan Air 3D */}
      <LiquidGlassBackdrop />

      {/* Kartu Utama Frosted Liquid Glass */}
      <div className="relative z-10 mt-10 w-full max-w-[384px] rounded-[34px] border border-white/90 bg-white/65 px-6 pb-6 pt-16 shadow-[0_24px_60px_rgba(6,95,70,0.11),inset_0_2px_3px_rgba(255,255,255,0.96),inset_0_-1px_2px_rgba(16,185,129,0.12)] ring-1 ring-emerald-950/[0.05] backdrop-blur-2xl">
        <LiquidMascotOrb mood={mascotMood} />

        <div className="text-center">
          <h1 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#0F291E]">
            Daftar Akun TAKAR
          </h1>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-600">
            Mulai kalibrasi target protein &amp; kalori harianmu dengan presisi.
          </p>
        </div>

        <form onSubmit={(e) => void handleRegister(e)} className="mt-5 space-y-3">
          <div className="relative">
            <User
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-emerald-700/70"
              strokeWidth={1.8}
            />
            <input
              id="takar-register-name"
              type="text"
              required
              autoComplete="name"
              aria-label="Nama Panggilan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama Panggilan (Contoh: Budi)"
              className="h-11 w-full rounded-2xl border border-white/90 bg-white/65 pl-11 pr-4 text-[14px] font-medium text-ink shadow-[inset_0_2px_5px_rgba(15,23,42,0.05),0_1px_0_rgba(255,255,255,0.95)] placeholder:text-slate-400 focus:border-emerald-400/80 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
            />
          </div>

          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-emerald-700/70"
              strokeWidth={1.8}
            />
            <input
              id="takar-register-email"
              type="email"
              required
              autoComplete="email"
              aria-label="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Alamat Email"
              className="h-11 w-full rounded-2xl border border-white/90 bg-white/65 pl-11 pr-4 text-[14px] font-medium text-ink shadow-[inset_0_2px_5px_rgba(15,23,42,0.05),0_1px_0_rgba(255,255,255,0.95)] placeholder:text-slate-400 focus:border-emerald-400/80 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
            />
          </div>

          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-emerald-700/70"
              strokeWidth={1.8}
            />
            <input
              id="takar-register-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              aria-label="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata Sandi (Min. 6 karakter)"
              className="h-11 w-full rounded-2xl border border-white/90 bg-white/65 pl-11 pr-11 text-[14px] font-medium text-ink shadow-[inset_0_2px_5px_rgba(15,23,42,0.05),0_1px_0_rgba(255,255,255,0.95)] placeholder:text-slate-400 focus:border-emerald-400/80 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"
              }
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.8} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.8} />
              )}
            </button>
          </div>

          {/* Pilihan Program Awal Bergaya Glass Pill */}
          <div>
            <span className="mb-1.5 block text-center text-[11.5px] font-semibold text-slate-600">
              Program Awal Pilihanmu
            </span>
            <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/80 bg-white/55 p-1 shadow-[inset_0_1px_3px_rgba(15,23,42,0.05)]">
              {(Object.keys(GOAL_TARGET_PRESETS) as GoalKey[]).map(
                (goalKey) => {
                  const active = selectedGoal === goalKey;
                  return (
                    <button
                      key={goalKey}
                      type="button"
                      onClick={() => setSelectedGoal(goalKey)}
                      className={[
                        "h-8 rounded-xl text-[12px] font-bold transition-all",
                        active
                          ? "bg-gradient-to-b from-[#34D399] to-[#059669] text-white shadow-[0_4px_10px_rgba(16,185,129,0.3)]"
                          : "text-slate-600 hover:text-ink",
                      ].join(" ")}
                    >
                      {goalKey}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {errorMessage ? (
            <p className="rounded-2xl border border-amber-300/60 bg-amber-50/90 px-3.5 py-2.5 text-[12.5px] font-medium text-amber-800">
              {errorMessage}
            </p>
          ) : null}

          {infoMessage ? (
            <div className="space-y-2 rounded-2xl border border-emerald-300/60 bg-emerald-50/90 p-3.5 text-[12.5px] font-medium text-emerald-900">
              <p>{infoMessage}</p>
              <Link
                href="/login"
                className="inline-flex h-9 w-full items-center justify-center rounded-full bg-emerald-600 text-[12.5px] font-bold text-white"
              >
                Ke Halaman Masuk TAKAR
              </Link>
            </div>
          ) : null}

          {/* Tombol Pill 3D Glossy Emerald */}
          <div className="pt-1.5">
            <button
              type="submit"
              disabled={loading}
              className="relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-[#34D399] via-[#10B981] to-[#047857] px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.42),inset_0_2px_2px_rgba(255,255,255,0.72),inset_0_-2px_4px_rgba(6,78,59,0.45)] transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-1 h-[40%] rounded-full bg-gradient-to-b from-white/45 to-white/0"
              />
              {loading ? (
                <Loader2 className="relative z-10 h-4 w-4 animate-spin" strokeWidth={2.2} />
              ) : null}
              <span className="relative z-10">Daftar Akun TAKAR</span>
              {!loading ? (
                <ArrowRight className="relative z-10 h-4 w-4" strokeWidth={2.2} />
              ) : null}
            </button>
          </div>
        </form>

        <div className="mt-5 border-t border-emerald-950/[0.08] pt-3.5 text-center">
          <p className="text-[13px] font-medium text-slate-600">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-bold text-[#047857] hover:underline"
            >
              Masuk ke TAKAR
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
