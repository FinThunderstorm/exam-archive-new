/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['var(--font-anybody)'],
        sans: ['var(--font-josefinSans)']
      }
    }
  },
  plugins: []
}