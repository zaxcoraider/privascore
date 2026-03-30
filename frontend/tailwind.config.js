/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050816",
        midnight: "#09101f",
        panel: "rgba(13, 20, 38, 0.72)",
        line: "rgba(148, 163, 184, 0.16)",
        accent: "#7c8cff",
        accentSoft: "#9d7bff",
        success: "#3ee089",
        danger: "#ff6b7a",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "monospace"],
      },
      boxShadow: {
        panel: "0 24px 80px rgba(4, 8, 20, 0.55)",
        glow: "0 0 0 1px rgba(124, 140, 255, 0.18), 0 18px 60px rgba(40, 58, 140, 0.24)",
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top, rgba(124, 140, 255, 0.16), transparent 38%), radial-gradient(circle at 80% 20%, rgba(140, 92, 255, 0.12), transparent 28%), linear-gradient(180deg, #070b18 0%, #050816 42%, #02040b 100%)",
      },
      animation: {
        float: "float 10s ease-in-out infinite",
        pulseSoft: "pulseSoft 1.8s ease-in-out infinite",
        reveal: "reveal 450ms ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -10px, 0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "1" },
        },
        reveal: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

