import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Add the "Poppins" font family
      fontFamily: {
        sans: ['Poppins', ...fontFamily.sans],
      },
      // Add our custom color palette
      colors: {
        'brand-dark': '#0D1117',
        'brand-light': '#161B22',
        'brand-border': '#30363D',
        'brand-accent': '#58A6FF',
      },
      // Add a cool glow effect for the card
      boxShadow: {
        'glow': '0 0 20px rgba(88, 166, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
export default config