import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Public Supabase client using Anon/Publishable Key.
 * Used for public read queries (services, promos, outlets) subject to RLS.
 */
export const supabasePublic: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Creates a scoped Supabase client authenticated as the specific user.
 * Attaches the user's JWT access token to headers so PostgreSQL RLS evaluates auth.uid().
 */
export function createScopedSupabaseClient(token: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

/**
 * Optional: Privileged Supabase client using Service Role Key.
 * Only instantiated if SUPABASE_SERVICE_ROLE_KEY is provided in environment.
 * NEVER exposed to client-facing logic.
 */
export const supabaseAdmin: SupabaseClient | null = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

