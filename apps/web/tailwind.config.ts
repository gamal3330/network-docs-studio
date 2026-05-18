import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#121621",
        panel: "#f7f8fb"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(18, 22, 33, 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
