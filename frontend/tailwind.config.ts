import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      // ─── ChamalCom Brand Colors ─────────────────────────────────
      colors: {
        // Primary — Mediterranean Blue (inspired by Oued Laou sea)
        primary: {
          50:  '#eff8ff',
          100: '#dbeffe',
          200: '#bfe3fd',
          300: '#93d1fb',
          400: '#60b7f7',
          500: '#3b9af3',
          600: '#1a78e8',  // Main brand blue
          700: '#1461cc',
          800: '#164fa6',
          900: '#174483',
          950: '#122b50',
          DEFAULT: '#1a78e8',
          foreground: '#ffffff',
        },
        // Secondary — Mediterranean Teal
        secondary: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          200: '#9af5e0',
          300: '#5eebcb',
          400: '#2dd9b3',
          500: '#0dbf9b',
          600: '#069880',  // Teal accent
          700: '#077a67',
          800: '#0a6155',
          900: '#0b5047',
          950: '#042d28',
          DEFAULT: '#069880',
          foreground: '#ffffff',
        },
        // Warm Sand (Moroccan beach sand)
        sand: {
          50:  '#fefdf7',
          100: '#fdf8e8',
          200: '#faedcc',
          300: '#f5dc9e',
          400: '#eec568',
          500: '#e6ab3a',
          600: '#d4901e',  // Rich sand
          700: '#b07015',
          800: '#8f5616',
          900: '#764718',
          950: '#42250a',
          DEFAULT: '#d4901e',
          foreground: '#ffffff',
        },
        // Ocean surface for accents
        ocean: {
          light: '#b3e5f7',
          DEFAULT: '#0ea5e9',
          dark: '#075985',
        },
        // Moroccan terracotta for warmth
        terracotta: {
          light: '#fcd5c0',
          DEFAULT: '#e05a2b',
          dark: '#92330f',
        },
        border: 'hsl(var(--border))',
        input:  'hsl(var(--input))',
        ring:   'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      // ─── Typography ────────────────────────────────────────────
      fontFamily: {
        arabic:  ['Noto Kufi Arabic', 'Cairo', 'system-ui', 'sans-serif'],
        latin:   ['Inter', 'system-ui', 'sans-serif'],
        display: ['Noto Kufi Arabic', 'Poppins', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // ─── Border Radius ─────────────────────────────────────────
      borderRadius: {
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      // ─── Box Shadows (glassmorphism) ───────────────────────────
      boxShadow: {
        'glass':      '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-md':   '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'property':   '0 20px 60px rgba(0,0,0,0.08)',
        'card-hover': '0 25px 80px rgba(26, 120, 232, 0.15)',
        'premium':    '0 0 0 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.2)',
        'glow-blue':  '0 0 20px rgba(26, 120, 232, 0.4)',
        'glow-teal':  '0 0 20px rgba(6, 152, 128, 0.4)',
      },

      // ─── Gradients ─────────────────────────────────────────────
      backgroundImage: {
        'gradient-radial':      'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand':       'linear-gradient(135deg, #1a78e8, #069880)',
        'gradient-hero':        'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
        'gradient-card':        'linear-gradient(145deg, rgba(255,255,255,0.6), rgba(255,255,255,0.1))',
        'gradient-moroccan':    'linear-gradient(135deg, #1a78e8 0%, #069880 50%, #d4901e 100%)',
        'gradient-sea':         'linear-gradient(180deg, #b3e5f7 0%, #0ea5e9 50%, #075985 100%)',
        'mesh-pattern':         'radial-gradient(at 40% 20%, #1a78e8 0px, transparent 50%), radial-gradient(at 80% 0%, #069880 0px, transparent 50%)',
      },

      // ─── Keyframes / Animations ────────────────────────────────
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up':   { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in':        { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in-left':   { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'fade-in-right':  { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'scale-in':       { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'slide-up':       { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'pulse-soft':     { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        'shimmer':        { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'float':          { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'wave':           { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        'ping-slow':      { '0%': { transform: 'scale(1)', opacity: '1' }, '75%, 100%': { transform: 'scale(1.5)', opacity: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':        'fade-in 0.5s ease-out',
        'fade-in-left':   'fade-in-left 0.5s ease-out',
        'fade-in-right':  'fade-in-right 0.5s ease-out',
        'scale-in':       'scale-in 0.3s ease-out',
        'slide-up':       'slide-up 0.4s ease-out',
        'pulse-soft':     'pulse-soft 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'float':          'float 3s ease-in-out infinite',
        'ping-slow':      'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },

      // ─── Backdrop Blur ─────────────────────────────────────────
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

export default config
