module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'gray-850': '#1a1c23',
        'gray-900': '#0f1115',
        'gray-900': '#0F172A',
        'gray-800': '#1E293B',
        'gray-700': '#334155',
        'emerald-400': '#34D399',
        'emerald-500': '#10B981',
        'emerald-600': '#059669',
        'gray-900': '#0F172A',
        'gray-800': '#1E293B',
        'gray-700': '#334155',
      },
      animation: {
        pulse: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}