<script>
	let currentLocation = {
		lat: 0,
		lng: 0,
	};
	import { push, replace, pop } from "svelte-spa-router";
	import {
		searchResults,
		searchTerm as searchTermStore,
	} from "./../stores/search_res.js";
	import { onMount, onDestroy } from "svelte";
	import * as config from "./../config/config.js";
	import { getLocation } from "../utils/location";

	let searchValue = "";
	onMount(async (_) => {
		const location = await getLocation();
		currentLocation = location;
	});

	const onSearch = async (e) => {
		const response = await fetch(
			`${config.server_base_url}/restaurant/search?search=${searchValue}&lat=${currentLocation.lat}&lng=${currentLocation.lng}`,
			{
				method: "GET",
			}
		);
		if (response.status !== 200) {
			alert(await response.json());
		} else {
			const data = await response.json();
			console.log(data);
			searchResults.set(data);

			searchTermStore.set(
				`search=${searchValue}&lat=${currentLocation.lat}&lng=${currentLocation.lng}`
			);
			push("/get_delivery");
		}
	};
</script>

<div class="flex justify-center flex-col items-center basis-full">
	<h1 class="text-white text-3xl sm:text-6xl md:text-8xl lg:text-9xl font-bold">
		BOOK MY DINE
	</h1>
	<h2 class="text-gray-400 text-xl sm:text-2xl md:text-4xl lg:text-5xl mt-8">
		Discover food & drinks Near You
	</h2>
	<div class="flex mt-8 w-full items-center justify-center">
		<input
			type="text"
			name="search"
			id="search"
			class="border-0 w-9/12 sm:w-7/12 md:w-[50%] 
			lg:w-[40%] xl:w-[25%] bg-white bg-opacity-60 rounded-l-lg 
			text-2xl border-transparent focus:border-transparent
			 focus:ring-0 px-4 py-4 font-semibold"
			autocomplete="off"
			bind:value={searchValue}
		/>
		<div
			class="rounded-r-lg text-2xl bg-[#A3FF99] px-10 py-4 font-semibold cursor-pointer"
			on:click={onSearch}
		>
			Search
		</div>
	</div>
</div>
