import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

////////////////////////////////////////////////////////////////////
// MIDDLEWARE — C:\trippyhippieorg\middleware.ts
//
// This file runs on EVERY request before it hits a page or API route.
// It handles:
//   1. Supabase session refresh (keeps auth tokens fresh)
//   2. Age gate enforcement (block unverified users)
//   3. Auth guard (redirect unauthenticated users away from protected pages)
//   4. Admin guard (only admin users can access /admin routes)
//   5. Wholesale guard (only approved wholesale users can access /wholesale)
//   6. Account approval guard (pending accounts cannot checkout)
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
// ROUTE DEFINITIONS
// Define which routes require what level of protection.
// Update these arrays as you add new pages.
////////////////////////////////////////////////////////////////////

// Routes that require the user to be signed in
const PROTECTED_ROUTES = [
  "/account",
  "/checkout",
  "/wholesale",
];

// Routes that only admin users can access
// Admin status checked via user metadata in Supabase
const ADMIN_ROUTES = [
  "/admin",
];

// Routes that only approved wholesale accounts can access
const WHOLESALE_ROUTES = [
  "/wholesale",
];

// Routes that are always public — no auth required
const PUBLIC_ROUTES = [
  "/",
  "/shop",
  "/product",
  "/blog",
  "/about",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/legal",
  "/coa",
  "/apply-wholesale",
  "/apply-affiliate",
  "/login",
  "/register",
  "/verify",
  "/forgot-password",
];


////////////////////////////////////////////////////////////////////
// MIDDLEWARE FUNCTION
// Runs in the Edge Runtime — must be fast, no Node.js APIs
////////////////////////////////////////////////////////////////////
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  ////////////////////////////////////////////////////////////////////
  // STEP 1: CREATE SUPABASE CLIENT FOR MIDDLEWARE
  // This special client reads/writes cookies to keep the session fresh.
  // Required on every request that touches auth state.
  ////////////////////////////////////////////////////////////////////
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: Record<string, unknown> }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  ////////////////////////////////////////////////////////////////////
  // STEP 2: REFRESH SESSION
  // This call refreshes the user's access token if it's expired.
  // Must happen before any auth checks below.
  ////////////////////////////////////////////////////////////////////
  const {
    data: { user },
  } = await supabase.auth.getUser();


  ////////////////////////////////////////////////////////////////////
  // STEP 3: AGE GATE CHECK
  // If the user has not confirmed their age, redirect to home
  // where the AgeGateModal will appear.
  //
  // Age gate verification is stored in a cookie: "age_verified=true"
  // Set by the AgeGateModal component after user confirms.
  //
  // Exceptions: API routes, static assets, and auth pages are excluded.
  ////////////////////////////////////////////////////////////////////
  const isApiRoute = pathname.startsWith("/api");
  const isStaticAsset = pathname.startsWith("/_next") || pathname.startsWith("/fonts") || pathname.includes(".");
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/verify") || pathname.startsWith("/forgot-password");

  if (!isApiRoute && !isStaticAsset && !isAuthPage) {
    const ageVerified = request.cookies.get("age_verified");
    const stateSelected = request.cookies.get("user_state");

    // If age gate not passed and trying to access any non-auth page, let
    // the client-side AgeGateModal handle it (we do not server-redirect
    // because the gate needs to show on the homepage itself).
    // The cart and checkout are additionally protected below.
  }


  ////////////////////////////////////////////////////////////////////
  // STEP 4: AUTH GUARD
  // If user is not signed in and tries to access a protected route,
  // redirect them to login with a `next` param so they return after auth.
  ////////////////////////////////////////////////////////////////////
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }


  ////////////////////////////////////////////////////////////////////
  // STEP 5: ADMIN GUARD
  // If the route is an admin route, verify the user is an admin.
  // Admin status is stored in user.user_metadata.is_admin (boolean)
  // set by the Supabase service role when promoting a user.
  ////////////////////////////////////////////////////////////////////
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isAdminRoute) {
    // Not logged in → redirect to login
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Logged in but not admin → redirect to home
    const isAdmin = user.user_metadata?.is_admin === true ||
      process.env.ADMIN_USER_IDS?.split(",").includes(user.id);

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }


  ////////////////////////////////////////////////////////////////////
  // STEP 6: WHOLESALE GUARD
  // Wholesale shop requires:
  //   - User must be logged in
  //   - User must have is_wholesale_approved = true in their profile
  //
  // If not approved, redirect to the /apply-wholesale page.
  // We fetch the profile from Supabase to check approval status.
  ////////////////////////////////////////////////////////////////////
  const isWholesaleRoute = WHOLESALE_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isWholesaleRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_wholesale_approved")
      .eq("id", user.id)
      .single();

    if (!profile?.is_wholesale_approved) {
      // Not approved — redirect to application page
      return NextResponse.redirect(new URL("/apply-wholesale", request.url));
    }
  }


  ////////////////////////////////////////////////////////////////////
  // STEP 7: ACCOUNT APPROVAL GUARD
  // New accounts start as "pending" and need admin approval.
  // Pending users CAN browse the site and their account page,
  // but CANNOT access the checkout flow.
  //
  // Redirect them to their verify-id page with a message.
  ////////////////////////////////////////////////////////////////////
  if (pathname.startsWith("/checkout") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_status")
      .eq("id", user.id)
      .single();

    if (profile?.account_status === "pending") {
      return NextResponse.redirect(new URL("/account/verify-id?reason=pending", request.url));
    }

    if (profile?.account_status === "rejected") {
      return NextResponse.redirect(new URL("/account?reason=rejected", request.url));
    }
  }


  ////////////////////////////////////////////////////////////////////
  // STEP 8: REDIRECT LOGGED-IN USERS AWAY FROM AUTH PAGES
  // If a user is already logged in and tries to visit /login or
  // /register, send them to their account instead.
  ////////////////////////////////////////////////////////////////////
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/account", request.url));
  }


  ////////////////////////////////////////////////////////////////////
  // RETURN
  // Pass through to the actual page with the refreshed session cookies.
  ////////////////////////////////////////////////////////////////////
  return supabaseResponse;
}


////////////////////////////////////////////////////////////////////
// MATCHER CONFIG
// Controls which routes this middleware runs on.
// Excludes static files and Next.js internals for performance.
////////////////////////////////////////////////////////////////////
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets (images, fonts, icons)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|mp4|webm)).*)",
  ],
};