import type { Config } from "tailwindcss";

const config = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        sportsbook: {
          fanduel: "#00A3E0",
          draftkings: "#F87C00",
          bet365: "#0B6231",
          hardrock: "#512398",
          espnbet: "#00A94F",
          fanatics: "#002F6C",
        },
      },
      boxShadow: {
        card: "0 15px 35px -15px rgba(15, 23, 42, 0.45)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
