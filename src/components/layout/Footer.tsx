import Link from "next/link";
import { Leaf, Instagram, Mail } from "lucide-react";

/* src/components/layout/Footer.tsx */

const footerGroups = [
  {
    heading: "Shop",
    links: [
      { href: "/shop?category=flower",    label: "Shop Flower" },
      { href: "/shop?category=vape",      label: "Shop Vapes" },
      { href: "/shop?category=edible",    label: "Shop Edibles" },
      { href: "/shop?category=accessory", label: "Accessories" },
      { href: "/coa",                     label: "Lab Results" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about",   label: "About Us" },
      
      { href: "/contact", label: "Contact" },
      { href: "/faq",     label: "FAQ" },
    ],
  },
  {
    heading: "Business",
    links: [
      { href: "/apply-wholesale", label: "Wholesale Program" },
      { href: "/apply-affiliate", label: "Affiliate Program" },
      { href: "/account",         label: "My Account" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy",     label: "Privacy Policy" },
      { href: "/terms",       label: "Terms of Service" },
      { href: "/legal",  label: "Compliance & Legal" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0A160A] pt-12 pb-6">
      <div className="container-brand">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Leaf className="h-5 w-5 text-brand-green" />
              <span className="font-display font-bold text-brand-cream">Trippy Hippie</span>
            </Link>
            <p className="text-xs text-brand-cream-dark leading-relaxed mb-4">
              Premium hemp-derived products. Lab-tested, Farm Bill compliant, shipped nationwide.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-brand border border-white/10 text-brand-cream-dark hover:text-brand-green hover:border-brand-green/30 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="mailto:info@trippyhippie.org"
                className="w-8 h-8 flex items-center justify-center rounded-brand border border-white/10 text-brand-cream-dark hover:text-brand-green hover:border-brand-green/30 transition-colors"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link groups */}
          {footerGroups.map(group => (
            <div key={group.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-brand-cream-dark mb-3">
                {group.heading}
              </h4>
              <ul className="space-y-2">
                {group.links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-cream-muted hover:text-brand-cream transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-brand-cream-dark text-center sm:text-left">
            © {new Date().getFullYear()} Trippy Hippie Wholesale LLC. All rights reserved.
          </p>
          <p className="text-xs text-brand-cream-dark text-center">
            Hemp products ≤0.3% Δ9-THC · 21+ only · Farm Bill Compliant
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
