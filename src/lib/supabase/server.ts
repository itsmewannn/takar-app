import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseServerConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && url.startsWith("http") && key && key.length > 10);
}

export function getSupabaseServerClient(
  accessToken?: string
): SupabaseClient | null {
  if (!isSupabaseServerConfigured()) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      ...(accessToken
        ? {
            global: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          }
        : {}),
    }
  );
}

export interface AuthenticatedRequestContext {
  supabase: SupabaseClient | null;
  userId: string;
}

/**
 * Memverifikasi identitas user dari Bearer JWT Supabase (atau header sesi lokal
 * apabila kredensial Supabase belum diisi di environment development).
 */
export async function getAuthenticatedRequestContext(
  request: Request
): Promise<AuthenticatedRequestContext | null> {
  const authHeader = request.headers.get("authorization") ?? "";
  const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (isSupabaseServerConfigured()) {
    if (!bearerToken) {
      return null;
    }

    const supabase = getSupabaseServerClient(bearerToken);
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase.auth.getUser(bearerToken);
    if (error || !data.user?.id) {
      return null;
    }

    return {
      supabase,
      userId: data.user.id,
    };
  }

  // Fallback hanya saat NEXT_PUBLIC_SUPABASE_URL belum diset (dev lokal)
  const devUserId = request.headers.get("x-takar-dev-user-id")?.trim();
  if (!devUserId) {
    return null;
  }

  return {
    supabase: null,
    userId: devUserId,
  };
}
