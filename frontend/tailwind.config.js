/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sportsGreen: {
          light: '#22c55e',
          DEFAULT: '#16a34a',
          dark: '#15803d',
        },
        sportsOrange: {
          light: '#fbbf24',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        darkBg: {
          deep: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          accent: '#f1f5f9',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 10px 25px rgba(22, 163, 74, 0.18)',
        'neon-orange': '0 10px 25px rgba(245, 158, 11, 0.18)',
      }
    },
  },
  plugins: [],
}
