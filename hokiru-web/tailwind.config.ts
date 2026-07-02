import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1a1a1a",
        paper: "#fafaf9",
        accent: "#2563eb",
        muted: "#6b7280",
      },
    },
  },
  plugins: [],
};

export default config;
