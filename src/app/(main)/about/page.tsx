import Link from "next/link";
import { Leaf, Shield, CheckCircle, Users, ArrowRight, Heart } from "lucide-react";

/* src/app/(main)/about/page.tsx */

export default function AboutPage() {
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="section-padding text-center" style={{ background: "radial-gradient(ellipse at top, #1A2E1A 0%, #0D1F0D 70%)" }}>
        <div className="container-brand max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-brand-green text-sm font-semibold mb-6">
            <Heart className="h-4 w-4" />
            WHO WE ARE
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-brand-cream mb-6">
            We Actually Care About What We Sell
          </h1>
          <p className="text-xl text-brand-cream-muted leading-relaxed">
            Trippy Hippie isn't a warehouse that slaps a label on anything. We built this because we were tired of not knowing what we were buying. So we created the shop we wanted to see.
          </p>
        </div>
      </section>

      {/* The Real Story */}
      <section className="section-padding bg-[#0A160A]">
        <div className="container-brand max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-cream mb-8 text-center">How This Started</h2>
          <div className="space-y-6 text-brand-cream-muted leading-relaxed">
            <p>
              We got tired of buying products with vague sourcing, sketchy lab work, and sellers who couldn't answer basic questions about what they were selling. The hemp market had (and still has) a trust problem.
            </p>
            <p>
              So we decided to do something different. We started talking to legitimate cultivators, and top-notch distributors. We visited farms. We watched harvests. We watched the processing. We asked hard questions about methods, storage, and testing. We built relationships with people who think like we do: quality matters more than volume.
            </p>
            <p>
              Every product in our shop had to pass the same test we would use for ourselves. Not because it sounds good in marketing. Because we genuinely don't want to sell something we wouldn't buy.
            </p>
          </div>
        </div>
      </section>

      {/* Our Actual Standards */}
      <section className="section-padding">
        <div className="container-brand">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-cream text-center mb-12">Our Three Commitments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Full Transparency",
                desc: "Every product has a real Certificate of Analysis from an independent lab. You get the link. You get to verify it. No hidden batches, no 'trust us.'"
              },
              {
                icon: Leaf,
                title: "We Turn Down 90%",
                desc: "Most products we're offered don't make the cut. We source from cultivators we respect, and we say no far more than we say yes. That matters."
              },
              {
                icon: CheckCircle,
                title: "Real Support",
                desc: "When something goes wrong, it's handled. Full refund, replacement, or conversation. No runaround. You bought from us for a reason."
              },
            ].map(v => (
              <div key={v.title} className="glass-card p-8 border border-white/5 hover:border-brand-green/20 transition-colors">
                <div className="w-12 h-12 rounded-card bg-brand-green/10 flex items-center justify-center mb-5">
                  <v.icon className="h-6 w-6 text-brand-green" />
                </div>
                <h3 className="font-display font-semibold text-brand-cream text-lg mb-3">{v.title}</h3>
                <p className="text-brand-cream-muted leading-relaxed text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Actually Do */}
      <section className="section-padding bg-[#0A160A]">
        <div className="container-brand max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-cream mb-8 text-center">Our Process</h2>
          <div className="space-y-6">
            {[
              { step: "01", title: "Source Right", desc: "Direct relationships with cultivators who share our standards. No middleman markups, just honest agreements about what matters." },
              { step: "02", title: "Test Everything", desc: "Before anything lands on our shelf, it gets third-party tested. Potency, terpenes, residual solvents, heavy metals. All verified." },
              { step: "03", title: "Store Smart", desc: "Environmental controls matter. Temperature, humidity, light exposure. We don't just sit on inventory and hope it stays fresh." },
              { step: "04", title: "Ship With Respect", desc: "Discreet packaging, tracked delivery, handled carefully. Your order arrives in the condition we'd want to receive it." },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 glass-card p-6 border border-white/5">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-card bg-brand-green/10 flex items-center justify-center">
                    <span className="font-display font-bold text-brand-green">{item.step}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-brand-cream mb-2">{item.title}</h3>
                  <p className="text-brand-cream-muted text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Retailers */}
      <section className="section-padding">
        <div className="container-brand max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-cream mb-6">For Businesses</h2>
          <p className="text-brand-cream-muted mb-8 leading-relaxed">
            If you run a dispensary, smoke shop, or retail operation, we work with you the same way. Volume discounts that actually make sense. Priority access to new cultivars. Account management that answers the phone. We're building wholesale relationships, not just transactions.
          </p>
          <Link
            href="/apply-wholesale"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-card bg-brand-green text-white font-semibold hover:bg-brand-green-light transition-all"
          >
            Apply for Wholesale <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-[#0A160A] text-center">
        <div className="container-brand">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-cream mb-4">Ready to Try Us Out?</h2>
          <p className="text-brand-cream-muted mb-8">Everything you read here is backed by real standards and real execution.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 h-12 px-8 rounded-card bg-brand-green text-white font-semibold hover:bg-brand-green-light transition-all">
            Browse Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
