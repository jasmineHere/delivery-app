<script>
	export let params = {};
	import Home_nav_user from "../../components/Home_nav_user.svelte";
	import NavBar from "../../components/Restuarant_nav.svelte";

	import dayjs from "dayjs";
	import { link, push, replace, pop, querystring } from "svelte-spa-router";
	import { onMount, onDestroy } from "svelte";

	import * as config from "../../config/config.js";
	import { user as userStore } from "./../../stores/user.js";
	let current_time = {
		hour: dayjs().hour(),
		minute: dayjs().minute(),
	};
	let reservations_list = null;

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
			`${config.server_base_url}/order/list_reservation`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
			}
		);
		if (reservationResponse.status === 200) {
			reservations_list = await reservationResponse.json();
			reservations_list = reservations_list.map((reservation) => {
				reservation.restaurtant = reservation.restaurant_id.restaurant;
				reservation.restaurtant.location = {
					lat: reservation.restaurant_id.location.coordinates[1],
					lng: reservation.restaurant_id.location.coordinates[0],
				};
				return reservation;
			});
		} else {
			return replace("/");
		}
	});
	const imageSrc = (image) => {
		return `${config.server_base_url}/image/${image}`;
	};
</script>

<div
	class="flex border-b-2 border-red-300 w-full uppercase text-6xl text-[#D12627] py-8 pl-6 font-bold font-Montserrat tracking-wide"
>
	your Reservations
</div>
{#if reservations_list && reservations_list.length}
	<div class="flex flex-col gap-4 px-4 py-8 mt-5 ">
		{#each reservations_list as reservation}
			<div
				class="flex flex-col px-4 py-4 bg-gray-100 rounded-lg hover:bg-gray-300 cursor-pointer"
				on:click={() => {
					push(`/reservation_details/${reservation._id}`);
				}}
			>
				<div class="flex gap-5">
					<div class="flex w-[200px] h-[200px]">
						<img
							class="aspect-square rounded-lg "
							src={imageSrc(reservation.restaurtant.logo)}
							alt={reservation.restaurtant.name}
						/>
					</div>

					<div class="flex flex-col gap-2">
						<div class="flex text-4xl text-red-500 font-semibold">
							{reservation.restaurtant.name}
						</div>
						<div class="flex text-2xl text-gray-700">
							{`${reservation.restaurtant.address.street} ${reservation.restaurtant.address.landmark} ${reservation.restaurtant.address.area} ${reservation.restaurtant.address.city}`}
						</div>
						<div class="flex justify-start items-center gap-3">
							<div
								class="flex text-2xl text-white bg-red-400 px-3 py-2 w-max rounded-lg capitalize"
							>
								{reservation.slot_time.hour > 12
									? reservation.slot_time.hour -
									  12 +
									  `:${
											reservation.slot_time.minute == 0
												? "00"
												: reservation.slot_time.minute
									  } PM`
									: reservation.slot_time.hour +
									  `:${
											reservation.slot_time.minute == 0
												? "00"
												: reservation.slot_time.minute
									  } AM`}
							</div>
							<div class="flex text-2xl text-gray-700 font-semibold">
								{#if reservation.slot_date === dayjs().format("YYYY-MM-DD")}
									Today
								{:else if reservation.slot_date === dayjs()
										.add(1, "day")
										.format("YYYY-MM-DD")}
									Tomorrow
								{:else}
									{reservation.slot_date}
								{/if}
							</div>
						</div>
						<div class="flex text-2xl text-gray-700 font-semibold">
							{reservation.person_count} Person
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
	{:else}
	<h2 class="text-center text-red-500 text-2xl p-5">You have no Reservations yet.</h2>
{/if}
