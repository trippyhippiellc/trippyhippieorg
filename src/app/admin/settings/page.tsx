"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConstructionModeSettings } from "@/components/admin/ConstructionModeSettings";
import { FontSettings } from "@/components/admin/FontSettings";
import { siteConfig } from "@/config/site";
import { Settings, Save } from "lucide-react";

/* src/app/admin/settings/page.tsx */

export default function AdminSettingsPage() {
  const toast = useToast();

  /* These are the env-based defaults. In a real system you'd load from a
     site_settings table and save back there. For now this is a display page. */
  const [cashApp,   setCashApp]   = useState(siteConfig.cashAppHandle);
  const [minOrder,  setMinOrder]  = useState("200");
  const [shipping,  setShipping]  = useState("9.95");
  const [freeShip,  setFreeShip]  = useState("100");
  const [saved,     setSaved]     = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    /* TODO: POST to /api/admin/settings or upsert to site_settings table */
    setSaved(true);
    toast.success("Settings saved (update your .env to persist)");
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-cream mb-1 flex items-center gap-2">
          <Settings className="h-5 w-5 text-brand-green" /> Settings
        </h1>
        <p className="text-brand-cream-muted text-sm">
          Site-wide configuration. Changes here update the UI. Persist values by updating your <code className="text-brand-green">.env</code>.
        </p>
      </div>

      {/* Construction Mode - Outside Form */}
      <ConstructionModeSettings />

      {/* Font Settings */}
      <FontSettings />

      <form onSubmit={handleSave} className="space-y-6">
        {/* Payments */}
        <div className="glass-card border border-brand-green/10 p-6 rounded-card space-y-4">
          <h2 className="font-semibold text-brand-cream">Payment Settings</h2>
          <Input label="Cash App Handle" value={cashApp} onChange={e => setCashApp(e.target.value)} placeholder="$YourHandle" helperText="Shown to customers paying via Cash App" />
          <Input label="Wire Minimum Order ($)" type="number" value={minOrder} onChange={e => setMinOrder(e.target.value)} placeholder="200" />
        </div>

        {/* Shipping */}
        <div className="glass-card border border-brand-green/10 p-6 rounded-card space-y-4">
          <h2 className="font-semibold text-brand-cream">Shipping</h2>
          <Input label="Standard Shipping ($)" type="number" step="0.01" value={shipping} onChange={e => setShipping(e.target.value)} />
          <Input label="Free Shipping Threshold ($)" type="number" step="0.01" value={freeShip} onChange={e => setFreeShip(e.target.value)} helperText="Orders over this amount ship free" />
        </div>

        {/* Env variable reference */}
        <div className="glass-card border border-white/5 p-5 rounded-card">
          <h2 className="font-semibold text-brand-cream mb-3 text-sm">Environment Variables</h2>
          <div className="space-y-1.5 font-mono text-xs text-brand-cream-dark">
            {[
              "STRIPE_SECRET_KEY",
              "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
              "STRIPE_WEBHOOK_SECRET",
              "NOWPAYMENTS_API_KEY",
              "NOWPAYMENTS_IPN_SECRET",
              "RESEND_API_KEY",
              "NEXT_PUBLIC_CASHAPP_HANDLE",
              "NEXT_PUBLIC_WIRE_BANK_NAME",
              "NEXT_PUBLIC_WIRE_ACCOUNT",
              "NEXT_PUBLIC_WIRE_ROUTING",
            ].map(v => (
              <div key={v} className="flex items-center gap-2">
                <span className="text-brand-green/60">$</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" variant="primary" leftIcon={<Save className="h-4 w-4" />}>
          {saved ? "Saved!" : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}
