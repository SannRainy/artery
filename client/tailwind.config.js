
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
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