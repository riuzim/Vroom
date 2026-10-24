import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Barlow Condensed', 'Barlow', 'ui-sans-serif', 'system-ui'],
        sans: ['Barlow', 'Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
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
        /* Tokens da marca Vroom — paleta "Asfalto 1-bit" */
        ink: 'hsl(var(--ink))',
        panel: 'hsl(var(--panel))',
        raised: 'hsl(var(--raised))',
        line: 'hsl(var(--line))',
        bone: 'hsl(var(--bone))',
        flame: 'hsl(var(--flame))',
        acid: 'hsl(var(--acid))',
        danger: 'hsl(var(--danger))',
      },
      borderRadius: {
        sm: '3px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      boxShadow: {
        /* Sombras stamped: sólida, colapsa no press (0 blur — nada de glow) */
        hard: '0 3px 0 0 rgba(0, 0, 0, 0.40)',
        'hard-sm': '0 2px 0 0 rgba(0, 0, 0, 0.35)',
        'hard-lg': '0 5px 0 0 rgba(0, 0, 0, 0.45)',
        'hard-flame': '0 3px 0 0 rgba(255, 109, 0, 0.55)',
        inset: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
        'inset-line': 'inset 0 0 0 1px hsl(var(--bone) / 0.08)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
};
