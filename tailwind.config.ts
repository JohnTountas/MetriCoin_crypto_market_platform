import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Manrope"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 22px 70px -30px rgba(10, 16, 35, 0.45)',
        glow: '0 0 0 1px rgba(115, 241, 202, 0.18), 0 20px 50px -24px rgba(17, 193, 163, 0.55)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.82' },
          '50%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flashUp: {
          '0%': { backgroundColor: 'rgba(52, 211, 153, 0.28)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashDown: {
          '0%': { backgroundColor: 'rgba(248, 113, 113, 0.24)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        'slide-up': 'slideUp 420ms ease-out',
        'flash-up': 'flashUp 900ms ease-out',
        'flash-down': 'flashDown 900ms ease-out',
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 28%), radial-gradient(circle at 80% 0%, rgba(45, 212, 191, 0.16), transparent 24%), radial-gradient(circle at 50% 100%, rgba(234, 179, 8, 0.08), transparent 30%)',
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
};

export default config;

