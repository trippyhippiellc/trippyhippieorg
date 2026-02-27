"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Link from "next/link";

/* src/app/(main)/apply-wholesale/page.tsx */

const BUSINESS_TYPES = ["LLC","Corporation","Sole Proprietorship","Partnership","Non-Profit","Other"];
const VOLUME_OPTIONS = ["Under $1,000/mo","$1,000–$5,000/mo","$5,000–$10,000/mo","$10,000–$25,000/mo","$25,000+/mo"];
const YEARS_OPTIONS  = ["Less than 1 year","1–2 years","3–5 years","5–10 years","10+ years"];

export default function ApplyWholesalePage() {
  const router   = useRouter();
  const { user } = useAuth();
  const [businessName,  setBusinessName]  = useState("");
  const [businessType,  setBusinessType]  = useState("");
  const [einNumber,     setEinNumber]     = useState("");
  const [monthlyVolume, setMonthlyVolume] = useState("");
  const [yearsInBiz,    setYearsInBiz]    = useState("");
  const [websiteUrl,    setWebsiteUrl]    = useState("");
  const [refs,          setRefs]          = useState("");
  const [reason,        setReason]        = useState("");
  const [loading,       setLoading]       = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [error,         setError]         = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    setLoading(true);
    setError("");

    const client = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (client.from("wholesale_applications") as any).insert({
      user_id:                  user.id,
      business_name:            businessName,
      business_type:            businessType,
      ein_number:               einNumber   || null,
      estimated_monthly_volume: monthlyVolume,
      years_in_business:        yearsInBiz,
      website_url:              websiteUrl  || null,
      business_references:      refs        || null,
      reason,
    });

    if (dbError) { setError(dbError.message); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="container-brand section-padding max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-brand-green/15 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-brand-green" />
        </div>
        <h1 className="text-3xl font-display font-bold text-brand-cream mb-3">Application Submitted</h1>
        <p className="text-brand-cream-muted mb-8">We review applications within 1–3 business days and will email <strong className="text-brand-cream">{user?.email}</strong>.</p>
        <Link href="/shop"><Button variant="primary" size="lg">Continue Shopping</Button></Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-brand section-padding max-w-lg mx-auto text-center">
        <h1 className="text-3xl font-display font-bold text-brand-cream mb-4">Wholesale Application</h1>
        <p className="text-brand-cream-muted mb-8">You must be logged in to apply.</p>
        <Link href="/login"><Button variant="primary" size="lg">Sign In to Apply</Button></Link>
      </div>
    );
  }

  return (
    <div className="container-brand section-padding max-w-2xl mx-auto">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-violet-400 text-sm font-semibold mb-3"><Building2 className="h-4 w-4" />WHOLESALE PROGRAM</div>
        <h1 className="text-4xl font-display font-bold text-brand-cream mb-3">Apply for Wholesale Access</h1>
        <p className="text-brand-cream-muted text-lg">Wholesale pricing, bulk tiers, and dedicated support.</p>
      </div>

      <div className="glass-card border border-brand-green/15 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Acme Smoke Shop LLC" required />
            <Select label="Business Type" value={businessType} onChange={e => setBusinessType(e.target.value)} placeholder="Select type…" required>
              {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="EIN Number (optional)" value={einNumber} onChange={e => setEinNumber(e.target.value)} placeholder="XX-XXXXXXX" />
            <Input label="Website (optional)" type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://yourstore.com" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select label="Estimated Monthly Volume" value={monthlyVolume} onChange={e => setMonthlyVolume(e.target.value)} placeholder="Select range…" required>
              {VOLUME_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
            </Select>
            <Select label="Years in Business" value={yearsInBiz} onChange={e => setYearsInBiz(e.target.value)} placeholder="Select…" required>
              {YEARS_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-cream-muted">References (optional)</label>
            <textarea value={refs} onChange={e => setRefs(e.target.value)} rows={3} placeholder="Other vendors you work with…" className="w-full px-3 py-2.5 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream placeholder:text-brand-cream-dark focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-brand-cream-muted">Why do you want wholesale access? <span className="text-red-400">*</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} required placeholder="Tell us about your business…" className="w-full px-3 py-2.5 text-sm bg-[#162816] border border-white/10 rounded-brand text-brand-cream placeholder:text-brand-cream-dark focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 resize-none" />
          </div>
          {error && <div className="p-3 rounded-brand bg-red-500/10 border border-red-500/20"><p className="text-sm text-red-400">⚠ {error}</p></div>}
          <Button type="submit" variant="primary" size="lg" isLoading={loading} className="w-full">Submit Application</Button>
        </form>
      </div>
    </div>
  );
}
