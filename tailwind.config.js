/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Safelist only essential dynamically generated classes
  safelist: [
    "animate-pulse",
    "animate-pulse-once",
  ],
};
