/* Site config — single source of truth for brand, URLs, SEO, and feature flags */

export const siteConfig = {
  name: "Trippy Hippie",
  legalName: "Trippy Hippie Wholesale LLC",
  tagline: "Premium Hemp • THCa • Elevated Experiences",
  description:
    "Trippy Hippie — the most trusted online source for premium THCa flower, vapes, edibles, and accessories. Lab-tested, craft-quality hemp delivered to your door.",

  url: process.env.NEXT_PUBLIC_SITE_URL || "https://trippyhippie.org",
  domain: "trippyhippie.org",

  email: "support@trippyhippie.org",
  supportEmail: "support@trippyhippie.org",
  businessEmail: "info@trippyhippie.org",
  phone: null as string | null,

  cashAppHandle: process.env.NEXT_PUBLIC_CASHAPP_HANDLE || "$TrippyHippieSmoke",

  social: {
    instagram: "trippyhippiesmoke",
    tiktok:    "trippyhippiesmoke",
    twitter:   null as string | null,
    youtube:   null as string | null,
    discord:   null as string | null,
  },

  seo: {
    defaultTitle: "Trippy Hippie — Premium THCa & Hemp",
    titleTemplate: "%s | Trippy Hippie",
    defaultDescription:
      "Premium THCa flower, vapes, edibles and accessories. Lab-tested, craft-quality hemp. Wholesale available.",
    /* SEO meta keywords — these are <head> tags only, invisible to users.
       Product categories shown on the site come from the database, not here. */
    keywords: [
      "THCa flower",
      "hemp flower",
      "THCa vapes",
      "hemp edibles",
      "buy THCa online",
      "wholesale hemp",
      "Trippy Hippie",
    ] as string[],
    ogImage: "/assets/images/og-default.jpg",
  },

  features: {
    web3Enabled:       true,
    communityEnabled:  true,
    blogEnabled:       true,
    affiliatesEnabled: true,
    wholesaleEnabled:  true,
    aiRecommendations: true,
    cryptoPayments:    true,
    cashAppPayments:   true,
    wirePayments:      true,
  },

  minimumAge: 21,

  affiliateCommissionPercent: 10,

  wholesaleMinimumOrderCents: 20000, // $200.00
};

export type SiteConfig = typeof siteConfig;