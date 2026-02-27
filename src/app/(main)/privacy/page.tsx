"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const privacySections = [
  {
    q: "1. Overview",
    a: "At Trippy Hippie Wholesale LLC, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit our website, make purchases, or interact with our services. We value your trust and handle your data responsibly, transparently, and with care.",
  },
  {
    q: "2. Information We Collect",
    a: "We collect only the information necessary to provide and improve our services. This includes:\n\n• Information you provide directly: name, email address, shipping/billing address, phone number (if provided), and order details.\n• Payment information: processed securely by third-party providers (we do not store full credit card numbers).\n• Automatically collected data: device type, browser, IP address, pages visited, interaction patterns, and anonymized usage statistics to enhance site performance and security.\n• Cookies & similar technologies: used for age verification, state selection, cart persistence, and session management.\n\nWe do not collect sensitive personal data such as government-issued IDs, Social Security numbers, full payment card details, or biometric information.",
  },
  {
    q: "3. How We Use Your Information",
    a: "We use your information to:\n\n• Process and fulfill orders, including shipping and delivery updates\n• Manage and secure your account\n• Send important transactional emails (order confirmations, shipping notifications)\n• Process affiliate commissions when applicable\n• Comply with legal obligations and prevent fraud\n• Analyze anonymized usage data to improve our platform, user experience, and security\n• Respond to your inquiries and communications",
  },
  {
    q: "4. Payment Information",
    a: "We never store full credit card details on our servers. All card and cryptocurrency payments are securely processed by third-party providers. We retain only the minimum transaction reference IDs required for order management and support.",
  },
  {
    q: "5. Cookies & Tracking",
    a: "We use essential cookies for:\n• Age gate verification (expires after 365 days)\n• Remembering your selected state\n• Maintaining cart contents across sessions\n• Session authentication and basic site functionality\n\nYou can disable cookies via your browser settings, but this may limit or break certain features of the site.",
  },
  {
    q: "6. Data Sharing",
    a: "We do not sell your personal information to third parties. We share data only with trusted service providers necessary to operate our business, such as payment processors, hosting and database services, fulfillment partners, and transactional email providers.\n\nAll partners are bound by strict contractual obligations to protect your data and use it only for the purposes we specify.",
  },
  {
    q: "7. Age Verification & Restriction",
    a: "This site is intended only for adults 21 years of age and older. By using our site and confirming your age, you represent that you are at least 21. We do not knowingly collect, use, or disclose personal information from anyone under 21. If we learn that we have collected data from someone under 21, we will delete it promptly.",
  },
  {
    q: "8. Your Rights & Choices",
    a: "You have the right to:\n\n• Access, update, or correct your personal information\n• Request deletion of your account and associated personal data\n• Opt out of promotional communications (unsubscribe links are in every email)\n• Opt out of non-essential anonymized analytics collection (contact us)\n• Withdraw consent where processing is based on consent\n\nTo exercise these rights, email us at info@trippyhippie.org. We will respond to verifiable requests within 30 days (or as required by applicable law).",
  },
  {
    q: "9. Data Security",
    a: "We implement industry-standard technical, administrative, and physical safeguards to protect your information, including encrypted data transmission (HTTPS), secure servers, access controls, and ongoing monitoring. While no method of transmission or storage is 100% secure, we continuously work to minimize risks and keep your data as safe as possible.",
  },
  {
    q: "10. Policy Updates",
    a: "We may update this Privacy Policy periodically to reflect changes in our practices, technology, or legal obligations. The “Last updated” date at the top of this page will always show the most recent version. We encourage you to review this policy occasionally. Your continued use of our services after any changes constitutes acceptance of the updated policy.",
  },
];

function PrivacyItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="font-medium text-brand-cream group-hover:text-brand-green transition-colors">
          {q}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-brand-cream-dark flex-shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <p className="text-brand-cream-muted text-sm leading-relaxed pb-5 whitespace-pre-wrap">
          {a}
        </p>
      )}
    </div>
  );
}

export default function PrivacyPage() {
  const lastUpdated = "February 23, 2026";

  return (
    <div className="container-brand section-padding max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-brand-cream mb-3">
          Privacy Policy
        </h1>
        <p className="text-brand-cream-muted text-lg">Last updated: {lastUpdated}</p>
      </div>
      <div className="glass-card border border-brand-green/10 rounded-card px-6">
        {privacySections.map((section) => (
          <PrivacyItem key={section.q} {...section} />
        ))}
      </div>
      <p className="text-center text-brand-cream-muted text-sm mt-8">
        Questions about this policy? Contact us at{" "}
        <a href="mailto:info@trippyhippie.org" className="text-brand-green hover:underline">
          info@trippyhippie.org
        </a>
      </p>
    </div>
  );
}