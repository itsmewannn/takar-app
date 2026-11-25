"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import {
  getSupabaseBrowserClient,
  isSupabaseClientConfigured,
} from "@/lib/supabase/client";

export interface TakarAuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: TakarAuthUser | null;
  accessToken: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
  getAuthHeaders: () => Record<string, string>;
  signOut: () => Promise<void>;
  setDevFallbackSession: (devUser: TakarAuthUser) => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

const PUBLIC_AUTH_ROUTES = new Set(["/login", "/register"]);
const DEV_FALLBACK_SESSION_KEY = "takar_dev_auth_session_v1";

function mapSupabaseSessionToUser(session: Session): TakarAuthUser {
  const email = session.user.email ?? "";
  const rawName =
    (session.user.user_metadata?.full_name as string | undefined) ||
    email.split("@")[0] ||
    "Sobat Takar";

  return {
    id: session.user.id,
    email,
    name: rawName,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = React.useState<TakarAuthUser | null>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      // Mode development lokal ketika kredensial Supabase belum diisi
      try {
        const raw = localStorage.getItem(DEV_FALLBACK_SESSION_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as TakarAuthUser;
          if (parsed?.id && parsed?.email) {
            setUser(parsed);
            setStatus("authenticated");
            return;
          }
        }
      } catch {
        // Abaikan error localStorage
      }
      setUser(null);
      setStatus("unauthenticated");
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(mapSupabaseSessionToUser(session));
          setAccessToken(session.access_token);
          setStatus("authenticated");
        } else {
          setUser(null);
          setAccessToken(null);
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
        setAccessToken(null);
        setStatus("unauthenticated");
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      if (nextSession?.user) {
        setUser(mapSupabaseSessionToUser(nextSession));
        setAccessToken(nextSession.access_token);
        setStatus("authenticated");
      } else {
        setUser(null);
        setAccessToken(null);
        setStatus("unauthenticated");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isPublicRoute = PUBLIC_AUTH_ROUTES.has(pathname);

  // Strict Route Protection: arahkan ke /login jika belum login, atau ke / jika sudah login di halaman auth
  React.useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" && !isPublicRoute) {
      router.replace("/login");
    } else if (status === "authenticated" && isPublicRoute) {
      router.replace("/");
    }
  }, [status, isPublicRoute, router]);

  const getAuthHeaders = React.useCallback((): Record<string, string> => {
    if (accessToken) {
      return {
        Authorization: `Bearer ${accessToken}`,
      };
    }
    if (!isSupabaseClientConfigured() && user?.id) {
      return {
        "x-takar-dev-user-id": user.id,
      };
    }
    return {};
  }, [accessToken, user?.id]);

  const setDevFallbackSession = React.useCallback((devUser: TakarAuthUser) => {
    try {
      localStorage.setItem(DEV_FALLBACK_SESSION_KEY, JSON.stringify(devUser));
    } catch {
      // Abaikan error storage
    }
    setUser(devUser);
    setStatus("authenticated");
  }, []);

  const signOut = React.useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut().catch(() => undefined);
    }
    try {
      localStorage.removeItem(DEV_FALLBACK_SESSION_KEY);
      sessionStorage.removeItem("takar_active_review_v1");
      sessionStorage.removeItem("takar_trigger_welcome_v1");
    } catch {
      // Abaikan error storage
    }
    setUser(null);
    setAccessToken(null);
    setStatus("unauthenticated");
    router.replace("/login");
  }, [router]);

  const contextValue = React.useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      status,
      getAuthHeaders,
      signOut,
      setDevFallbackSession,
    }),
    [user, accessToken, status, getAuthHeaders, signOut, setDevFallbackSession]
  );

  // Blokir seluruh tampilan dashboard/fitur sebelum sesi terverifikasi
  if (status === "loading") {
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="flex min-h-dvh items-center justify-center bg-canvas" />
      </AuthContext.Provider>
    );
  }

  if (status === "unauthenticated" && !isPublicRoute) {
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="flex min-h-dvh items-center justify-center bg-canvas" />
      </AuthContext.Provider>
    );
  }

  if (status === "authenticated" && isPublicRoute) {
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="flex min-h-dvh items-center justify-center bg-canvas" />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipanggil di dalam <AuthProvider />.");
  }
  return ctx;
}
