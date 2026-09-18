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
          light: '#DCFCE7',
          DEFAULT: '#25D366',
          dark: '#1DA851',
        },
        sportsOrange: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        darkBg: {
          deep: '#F4F6F4',
          card: '#FFFFFF',
          border: '#E2E8F0',
          accent: '#EBF0EC',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-green': '0 6px 20px rgba(37, 211, 102, 0.25)',
        'neon-orange': '0 6px 20px rgba(245, 158, 11, 0.25)',
        'glass': '0 8px 24px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
