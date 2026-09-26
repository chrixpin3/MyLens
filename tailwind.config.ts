import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#000000",
          950: "#0a0a0a",
          900: "#111111",
          850: "#1a1a1a",
          800: "#2e2e2e",
        },
        paper: {
          DEFAULT: "#ffffff",
          50: "#f5f5f5",
          100: "#e5e5e5",
        },
        hairline: {
          DEFAULT: "rgba(255,255,255,0.12)",
          soft: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.22)",
          dark: "rgba(0,0,0,0.10)",
          "dark-strong": "rgba(0,0,0,0.20)",
        },
        glass: {
          dark: "rgba(255,255,255,0.06)",
          "dark-hover": "rgba(255,255,255,0.10)",
          "dark-strong": "rgba(255,255,255,0.12)",
          light: "rgba(0,0,0,0.05)",
          "light-hover": "rgba(0,0,0,0.09)",
        },
        focus: "#ffffff",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "fluid-xs": ["clamp(0.75rem, 0.72rem + 0.15vw, 0.85rem)", {}],
        "fluid-sm": ["clamp(0.875rem, 0.84rem + 0.2vw, 1rem)", {}],
        "fluid-base": ["clamp(1rem, 0.96rem + 0.2vw, 1.125rem)", {}],
        "fluid-lg": ["clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)", {}],
        "fluid-xl": ["clamp(1.375rem, 1.2rem + 0.8vw, 2rem)", {}],
        "fluid-2xl": ["clamp(1.75rem, 1.4rem + 1.6vw, 3rem)", {}],
        "fluid-3xl": ["clamp(2.25rem, 1.6rem + 3vw, 4.5rem)", {}],
        "fluid-4xl": ["clamp(2.75rem, 1.6rem + 5.2vw, 7rem)", {}],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      borderRadius: {
        glass: "20px",
        "glass-lg": "24px",
        "glass-sm": "16px",
      },
      boxShadow: {
        glass:
          "0 1px 0 0 rgba(255,255,255,0.08) inset, 0 20px 60px -24px rgba(0,0,0,0.75)",
        "glass-light":
          "0 1px 0 0 rgba(255,255,255,0.6) inset, 0 18px 50px -28px rgba(0,0,0,0.35)",
        "glass-sm": "0 8px 30px -18px rgba(0,0,0,0.7)",
        glow: "0 0 0 1px rgba(255,255,255,0.14), 0 0 40px -12px rgba(255,255,255,0.28)",
      },
      backdropBlur: {
        glass: "18px",
        "glass-lg": "24px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { opacity: "0.6", transform: "scale(0.9)" },
          "100%": { opacity: "0", transform: "scale(1.6)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 1.6s infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
