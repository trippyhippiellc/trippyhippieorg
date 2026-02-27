"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckCircle } from "lucide-react";

/* src/app/(main)/account/profile/page.tsx
 *
 * NOTE ON TYPES: The .update() payload is cast to `any` because the hand-written
 * supabase.ts types have structural issues. Run:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
 * to generate accurate types and remove the casts.
 */

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [fullName,  setFullName]  = useState(profile?.full_name ?? "");
  const [phone,     setPhone]     = useState(profile?.phone ?? "");
  const [loading,   setLoading]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSent,    setPwSent]    = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");

    const client = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbErr } = await (client.from("profiles") as any)
      .update({ full_name: fullName || null, phone: phone || null })
      .eq("id", user.id);

    if (dbErr) setError(dbErr.message);
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setLoading(false);
  }

  async function sendPasswordReset() {
    if (!user?.email) return;
    setPwLoading(true);
    const client = createClient();
    await client.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/account/profile?reset=true`,
    });
    setPwSent(true);
    setPwLoading(false);
  }

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="text-2xl font-display font-bold text-brand-cream">Profile Settings</h1>

      <div className="glass-card border border-brand-green/10 p-6 rounded-card">
        <h2 className="text-lg font-semibold text-brand-cream mb-5">Personal Info</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" />
          <Input label="Email" value={user?.email ?? ""} disabled helperText="Email cannot be changed" />
          <Input label="Phone (optional)" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
          {error && <p className="text-sm text-red-400">⚠ {error}</p>}
          <Button type="submit" variant="primary" isLoading={loading} leftIcon={saved ? <CheckCircle className="h-4 w-4" /> : undefined}>
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </form>
      </div>

      <div className="glass-card border border-white/5 p-6 rounded-card">
        <h2 className="text-lg font-semibold text-brand-cream mb-2">Password</h2>
        <p className="text-sm text-brand-cream-muted mb-5">We&apos;ll send a secure reset link to your email address.</p>
        {pwSent ? (
          <p className="text-sm text-brand-green flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> Reset link sent to {user?.email}
          </p>
        ) : (
          <Button variant="secondary" onClick={sendPasswordReset} isLoading={pwLoading}>
            Send Password Reset Email
          </Button>
        )}
      </div>
    </div>
  );
}
