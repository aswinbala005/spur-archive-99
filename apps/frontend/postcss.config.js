export default {
  plugins: {
    // Tailwind CSS v4 PostCSS plugin
    // This handles scanning your files and generating CSS on demand.
    "@tailwindcss/postcss": {},

    // Autoprefixer
    // Adds vendor prefixes (like -webkit-, -moz-) to CSS rules
    // to ensure compatibility across different browsers.
    autoprefixer: {},
  },
};
