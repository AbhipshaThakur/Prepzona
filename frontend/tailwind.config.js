/** @type {import('tailwindcss').Config} */
export default {

  darkMode: "class",

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {

    extend: {

      colors: {

        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#ec4899",

        darkbg: "#020617",
        carddark: "#1e293b"

      },

      animation: {

        blob: "blob 8s infinite",
        float: "float 6s ease-in-out infinite",
        pulseSlow: "pulse 3s infinite",
        "spin-slow": "spin 6s linear infinite",
        marquee: "marquee 28s linear infinite"

      },

      keyframes: {

        blob: {
          "0%": { transform: "translate(0px,0px) scale(1)" },
          "33%": { transform: "translate(30px,-50px) scale(1.1)" },
          "66%": { transform: "translate(-20px,20px) scale(0.9)" },
          "100%": { transform: "translate(0px,0px) scale(1)" }
        },

        float: {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
          "100%": { transform: "translateY(0px)" }
        },

        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        }

      },

      backdropBlur: {

        xs: "2px"

      }

    }

  },

  plugins: []

}
