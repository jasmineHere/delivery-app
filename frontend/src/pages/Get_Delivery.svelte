<script>
	import dayjs from "dayjs";
	import GetDeliveryNav from "./../components/Restuarant_nav.svelte";

	import HomeNav from "../components/Home_nav.svelte";
	import Restaurants_card from "../components/Restaurant_card.svelte";
	import Filter_popup from "../components/filter_popup.svelte";

	import { user as userStore } from "../stores/user";
	import {
		searchResults as searchResultsStore,
		searchTerm as searchTermStore,
	} from "../stores/search_res";
	import * as config from "./../config/config.js";
	import { onMount, onDestroy } from "svelte";

	import { getLocation } from "../utils/location";
	let user;
	let isUserLoggedIn;
	let currentTime = {
		hour: dayjs().hour(),
		minute: dayjs().minute(),
	};
	let sort_by = "distance";
	let selected_rating_filter = "any";
	let selected_cuisine = [];
	let searchValue = $searchTermStore.term || "cookie";
	onMount(async () => {
		currentTime = {
			hour: dayjs().hour(),
			minute: dayjs().minute(),
		};
		const localStorage_token = localStorage.getItem("token");
		console.log(localStorage_token);
		if (localStorage_token) {
			const response = await fetch(`${config.server_base_url}/user`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					token: localStorage_token,
				},
			});
			const data = await response.json();
			console.log(data);
			userStore.set(data);
			if (response.status !== 200) {
				localStorage.removeItem("token");
				push("/");
			} else {
				if (data.user.type === "customer") {
					user = data.user;
					isUserLoggedIn = true;
				} else if (data.user.type === "restaurant") {
					push("/restaurant_ui");
				} else if (data.user.type === "admin") {
					push("/admin_ui");
				} else if (data.user.type === "delivery") {
					push("/delivery_ui");
				}
			}
		}
	});
	const onSearch = async (e) => {
		console.log("Runnning Search");
		if (!searchValue.length) return;
		const location = await getLocation();
		let searchQuery = "?";
		if (searchValue.length) {
			searchQuery += `search=${searchValue}`;
		}
		if (location) {
			searchQuery += `&lat=${location.lat}&lng=${location.lng}`;
		}
		if (selected_rating_filter !== "any") {
			searchQuery += `&rating=${selected_rating_filter}`;
		}
		if (selected_cuisine.length) {
			searchQuery += `&cuisine=${selected_cuisine.join(",")}`;
		}
		if (sort_by !== "distance") {
			searchQuery += `&sort_by=${sort_by}`;
		}
		console.log(searchQuery);
		const response = await fetch(
			`${config.server_base_url}/restaurant/search${searchQuery}`,

			{
				method: "GET",
			}
		);
		if (response.status !== 200) {
			alert(await response.json());
		} else {
			const data = await response.json();
			console.log(data);
			searchResultsStore.set(data);
		}
	};
	let isFilterDivOpen = false;
	const imageSrc = (image) => {
		return `${config.server_base_url}/image/${image}`;
	};
</script>

<div class="hero_image min-h-screen relative">
	{#if isFilterDivOpen}
		<div
			class="absolute w-full min-h-screen z-50 bg-slate-600 bg-opacity-60 flex items-center justify-center"
		>
			<Filter_popup
				onClose={(e) => {
					isFilterDivOpen = false;
				}}
				onApply={(selected_sort_by, cuisines, selected_rating) => {
					sort_by = selected_sort_by;
					selected_cuisine = cuisines;
					selected_rating_filter = selected_rating;
					isFilterDivOpen = false;
					console.log(selected_sort_by, cuisines, selected_rating);
					onSearch();
				}}
				cuisines={selected_cuisine}
				selected_rating={selected_rating_filter}
				selected_sort_by={sort_by}
			/>
		</div>
	{/if}
	{#if isUserLoggedIn}
		<div class="sticky">
			<GetDeliveryNav
				userName={user.name}
				image_url={imageSrc(user.customer.profile_image)}
			/>
		</div>
	{:else}
		<HomeNav />
	{/if}
	<div class="flex flex-col">
		<div class="flex justify-center flex-col items-center">
			<div class="flex mt-8 w-full items-center justify-center">
				<input
					type="text"
					name="search"
					id="search"
					class="border-0 w-9/12 sm:w-7/12 md:w-[50%] 
                    lg:w-[40%] xl:w-[25%] bg-white bg-opacity-80 rounded-l-lg 
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

			<button
				class="mt-4 rounded-md px-4 py-3 text-xl outline-none border-none bg-[#D12627] text-white font-semibold"
				on:click={(e) => (isFilterDivOpen = true)}
			>
				Filters
			</button>
		</div>
	</div>

	<div class="flex w-full px-10 py-8 text-white text-3xl">
		Found {$searchResultsStore.length} Restaurants Matching Your Search
	</div>

	<div
		class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3  gap-y-10 justify-items-center items-center px-8"
	>
		{#each $searchResultsStore as result}
			<Restaurants_card
				address={`${result.restaurant.address.area} ${result.restaurant.address.city}`}
				name={result.restaurant.name}
				cuisines={result.restaurant.cuisines}
				cover_image={result.restaurant.cover_image}
				current_time={currentTime}
				opening_hours={result.restaurant.opening_time}
				closing_hours={result.restaurant.closing_time}
				reviews={result.restaurant.overall_rating}
				id={result._id}
			/>
		{/each}
	</div>
</div>

<style>
	.hero_image {
		background-image: url("/image/HERO BG.png");
		background-position: center;
		background-size: cover;
		background-attachment: fixed;
	}
</style>
