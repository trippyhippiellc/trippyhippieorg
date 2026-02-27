"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bitcoin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { paymentConfig } from "@/config/payments";

/* src/app/(main)/checkout/crypto/page.tsx */

export default function CryptoCheckoutPage() {
  const params      = useSearchParams();
  const orderNumber = params.get("order") ?? "";

  const [coin,     setCoin]     = useState("BTC");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [invoiceUrl, setInvoiceUrl] = useState("");

  async function createInvoice() {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/payments/crypto/create-invoice", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ orderNumber, coin }),
      });
      const data = await res.json() as { invoiceUrl?: string; error?: string };
      if (data.invoiceUrl) {
        setInvoiceUrl(data.invoiceUrl);
        window.open(data.invoiceUrl, "_blank");
      } else {
        setError(data.error ?? "Failed to create invoice.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="container-brand section-padding max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-4">
          <Bitcoin className="h-7 w-7 text-amber-400" />
        </div>
        <h1 className="text-3xl font-display font-bold text-brand-cream mb-2">Pay with Crypto</h1>
        <p className="text-brand-cream-muted text-sm">
          Order <span className="font-mono text-brand-cream">{orderNumber}</span>
        </p>
      </div>

      <div className="glass-card border border-amber-500/15 p-6 rounded-card space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-cream-muted">Select Cryptocurrency</label>
          <div className="grid grid-cols-3 gap-2">
            {paymentConfig.crypto.acceptedCoins.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCoin(c)}
                className={`py-2.5 rounded-brand border text-sm font-mono font-bold transition-all ${
                  coin === c
                    ? "border-amber-400 bg-amber-400/10 text-amber-400"
                    : "border-white/10 text-brand-cream-muted hover:border-white/20"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-brand bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">⚠ {error}</p>
          </div>
        )}

        {invoiceUrl ? (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 px-6 rounded-brand bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-all"
          >
            Open Payment Page <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={createInvoice}
            isLoading={loading}
            className="w-full"
          >
            {loading ? <Spinner size="sm" /> : `Pay with ${coin}`}
          </Button>
        )}

        <p className="text-xs text-brand-cream-dark text-center">
          Payments processed by NOWPayments · Your order ships once confirmed on-chain.
        </p>
      </div>
    </div>
  );
}
