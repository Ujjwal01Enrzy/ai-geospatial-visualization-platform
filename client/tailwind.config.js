/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          50: "#E8F2FF",
          100: "#D1E5FF",
          200: "#A3CBFF",
          300: "#75B1FF",
          400: "#4797FF",
          500: "#0F62FE", // Main primary
          600: "#0C4FCC",
          700: "#093C99",
          800: "#062966",
          900: "#031633",
        },
        // Accent palette
        accent: {
          50: "#E6F9F4",
          100: "#CCF3E9",
          200: "#99E7D3",
          300: "#66DBBD",
          400: "#33CFA7",
          500: "#00B894", // Main accent
          600: "#009376",
          700: "#006E59",
          800: "#004A3B",
          900: "#00251E",
        },
        // Neutral (dark mode support)
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A", // Main dark bg
        },
        // Confidence heatmap
        confidence: {
          low: "#FFBABA",
          mid: "#FFD580",
          high: "#7CFC00",
        },
        // Semantic colors
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["Roboto Mono", "monospace"],
      },
      fontSize: {
        h1: ["32px", { lineHeight: "40px", fontWeight: "700" }],
        h2: ["26px", { lineHeight: "32px", fontWeight: "600" }],
        h3: ["22px", { lineHeight: "28px", fontWeight: "600" }],
        h4: ["18px", { lineHeight: "24px", fontWeight: "600" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      spacing: {
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        24: "24px",
        32: "32px",
        40: "40px",
        280: "280px",
        360: "360px",
      },
      borderRadius: {
        card: "8px",
        button: "6px",
      },
      boxShadow: {
        "elevation-1":
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "elevation-2":
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "elevation-3":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        "elevation-4":
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      zIndex: {
        map: "1",
        controls: "10",
        panel: "20",
        modal: "50",
        toast: "100",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
