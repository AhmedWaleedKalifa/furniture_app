// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        br: '#625043',
        accent: '#65B3B5',
        bl: '#1a1a1a',
        'g-100': '#F5F5F5',
        'g-200': '#A9A9A9',
        'g-300': '#666666',
        'w-100': '#FFFFFF',
        'w-200': '#F8F8F8',
      },
    },
  },
  plugins: [],
};