/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          50: '#e6fff9',
          100: '#b3ffe8',
          200: '#80ffd6',
          300: '#4dffc5',
          400: '#1affb3',
          500: '#00E5CC',
          600: '#00b8a3',
          700: '#008a7a',
          800: '#005c52',
          900: '#002e29',
        },
        surface: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#4e535c',
          700: '#3c4048',
          800: '#2f3238',
          900: '#26282e',
          950: '#26282e',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Noto Sans SC', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 229, 204, 0.2), 0 0 20px rgba(0, 229, 204, 0.1)' },
          '100%': { boxShadow: '0 0 10px rgba(0, 229, 204, 0.4), 0 0 40px rgba(0, 229, 204, 0.2)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
