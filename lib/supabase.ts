import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Supabase client for Admin CMS
//
// Uses the service-role key on the server so we can bypass Row Level Security
// for admin operations (approve student, create attendance session, etc.)
// NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser — only use it in
// Server Components or API routes (server-side only).
//
// For client components that only need read access, use the anon key variant.
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Browser-safe client — anon key, respects RLS */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Server-only admin client — service role, bypasses RLS */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
