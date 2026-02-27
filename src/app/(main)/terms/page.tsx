import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

/* src/app/(main)/terms/page.tsx
Terms & Conditions with detailed information on user obligations and our policies
*/

const TERMS_SECTIONS = [
  {
    title: "1. Overview",
    body: `Trippy Hippie Wholesale LLC ("Trippy Hippie", "we", "us", "our") provides lawful hemp products, accessories, and related items to adults aged 21 and over. By creating an account, accessing the site, or completing a purchase, you acknowledge and agree to these Terms and Conditions. These terms govern your use of the platform, your purchases, and your relationship with us.`,
  },
  {
    title: "2. Age & Eligibility",
    body: `You affirm that you are at least 21 years of age. You must provide truthful and accurate information regarding your identity and age. Providing false or misleading information constitutes a material breach of these Terms. Access and use of our platform is strictly limited to eligible adults.`,
  },
  {
    title: "3. Compliance with Hemp Law",
    body: `All hemp-derived products offered contain no more than 0.3% Δ9 THC by dry weight, consistent with federal regulations. Customers are responsible for complying with local, state, and federal laws regarding possession, consumption, and shipment of hemp products. We reserve the right to refuse or cancel orders where shipment may be restricted or prohibited by law.`,
  },
  {
    title: "4. No Medical Claims",
    body: `Our products are not intended to diagnose, treat, cure, or prevent any disease. Statements on this platform have not been evaluated by the FDA. You should consult a qualified healthcare professional before using any product if you have medical concerns.`,
  },
  {
    title: "5. Payment & Transaction Security",
    body: `All payment processing is conducted via secure, compliant systems. We do not store full payment card numbers, banking credentials, or other sensitive financial information. Payment information is transmitted and processed via secure third-party providers in accordance with applicable security standards to protect against unauthorized access, disclosure, or misuse.`,
  },
  {
    title: "6. Data Collection & Privacy",
    body: `We collect only the minimum personal information necessary to provide services, fulfill orders, and maintain accounts. This may include your name, email, shipping details, and order history. We do not sell, rent, broker, or otherwise redistribute personal data. We do not collect government IDs, Social Security numbers, full payment card numbers, biometric identifiers, or unrelated behavioral analytics beyond operational needs.`,
  },
  {
    title: "7. Security Measures",
    body: `We implement industry-standard security protocols including encryption of data in transit, access controls, logging, monitoring, and principle of least privilege on backend systems. While no system can guarantee absolute security, these layered measures reduce the risk of unauthorized access or misuse.`,
  },
  {
    title: "8. Sensitive Data Handling",
    body: `We do not intentionally collect or store highly sensitive personal data. If such data is inadvertently submitted, you consent to its routine deletion or redaction. PLEASE DO NOT upload protected health information (PHI), financial account numbers, or other regulated data types without express authorization.`,
  },
  {
    title: "9. Account Approval",
    body: `Account creation may require manual or semi-automated approval. Approval is not guaranteed and may be revoked if misuse, fraud, or policy violations are suspected.`,
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
    body: `All trademarks, logos, product descriptions, imagery, and platform code are proprietary or properly licensed. Users receive a limited, revocable, non-transferable license to access content solely for lawful personal use.`,
  },
  {
    title: "12. Order Conditions & Availability",
    body: `Inventory, pricing, promotions, and product releases ("drops") may change without notice. Receipt of an order confirmation email does not guarantee fulfillment; all orders are contingent upon verification, availability, and compliance with applicable laws.`,
  },
  {
    title: "13. Limitation of Liability",
    body: `To the fullest extent permitted by law, Trippy Hippie Wholesale LLC shall not be liable for indirect, incidental, consequential, exemplary, or punitive damages arising from use of the platform or products. Direct liability is limited to the amount actually paid for the affected order.`,
  },
  {
    title: "14. Indemnification",
    body: `You agree to indemnify and hold harmless Trippy Hippie Wholesale LLC, its affiliates, officers, employees, and contractors from any claims, damages, or losses arising out of your breach of these Terms or misuse of products or services.`,
  },
  {
    title: "15. Modifications",
    body: `We reserve the right to update or modify these Terms at any time. Continued use of the platform after such changes constitutes acceptance of the revised Terms. A "Last Updated" date will indicate the current version.`,
  },
  {
    title: "16. Termination",
    body: `Access to your account or the platform may be suspended or terminated without notice in cases of suspected fraud, abuse, illegal activity, or security risks.`,
  },
  {
    title: "17. Dispute Resolution",
    body: `Where permitted by law, disputes shall first be attempted to be resolved informally. If unresolved, disputes may be resolved in the appropriate state or federal courts of our principal state of operation, unless superseded by mandatory arbitration requirements.`,
  },
  {
    title: "18. Acceptance",
    body: `By creating an account, accessing the site, or making purchases, you affirm that you are 21 years or older, have read and understood these Terms, consent to our data practices, and acknowledge that all product use is at your own risk.`,
  },
];

export default function TermsPage() {
  return (
    <div className="container-brand section-padding max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-brand-cream mb-3">
          Terms of Service
        </h1>
        <p className="text-brand-cream-muted text-lg">Last updated: February 2026</p>
      </div>

      <div className="space-y-6">
        {TERMS_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-display font-semibold text-brand-cream mb-3">
              {section.title}
            </h2>
            {section.body && (
              <p className="text-brand-cream-muted leading-relaxed whitespace-pre-wrap">
                {section.body}
              </p>
            )}
            {section.bullets && (
              <ul className="list-disc list-inside text-brand-cream-muted leading-relaxed space-y-1">
                {section.bullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 text-center">
        <p className="text-brand-cream-muted text-sm">
          Questions about these terms? Contact us at{" "}
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
