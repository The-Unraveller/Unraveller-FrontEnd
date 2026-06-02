/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Core Palette ──
        'navy':    '#0f0c1e',
        'navy-2':  '#1a1640',
        'navy-3':  '#1e1b4b',
        'card':    '#2e2a5d',
        'card-2':  '#252050',

        // ── Brand Purple ──
        'purple-brand':  '#7c3aed',
        'purple-light':  '#9333ea',
        'purple-soft':   '#a855f7',
        'purple-glow':   'rgba(124,58,237,0.35)',

        // ── Cyan Accent ──
        'cyan-brand':    '#06b6d4',
        'cyan-light':    '#22d3ee',
        'cyan-soft':     '#67e8f9',

        // ── Gamification ──
        'xp-orange':     '#f59e0b',
        'xp-yellow':     '#fbbf24',
        'xp-red':        '#ef4444',
        'streak-fire':   '#f97316',

        // ── Gold ──
        'gold':          '#f5c842',
        'gold-dark':     '#e0a800',

        // ── Status ──
        'success':       '#10b981',
        'danger':        '#ef4444',
        'warning':       '#f59e0b',

        // ── Spy Cyberpunk Theme colors ──
        'spy-black':     '#080612',
        'spy-green':     '#00ff41',
        'spy-red':       '#ff0055',
        'spy-blue':      '#00f0ff',
      },
      fontFamily: {
        'heading': ['Be Vietnam Pro', 'sans-serif'],
        'body':    ['Inter', 'sans-serif'],
        'mono':    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-purple': '0 0 24px rgba(124,58,237,0.4)',
        'glow-cyan':   '0 0 20px rgba(6,182,212,0.35)',
        'glow-gold':   '0 0 20px rgba(245,200,66,0.4)',
        'glow-xp':     '0 0 16px rgba(245,158,11,0.4)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover':  '0 8px 40px rgba(124,58,237,0.25)',
      },
      backgroundImage: {
        'gradient-brand':  'linear-gradient(135deg, #7c3aed, #06b6d4)',
        'gradient-purple': 'linear-gradient(135deg, #7c3aed, #9333ea)',
        'gradient-xp':     'linear-gradient(90deg, #f59e0b, #f97316)',
        'gradient-card':   'linear-gradient(135deg, #2e2a5d, #1e1b4b)',
        'gradient-hero':   'linear-gradient(180deg, #0f0c1e 0%, #1e1b4b 50%, #0f0c1e 100%)',
      },
      animation: {
        'float':        'float 3.5s ease-in-out infinite',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up':     'slideUp 0.4s ease forwards',
        'fade-in':      'fadeIn 0.5s ease forwards',
        'xp-fill':      'xpFill 1.2s ease forwards',
        'bounce-in':    'bounceIn 0.6s cubic-bezier(0.36,0.07,0.19,0.97)',
        'star-pop':     'starPop 0.5s ease forwards',
        'shimmer':      'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        xpFill: {
          '0%':   { width: '0%' },
          '100%': { width: 'var(--xp-width)' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0.3)',   opacity: '0' },
          '50%':  { transform: 'scale(1.08)',  opacity: '1' },
          '70%':  { transform: 'scale(0.96)' },
          '100%': { transform: 'scale(1)' },
        },
        starPop: {
          '0%':   { transform: 'scale(0) rotate(-20deg)', opacity: '0' },
          '70%':  { transform: 'scale(1.2) rotate(5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)',   opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
      borderRadius: {
        '2xl':  '1rem',
        '3xl':  '1.5rem',
        '4xl':  '2rem',
      },
    },
  },
  plugins: [],
}
