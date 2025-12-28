import typography from "@tailwindcss/typography";
import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
  // 1. Dark Mode Strategy
  // Uses a 'class' strategy (looking for the .dark class on the HTML tag)
  // This is standard for ShadCN themes.
  darkMode: ["class"],

  // 2. Content Paths
  // Tells Tailwind to scan these files for class names to generate CSS.
  content: ["./src/**/*.{html,js,svelte,ts}"],

  // 3. Safety List
  // Forces the 'dark' class to always be generated, ensuring theme toggling works.
  safelist: ["dark"],

  theme: {
    // 4. Container Configuration
    // Sets defaults for the .container class (centering and padding).
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 5. CSS Variable Mapping (The Core of ShadCN)
      // This maps Tailwind utility classes (e.g., bg-primary) to the CSS variables
      // defined in your src/app.css (e.g., --primary).
      // The syntax `hsl(var(--name) / <alpha-value>)` allows opacity modifiers
      // like `bg-primary/50` to work correctly.
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
      },
      // 6. Border Radius Mapping
      // Maps utilities like `rounded-lg` to the --radius variable in app.css.
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // 7. Font Family
      // Ensures the default sans-serif stack is included.
      fontFamily: {
        sans: [...fontFamily.sans],
      },
    },
  },

  // 8. Plugins
  // - typography: For rendering Markdown in chat bubbles nicely (prose class).
  plugins: [typography],
};

export default config;
