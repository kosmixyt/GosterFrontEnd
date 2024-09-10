/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      roboto: ["Roboto", "sans-serif"],
    },
    extend: {
      borderRadius: {
        inherit: "inherit",
      },
      screens: {
        xs: "375px",
        ...defaultTheme.screens,
      },
      maxWidth: {
        128: "500px",
      },
      width: {
        128: "100%",
        "97%": "97%",
      },
      keyframes: {
        zoomIn: {
          from: {
            transform: "scale(1)",
            zIndex: 40,
          },
          to: {
            transform: "scale(1.5)",
            zIndex: 40,
          },
        },
        zoomWithSpin: {
          from: {
            transform: "scale(1)",
            zIndex: 40,
          },
          to: {
            transform: "scale(1.1) rotate(360deg)",
            zIndex: 40,
          },
        },
        MiniaOp: {
          "0%": {
            opacity: 1,
          },
          "100%": {
            opacity: 0,
          },
        },
        unscale: {
          from: {
            transform: "scale(100)",
          },
          to: {
            transform: "scale(1)",
          },
        },
      },
      animation: {
        zoomIn: "zoomIn 0.4s forwards 0.7s",
        zoomInNoDelay: "zoomWithSpin 0.4s ease-in-out forwards",
        miniaAnim: "MiniaOp 3s forwards 0.7s",
        unscale: "unscale 0.4s forwards",
      },
    },
  },
  plugins: [],
};
