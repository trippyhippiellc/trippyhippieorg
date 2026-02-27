import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

////////////////////////////////////////////////////////////////////
// SUPABASE ADMIN CLIENT — src/lib/supabase/admin.ts
//
// This client uses the SERVICE ROLE KEY which bypasses ALL Row Level
// Security (RLS) policies. This means it can read and write any data.
//
// SECURITY RULES — READ CAREFULLY:
//   ✅ Use ONLY in server-side API routes (/app/api/...)
//   ✅ Use for admin operations: approving users, updating any order, etc.
//   ❌ NEVER import this in a Client Component ("use client" files)
//   ❌ NEVER expose the service role key to the browser
//   ❌ NEVER use this for regular user operations
//
// Usage in an API Route:
//   import { adminClient } from "@/lib/supabase/admin"
//   const { data } = await adminClient.from("profiles").update({ is_approved: true })
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
// SINGLETON PATTERN
// We create one admin client and reuse it across requests.
// This avoids creating a new connection on every API call.
////////////////////////////////////////////////////////////////////
let adminClientInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getAdminClient(): ReturnType<typeof createClient<Database>> {
  if (!adminClientInstance) {
    ////////////////////////////////////////////////////////////////////
    // VALIDATION
    // Crash immediately if the service role key is missing.
    // Better to crash loudly at startup than silently skip RLS.
    ////////////////////////////////////////////////////////////////////
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    }

    adminClientInstance = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          ////////////////////////////////////////////////////////////////////
          // AUTH OPTIONS FOR SERVICE ROLE
          // autoRefreshToken: false — service role tokens don't expire
          // persistSession: false — don't store session in cookies/localStorage
          // detectSessionInUrl: false — no OAuth redirect handling needed
          ////////////////////////////////////////////////////////////////////
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );
  }

  return adminClientInstance;
}

// Named export for convenience
export const adminClient = getAdminClient();