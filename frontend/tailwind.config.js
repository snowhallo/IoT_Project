/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        iot: {
          bg: '#0f172a',        // Slate 900
          card: '#1e293b',      // Slate 800
          cardHover: '#334155', // Slate 700
          border: '#334155',    // Slate 700
          primary: '#38bdf8',   // Sky 400
          temp: '#f97316',      // Orange 500
          humid: '#06b6d4',     // Cyan 500
          light: '#eab308',     // Yellow 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
