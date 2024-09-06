<script>
	import dayjs from "dayjs";
	import Home_nav from "./../components/Home_nav.svelte";
	import Home_nav_user from "./../components/Home_nav_user.svelte";
	import HERO_search from "./../components/Hero_search.svelte";
	import Home_select_card from "./../components/Home_select_card.svelte";
	import Restaurants_card from "../components/Restaurant_card.svelte";
	import * as config from "./../config/config.js";
	import { link, push, replace, pop } from "svelte-spa-router";
	import { onMount, onDestroy } from "svelte";
	let isUserLoggedIn = false;
	let user = null;

	let restaurants = [];
	let currentTime = {
		hour: dayjs().hour(),
		minute: dayjs().minute(),
	};
	onMount(async () => {
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
		const response = await fetch(
			`${config.server_base_url}/restaurant/search`,
			{
				method: "GET",
			}
		);

		if (response.status !== 200) {
			alert(await response.json());
		} else {
			restaurants = await response.json();
		}
	});
	const imageSrc = (image) => {
		return `${config.server_base_url}/image/${image}`;
	};
</script>

<div class="w-full flex flex-col hero_image min-h-screen relative pb-[200px]">
	{#if !isUserLoggedIn}
		<Home_nav />
	{:else}
		<Home_nav_user
			userName={user.name}
			image_url={imageSrc(user.customer.profile_image)}
		/>
	{/if}

	<HERO_search />

	<div
		class="grid mt-24 grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3  gap-y-10 justify-items-center items-center px-8"
	>
		{#each restaurants as result}
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
		{:else}
			<div
				class="text-center w-full flex items-center justify-center h-[200px]"
			>
				Loading Data...
			</div>
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
