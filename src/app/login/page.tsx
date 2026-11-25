"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { TakaMascot, type TakaMood } from "@/components/TakaMascot";
import { Button } from "@/components/ui/Button";
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
        // Fallback sesi akun lokal terisolasi bila kredensial Supabase belum diisi di env lokal
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
      router.replace("/");
    } catch {
      setMascotMood("worried");
      setErrorMessage("Terjadi kendala koneksi. Silakan coba sesaat lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-canvas px-5 py-8">
      {/* Bagian Atas: Maskot & Identitas TAKAR */}
      <div className="mx-auto flex w-full max-w-[380px] flex-col items-center pt-3 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-surface shadow-soft">
          <TakaMascot mood={mascotMood} size={82} />
        </div>

        <span className="mt-4 inline-flex items-center rounded-full bg-emeraldBrand-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emeraldBrand">
          TAKAR • Asisten Nutrisi Harian
        </span>

        <h1 className="mt-2.5 text-[24px] font-extrabold tracking-[-0.02em] text-ink">
          Masuk ke TAKAR
        </h1>
        <p className="mt-1.5 max-w-[300px] text-[13.5px] leading-relaxed text-ink-secondary">
          Masuk ke akunmu untuk mengakses riwayat makan dan target protein harian secara aman.
        </p>
      </div>

      {/* Kartu Form Login Wajib (Tanpa Mode Tamu) */}
      <form
        onSubmit={(e) => void handleLogin(e)}
        className="mx-auto my-6 w-full max-w-[380px] space-y-4 rounded-3xl bg-surface p-6 shadow-soft"
      >
        <div>
          <label
            htmlFor="takar-login-email"
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
              id="takar-login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="h-12 w-full rounded-2xl bg-canvas pl-10 pr-4 text-[14px] text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-emeraldBrand/35"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="takar-login-password"
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
              id="takar-login-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              className="h-12 w-full rounded-2xl bg-canvas pl-10 pr-11 text-[14px] text-ink placeholder:text-ink-secondary focus:outline-none focus:ring-2 focus:ring-emeraldBrand/35"
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

        {errorMessage ? (
          <p className="rounded-2xl bg-warning-bg px-3.5 py-2.5 text-[12.5px] font-medium text-warning">
            {errorMessage}
          </p>
        ) : null}

        <div className="pt-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            <span>Masuk ke TAKAR</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </form>

      {/* Footer Navigasi ke Register */}
      <p className="text-center text-[13.5px] text-ink-secondary">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-bold text-emeraldBrand hover:underline"
        >
          Daftar Akun TAKAR
        </Link>
      </p>
    </div>
  );
}
