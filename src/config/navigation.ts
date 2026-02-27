/*
  navigation.ts — all nav link definitions.
  Import mainNav for the Navbar, footerNav for the Footer.
*/

export interface NavLink {
  href:  string;
  label: string;
}

export interface FooterNavGroup {
  label: string;
  links: NavLink[];
}

/* Top navbar links — shown on desktop, also in MobileMenu */
export const mainNav: NavLink[] = [
  { href: "/shop",            label: "Shop" },

  { href: "/community",       label: "Community" },
  { href: "/about",           label: "About" },
  { href: "/coa",             label: "Lab Results" },
];

/* Footer nav groups */
export const footerNav: FooterNavGroup[] = [
  {
    label: "Shop",
    links: [
      { href: "/shop",             label: "All Products" },
      { href: "/shop?category=flower",   label: "Flower" },
      { href: "/shop?category=vape",     label: "Vapes" },
      { href: "/shop?category=edible",   label: "Edibles" },
      { href: "/shop?category=accessory",label: "Accessories" },
    ],
  },
  {
    label: "Company",
    links: [
      { href: "/about",       label: "About Us" },
    
      { href: "/community",   label: "Community" },
      { href: "/contact",     label: "Contact" },
      { href: "/coa",         label: "Lab Results" },
    ],
  },
  {
    label: "Business",
    links: [
      { href: "/apply-wholesale",  label: "Wholesale Program" },
      { href: "/apply-affiliate",  label: "Affiliate Program" },
      { href: "/faq",              label: "FAQ" },
    ],
  },
  {
    label: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms",   label: "Terms of Service" },
      { href: "/legal",   label: "Legal Disclosures" },
    ],
  },
];
