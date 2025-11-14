/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Modern professional palette
        'navy-900': '#0f1419',
        'navy-800': '#1a1f2e',
        'navy-700': '#252d3d',
        'gradient-start': '#4cc9f0',
        'gradient-mid': '#4361ee',
        'gradient-end': '#7209b7',
        'accent-purple': '#7209b7',
        'accent-blue': '#4361ee',
        'accent-cyan': '#4cc9f0',
      },
      fontFamily: {
        'display': ['Space Grotesk', 'Sora', 'system-ui'],
        'heading': ['Poppins', 'Inter', 'system-ui'],
        'sans': ['Inter', 'DM Sans', 'system-ui'],
      },
      fontSize: {
        'display-lg': ['4.5rem', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.02em' }],
        'display-md': ['3.5rem', { lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.02em' }],
        'display-sm': ['2.5rem', { lineHeight: '1.2', fontWeight: '800', letterSpacing: '-0.01em' }],
        'heading-lg': ['2rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.01em' }],
        'heading-md': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75', fontWeight: '500' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      boxShadow: {
        'premium': '0 20px 60px -15px rgba(0, 0, 0, 0.4)',
        'premium-lg': '0 40px 100px -20px rgba(0, 0, 0, 0.5)',
        'glow-purple': '0 0 40px rgba(114, 9, 183, 0.3)',
        'glow-blue': '0 0 50px rgba(67, 97, 238, 0.3)',
        'glow-cyan': '0 0 50px rgba(76, 201, 240, 0.25)',
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%)',
        'gradient-accent': 'linear-gradient(135deg, #4cc9f0 0%, #4361ee 50%, #7209b7 100%)',
        'gradient-button': 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-down': 'slide-down 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.5', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(30px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(67, 97, 238, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(67, 97, 238, 0.6)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        'section-sm': '60px',
        'section-md': '80px',
        'section-lg': '120px',
      },
    },
  },
  plugins: [],
}
