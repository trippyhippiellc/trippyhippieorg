"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/*
  ForgotPasswordForm — sends a password reset email via Supabase Auth.
*/

export function ForgotPasswordForm() {
  const supabase = createClient();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${siteConfig.url}/account/profile?reset=true` }
    );

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-brand-green/15 flex items-center justify-center mx-auto mb-4">
          <Mail className="h-6 w-6 text-brand-green" />
        </div>
        <h2 className="text-xl font-display font-bold text-brand-cream mb-2">
          Reset link sent
        </h2>
        <p className="text-sm text-brand-cream-muted leading-relaxed mb-6">
          Check <strong className="text-brand-cream">{email}</strong> for a password reset link.
          It expires in 1 hour.
        </p>
        <Link href="/login" className="text-sm text-brand-green hover:underline">
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-display font-bold text-brand-cream mb-1">
          Reset your password
        </h1>
        <p className="text-sm text-brand-cream-muted">
          Enter your email and we&apos;ll send you a reset link.
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
          leftAddon={<Mail className="h-4 w-4" />}
        />

        {error && (
          <div className="p-3 rounded-brand bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">⚠ {error}</p>
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full">
          Send Reset Link
        </Button>
      </form>

      <p className="text-center text-sm text-brand-cream-muted mt-6">
        <Link href="/login" className="text-brand-green hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default ForgotPasswordForm;
