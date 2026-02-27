"use client";

import { Smartphone, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { formatCurrency } from "@/lib/utils/cn";

/* src/components/checkout/CashAppPayment.tsx */

interface CashAppPaymentProps {
  total: number;
  orderNumber: string;
}

export function CashAppPayment({ total, orderNumber }: CashAppPaymentProps) {
  const [copied, setCopied] = useState(false);

  function copyHandle() {
    navigator.clipboard.writeText(siteConfig.cashAppHandle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-card bg-brand-green/5 border border-brand-green/20 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-green/15 flex items-center justify-center mx-auto mb-3">
          <Smartphone className="h-7 w-7 text-brand-green" />
        </div>
        <h3 className="font-display font-bold text-brand-cream text-xl mb-1">Pay via Cash App</h3>
        <p className="text-brand-cream-muted text-sm">Send the exact amount below to our Cash App handle</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 rounded-brand bg-[#162816] border border-white/10">
          <div>
            <p className="text-xs text-brand-cream-dark mb-0.5">Cash App Handle</p>
            <p className="font-mono font-bold text-brand-green text-lg">{siteConfig.cashAppHandle}</p>
          </div>
          <button
            onClick={copyHandle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-brand bg-brand-green/10 border border-brand-green/20 text-brand-green text-sm hover:bg-brand-green/20 transition-colors"
          >
            {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-brand bg-[#162816] border border-white/10">
          <div>
            <p className="text-xs text-brand-cream-dark mb-0.5">Amount to Send</p>
            <p className="font-mono font-bold text-brand-cream text-lg">{formatCurrency(total)}</p>
          </div>
        </div>

        <div className="p-4 rounded-brand bg-[#162816] border border-white/10">
          <p className="text-xs text-brand-cream-dark mb-0.5">Note to Include</p>
          <p className="font-mono text-brand-cream text-sm">Order #{orderNumber}</p>
        </div>
      </div>

      <div className="p-4 rounded-brand bg-amber-500/5 border border-amber-500/20">
        <p className="text-sm text-amber-300 font-semibold mb-1">⚠ Important</p>
        <ul className="text-xs text-brand-cream-muted space-y-1">
          <li>• Include your order number in the Cash App note</li>
          <li>• Send the exact amount — no rounding</li>
          <li>• Orders ship once payment is confirmed (usually within 2 hours)</li>
          <li>• Screenshot your payment and email it to support@trippyhippie.org if needed</li>
        </ul>
      </div>
    </div>
  );
}

export default CashAppPayment;
