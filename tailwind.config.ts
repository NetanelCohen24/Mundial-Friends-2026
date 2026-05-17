import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pitch: "#0a5f3f",
        "pitch-dark": "#063d28",
        sunset: "#e85d24",
        "sunset-light": "#f4a261",
        cream: "#fdf8f0",
        ink: "#1a1a1a",
      },
      fontFamily: {
        display: ["var(--font-rubik)", "system-ui", "sans-serif"],
        body: ["var(--font-heebo)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
