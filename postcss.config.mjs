////////////////////////////////////////////////////////////////////
// POSTCSS CONFIG — C:\trippyhippieorg\postcss.config.mjs
// PostCSS processes CSS before Tailwind generates its classes.
// autoprefixer adds vendor prefixes for cross-browser support.
////////////////////////////////////////////////////////////////////

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
