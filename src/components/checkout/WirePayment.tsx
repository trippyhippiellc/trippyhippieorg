"use client";

import { Building2, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils/cn";

/* src/components/checkout/WirePayment.tsx */

interface WirePaymentProps {
  total:       number;
  orderNumber: string;
}

const wireDetails = [
  { label: "Bank Name",      value: process.env.NEXT_PUBLIC_WIRE_BANK_NAME    || "Contact us for bank details" },
  { label: "Account Name",   value: "Trippy Hippie Wholesale LLC" },
  { label: "Account Number", value: process.env.NEXT_PUBLIC_WIRE_ACCOUNT      || "Contact us" },
  { label: "Routing Number", value: process.env.NEXT_PUBLIC_WIRE_ROUTING      || "Contact us" },
];

export function WirePayment({ total, orderNumber }: WirePaymentProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  function copy(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-card bg-violet-500/5 border border-violet-500/20 text-center">
        <div className="w-14 h-14 rounded-full bg-violet-500/15 flex items-center justify-center mx-auto mb-3">
          <Building2 className="h-7 w-7 text-violet-400" />
        </div>
        <h3 className="font-display font-bold text-brand-cream text-xl mb-1">Wire Transfer</h3>
        <p className="text-brand-cream-muted text-sm">Send {formatCurrency(total)} to the account below</p>
      </div>

      <div className="space-y-2">
        {wireDetails.map((d, i) => (
          <div key={d.label} className="flex items-center justify-between p-3 rounded-brand bg-[#162816] border border-white/10">
            <div>
              <p className="text-xs text-brand-cream-dark">{d.label}</p>
              <p className="text-sm font-mono text-brand-cream">{d.value}</p>
            </div>
            <button onClick={() => copy(d.value, i)} className="text-brand-cream-dark hover:text-brand-green transition-colors ml-3">
              {copiedIdx === i ? <CheckCircle className="h-4 w-4 text-brand-green" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        ))}
        <div className="p-3 rounded-brand bg-[#162816] border border-white/10">
          <p className="text-xs text-brand-cream-dark">Memo / Reference</p>
          <p className="text-sm font-mono text-brand-cream">Order #{orderNumber}</p>
        </div>
      </div>

      <div className="p-4 rounded-brand bg-amber-500/5 border border-amber-500/20 text-xs text-brand-cream-muted space-y-1">
        <p className="font-semibold text-amber-300">⚠ Wire Transfer Notes</p>
        <p>• Include your order number in the memo/reference field</p>
        <p>• Processing takes 1–2 business days after funds are received</p>
        <p>• Email support@trippyhippie.org once sent with confirmation</p>
        <p>• Minimum wire order: $200.00</p>
      </div>
    </div>
  );
}

export default WirePayment;
