<script>
	import * as config from "../../config/config.js";
	import { link, push, replace, pop } from "svelte-spa-router";
	import { onMount, onDestroy } from "svelte";

	import Profile_edit_page from "./Profile_screen.svelte";

	let isUserLoggedIn = false;
	let user = null;
	onMount(async () => {
		localStorage.clear()
	});

	let selected_page = "profile";
	let selected_class = "bg-red-500 text-white";
	let non_selected_class = "bg-slate-500";
</script>
<button>
	Logout
</button>

<br>

You are not a customer use the correct panel