// SERVER ONLY — NEVER import this in Client Components ('use client')
import { createClient } from "@supabase/supabase-js";

// Server-only — NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser
// Only use this in Server Components or API routes (server-side only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/** Server-only admin client — service role, bypasses RLS */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
