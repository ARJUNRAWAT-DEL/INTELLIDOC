/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Aurora Dark Palette
        'navy-primary': '#030712',
        'navy-secondary': '#070C1E',
        'navy-tertiary': '#0C1228',
        'accent-neon-purple': '#9A4DFF',
        'accent-neon-cyan': '#4F9CFF',
        'accent-purple-alt': '#B566FF',
        'accent-blue': '#4F9CFF',
        'accent-violet': '#7C3AED',
        'accent-indigo': '#6366F1',
        'text-primary': '#FFFFFF',
        'text-secondary': '#CBD5E1',
        'text-muted': '#64748B',
        'glow-purple': '#9A4DFF',
        'glow-cyan': '#4F9CFF',
      },
      fontFamily: {
        'display': ['Space Grotesk', 'Inter', 'system-ui'],
        'heading': ['Inter', 'Poppins', 'system-ui'],
        'sans': ['Inter', 'system-ui'],
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
        'premium': '0 8px 24px rgba(154, 77, 255, 0.4)',
        'premium-lg': '0 20px 50px rgba(0, 0, 0, 0.5)',
        'glow-purple': '0 0 40px rgba(154, 77, 255, 0.5)',
        'glow-cyan': '0 0 40px rgba(79, 156, 255, 0.4)',
        'button': '0 8px 24px rgba(154, 77, 255, 0.5)',
      },
      backgroundImage: {
        'gradient-ai': 'radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(79, 156, 255, 0.15) 0%, transparent 50%), linear-gradient(135deg, #050816 0%, #0A0F24 50%, #0F162E 100%)',
        'gradient-button': 'linear-gradient(90deg, #9A4DFF 0%, #B566FF 100%)',
        'gradient-heading': 'linear-gradient(135deg, #9A4DFF 0%, #4F9CFF 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #7C3AED 0%, #6366F1 50%, #4F9CFF 100%)',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(108, 99, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(108, 99, 255, 0.6)' },
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
