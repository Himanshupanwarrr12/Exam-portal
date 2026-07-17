/** @type {import('tailwindcss').Config} */
// tailwind.config.js — tells Tailwind which files to scan for class names.
// Tailwind only generates CSS for classes it finds in these files,
// keeping the final CSS bundle small.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}", // scan all JS/JSX files in src/
  ],
  theme: {
    extend: {
      // We can add custom colors, fonts, spacing here later
    },
  },
  plugins: [],
}
