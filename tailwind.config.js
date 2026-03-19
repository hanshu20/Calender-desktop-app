/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./index.html"],
  theme: {
    extend: {
      colors: {
        supernova: {
          night: "#0b1024",
          deep: "#121938",
          glow: "#8b5cf6",
          neon: "#ff4fd8",
          aqua: "#4fd9ff"
        }
      },
      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.35)",
        neon: "0 0 18px rgba(255, 79, 216, 0.45)",
        aqua: "0 0 16px rgba(79, 217, 255, 0.35)"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      }
    }
  },
  plugins: []
};
