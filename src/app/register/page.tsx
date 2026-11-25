"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { TakaMascot, type TakaMood } from "@/components/TakaMascot";
import { Button } from "@/components/ui/Button";
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
          router.replace("/");
          return;
        }

        // Jika Supabase mengaktifkan konfirmasi email wajib sebelum sesi diterbitkan
        setMascotMood("happy");
        setInfoMessage(
          "Akun TAKAR berhasil dibuat! Silakan cek kotak masuk emailmu untuk konfirmasi lalu masuk."
        );
        return;
      }

      // Fallback sesi akun lokal terisolasi saat Supabase belum dikonfigurasi
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
      router.replace("/");
    } catch {
      setMascotMood("worried");
      setErrorMessage("Terjadi kendala saat membuat akun TAKAR.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-canvas px-5 py-7">
      {/* Bagian Atas: Maskot & Identitas TAKAR */}
      <div className="mx-auto flex w-full max-w-[380px] flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-surface shadow-soft">
          <TakaMascot mood={mascotMood} size={82} />
        </div>

        <span className="mt-3.5 inline-flex items-center rounded-full bg-emeraldBrand-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emeraldBrand">
          TAKAR • Mulai Sekarang
        </span>

        <h1 className="mt-2 text-[24px] font-extrabold tracking-[-0.02em] text-ink">
          Daftar Akun TAKAR
        </h1>
        <p className="mt-1 max-w-[300px] text-[13.5px] leading-relaxed text-ink-secondary">
          Buat profil pribadimu untuk mulai melacak target protein &amp; makro harian.
        </p>
      </div>

      {/* Form Pendaftaran TAKAR */}
      <form
        onSubmit={(e) => void handleRegister(e)}
        className="mx-auto my-5 w-full max-w-[380px] space-y-3.5 rounded-3xl bg-surface p-6 shadow-soft"
      >
        <div>
          <label
            htmlFor="takar-register-name"
            className="mb-1.5 block text-[12.5px] font-semibold text-ink"
          >
            Nama Panggilan
          </label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
              strokeWidth={1.8}
            />
            <input
              id="takar-register-name"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Budi"
              className="h-11 w-full rounded-2xl bg-canvas pl-10 pr-4 text-[14px] text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-emeraldBrand/35"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="takar-register-email"
            className="mb-1.5 block text-[12.5px] font-semibold text-ink"
          >
            Alamat Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
              strokeWidth={1.8}
            />
            <input
              id="takar-register-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="h-11 w-full rounded-2xl bg-canvas pl-10 pr-4 text-[14px] text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-emeraldBrand/35"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="takar-register-password"
            className="mb-1.5 block text-[12.5px] font-semibold text-ink"
          >
            Kata Sandi
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-secondary"
              strokeWidth={1.8}
            />
            <input
              id="takar-register-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="h-11 w-full rounded-2xl bg-canvas pl-10 pr-11 text-[14px] text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-emeraldBrand/35"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"
              }
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-secondary hover:bg-subtle hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={1.8} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={1.8} />
              )}
            </button>
          </div>
        </div>

        {/* Pilihan Fokus Program Awal */}
        <div>
          <span className="mb-1.5 block text-[12.5px] font-semibold text-ink">
            Fokus Program Nutrisi
          </span>
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-subtle p-1.5">
            {(Object.keys(GOAL_TARGET_PRESETS) as GoalKey[]).map((goalKey) => {
              const active = selectedGoal === goalKey;
              return (
                <button
                  key={goalKey}
                  type="button"
                  onClick={() => setSelectedGoal(goalKey)}
                  className={[
                    "h-9 rounded-xl text-[12.5px] font-semibold transition-all",
                    active
                      ? "bg-emeraldBrand text-white shadow-[0_4px_12px_rgb(27,107,74,0.22)]"
                      : "text-ink-secondary hover:text-ink",
                  ].join(" ")}
                >
                  {goalKey}
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage ? (
          <p className="rounded-2xl bg-warning-bg px-3.5 py-2.5 text-[12.5px] font-medium text-warning">
            {errorMessage}
          </p>
        ) : null}

        {infoMessage ? (
          <div className="space-y-2.5 rounded-2xl bg-emeraldBrand-soft p-3.5 text-[12.5px] font-medium text-emeraldBrand">
            <p>{infoMessage}</p>
            <Link
              href="/login"
              className="inline-flex h-9 w-full items-center justify-center rounded-xl bg-emeraldBrand text-[12.5px] font-semibold text-white"
            >
              Ke Halaman Masuk TAKAR
            </Link>
          </div>
        ) : null}

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            <span>Daftar Akun TAKAR</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </form>

      {/* Footer Navigasi ke Login */}
      <p className="text-center text-[13.5px] text-ink-secondary">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-bold text-emeraldBrand hover:underline"
        >
          Masuk ke TAKAR
        </Link>
      </p>
    </div>
  );
}
