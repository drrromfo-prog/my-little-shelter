/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8f2",
          100: "#fbe9db",
          200: "#f4caa5",
          300: "#ecab70",
          400: "#dd8343",
          500: "#c86728",
          600: "#b4522d",
          700: "#87381a",
          800: "#6f2d16",
          900: "#522215"
        }
      },
      boxShadow: {
        panel: "0 20px 45px rgba(62, 36, 18, 0.12)"
      },
      fontFamily: {
        display: ['Georgia', '"Times New Roman"', "serif"],
        sans: ['"Aptos"', '"Segoe UI"', "sans-serif"]
      }
    }
  },
  plugins: []
};
