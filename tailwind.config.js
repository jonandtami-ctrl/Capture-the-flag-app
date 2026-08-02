/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bangers"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ember: {
          50: '#fff4ed',
          100: '#ffe4d2',
          200: '#ffc4a3',
          300: '#ff9c6b',
          400: '#ff7a3d',
          500: '#f9581a',
          600: '#ea3f10',
          700: '#c22c0e',
          800: '#9a2513',
          900: '#7c2113',
        },
        forest: {
          50: '#eefdf3',
          100: '#d6f9e2',
          200: '#b0f1c9',
          300: '#7ce3aa',
          400: '#43cc86',
          500: '#1eb06c',
          600: '#128d57',
          700: '#107048',
          800: '#11593c',
          900: '#0d3f2b',
          950: '#071f16',
        },
        dusk: {
          800: '#132a20',
          900: '#0b1f14',
          950: '#06140d',
        },
      },
      backgroundImage: {
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(249, 88, 26, 0.45)',
        'glow-forest': '0 0 40px -8px rgba(30, 176, 108, 0.45)',
        card: '0 10px 30px -12px rgba(0,0,0,0.5)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.85 },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        flicker: 'flicker 3s ease-in-out infinite',
        floaty: 'floaty 4s ease-in-out infinite',
        pulseRing: 'pulseRing 1.6s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}
