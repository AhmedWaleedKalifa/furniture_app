/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        bl:"1C1C1C",
        br: "#625043",
        g:{
          100:"#D9D9D9",
          200:"#919191",
          300:"#606060"
        },
        w:{
          100:"#FFFFFF",
          200:"#F0EEED"
        },
        accent:"#22bb22"
      }
    },
  },
  plugins: [],
}