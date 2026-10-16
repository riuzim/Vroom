/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Ginto Nord', 'Inter', 'ui-sans-serif', 'system-ui'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular'],
      },
      colors: {
        ink: '#101114',
        panel: '#181a20',
        panelSoft: '#20232c',
        line: '#333744',
        flame: '#f9b17a',
        mint: '#8ef0c1',
        danger: '#ff6b6b',
      },
      boxShadow: {
        glow: '0 0 22px rgba(249, 177, 122, 0.36)',
        mint: '0 0 22px rgba(142, 240, 193, 0.28)',
        danger: '0 0 22px rgba(255, 107, 107, 0.28)',
      },
    },
  },
  plugins: [],
};
