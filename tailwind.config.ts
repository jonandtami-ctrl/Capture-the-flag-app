import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FAF6EE",
          light: "#FFFDF9",
        },
        beige: {
          DEFAULT: "#F0E6D2",
          dark: "#E4D5B7",
        },
        forest: {
          DEFAULT: "#1F3A2E",
          light: "#2C4E3D",
          dark: "#152A21",
        },
        gold: {
          DEFAULT: "#B8965A",
          light: "#D4B67F",
          dark: "#96773F",
        },
        charcoal: {
          DEFAULT: "#2B2A28",
          light: "#4A4844",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem",
        "3xl": "2.5rem",
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(31, 58, 46, 0.18)",
        card: "0 8px 30px -10px rgba(43, 42, 40, 0.12)",
      },
      maxWidth: {
        "8xl": "90rem",
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "fade-in-up": "fadeInUp 0.9s ease-out forwards",
        "bounce-slow": "bounceSlow 2.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
