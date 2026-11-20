/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        status: {
          good: {
            light: '#ecfdf5',
            border: '#a7f3d0',
            text: '#065f46',
            DEFAULT: '#059669',
          },
          flagged: {
            light: '#fffbeb',
            border: '#fde68a',
            text: '#92400e',
            DEFAULT: '#d97706',
          },
          damaged: {
            light: '#fef2f2',
            border: '#fecaca',
            text: '#991b1b',
            DEFAULT: '#dc2626',
          },
          pending: {
            light: '#f8fafc',
            border: '#e2e8f0',
            text: '#475569',
            DEFAULT: '#64748b',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
