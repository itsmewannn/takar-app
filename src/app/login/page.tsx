"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  LiquidGlassBackdrop,
  LiquidMascotOrb,
} from "@/components/auth/LiquidGlassBackdrop";
import { TRIGGER_LOADING_EVENT } from "@/components/SplashScreen";
import type { TakaMood } from "@/components/TakaMascot";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { setDevFallbackSession } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [mascotMood, setMascotMood] = React.useState<TakaMood>("happy");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    setMascotMood("thinking");

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const supabase = getSupabaseBrowserClient();

      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          setMascotMood("worried");
          setErrorMessage(
            error.message === "Invalid login credentials"
              ? "Email atau kata sandi belum sesuai. Silakan periksa kembali."
              : error.message.toLowerCase().includes("email not confirmed")
                ? "Email belum diverifikasi. Silakan cek kotak masuk emailmu terlebih dahulu."
                : "Gagal masuk ke akun TAKAR. Pastikan email dan kata sandi benar."
          );
          return;
        }
      } else {
        const deterministicDevId = `dev-${trimmedEmail.replace(/[^a-z0-9]/g, "-")}`;
        const fallbackName = trimmedEmail.split("@")[0] || "Sobat Takar";
        setDevFallbackSession({
          id: deterministicDevId,
          email: trimmedEmail,
          name: fallbackName,
        });
      }

      try {
        sessionStorage.setItem("takar_trigger_welcome_v1", "1");
      } catch {
        // Abaikan bila sessionStorage dibatasi
      }

      setMascotMood("excited");
      window.dispatchEvent(
        new CustomEvent(TRIGGER_LOADING_EVENT, {
          detail: {
            message: "Menyiapkan takaran nutrisimu...",
            durationMs: 1250,
          },
        })
      );
      router.replace("/");
    } catch {
      setMascotMood("worried");
      setErrorMessage("Terjadi kendala koneksi. Silakan coba sesaat lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F0FDF4] via-[#E8FAF0] to-[#DCFCE7] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,calc(env(safe-area-inset-top)+1.75rem))]">
      {/* Elemen Dekoratif Cairan Gel & Tetesan Air 3D */}
      <LiquidGlassBackdrop />

      {/* Kartu Utama Frosted Liquid Glass */}
      <div className="relative z-10 mt-10 w-full max-w-[384px] rounded-[34px] border border-white/90 bg-white/65 px-6 pb-7 pt-16 shadow-[0_24px_60px_rgba(6,95,70,0.11),inset_0_2px_3px_rgba(255,255,255,0.96),inset_0_-1px_2px_rgba(16,185,129,0.12)] ring-1 ring-emerald-950/[0.05] backdrop-blur-2xl">
        {/* Orb Kaca 3D Menonjol Setengah Lingkaran dengan Maskot TAKAR */}
        <LiquidMascotOrb mood={mascotMood} />

        {/* Judul & Subjudul */}
        <div className="text-center">
          <h1 className="text-[25px] font-extrabold tracking-[-0.02em] text-[#0F291E]">
            Masuk ke TAKAR
          </h1>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-600">
            Selamat datang kembali! Yuk pantau protein &amp; kalorimu hari ini.
          </p>
        </div>

        {/* Form Input Glass Inset */}
        <form onSubmit={(e) => void handleLogin(e)} className="mt-6 space-y-3.5">
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-emerald-700/70"
              strokeWidth={1.8}
            />
            <input
              id="takar-login-email"
              type="email"
              required
              autoComplete="email"
              aria-label="Alamat Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Alamat Email"
              className="h-12 w-full rounded-2xl border border-white/90 bg-white/65 pl-11 pr-4 text-[14px] font-medium text-ink shadow-[inset_0_2px_5px_rgba(15,23,42,0.05),0_1px_0_rgba(255,255,255,0.95)] placeholder:text-slate-400 focus:border-emerald-400/80 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
            />
          </div>

          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-emerald-700/70"
              strokeWidth={1.8}
            />
            <input
              id="takar-login-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="current-password"
              aria-label="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata Sandi"
              className="h-12 w-full rounded-2xl border border-white/90 bg-white/65 pl-11 pr-11 text-[14px] font-medium text-ink shadow-[inset_0_2px_5px_rgba(15,23,42,0.05),0_1px_0_rgba(255,255,255,0.95)] placeholder:text-slate-400 focus:border-emerald-400/80 focus:bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
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

          {errorMessage ? (
            <p className="rounded-2xl border border-amber-300/60 bg-amber-50/90 px-3.5 py-2.5 text-[12.5px] font-medium text-amber-800">
              {errorMessage}
            </p>
          ) : null}

          {/* Tombol Pill 3D Glossy Emerald */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-[#34D399] via-[#10B981] to-[#047857] px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.42),inset_0_2px_2px_rgba(255,255,255,0.72),inset_0_-2px_4px_rgba(6,78,59,0.45)] transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65"
            >
              {/* Inner Top Specular Highlight */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-5 top-1 h-[40%] rounded-full bg-gradient-to-b from-white/45 to-white/0"
              />
              {loading ? (
                <Loader2 className="relative z-10 h-4 w-4 animate-spin" strokeWidth={2.2} />
              ) : null}
              <span className="relative z-10">Masuk ke TAKAR</span>
              {!loading ? (
                <ArrowRight className="relative z-10 h-4 w-4" strokeWidth={2.2} />
              ) : null}
            </button>
          </div>
        </form>

        {/* Garis Pembatas Halus & Navigasi Daftar */}
        <div className="mt-6 border-t border-emerald-950/[0.08] pt-4 text-center">
          <p className="text-[13px] font-medium text-slate-600">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-bold text-[#047857] hover:underline"
            >
              Daftar Akun TAKAR
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
