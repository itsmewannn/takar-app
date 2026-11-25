"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import {
  BodyScannerCard,
  type BodyScannerSaveInput,
} from "@/components/profile/BodyScannerCard";
import type { UserProfileRow, UserTargetRow } from "@/types/database.types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, getAuthHeaders } = useAuth();
  const [profile, setProfile] = React.useState<UserProfileRow | undefined>(
    undefined
  );

  const userId = user?.id ?? "";
  const profileCacheKey = userId ? `takar_profile_v2_${userId}` : "";
  const targetCacheKey = userId ? `takar_target_v2_${userId}` : "";

  React.useEffect(() => {
    if (!userId) return;

    try {
      const cached = localStorage.getItem(profileCacheKey);
      if (cached) {
        setProfile(JSON.parse(cached) as UserProfileRow);
      }
    } catch {
      // Abaikan error storage
    }

    let active = true;
    fetch("/api/profile", { headers: getAuthHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((res: { profile?: UserProfileRow } | null) => {
        if (!active || !res?.profile) return;
        setProfile(res.profile);
        try {
          localStorage.setItem(profileCacheKey, JSON.stringify(res.profile));
        } catch {
          // Abaikan error storage
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [userId, profileCacheKey, getAuthHeaders]);

  const handleSaveBodyProfile = async (input: BodyScannerSaveInput) => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        ...input,
        display_name: user?.name ?? null,
      }),
    });

    if (!res.ok) return;

    const data = (await res.json()) as {
      profile: UserProfileRow;
      target: Omit<UserTargetRow, "id">;
    };

    setProfile(data.profile);

    if (userId) {
      try {
        localStorage.setItem(profileCacheKey, JSON.stringify(data.profile));
        localStorage.setItem(
          targetCacheKey,
          JSON.stringify({
            id: userId,
            user_id: userId,
            ...data.target,
          })
        );
      } catch {
        // Abaikan error storage
      }
    }

    setTimeout(() => {
      router.push("/");
    }, 650);
  };

  if (!user) return null;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas pb-12">
      <header className="flex items-center gap-3 px-5 pb-3 pt-5">
        <Link
          href="/"
          aria-label="Kembali ke beranda"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink shadow-soft transition-transform active:scale-95"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </Link>
        <div>
          <h1 className="text-[20px] font-bold tracking-[-0.02em] text-ink">
            Profil Tubuh &amp; Scanner
          </h1>
          <p className="text-[12px] font-medium text-ink-secondary">
            Kalibrasi BMI, TDEE, dan target program makanmu
          </p>
        </div>
      </header>

      <main className="px-5 pt-2">
        <BodyScannerCard
          initialProfile={profile}
          onSave={handleSaveBodyProfile}
        />
      </main>
    </div>
  );
}
