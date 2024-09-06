module.exports = {
	purge: {
		enabled: !process.env.ROLLUP_WATCH,
		content: ["./src/**/*.svelte"],
	},
	darkMode: 'media', // or 'media' or 'class'
	theme: {
		fontFamily: {
			Montserrat: ["Montserrat", "sans-serif"],
			Roboto:[ "Roboto, sans-serif"],
		},
		extend: {},
	},
	variants: {
		extend: {},
	},
	plugins: [require("@tailwindcss/forms")],
};
