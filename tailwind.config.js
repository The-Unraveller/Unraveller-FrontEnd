/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spy-black': '#0a0a0a',
        'spy-green': '#00ff41',
        'spy-red': '#ff0000',
        'spy-blue': '#00d8ff',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
