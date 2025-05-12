module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E60023',
          dark: '#AD081B',
          light: '#FFEAED'
        },
        secondary: {
          DEFAULT: '#111111',
          light: '#767676'
        },
        background: '#F5F5F5'
      }
    },
  },
  plugins: [],
}