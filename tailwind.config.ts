import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#f7f0e2",
          soft: "#fbf7ef",
        },
        ink: {
          DEFAULT: "#141414",
          muted: "#5c5c5c",
          faint: "#8a8478",
        },
        hairline: "#d3c7b4",
        olive: {
          DEFAULT: "#58613a",
          dark: "#41492c",
        },
        clay: "#a85f42",
        primary: "#141414",
      },
      fontFamily: {
        sans: ["var(--font-ui)", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        panel: "0 18px 40px rgba(52, 44, 31, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
