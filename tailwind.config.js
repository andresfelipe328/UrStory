/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark_1': '#2C3333',
        'dark_2': '#395B64',
        'light_1': '#A5C9CA',
        'light_2': '#E7F6F2',
        'green': '#717744',
        'sun': '#FDDA0D',
        'moon': '#E7F6F2'
      },

      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-30deg)' },
          '50%': { transform: 'rotate(30deg)' },
        }
      },

      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
      },

      boxShadow: {
        'xsShadow': 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;',
        'invXsShadow': 'rgba(50, 50, 93, 0.25) 0px -2px 5px -1px, rgba(0, 0, 0, 0.3) 0px -1px 3px -1px;',
        'smShadow': 'rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;',
        'mdShadow': 'rgba(0, 0, 0, 0.24) 0px 3px 8px;',
        'onHover': 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px'
      }
    }

  },
  plugins: [],
}