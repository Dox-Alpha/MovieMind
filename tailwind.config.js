/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070a12",
        panel: "#0e1422",
        panel2: "#111a2c",
        line: "rgba(128, 232, 255, 0.16)",
        cyan: "#32d9ff",
        violet: "#8b5cf6",
        amber: "#fbbf24",
        coral: "#ff6b6b"
      },
      boxShadow: {
        glow: "0 0 32px rgba(50, 217, 255, 0.16)",
        violet: "0 0 36px rgba(139, 92, 246, 0.14)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"]
      }
    }
  },
  plugins: [],
};
