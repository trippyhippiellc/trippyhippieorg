import type { Metadata, Viewport } from "next";
import { Cinzel, DM_Sans, JetBrains_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppProvider";
import { ConstructionModeGuard } from "@/components/guards/ConstructionModeGuard";
import { siteConfig } from "@/config/site";
import "@/app/globals.css";

/* Root layout — fonts, metadata, AppProvider wrapper */

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seo.defaultTitle,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.defaultDescription,
  keywords: siteConfig.seo.keywords,
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.seo.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    images: [siteConfig.seo.ogImage],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0D1F0D" },
    { media: "(prefers-color-scheme: light)", color: "#7CB342" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${cinzel.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-[var(--background)] text-[var(--foreground)] font-body antialiased"
        suppressHydrationWarning
      >
        <AppProvider>
          <ConstructionModeGuard>
            {children}
          </ConstructionModeGuard>
        </AppProvider>
      </body>
    </html>
  );
}
