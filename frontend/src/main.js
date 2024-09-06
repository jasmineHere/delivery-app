import App from "./App.svelte";
const app = new App({
	target: document.body,
	props: {
		name: "world",
	},
});
window.initMap = function ready() {
};


export default app;
