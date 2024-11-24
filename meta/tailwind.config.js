/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'berkeley': '#053061',
        'lapis': '#00567A',
        'spring': '#417656',
        custom: {
          white: '#FFFEFF',
          night: '#041008',
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '25%': {
            transform: 'translate(20px, -20px) scale(1.1)',
          },
          '50%': {
            transform: 'translate(0, 20px) scale(0.9)',
          },
          '75%': {
            transform: 'translate(-20px, -15px) scale(1.05)',
          },
        }
      }
    },
  },
  plugins: [],
}
