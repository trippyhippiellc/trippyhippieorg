"use client";

import { CreditCard, Bitcoin, Smartphone, Building2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* src/components/checkout/PaymentSelector.tsx */

export type PaymentMethod = "stripe" | "crypto" | "cashapp" | "wire";

interface PaymentOption {
  id:      PaymentMethod;
  label:   string;
  desc:    string;
  icon:    React.ElementType;
  color:   string;
}

const OPTIONS: PaymentOption[] = [
  {
    id:    "stripe",
    label: "Credit / Debit Card",
    desc:  "Visa, Mastercard, Amex — processed by Stripe",
    icon:  CreditCard,
    color: "text-blue-400",
  },
  {
    id:    "crypto",
    label: "Cryptocurrency",
    desc:  "Bitcoin, Ethereum, USDC, and more",
    icon:  Bitcoin,
    color: "text-amber-400",
  },
  {
    id:    "cashapp",
    label: "Cash App",
    desc:  "Send payment to $TrippyHippieSmoke",
    icon:  Smartphone,
    color: "text-brand-green",
  },
  {
    id:    "wire",
    label: "Wire Transfer",
    desc:  "For wholesale orders — 1–2 business days",
    icon:  Building2,
    color: "text-violet-400",
  },
];

interface PaymentSelectorProps {
  value:    PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentSelector({ value, onChange }: PaymentSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-brand-cream-muted uppercase tracking-wide">
        Payment Method
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "flex items-start gap-3 p-4 rounded-card border text-left transition-all",
              value === opt.id
                ? "border-brand-green bg-brand-green/10"
                : "border-white/10 hover:border-white/20 bg-[#162816]"
            )}
          >
            <div className={cn("mt-0.5 flex-shrink-0", opt.color)}>
              <opt.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-brand-cream text-sm">{opt.label}</p>
              <p className="text-xs text-brand-cream-dark mt-0.5">{opt.desc}</p>
            </div>
            {value === opt.id && (
              <div className="ml-auto w-4 h-4 rounded-full border-2 border-brand-green bg-brand-green flex-shrink-0 mt-0.5" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PaymentSelector;
