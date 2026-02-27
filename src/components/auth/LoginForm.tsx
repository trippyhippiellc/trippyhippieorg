"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";

/*
  LoginForm — email + password sign in via Supabase Auth.
  Redirects to /account on success.
*/

export function LoginForm() {
  const router   = useRouter();
  const supabase = createClient();

  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-display font-bold text-brand-cream mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-brand-cream-muted">
          Sign in to your Trippy Hippie account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type={showPass ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          rightAddon={
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="text-brand-cream-dark hover:text-brand-cream transition-colors"
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {error && (
          <div className="p-3 rounded-brand bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">⚠ {error}</p>
          </div>
        )}

        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-brand-cream-muted hover:text-brand-green transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="w-full"
          leftIcon={<LogIn className="h-4 w-4" />}
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-brand-cream-muted mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand-green hover:underline font-medium">
          Sign up free
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
