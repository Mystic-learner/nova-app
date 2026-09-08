import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0B0F17',
          surface: '#131B2E',
          surfaceHover: '#18223A',
          neonViolet: '#A855F7',
          neonCyan: '#06B6D4',
        },
      },
      boxShadow: {
        'neon-violet': '0 0 15px -2px rgba(168, 85, 247, 0.45)',
        'neon-cyan': '0 0 15px -2px rgba(6, 182, 212, 0.45)',
        'glass-glow': '0 8px 32px 0 rgba(19, 27, 46, 0.8)',
      },
    },
  },
  plugins: [],
};

export default config;