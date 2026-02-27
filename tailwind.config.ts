import type { Config } from "tailwindcss";

////////////////////////////////////////////////////////////////////
// TAILWIND CONFIGURATION — C:\trippyhippieorg\tailwind.config.ts
// Defines the brand design system:
// colors, fonts, animations, spacing, and component utilities
////////////////////////////////////////////////////////////////////

const config: Config = {

  ////////////////////////////////////////////////////////////////////
  // CONTENT PATHS
  // Tailwind scans these files to tree-shake unused CSS classes.
  // If you add new file locations, add them here or styles won't apply.
  ////////////////////////////////////////////////////////////////////
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  ////////////////////////////////////////////////////////////////////
  // DARK MODE
  // "class" strategy: dark mode activates via <html class="dark">
  // Controlled by ThemeProvider — allows user preference toggle
  ////////////////////////////////////////////////////////////////////
  darkMode: "class",

  theme: {
    extend: {

      //////////////////////////////////////////////////////////////////
      // BRAND COLORS
      // Full Trippy Hippie palette with light/dark variants.
      // Usage: bg-brand-green, text-brand-cream, border-brand-violet
      //////////////////////////////////////////////////////////////////
      colors: {
        // Primary brand green — used for CTAs, accents, links
        brand: {
          green: {
            DEFAULT: "#7CB342",
            light: "#9CCC65",
            dark: "#558B2F",
            muted: "#7CB34220",
          },
          // Mystic violet — secondary accent, hover states, highlights
          violet: {
            DEFAULT: "#6B3FA0",
            light: "#9C6FD4",
            dark: "#4A2870",
            muted: "#6B3FA020",
          },
          // Dark forest — primary dark background
          forest: {
            DEFAULT: "#1A2E1A",
            light: "#243D24",
            dark: "#0D1A0D",
          },
          // Smoke glass — card backgrounds in dark mode
          smoke: {
            DEFAULT: "#0D1F0D",
            light: "#162816",
            glass: "rgba(13, 31, 13, 0.8)",
          },
          // Cream — primary text on dark backgrounds
          cream: {
            DEFAULT: "#F5F0E8",
            muted: "#C8C0B0",
            dark: "#8A8070",
          },
        },

        // Status colors — order states, alerts, badges
        status: {
          processing: "#F59E0B",   // amber — order in progress
          pending: "#3B82F6",      // blue — waiting
          shipped: "#8B5CF6",      // purple — on the way
          completed: "#10B981",    // green — done
          rejected: "#EF4444",     // red — denied
          approved: "#10B981",     // green — approved
        },
      },

      //////////////////////////////////////////////////////////////////
      // TYPOGRAPHY
      // Brand fonts loaded via Google Fonts in layout.tsx
      // Display: Cinzel Decorative — titles, hero, brand moments
      // Body: Inter — readable, modern body text
      //////////////////////////////////////////////////////////////////
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      //////////////////////////////////////////////////////////////////
      // FONT SIZES
      // Custom type scale beyond Tailwind defaults
      //////////////////////////////////////////////////////////////////
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "hero": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1.1" }],
        "section": ["clamp(1.75rem, 4vw, 3rem)", { lineHeight: "1.2" }],
      },

      //////////////////////////////////////////////////////////////////
      // SPACING
      // Additional spacing tokens for consistent layouts
      //////////////////////////////////////////////////////////////////
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "section": "clamp(4rem, 8vw, 8rem)",
      },

      //////////////////////////////////////////////////////////////////
      // BORDER RADIUS
      // Brand shape language — slightly rounded, not pill-y
      //////////////////////////////////////////////////////////////////
      borderRadius: {
        "brand": "0.625rem",
        "card": "1rem",
        "pill": "9999px",
      },

      //////////////////////////////////////////////////////////////////
      // BOX SHADOWS
      // Elevation system — glass morphism style for dark mode
      //////////////////////////////////////////////////////////////////
      boxShadow: {
        "card": "0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 4px rgba(0,0,0,0.2)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(124, 179, 66, 0.2)",
        "glow-green": "0 0 20px rgba(124, 179, 66, 0.4), 0 0 40px rgba(124, 179, 66, 0.1)",
        "glow-violet": "0 0 20px rgba(107, 63, 160, 0.4), 0 0 40px rgba(107, 63, 160, 0.1)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.05)",
        "navbar": "0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.3)",
      },

      //////////////////////////////////////////////////////////////////
      // BACKGROUND IMAGES
      // Custom gradient utilities for brand backgrounds
      //////////////////////////////////////////////////////////////////
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #1A2E1A 0%, #0D1F0D 50%, #1A2E1A 100%)",
        "gradient-hero": "radial-gradient(ellipse at center, #243D24 0%, #0D1F0D 70%)",
        "gradient-card": "linear-gradient(145deg, rgba(36, 61, 36, 0.6) 0%, rgba(13, 31, 13, 0.8) 100%)",
        "gradient-green": "linear-gradient(135deg, #7CB342 0%, #558B2F 100%)",
        "gradient-violet": "linear-gradient(135deg, #6B3FA0 0%, #4A2870 100%)",
        "noise": "url('/assets/images/noise.png')",
      },

      //////////////////////////////////////////////////////////////////
      // ANIMATIONS
      // Custom keyframe animations for cart counter, modals, etc.
      //////////////////////////////////////////////////////////////////
      keyframes: {
        // Slide in from the right — used for cart widget
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        // Slide out to right — cart widget close
        "slide-out-right": {
          "0%": { transform: "translateX(0)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
        // Scale + fade in — used for modals
        "modal-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        // Bounce — cart counter when item added
        "counter-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.4)" },
        },
        // Pulse glow — for active/highlighted elements
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(124, 179, 66, 0.2)" },
          "50%": { boxShadow: "0 0 30px rgba(124, 179, 66, 0.6)" },
        },
        // Fade up — staggered reveal for product cards
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Shimmer — skeleton loading animation
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      animation: {
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out-right": "slide-out-right 0.25s cubic-bezier(0.4, 0, 1, 1)",
        "modal-in": "modal-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "counter-bounce": "counter-bounce 0.3s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "shimmer": "shimmer 1.5s linear infinite",
      },

      //////////////////////////////////////////////////////////////////
      // TRANSITIONS
      // Standard easing curves for consistent feel
      //////////////////////////////////////////////////////////////////
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.16, 1, 0.3, 1)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      //////////////////////////////////////////////////////////////////
      // BACKDROP BLUR
      // For glass morphism effects on cards + navbar
      //////////////////////////////////////////////////////////////////
      backdropBlur: {
        "xs": "2px",
        "brand": "12px",
      },

      //////////////////////////////////////////////////////////////////
      // Z-INDEX SCALE
      // Consistent layering: modals > drawers > navbar > content
      //////////////////////////////////////////////////////////////////
      zIndex: {
        "navbar": "50",
        "drawer": "60",
        "modal": "70",
        "toast": "80",
        "age-gate": "100",
      },

      //////////////////////////////////////////////////////////////////
      // SCREENS (BREAKPOINTS)
      // Standard Tailwind breakpoints + custom xs for small devices
      //////////////////////////////////////////////////////////////////
      screens: {
        "xs": "375px",
      },
    },
  },

  ////////////////////////////////////////////////////////////////////
  // PLUGINS
  // @tailwindcss/typography — for blog post prose styling
  // @tailwindcss/forms — for consistent form input base styles
  ////////////////////////////////////////////////////////////////////
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};

export default config;