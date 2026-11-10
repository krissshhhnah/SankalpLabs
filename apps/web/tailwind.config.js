/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'Outfit', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Official SankalpLabs Brand Palette
        ivory: '#FAFAF7',         // Primary background · Main canvas
        ink: '#1A1917',           // Primary text · Buttons · Logo
        terracotta: '#A2502F',    // Brand accent · Editorial highlights
        vibrantOrange: '#D9542C', // CTA accents · Notifications · Cursors
        softBlush: '#F6E7DE',     // Accent backgrounds · Badges
        warmGrey: '#5E5C56',      // Secondary text · Navigation
        softStone: '#D9D8D5',     // Borders · Dividers · UI outlines

        brand: {
          ivory: '#FAFAF7',
          ink: '#1A1917',
          terracotta: '#A2502F',
          orange: '#D9542C',
          blush: '#F6E7DE',
          grey: '#5E5C56',
          stone: '#D9D8D5',
          50: '#FAFAF7',
          100: '#F6E7DE',
          200: '#D9D8D5',
          500: '#D9542C',
          600: '#A2502F',
          700: '#1A1917',
          900: '#1A1917',
        },
      },
    },
  },
  plugins: [],
};
