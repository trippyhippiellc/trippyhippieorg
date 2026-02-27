import Link from "next/link";
import { ArrowRight, Shield, Truck, Star, Leaf, FlaskConical, Users, Award, Zap, Check, Lock, Clock } from "lucide-react";

/*
  HOME PAGE - src/app/(main)/page.tsx
  Lives inside the (main) route group so Navbar + Footer render.
  Premium hemp-derived products with uncompromising quality standards.
*/

const qualityFeatures = [
  {
    icon: FlaskConical,
    title: "Full Batch Transparency",
    desc: "Every single product comes with a complete certificate of analysis. Potency, terpenes, residual solvents, heavy metals, and it's all verified by independent third-party labs you can trust.",
  },
  {
    icon: Shield,
    title: "Farm Bill Compliant ≤0.3% Δ9",
    desc: "All products meet federal requirements. We source from licensed cultivators who follow rigorous testing protocols. No exceptions, no gray areas.",
  },
  {
    icon: Leaf,
    title: "Cultivator Vetted Selection",
    desc: "We don't stock everything. We partner with established growers who prioritize quality over quantity. Every strain is hand-selected for potency, terp profile, and freshness.",
  },
  {
    icon: Award,
    title: "Quality Guarantee",
    desc: "Unhappy with your order? Full refund or replacement, no questions asked. We stand behind every product we sell.",
  },
];

const shipperBenefits = [
  {
    icon: Truck,
    title: "Flat-Rate Shipping",
    desc: "Same competitive rate nationwide. No surprise charges at checkout.",
  },
  {
    icon: Clock,
    title: "24-Hour Processing",
    desc: "Most orders ship same-day or next business day. Tracked, insured, and discreetly packaged.",
  },
  {
    icon: Lock,
    title: "Signature Required Optional",
    desc: "Choose delivery protection. Your package arrives when you're home.",
  },
  {
    icon: Zap,
    title: "Real-Time Tracking",
    desc: "Carrier updates every step of the way. Know exactly when to expect your order.",
  },
];

const categories = [
  {
    emoji: "🌸",
    label: "Shop Flower",
    href: "/shop?category=flower",
    desc: "Curated strains from vetted cultivators, selected for terp profile and freshness. Full transparency on every batch with COAs you can actually download.",
    highlights: "Multiple cultivators • Fresh rotations • Bulk pricing • Wholesale available",
  },
  {
    emoji: "💨",
    label: "Shop Vapes",
    href: "/shop?category=vape",
    desc: "Disposables and cartridges that don't cut corners. Verified potency, consistent flavor, and discreet delivery. Real COAs for every batch.",
    highlights: "Verified potency • Travel-ready • Lab-tested • Quality brands only",
  },
  {
    emoji: "🍬",
    label: "Edibles & Beverages",
    href: "/shop?category=edible",
    desc: "Gummies, chocolates, and seltzers with full ingredient transparency. Precise dosing, verified compliance, and flavors that actually taste good.",
    highlights: "Transparent ingredients • Precise dosing • Full COAs • Shelf-stable",
  },
  {
    emoji: "🛠️",
    label: "Accessories & Hardware",
    href: "/shop?category=accessory",
    desc: "The gear that matters. Quality grinders, rolling supplies, glass, and cleaning tools from brands we actually trust.",
    highlights: "Quality brands • Practical selection • Expert-curated • Always in stock",
  },
];

const trustSignals = [
  {
    number: "100%",
    label: "Lab-Tested Products",
  },
  {
    number: "30 Days",
    label: "Hassle-Free Returns",
  },
  {
    number: "2-5 Days",
    label: "Shipping Nationwide",
  },
  {
    number: "24/7",
    label: "Customer Support",
  },
];

const complianceFeatures = [
  "USDA Hemp Program Compliant",
  "All Δ9-THC ≤0.3% verified",
  "Independent Lab Testing (COAs)",
  "Batch Testing Per Strain",
  "Residual Solvent Analysis",
  "Heavy Metal Screening",
  "Mycotoxin Testing",
  "Microbial Analysis",
  "Potency & Terpene Profiles",
  "Pesticide Screening",
];

const whyChooseUs = [
  {
    title: "Uncompromising Source Standards",
    desc: "We turn down far more products than we accept. Our buyers work directly with cultivators to ensure every strain meets our quality bar: proper cure, optimal freshness, and exceptional terp profiles.",
  },
  {
    title: "Real Customers, Real Reviews",
    desc: "Every review is from verified purchases. No fake 5-stars, no astroturfing. See what actual people think of the exact products they received.",
  },
  {
    title: "Competitive Pricing Without Compromise",
    desc: "We negotiate volume discounts with cultivators, not to sell cheap, but to pass savings to you. Better products, better prices, no race to the bottom.",
  },
  {
    title: "Expert Community",
    desc: "Our team has decades of combined experience in hemp cultivation, compliance, and retail. Ask us anything; we actually know what we're talking about.",
  },
  {
    title: "Wholesale Done Right",
    desc: "For businesses: tiered pricing based on volume, dedicated account management, and flexible payment terms. Built for resellers, dispensaries, and retailers who care about quality.",
  },
  {
    title: "Compliance You Can Count On",
    desc: "We track everything. USDA Farm Bill alignment, state-level regulations, third-party verification. Your order arrives compliant, and you have the documentation to prove it.",
  },
];

const faqs = [
  {
    q: "How fresh are your products?",
    a: "We rotate inventory regularly and only stock products from recent harvests. Flowers are typically 2-8 months from harvest when they reach you, stored in optimal conditions to preserve terpenes and potency.",
  },
  {
    q: "Can I see the lab results?",
    a: "Absolutely. Every product has a downloadable COA from a third-party lab. We link them directly on the product page. No hunting, no BS.",
  },
  {
    q: "Do you ship to my state?",
    a: "We ship to all states where delta-9 hemp (≤0.3%) is legal. Your state is automatically selected at checkout. If we don't ship there, you'll see a notice upfront.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "30-day money-back guarantee. No questions asked. We want you to be happy with what you get.",
  },
  {
    q: "How do wholesale rates work?",
    a: "Volume-based tiering. Order more, pay less per unit. We also offer marketing support, priority access to new products, and flexible terms for established businesses.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 60% 40%, #1A2E1A 0%, #0D1F0D 65%)" }}
      >
        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-green/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green/10 border border-brand-green/25 text-brand-green text-sm font-medium mb-8">
            <Leaf className="h-3.5 w-3.5" />
            Current Processing Times: 1-2 Business Days.
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-display font-bold text-brand-cream mb-6 leading-[1.05]">
            Hemp Done{" "}
            <span className="gradient-text">Right</span>
          </h1>

          <p className="text-xl sm:text-2xl text-brand-cream-muted mb-12 max-w-2xl mx-auto leading-relaxed">
            Third-party tested hemp products including vapes, edibles, and accessories from trusted cultivators. Full lab transparency and verified certificates of analysis are available.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-card bg-brand-green text-white font-semibold text-lg hover:bg-brand-green-light hover:shadow-[0_0_40px_rgba(124,179,66,0.4)] transition-all"
            >
              Explore Products <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/coa"
              className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-card border border-brand-green/40 text-brand-green font-semibold text-lg hover:bg-brand-green/10 transition-all"
            >
              <FlaskConical className="h-5 w-5" />
              View Lab Results
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {trustSignals.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-brand-cream font-display">{s.number}</p>
                <p className="text-xs text-brand-cream-dark mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-8 bg-gradient-to-b from-brand-green/50 to-transparent" />
        </div>
      </section>

      {/* ── CATEGORY GRID ── */}
      <section className="section-padding bg-[#0A160A]">
        <div className="container-brand">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-cream mb-3">
              What We Carry
            </h2>
            <p className="text-brand-cream-muted text-lg">
              Curated products across four main categories. All tested. All compliant. All fresh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group glass-card p-6 border border-brand-green/10 hover:border-brand-green/30 hover:bg-brand-green/5 transition-all duration-200 rounded-card flex flex-col"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {cat.emoji}
                </div>
                <h3 className="font-display font-semibold text-brand-cream mb-2 text-lg">{cat.label}</h3>
                <p className="text-sm text-brand-cream-muted mb-4 flex-grow">{cat.desc}</p>
                <p className="text-xs text-brand-green font-semibold">{cat.highlights}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUALITY STANDARDS ── */}
      <section className="section-padding">
        <div className="container-brand">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-cream mb-3">
              Verified Standards
            </h2>
            <p className="text-brand-cream-muted text-lg max-w-2xl mx-auto">
              We don't compete on price. We compete on standards you can actually verify.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {qualityFeatures.map((f) => (
              <div key={f.title} className="glass-card p-6 border border-white/5 hover:border-brand-green/20 transition-colors group">
                <div className="w-12 h-12 rounded-card bg-brand-green/10 flex items-center justify-center mb-5 group-hover:bg-brand-green/20 transition-colors">
                  <f.icon className="h-6 w-6 text-brand-green" />
                </div>
                <h3 className="font-display font-semibold text-brand-cream mb-2">{f.title}</h3>
                <p className="text-sm text-brand-cream-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE CHECKLIST ── */}
      <section className="section-padding bg-[#0A160A]">
        <div className="container-brand">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4 text-brand-green text-sm font-semibold">
                <Shield className="h-4 w-4" />
                VERIFIED COMPLIANCE
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-cream mb-3">
                Every Product Is Tested For
              </h2>
              <p className="text-brand-cream-muted">
                Independent third-party labs verify everything. You get the documentation.
              </p>
            </div>

            <div className="glass-card p-8 border border-brand-green/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {complianceFeatures.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                    <span className="text-brand-cream">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-10">
              <Link
                href="/coa"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-brand border border-brand-green/40 text-brand-green font-semibold hover:bg-brand-green/10 transition-all"
              >
                <FlaskConical className="h-4 w-4" />
                Download Certificates of Analysis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHIPPING & LOGISTICS ── */}
      <section className="section-padding">
        <div className="container-brand">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-cream mb-3">
              Shipping the Right Way
            </h2>
            <p className="text-brand-cream-muted text-lg">
              Fast, tracked, insured, and discreet. Standard across the entire customer base.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shipperBenefits.map((b) => (
              <div key={b.title} className="glass-card p-6 border border-white/5 hover:border-brand-green/20 transition-colors group">
                <div className="w-12 h-12 rounded-card bg-brand-green/10 flex items-center justify-center mb-5 group-hover:bg-brand-green/20 transition-colors">
                  <b.icon className="h-6 w-6 text-brand-green" />
                </div>
                <h3 className="font-display font-semibold text-brand-cream mb-2">{b.title}</h3>
                <p className="text-sm text-brand-cream-muted leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="section-padding bg-[#0A160A]">
        <div className="container-brand">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-brand-cream mb-3">
              Why We're Different
            </h2>
            <p className="text-brand-cream-muted text-lg max-w-2xl mx-auto">
              We're not just another marketplace. We actually care about what we sell.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {whyChooseUs.map((item, i) => (
              <div key={i} className="glass-card p-8 border border-white/5 hover:border-brand-green/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-card bg-brand-green/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-5 w-5 text-brand-green" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-brand-cream mb-2 text-lg">{item.title}</h3>
                    <p className="text-brand-cream-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHOLESALE PROGRAM ── */}
      <section className="section-padding">
        <div className="container-brand">
          <div className="relative overflow-hidden rounded-card border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-brand-green/10 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-violet-400 text-sm font-semibold mb-3">
                  <Users className="h-4 w-4" />
                  FOR RETAILERS & DISPENSARIES
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-cream mb-4">
                  Wholesale Program
                </h2>
                <p className="text-brand-cream-muted mb-4 max-w-lg leading-relaxed">
                  Tiered pricing based on volume. Priority access to new products. Dedicated account manager. Flexible payment terms for established businesses. We work with retailers who share our commitment to quality.
                </p>
                <ul className="space-y-2 text-brand-cream-muted text-sm mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-green flex-shrink-0" />
                    Volume-based discounts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-green flex-shrink-0" />
                    First access to new cultivars
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand-green flex-shrink-0" />
                    Dedicated account support
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link
                  href="/apply-wholesale"
                  className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-brand bg-violet-500 text-white font-semibold hover:bg-violet-400 transition-colors whitespace-nowrap"
                >
                  Apply for Wholesale <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/wholesale"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-brand border border-white/20 text-brand-cream-muted hover:text-brand-cream hover:border-white/30 transition-colors font-medium whitespace-nowrap"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-padding bg-[#0A160A]">
        <div className="container-brand max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-cream mb-3">
              Common Questions
            </h2>
            <p className="text-brand-cream-muted">
              Real answers about quality, compliance, and how we operate.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group glass-card border border-white/5 hover:border-brand-green/20 transition-colors cursor-pointer"
              >
                <summary className="p-6 font-semibold text-brand-cream flex items-center justify-between select-none hover:text-brand-green transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-brand-green group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-6 text-brand-cream-muted leading-relaxed border-t border-white/5 pt-6">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-brand-cream-muted mb-4">Can't find what you're looking for?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-brand border border-brand-green/40 text-brand-green font-semibold hover:bg-brand-green/10 transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section-padding">
        <div className="container-brand text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-cream mb-6">
            Ready to Experience the Difference?
          </h2>
          <p className="text-brand-cream-muted mb-10 text-lg leading-relaxed">
            Browse our full catalog of lab-tested, Farm Bill compliant products. Everything is tracked, verified, and shipped within 2-5 days. Join thousands of customers who trust Trippy Hippie for quality you can actually verify.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 h-14 px-12 rounded-card bg-brand-green text-white font-bold text-lg hover:bg-brand-green-light hover:shadow-[0_0_40px_rgba(124,179,66,0.4)] transition-all"
            >
              Shop Now <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/coa"
              className="inline-flex items-center justify-center gap-2 h-14 px-12 rounded-card border border-brand-green/40 text-brand-green font-bold text-lg hover:bg-brand-green/10 transition-all"
            >
              <FlaskConical className="h-5 w-5" />
              View All Lab Results
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
