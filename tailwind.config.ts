import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070807",
        graphite: "#141816",
        slate: "#1e2420",
        fog: "#eceae4",
        mist: "#b8b5ad",
        moss: "#1a3d2e",
        mossdeep: "#0f2419",
        /** Тёмный изумруд — фон витрины / каталога */
        emeraldnight: "#052922",
        emeraldvoid: "#031814",
        brass: "#9a8b6f"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        editorial: ["var(--font-editorial)", "Georgia", "Times New Roman", "serif"]
      },
      letterSpacing: {
        capsule: "0.22em"
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.8s var(--ease-out, cubic-bezier(0.22, 1, 0.36, 1)) both"
      }
    }
  },
  plugins: []
};

export default config;
