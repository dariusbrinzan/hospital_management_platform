import type { Config } from "tailwindcss";

const { fontFamily } = require("tailwindcss/defaultTheme");

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        green: {
          400: "#2DD4BF", // Turcoaz deschis
          500: "#14B8A6", // Turcoaz principal
          600: "#0D9488", // Turcoaz închis
          700: "#0F766E", // Turcoaz foarte închis
        },
        teal: {
          400: "#2DD4BF",
          500: "#14B8A6",
          600: "#0D9488",
        },
        blue: {
          500: "#06B6D4", // Cyan/Turcoaz albastru
          600: "#0891B2",
        },
        red: {
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
        },
        light: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
        },
        dark: {
          50: "#F9FAFB", // Alb foarte deschis
          100: "#F3F4F6", // Alb gri deschis
          200: "#E5E7EB", // Gri foarte deschis
          300: "#D1D5DB", // Gri deschis
          400: "#9CA3AF", // Gri mediu
          500: "#6B7280", // Gri
          600: "#4B5563", // Gri închis
          700: "#374151", // Gri foarte închis
          800: "#1f2937", // Fundal dark mode
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      backgroundImage: {
        appointments: "url('/assets/images/appointments-bg.png')",
        pending: "url('/assets/images/pending-bg.png')",
        cancelled: "url('/assets/images/cancelled-bg.png')",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
