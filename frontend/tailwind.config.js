/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'premium-dark': '#0a0e27',
        'premium-darker': '#050812',
        'slate-950': '#030712',
        'accent-gold': '#d4af37',
        'accent-silver': '#e8e8e8',
      },
      fontFamily: {
        'display': ['Syne', 'system-ui'],
        'sans': ['Inter var', 'system-ui'],
      },
      boxShadow: {
        'premium': '0 20px 60px -15px rgba(0, 0, 0, 0.4)',
        'premium-lg': '0 40px 100px -20px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 40px rgba(212, 175, 55, 0.3)',
        'glow-blue': '0 0 50px rgba(59, 130, 246, 0.2)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
        'gradient-accent': 'linear-gradient(135deg, #d4af37 0%, #f0d370 100%)',
      },
      animation: {
        'shimmer-premium': 'shimmer-premium 3s ease-in-out infinite',
        'float-up': 'float-up 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
