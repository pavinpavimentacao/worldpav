/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F7FF',
          100: '#CCF0FF',
          200: '#99E1FF',
          300: '#66D2FF',
          400: '#33C3FF',
          500: '#01AEEB',
          600: '#0099D4',
          700: '#0084BD',
          800: '#006FA6',
          900: '#005A8F',
        },
        secondary: {
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
        },
        // Cores personalizadas para status financeiros
        status: {
          'enviado': '#ef4444',      // red-500
          'recebido': '#6366f1',     // indigo-500  
          'aprovacao': '#f97316',    // orange-500
          'nota': '#3b82f6',         // blue-500
          'aguardando': '#eab308',   // yellow-500
          'pago': '#22c55e',         // green-500
        }
      }
    },
  },
  plugins: [],
}
