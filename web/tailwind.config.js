import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1A7A4A",
        "primary-hover": "#14613B",
        "primary-dark": "#145e39",
        "primary-light": "#2ECC71",
        "background-base": "#F5F7F5",
        "background-light": "#f6f8f7",
        "background-dark": "#122019",
        "brand-dark": "#0D5C34",
        "brand-light": "#1A7A4A",
        "surface-card": "#FFFFFF",
        "text-main": "#1A1A1A",
        "text-muted": "#666666",
        "border-subtle": "#E0E0E0",
        // New onboarding tokens
        "green-primary": "#1A7A4A",
        "green-dark": "#0D5C34",
        "green-bg": "#E8F5E9",
        "accent": "#1DB954",
        "gray-100": "#F5F5F5",
        "gray-700": "#333333",
        "white": "#FFFFFF",
      },
      fontFamily: {
        "display": ["Oswald", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "syne": ["Syne", "sans-serif"],
        "dmsans": ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #E0E0E0 1px, transparent 1px), linear-gradient(to bottom, #E0E0E0 1px, transparent 1px)",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
} satisfies Config
