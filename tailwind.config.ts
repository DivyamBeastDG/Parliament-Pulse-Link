import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], deva: ['"Noto Sans Devanagari"', 'Inter', 'sans-serif'] },
      colors: {
        bg: { primary: '#08090A', secondary: '#0C0D0F', elevated: '#131416', hover: '#1A1B1E' },
        border: { subtle: '#1F2024', hover: '#2A2B2F', strong: '#37383D' },
        text: { primary: '#F7F8F8', secondary: '#9CA3AF', muted: '#6B7280' },
        accent: { DEFAULT: '#5E6AD2', 2: '#26B5CE', 3: '#8E77ED' },
        success: '#4CB782', warning: '#F5A623', danger: '#EB5757',
      },
      animation: { 'fade-in': 'fadeIn 0.6s ease-out', 'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1)' },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
export default config;