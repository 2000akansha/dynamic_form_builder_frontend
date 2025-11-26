/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#264653", // Military Green (Main)
        primary2: "#71B3CE", // Lighter Military Green for accents
        secondary2: "#264658", // Muted Peach-Brown (hover/effects)
      },
    },
  },
  plugins: [
    function ({ addComponents, theme }) {
      addComponents({
        ".custom-input": {
          width: "100%",
          padding: "12px 20px",
          border: `1.25px solid ${theme("colors.secondary")}`,
          outlineColor: theme("colors.secondary"),
          borderRadius: "8px",
          boxSizing: "border-box",
          display: "inline-block",
          fontSize: "16px",
          "::placeholder": {
            color: theme("colors.secondary"),
            fontWeight: "600",
          },
        },
        ".input-padding": {
          padding: "6px 18px",
        },
        ".hide-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".hide-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        ".custom-scrollbar::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        ".custom-scrollbar::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(100, 100, 255, 0.6)",
          borderRadius: "10px",
          border: "2px solid transparent",
          backgroundClip: "padding-box",
        },
        ".custom-scrollbar::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "rgba(100, 100, 255, 0.8)",
        },
        ".custom-scrollbar::-webkit-scrollbar-track": {
          backgroundColor: "rgba(200, 200, 255, 0.2)",
          borderRadius: "10px",
        },
      });
    },
  ],
};
