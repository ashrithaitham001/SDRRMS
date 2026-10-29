/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        card: '#FFFFFF',
        slate: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        teal: {
          900: '#134E4A',
          800: '#115E59',
          700: '#0F766E', // Primary accent
          600: '#0D9488',
          500: '#14B8A6',
          100: '#CCFBF1',
          50: '#F0FDFA',
        },
        blue: {
          800: '#1E40AF',
          700: '#1D4ED8',
          600: '#2563EB', // Secondary accent
          500: '#3B82F6',
          100: '#DBEAFE',
          50: '#EFF6FF',
        },
        emergency: {
          DEFAULT: '#DC2626',
          dark: '#B91C1C',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        success: {
          DEFAULT: '#059669',
          light: '#D1FAE5',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
