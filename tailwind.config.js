/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Duolingo-inspired color palette
        'duo-green': '#58CC02',
        'duo-green-dark': '#4CAD00',
        'duo-green-light': '#89E219',
        'duo-orange': '#FF9600',
        'duo-orange-dark': '#E08600',
        'duo-gold': '#FFC800',
        'duo-red': '#FF4B4B',
        'duo-blue': '#1CB0F6',
        'duo-purple': '#CE82FF',
        'duo-gray': {
          100: '#F7F7F7',
          200: '#E5E5E5',
          300: '#AFAFAF',
          400: '#777777',
          500: '#4B4B4B',
          600: '#3C3C3C',
        }
      },
      fontFamily: {
        'din': ['DIN Round Pro', 'Nunito', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(88, 204, 2, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(88, 204, 2, 0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      screens: {
        'xs': '375px',
      }
    },
  },
  plugins: [],
}
