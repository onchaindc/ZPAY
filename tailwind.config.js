/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#05070d",
        zama: "#facc15",
        "zama-gold": "#facc15",
        "zama-soft": "#fde68a",
        "zama-ink": "#111111",
        lavender: "#fde68a"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 50px rgba(250, 204, 21, 0.24)",
        gold: "0 0 34px rgba(250, 204, 21, 0.35)"
      }
    }
  },
  plugins: []
};

module.exports = config;
