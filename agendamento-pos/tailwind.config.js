/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#dbeaff",
          200: "#b3d4ff",
          300: "#80b8ff",
          400: "#4d9aff",
          500: "#2479e6",
          600: "#1a5fc0",
          700: "#164a96",
          800: "#143a73",
          900: "#102c54",
        },
      },
      fontSize: {
        base: "18px",
      },
    },
  },
  plugins: [],
};
