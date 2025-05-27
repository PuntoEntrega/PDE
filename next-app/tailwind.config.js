/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  "./src/**/*.{js,ts,jsx,tsx,mdx}",   // <- cubre app, Components, Services…
	],
	theme: {
	  extend: {
		/* … tu paleta, radius, keyframes, etc. … */
	  },
	},
	plugins: [require("tailwindcss-animate")],
  };
  