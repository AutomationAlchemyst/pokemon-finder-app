import type { Config } from 'tailwindcss'
// This is the line we are fixing. Note the absence of curly braces around fontFamily.
import fontFamily from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', ...fontFamily.sans],
      },
      colors: {
        'brand-dark': '#0D1117',
        'brand-light': '#161B22',
        'brand-border': '#30363D',
        'brand-accent': '#58A6FF',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(88, 166, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
export default config