/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        glass: '0 10px 40px rgba(0,0,0,.35)',
      },
      colors: {
        brand: {
          primary: '#FF8C00',
          cream: '#F5EBDD',
          dark: '#0B0F14',
        },
      },
    },
  },
  plugins: [],
}
