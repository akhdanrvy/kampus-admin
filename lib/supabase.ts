import { createBrowserClient } from "@supabase/ssr";

// ---------------------------------------------------------------------------
// Supabase client for Admin CMS (Client-safe)
//
// Uses createBrowserClient from @supabase/ssr so session is stored in cookies,
// allowing the middleware to read and validate the session server-side.
// ---------------------------------------------------------------------------

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
