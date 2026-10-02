/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep green primary
        green: {
          50:  '#f0faf4',
          100: '#dcf2e4',
          200: '#bbe6cc',
          300: '#86d1a5',
          400: '#4fb57d',
          500: '#2d9a5f',
          600: '#1e7d4b',
          700: '#19643d',
          800: '#175032',
          900: '#14422a',
          950: '#0a2518',
        },
        // Warm amber accent
        amber: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Charcoal text
        charcoal: {
          50:  '#f7f7f8',
          100: '#eeeef0',
          200: '#d9d9de',
          300: '#b8b9c1',
          400: '#9293a0',
          500: '#757687',
          600: '#5e5f70',
          700: '#4d4e5c',
          800: '#42424f',
          900: '#3a3a44',
          950: '#26262e',
        },
        // Off-white background
        parchment: '#faf9f6',
        // Muted red for LOW status
        rust: {
          50:  '#fef6f0',
          100: '#fdeadd',
          200: '#fad2ba',
          300: '#f6b28c',
          400: '#f08a5b',
          500: '#e96a38',
          600: '#d44e23',
          700: '#b03d1c',
          800: '#8c321c',
          900: '#722c1a',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
