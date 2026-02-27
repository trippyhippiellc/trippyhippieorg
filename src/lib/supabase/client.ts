"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

////////////////////////////////////////////////////////////////////
// SUPABASE BROWSER CLIENT — src/lib/supabase/client.ts
//
// This client is used in CLIENT COMPONENTS only (files with "use client").
// It handles auth sessions in the browser using cookies.
//
// Usage:
//   import { createClient } from "@/lib/supabase/client"
//   const supabase = createClient()
//   const { data } = await supabase.from("products").select("*")
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
// CLIENT FACTORY
// Call this inside a component or hook — do not call at module level.
// Each call returns the same singleton in the browser.
////////////////////////////////////////////////////////////////////
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}