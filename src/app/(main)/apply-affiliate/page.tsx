"use client";

import { useState } from "react";
import { Star, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Link from "next/link";

/* src/app/(main)/apply-affiliate/page.tsx */

const PLATFORMS       = ["Instagram","TikTok","YouTube","Twitter/X","Facebook","Blog/Website","Other"];
const FOLLOWER_RANGES = ["Under 1,000","1,000–10,000","10,000–50,000","50,000–100,000","100,000+"];
const CONTENT_TYPES   = ["Lifestyle","Cannabis/Hemp","Health & Wellness","Reviews","Comedy","Education","Other"];

export default function ApplyAffiliatePage() {
  const { user } = useAuth();
  const [fullName,      setFullName]      = useState("");
  const [platform,      setPlatform]      = useState("");
  const [handle,        setHandle]        = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [contentType,   setContentType]   = useState("");
  const [promotionPlan, setPromotionPlan] = useState("");
  const [agreedTerms,   setAgreedTerms]   = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [error,         setError]         = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!agreedTerms) { setError("You must agree to the affiliate terms."); return; }
    setLoading(true);
    setError("");

    const client = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (client.from("affiliate_applications") as any).insert({
      user_id:         user.id,
      full_name:       fullName,
      platform,
      handle,
      follower_count:  followerCount,
      content_type:    contentType,
      promotion_plan:  promotionPlan,
      agreed_to_terms: agreedTerms,
    });

    if (dbError) { setError(dbError.message); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="container-brand section-padding max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-amber-400" />
        </div>
        <h1 className="text-3xl font-display font-bold text-brand-cream mb-3">Application Received!</h1>
        <p className="text-brand-cream-muted mb-8">We&apos;ll review within 3–5 days and email <strong className="text-brand-cream">{user?.email}</strong>.</p>
        <Link href="/shop"><Button variant="primary" size="lg">Continue Shopping</Button></Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-brand section-padding max-w-lg mx-auto text-center">
        <h1 className="text-3xl font-display font-bold text-brand-cream mb-4">Affiliate Program</h1>
        <p className="text-brand-cream-muted mb-8">Sign in to apply and earn 10% commission.</p>
        <Link href="/login"><Button variant="primary" size="lg">Sign In to Apply</Button></Link>
      </div>
    );
  }

  return (
    <div className="container-brand section-padding max-w-2xl mx-auto">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-amber-400 text-sm font-semibold mb-3"><Star className="h-4 w-4" />AFFILIATE PROGRAM</div>
        <h1 className="text-4xl font-display font-bold text-brand-cream mb-3">Earn 10% Commission</h1>
        <p className="text-brand-cream-muted text-lg">Share your unique code. Get paid on every order you refer.</p>
      </div>

      <div className="glass-card border border-amber-500/15 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Smith" required />
            <Select label="Primary Platform" value={platform} onChange={e => setPlatform(e.target.value)} placeholder="Select…" required>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Handle / Username" value={handle} onChange={e => setHandle(e.target.value)} placeholder="@yourhandle" required />
            <Select label="Follower Count" value={followerCount} onChange={e => setFollowerCount(e.target.value)} placeholder="Select…" required>
              {FOLLOWER_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
          </div>
          <Select label="Content Type" value={contentType} onChange={e => setContentType(e.target.value)} placeholder="Select…" required>
            {CONTENT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-cream-muted">How will you promote us? <span className="text-red-400">*</span></label>
            <textarea value={promotionPlan} onChange={e => setPromotionPlan(e.target.value)} rows={4} required placeholder="Describe your audience and promotion plan…" className="w-full px-3 py-2.5 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream placeholder:text-brand-cream-dark focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 resize-none" />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} className="mt-1 accent-brand-green" />
            <span className="text-sm text-brand-cream-muted">I agree to the <Link href="/terms" className="text-brand-green underline" target="_blank">Affiliate Terms</Link>. 10% commission, $50 minimum payout.</span>
          </label>
          {error && <div className="p-3 rounded-brand bg-red-500/10 border border-red-500/20"><p className="text-sm text-red-400">⚠ {error}</p></div>}
          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full">Submit Application</Button>
        </form>
      </div>
    </div>
  );
}
