/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}", 
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
      ],
    theme: {
      extend: {
        // colors: {
        //   primary: '#6366f1',
        //   secondary: '#8b5cf6',
        //   dark: '#121212',
        //   darkSecondary: '#1e1e1e',
        //   darkTertiary: '#2d2d2d',
        // },
        colors: {
          primary: '#6366F1',
          secondary: '#4F46E5',
          background: '#0F172A',
          surface: '#1E293B',
          text: '#F0F0F0',
          accent: '#EC4899',
        },
      },
    },
    plugins: [],
    important: 'html',
    prefix: 'tw-'
  }