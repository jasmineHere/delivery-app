<script>
	export let params = {};
	import Home_nav_user from "../../components/Home_nav_user.svelte";
	import NavBar from "../../components/Restuarant_nav.svelte";

	import dayjs from "dayjs";
	import { link, push, replace, pop } from "svelte-spa-router";
	import { onMount, onDestroy } from "svelte";

	import * as config from "../../config/config.js";
	import { user as userStore } from "./../../stores/user.js";
	let current_time = {
		hour: dayjs().hour(),
		minute: dayjs().minute(),
	};
	let reservation_details = null;
	let restaurtant = null;
	console.log($userStore);
	onMount(async () => {
		if ($userStore === null) {
			const localStorage_token = localStorage.getItem("token");
			if (!localStorage_token) {
				localStorage.removeItem("token");
				return replace("/");
			}
			const response = await fetch(`${config.server_base_url}/user`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					token: localStorage_token,
				},
			});
			if (response.status === 200) {
				const user = await response.json();
				console.log(user);
				$userStore = user.user;
			} else {
				return replace("/");
			}
		}
		const reservationResponse = await fetch(
			`${config.server_base_url}/order/reservation/${params.reservation_id}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
			}
		);
		reservation_details = await reservationResponse.json();
		restaurtant = reservation_details.restaurant_id.restaurant;
		restaurtant.location = {
			lat: reservation_details.restaurant_id.location.coordinates[1],
			lng: reservation_details.restaurant_id.location.coordinates[0],
		};
		console.log(restaurtant);
		console.log(reservation_details);
	});
	const imageSrc = (image) => {
		return `${config.server_base_url}/image/${image}`;
	};
</script>

{#if $userStore}
	<NavBar
		userName={$userStore.name}
		image_url={imageSrc($userStore.customer.profile_image)}
		back_url="/profile?page=reservations"
	/>

	{#if reservation_details !== null}
		<div
			class="flex pl-8 mt-4 flex-col text-5xl font-Montserrat text-red-400 capitalize font-semibold tracking-wide"
		>
			Your reservation details
		</div>
		<div class="flex mt-6 pl-8">
			<div class="max-w-[200px]">
				<img
					class="aspect-square rounded-lg"
					src={imageSrc(restaurtant.logo)}
					alt={restaurtant.name}
				/>
			</div>
			<div class="flex flex-col ml-6 gap-2">
				<div class="flex text-4xl text-red-500 font-semibold font-Roboto">
					{restaurtant.name}
				</div>
				<div class="flex text-2xl text-gray-700">
					{`${restaurtant.address.street} ${restaurtant.address.landmark} ${restaurtant.address.area} ${restaurtant.address.city}`}
				</div>
				<div class="flex text-2xl text-gray-700 capitalize">
					{reservation_details.slot_time.hour > 12
						? reservation_details.slot_time.hour -
						  12 +
						  `:${
								reservation_details.slot_time.minute == 0
									? "00"
									: reservation_details.slot_time.minute
						  } PM`
						: reservation_details.slot_time.hour +
						  `:${
								reservation_details.slot_time.minute == 0
									? "00"
									: reservation_details.slot_time.minute
						  } AM`}'s reservation
				</div>
				<div class="flex text-2xl text-gray-700">
					{#if reservation_details.slot_date === dayjs().format("YYYY-MM-DD")}
						Today
					{:else if reservation_details.slot_date === dayjs()
							.add(1, "day")
							.format("YYYY-MM-DD")}
						Tomorrow
					{:else}
						{reservation_details.slot_date}
					{/if}
				</div>
				<div class="flex text-2xl text-gray-700">
					₹ {reservation_details.payble_amount}
				</div>
			</div>
		</div>
		<div class="w-max ml-8">
			<div
				on:click={(e) => {
					window.open(
						`https://www.google.com/maps/dir/?api=1&destination=${restaurtant.location.lat},${restaurtant.location.lng}`,
						"_blank"
					);
				}}
				class="cursor-pointer mt-4 px-8 py-4 rounded-lg capitalize text-2xl bg-[#D12627] text-white self-start"
			>
				Get Directions
			</div>
		</div>
	{/if}
{/if}
