/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
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
            // background: "#fff",
          },
          to: {
            transform: "scale(1.5)",
            zIndex: 40,
            // background: "#181818",
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
        zoomUnzoom: {
          from: {
            transform: "scale(1)",
          },
          to: {
            transform: "scale(1.5)",
          },
        },
        fromLeft: {
          from: {
            transform: "translateX(-100%)",
            zIndex: 0,
            background: "#fff",
          },
          to: {
            transform: "translateX(0)",
            background: "#181818",
          },
        },
        fromTop: {
          from: {
            transform: "translateY(-100%)",
            zIndex: 0,
            background: "#fff",
          },
          to: {
            transform: "translateY(0)",
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
      },
      animation: {
        fromLeft: "fromLeft 0.4s forwards",
        fromTop: "fromTop 0.4s forwards",
        zoomIn: "zoomIn 0.4s forwards 0.7s",
        zoomInNoDelay: "zoomWithSpin 0.4s ease-in-out forwards",
        miniaAnim: "MiniaOp 3s forwards 0.7s",
        // reduceOpacity: "reduceOpacity 0.4s forwards 0.7s",
      },
    },
  },
  plugins: [],
};
