/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./public/partials/**/*.html",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A3A60',      // Deep Blue
        secondary: '#4B5563',    // Secondary Gray
        ice: '#A7D8F2',          // Ice Blue
        frost: '#F4F9FC',        // Frost White
        gold: '#D4AF37',         // Walleye Gold
        orange: '#FF8C00',       // Orange (Thin Ice)
        evergreen: '#22C55E',    // Bright Green (Safe Ice)
        danger: '#D9534F',       // Danger Red
        grayLight: '#F1F1F1',    // Light Gray
        grayPanel: '#E5E7EB',    // Panel Gray
        muted: '#9CA3AF',        // Muted Gray
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
