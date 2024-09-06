import { writable } from "svelte/store";

export const searchResults = writable([]);
export const searchTerm = writable({
	term: "",
	lat: "",
	lng: "",
});
