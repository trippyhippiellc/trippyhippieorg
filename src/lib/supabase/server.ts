import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

////////////////////////////////////////////////////////////////////
// SUPABASE SERVER CLIENT — src/lib/supabase/server.ts
//
// This client is used in SERVER COMPONENTS and API ROUTES (Route Handlers).
// It reads auth cookies from the incoming request to verify the user.
//
// Usage in a Server Component:
//   import { createClient } from "@/lib/supabase/server"
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
//
// Usage in an API Route (app/api/.../route.ts):
//   import { createClient } from "@/lib/supabase/server"
//   export async function GET() {
//     const supabase = await createClient()
//     ...
//   }
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
// SERVER CLIENT FACTORY
// Async because it awaits the Next.js cookie store.
// This is safe to call multiple times in the same request —
// Next.js de-duplicates the cookies() call.
////////////////////////////////////////////////////////////////////
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        ////////////////////////////////////////////////////////////////////
        // COOKIE HANDLERS
        // Supabase SSR needs to read and write auth cookies.
        // getAll returns all cookies; setAll writes them back.
        ////////////////////////////////////////////////////////////////////
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can throw in Server Components where headers are read-only.
            // This is safe to ignore — the middleware handles session refresh.
          }
        },
      },
    }
  );
}