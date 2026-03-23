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
        delabie: {
          blue: "#003B8E",
          "blue-dark": "#002A6B",
          "blue-light": "#0052CC",
          "blue-pale": "#E8F0FE",
          gray: "#F5F6F8",
          "gray-dark": "#6B7280",
          text: "#1A1A2E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
