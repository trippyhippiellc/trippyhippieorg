"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* src/app/(main)/faq/page.tsx */

const faqs = [
  { q: "Is THCa legal?", a: "Yes. THCa hemp flower and products containing ≤0.3% Δ9-THC are federally legal under the 2018 Farm Bill. However, laws vary by state — our site automatically filters products based on your state selection." },
  { q: "How is THCa different from Delta-9 THC?", a: "THCa is the non-psychoactive precursor to Δ9-THC found in raw hemp plants. When heated (smoked, vaped, or cooked), THCa converts to Δ9-THC through decarboxylation. Raw THCa is not psychoactive." },
  { q: "Do you ship to my state?", a: "We ship to most US states. After selecting your state, the shop automatically shows only compliant products. A few states restrict certain products — if you don't see what you're looking for, it may not be available in your area." },
  { q: "How do I apply for wholesale?", a: "Fill out the wholesale application on the Apply Wholesale page. We review all applications within 1–3 business days. Approved accounts get access to wholesale pricing and bulk tier discounts automatically." },
  { q: "What is the affiliate program?", a: "Approved affiliates receive a unique coupon code that gives their followers 10% off. You earn 10% commission on every order placed using your code. Payouts are processed monthly via CashApp or bank transfer with a $50 minimum." },
  { q: "What payment methods do you accept?", a: "We currently accept Credit/Debit Transactions, Cash App, and Wire Transfers for wholesale orders. Cryptocurrency Payments may make their way onto our platform, as an extra payment option." },
  { q: "How long does shipping take?", a: "Most orders currently ship out within 24-48 hours from the time of purchase. Standard delivery times vary by location. Expedited Processing and Expedited Shipping are both options; however, these options may incur extra fees." },
  { q: "What is your return policy?", a: "We accept returns on unopened products within 30 days. Opened consumable products cannot be returned per health regulations. Contact info@trippyhippie.org to initiate a return, or for more information." },
  { q: "Are your products lab tested?", a: "Yes — every batch is tested by an independent third-party lab. Certificates of Analysis (COAs) are available on the COA page or upon request from our support team." },
  { q: "How does bulk pricing work?", a: "Bulk pricing tiers automatically apply at checkout based on the quantity in your cart. The tiers are shown on each product page. No codes needed — the discount calculates automatically." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-4 py-5 text-left group">
        <span className="font-medium text-brand-cream group-hover:text-brand-green transition-colors">{q}</span>
        <ChevronDown className={cn("h-5 w-5 text-brand-cream-dark flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && <p className="text-brand-cream-muted text-sm leading-relaxed pb-5">{a}</p>}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="container-brand section-padding max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-brand-cream mb-3">Frequently Asked Questions</h1>
        <p className="text-brand-cream-muted text-lg">Everything you need to know about Trippy Hippie.</p>
      </div>
      <div className="glass-card border border-brand-green/10 rounded-card px-6">
        {faqs.map(faq => <FAQItem key={faq.q} {...faq} />)}
      </div>
      <p className="text-center text-brand-cream-muted text-sm mt-8">
        Still have questions?{" "}
        <a href="mailto:info@trippyhippie.org" className="text-brand-green hover:underline">info@trippyhippie.org</a>
      </p>
    </div>
  );
}
