/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#E6F7F5',
          100: '#C2EAE4',
          200: '#9ADCD3',
          300: '#71CFC1',
          400: '#48C2B0',
          500: '#0B877D',
          600: '#0A7A71',
          700: '#096E66',
          800: '#07625A',
          900: '#06564F',
        },
        navy: {
          50: '#E6ECF2',
          100: '#C2D1DF',
          200: '#9BB6CB',
          300: '#759BB8',
          400: '#4E80A4',
          500: '#275A8F',
          600: '#234F7F',
          700: '#1F456F',
          800: '#18375F',
          900: '#122C4F',
        },
        gold: {
          50: '#FCF8E9',
          100: '#F8ECC8',
          200: '#F3E0A7',
          300: '#EED485',
          400: '#E9C764',
          500: '#E4B04A',
          600: '#D0973E',
          700: '#BC7E33',
          800: '#A86427',
          900: '#944B1C',
        },
      },
    },
  },
  plugins: [],
};