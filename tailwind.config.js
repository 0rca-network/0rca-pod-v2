/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-midnight': '#0D0D0D',
        'slate-blue': '#1C2A3A',
        'mint-glow': '#63f2d2',
        'active-green': '#BEF264',
      },
    },
  },
  plugins: [],
}
