<script>
	import BMD_svg from "./../svgs/bmd_logo.svelte";
	// pages imports
	import MainProfile from "./profile_pages/main_profile.svelte";
	import Orders from "./profile_pages/orders.svelte";
	import Reservations from "./profile_pages/reservation.svelte";
	import Reviews from "./profile_pages/reviews.svelte";
	import Complains from "./profile_pages/complains.svelte";

	// NPM
	import dayjs from "dayjs";
	import { link, push, replace, pop, querystring } from "svelte-spa-router";
	import { onMount, onDestroy, afterUpdate } from "svelte";
	import Svelecte from "svelecte";
	import * as config from "./../config/config.js";
	// stores
	import { user as userStore } from "./../stores/user";
	// variables
	let user = $userStore;
	let isUserLoggedIn = false;
	let selected_page = "profile";
	if ($querystring && new URLSearchParams($querystring).get("page")) {
		if (
			["profile", "orders", "reservations", "reviews", "complains"].some(
				(page) => page === new URLSearchParams($querystring).get("page")
			)
		) {
			selected_page = new URLSearchParams($querystring).get("page");
		}
	}
	// onmount functions
	onMount(async (c) => {
		const localStorage_token = localStorage.getItem("token");
		if (localStorage_token) {
			const response = await fetch(`${config.server_base_url}/user`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					token: localStorage_token,
				},
			});
			const data = await response.json();
			$userStore = data.user;
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
	// toggles
</script>

{#if isUserLoggedIn}
	<div class="flex flex-no-wrap min-h-screen relative">
		<!-- Sidebar starts -->
		<!-- Remove class [ hidden ] and replace [ sm:flex ] with [ flex ] -->
		<div class="w-72 min-h-screen bg-gray-800 shadow flex-col flex fixed">
			<div
				on:click={(e) => push("/")}
				class="flex flex-col items-center mx-auto pt-8 gap-4 cursor-pointer"
			>
				<BMD_svg height={50} width="100" />
				<div
					class="flex uppercase text-white text-3xl font-semibold font-Montserrat tracking-wider"
				>
					Book my dine
				</div>
			</div>

			<div class="flex flex-col px-4 py-4 w-full gap-4 mt-16">
				{#each ["profile", "orders", "reservations"] as i}
					<div
						class={`${
							selected_page === i
								? "bg-red-300 bg-opacity-90"
								: "hover:bg-gray-300 hover:bg-opacity-40"
						} flex text-white capitalize text-2xl font-Roboto items-center justify-center  cursor-pointer px-2 py-3 rounded-md`}
						on:click={(e) => (selected_page = i)}
					>
						{i}
					</div>
				{/each}
			</div>
			<div
				class="flex text-red-400 font-medium py-4 mx-auto text-2xl font-Roboto gap-3 justify-center items-center mt-auto cursor-pointer"
				on:click={(e) => {
					localStorage.removeItem("token");
					push("/");
				}}
			>
				<svg
					width="25"
					height="25"
					viewBox="0 0 25 25"
					fill="#f87171"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M13.2813 1.56335H23.4375V23.4383H13.2813C12.85 23.4383 12.5001 23.7883 12.5001 24.2195C12.5001 24.6507 12.8501 25.0007 13.2813 25.0007H24.2188C24.65 25.0007 25 24.6508 25 24.2195V0.782128C25 0.350862 24.65 0.000901174 24.2188 0.000901174H13.2813C12.8501 0.000901174 12.5001 0.350927 12.5001 0.782128C12.5001 1.21339 12.8501 1.56335 13.2813 1.56335Z"
					/>
					<path
						d="M0.226725 13.0463L5.61732 18.5142C5.9228 18.8228 6.41731 18.822 6.72201 18.5142C7.02749 18.2064 7.02749 17.7064 6.72201 17.3986L2.6595 13.2775H18.7477C19.179 13.2775 19.5289 12.9244 19.5289 12.4884C19.5289 12.0525 19.1789 11.6994 18.7477 11.6994H2.6595L6.72201 7.57827C7.02749 7.26968 7.02749 6.77048 6.72201 6.46267C6.41653 6.15407 5.92202 6.15407 5.61732 6.46267L0.227504 11.9306C-0.0740765 12.2345 -0.0771932 12.7431 0.226725 13.0463Z"
					/>
				</svg>

				<span>Logout</span>
			</div>
		</div>
		<div class=" ml-72 w-full">
			{#if selected_page === "profile"}
				<MainProfile {user} />
			{:else if selected_page === "orders"}
				<Orders />
			{:else if selected_page === "reservations"}
				<Reservations />
			{:else if selected_page === "reviews"}
				<Reviews />
			{:else if selected_page === "complains"}
				<Complains />
			{/if}
		</div>
	</div>
{/if}
