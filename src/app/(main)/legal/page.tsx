"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StateLaw {
  state_code: string;
  state_name: string;
  allows_thca_flower: boolean;
  allows_vapes: boolean;
  allows_edibles: boolean;
  allows_accessories: boolean;
  shipping_allowed: boolean;
  notes: string | null;
  updated_at: string;
}

function ComplianceItem({
  title,
  content,
}: {
  title: string;
  content: string | React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="font-medium text-brand-cream group-hover:text-brand-green transition-colors">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-brand-cream-dark flex-shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="text-brand-cream-muted text-sm leading-relaxed pb-5 whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
}

// Helper to check if a state has any restrictions
function hasRestrictions(law: StateLaw): boolean {
  return (
    !law.allows_thca_flower ||
    !law.allows_vapes ||
    !law.allows_edibles ||
    !law.allows_accessories ||
    !law.shipping_allowed
  );
}

export default function CompliancePage() {
  const [stateLaws, setStateLaws] = useState<StateLaw[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const lastUpdated = "February 23, 2026";

  useEffect(() => {
    async function fetchStateLaws() {
      const { data } = await supabase.from("state_laws").select("*").order("state_name");
      if (data) setStateLaws(data as StateLaw[]);
      setLoading(false);
    }
    fetchStateLaws();
  }, []);

  // Filter to only show states with restrictions
  const restrictedStates = stateLaws.filter(hasRestrictions);
  const allowedStates = stateLaws.filter((s) => !hasRestrictions(s));

  const complianceSections = [
    {
      title: "1. Overview",
      content: `Trippy Hippie Wholesale LLC ("Trippy Hippie", "we", "us", "our") is committed to operating in full compliance with federal and state regulations governing hemp-derived products. This Compliance & Legal document outlines our commitment to lawful business practices, product safety, age verification, data protection, and state-specific restrictions.

By creating an account, accessing our site, or purchasing products, you acknowledge that you have read and understood these compliance requirements and agree to comply with all applicable laws in your jurisdiction.`,
    },
    {
      title: "2. Federal Hemp Compliance",
      content: `All products offered on our platform are hemp-derived and contain no more than 0.3% Δ9-THC on a dry weight basis, consistent with the 2018 Farm Bill and FDA regulations. 

Third-party laboratory analysis is available for all products. Products have not been evaluated by the FDA and are not intended to diagnose, treat, cure, or prevent any disease. We make no medical claims.

All products are sold for lawful use only. You are responsible for complying with federal, state, and local laws regarding possession and consumption.`,
    },
    {
      title: "3. Age Verification & Eligibility",
      content: `You must be at least 21 years of age to create an account, browse products, or make purchases. By accessing this platform, you affirm that you are 21 years of age or older.

We employ multiple age verification measures, including:
• Initial age gate confirmation at first visit
• Verification through cookies and local storage
• Manual verification during account approval

Providing false information about your age constitutes a material breach of these terms and may result in account termination and legal action.`,
    },
    {
      title: "4. State-Specific Restrictions",
      content: `Hemp product legality varies significantly by state. We maintain a comprehensive state laws database that defines which product categories are legal in each state, whether shipping is permitted, and any specific state restrictions.

Our system automatically restricts orders to compliant states. If you attempt to order from a restricted state, your order will be cancelled and refunded. We reserve the right to refuse service in any jurisdiction where our products may be illegal.

States not listed below currently allow all product categories with shipping allowed. States listed below have specific product or shipping restrictions—please review before ordering.`,
    },
    {
      title: "5. Payment & Transaction Security",
      content: `All payment processing is conducted via secure, compliant systems. We do not store full payment card numbers, banking credentials, or other sensitive financial information. Payment information is transmitted and processed via secure third-party providers in accordance with applicable security standards to protect against unauthorized access, disclosure, or misuse.`,
    },
    {
      title: "6. Data Collection & Privacy",
      content: `We collect only the minimum personal information necessary to provide services, fulfill orders, and maintain accounts. This may include your name, email, shipping details, and order history. We do not sell, rent, broker, or otherwise redistribute personal data. We do not collect government IDs, Social Security numbers, full payment card numbers, biometric identifiers, or unrelated behavioral analytics beyond operational needs.`,
    },
    {
      title: "7. Security Measures",
      content: `We implement industry-standard security protocols including encryption of data in transit, access controls, logging, monitoring, and principle of least privilege on backend systems. While no system can guarantee absolute security, these layered measures reduce the risk of unauthorized access or misuse.`,
    },
    {
      title: "8. Sensitive Data Handling",
      content: `We do not intentionally collect or store highly sensitive personal data. If such data is inadvertently submitted, you consent to its routine deletion or redaction. PLEASE DO NOT upload protected health information (PHI), financial account numbers, or other regulated data types without express authorization.`,
    },
    {
      title: "9. Account Approval",
      content: `Account creation may require manual or semi-automated approval. Approval is not guaranteed and may be revoked if misuse, fraud, or policy violations are suspected.`,
    },
    {
      title: "10. User Responsibilities",
      bullets: [
        "Use products lawfully and responsibly.",
        "Do not attempt to bypass age verification or other security mechanisms.",
        "Maintain the confidentiality of account credentials and report suspected compromise promptly.",
        "Refrain from scraping, reverse engineering, or abusing platform infrastructure.",
        "Comply with all applicable laws when interacting with the platform and products.",
      ],
    },
    {
      title: "11. Intellectual Property",
      content: `All trademarks, logos, product descriptions, imagery, and platform code are proprietary or properly licensed. Users receive a limited, revocable, non-transferable license to access content solely for lawful personal use.`,
    },
    {
      title: "12. Order Conditions & Availability",
      content: `Inventory, pricing, promotions, and product releases ("drops") may change without notice. Receipt of an order confirmation email does not guarantee fulfillment; all orders are contingent upon verification, availability, and compliance with applicable laws.`,
    },
    {
      title: "13. Limitation of Liability",
      content: `To the fullest extent permitted by law, Trippy Hippie Wholesale LLC shall not be liable for indirect, incidental, consequential, exemplary, or punitive damages arising from use of the platform or products. Direct liability is limited to the amount actually paid for the affected order.`,
    },
    {
      title: "14. Indemnification",
      content: `You agree to indemnify and hold harmless Trippy Hippie Wholesale LLC, its affiliates, officers, employees, and contractors from any claims, damages, or losses arising out of your breach of these Terms or misuse of products or services.`,
    },
    {
      title: "15. Modifications",
      content: `We reserve the right to update or modify these Terms at any time. Continued use of the platform after such changes constitutes acceptance of the revised Terms. A "Last Updated" date will indicate the current version.`,
    },
    {
      title: "16. Termination",
      content: `Access to your account or the platform may be suspended or terminated without notice in cases of suspected fraud, abuse, illegal activity, or security risks.`,
    },
    {
      title: "17. Dispute Resolution",
      content: `Where permitted by law, disputes shall first be attempted to be resolved informally. If unresolved, disputes may be resolved in the appropriate state or federal courts of our principal state of operation, unless superseded by mandatory arbitration requirements.`,
    },
    {
      title: "18. Acceptance",
      content: `By creating an account, accessing the site, or making purchases, you affirm that you are 21 years or older, have read and understood these Terms, consent to our data practices, and acknowledge that all product use is at your own risk.`,
    },

  ];

  return (
    <div className="container-brand section-padding max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-brand-cream mb-3">
          Compliance & Legal
        </h1>
        <p className="text-brand-cream-muted text-lg">
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* Compliance Sections */}
      <div className="glass-card border border-brand-green/10 rounded-card px-6 mb-12">
        {complianceSections.map((section) => (
          <ComplianceItem
            key={section.title}
            title={section.title}
            content={
              section.bullets ? (
                <ul className="list-disc list-inside space-y-1">
                  {section.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              ) : (
                section.content
              )
            }
          />
        ))}
      </div>

      {/* Restricted States Section */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-brand-cream-muted">Loading compliance data...</p>
        </div>
      ) : restrictedStates.length > 0 ? (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-display font-bold text-brand-cream">
              States with Restrictions
            </h2>
          </div>

          <p className="text-brand-cream-muted mb-6 text-sm">
            The following states have specific product category or shipping restrictions. If your state is listed below, read carefully before ordering.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {restrictedStates.map((law) => {
              const restrictions = [];
              if (!law.allows_thca_flower) restrictions.push("THCa Flower");
              if (!law.allows_vapes) restrictions.push("Vapes");
              if (!law.allows_edibles) restrictions.push("Edibles");
              if (!law.allows_accessories) restrictions.push("Accessories");
              if (!law.shipping_allowed) restrictions.push("No Shipping");

              return (
                <div
                  key={law.state_code}
                  className="glass-card border border-amber-500/20 bg-amber-500/5 rounded-card p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-brand-cream text-lg">
                        {law.state_name} ({law.state_code})
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {restrictions.map((r) => (
                        <span
                          key={r}
                          className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-medium"
                        >
                          ✗ {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Product Availability */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
                    <div className="text-center">
                      <p className="text-xs text-brand-cream-dark mb-1">Flower</p>
                      <p
                        className={`text-sm font-medium ${
                          law.allows_thca_flower
                            ? "text-brand-green"
                            : "text-red-400"
                        }`}
                      >
                        {law.allows_thca_flower ? "✓" : "✗"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-brand-cream-dark mb-1">Vapes</p>
                      <p
                        className={`text-sm font-medium ${
                          law.allows_vapes ? "text-brand-green" : "text-red-400"
                        }`}
                      >
                        {law.allows_vapes ? "✓" : "✗"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-brand-cream-dark mb-1">
                        Edibles
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          law.allows_edibles
                            ? "text-brand-green"
                            : "text-red-400"
                        }`}
                      >
                        {law.allows_edibles ? "✓" : "✗"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-brand-cream-dark mb-1">
                        Access.
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          law.allows_accessories
                            ? "text-brand-green"
                            : "text-red-400"
                        }`}
                      >
                        {law.allows_accessories ? "✓" : "✗"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-brand-cream-dark mb-1">
                        Shipping
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          law.shipping_allowed
                            ? "text-brand-green"
                            : "text-red-400"
                        }`}
                      >
                        {law.shipping_allowed ? "✓" : "✗"}
                      </p>
                    </div>
                  </div>

                  {law.notes && (
                    <p className="text-sm text-brand-cream-muted bg-white/5 rounded-brand p-3 border border-white/5">
                      <span className="font-semibold text-brand-cream">Note:</span> {law.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Footer Notice */}
      <div className="text-center py-8 border-t border-white/5">
        <p className="text-brand-cream-muted text-sm mb-3">
          <strong>Important:</strong> State laws change frequently. Always verify current regulations with your state's regulatory agency before ordering.
        </p>
        <p className="text-brand-cream-muted text-sm">
          Questions about our compliance practices? Contact us at{" "}
          <a
            href="mailto:info@trippyhippie.org"
            className="text-brand-green hover:underline"
          >
            info@trippyhippie.org
          </a>
        </p>
      </div>
    </div>
  );
}