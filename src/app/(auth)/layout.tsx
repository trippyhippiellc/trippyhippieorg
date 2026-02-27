import { Leaf } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

/*
  (auth)/layout.tsx — wraps all auth pages (login, register, forgot password).
  Centered card layout with brand mark. No navbar or footer.
*/

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "radial-gradient(ellipse at top, #1A2E1A 0%, #0D1F0D 60%)" }}
    >
      {/* Brand mark */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <Leaf className="h-7 w-7 text-brand-green group-hover:scale-110 transition-transform" />
        <span className="font-display font-bold text-xl text-brand-cream tracking-wide">
          Trippy Hippie
        </span>
      </Link>

      {/* Auth card */}
      <div className="w-full max-w-md glass-card border border-brand-green/15 p-8">
        {children}
      </div>

      <p className="text-xs text-brand-cream-dark mt-6 text-center">
        © {new Date().getFullYear()} Trippy Hippie Wholesale LLC
      </p>
    </div>
  );
}
