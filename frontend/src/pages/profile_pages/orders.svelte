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
	let order_list = [];
	const imageSrc = (image) => {
		return `${config.server_base_url}/image/${image}`;
	};
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
		const ordersResponse = await fetch(
			`${config.server_base_url}/order/list_food_orders`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
			}
		);
		if (ordersResponse.status === 200) {
			order_list = await ordersResponse.json();
			order_list = order_list.map((orders) => {
				orders.restaurtant = orders.restaurant_id.restaurant;
				orders.restaurtant.location = {
					lat: orders.restaurant_id.location.coordinates[1],
					lng: orders.restaurant_id.location.coordinates[0],
				};
				return orders;
			});
			console.log(order_list);
		} else {
			return replace("/");
		}
	});
</script>

<div
	class="flex border-b-2 border-red-300 w-full uppercase text-6xl text-[#D12627] py-8 pl-6 font-bold font-Montserrat tracking-wide"
>
	your Orders
</div>
{#if order_list && order_list.length}
	<div class="flex flex-col gap-4 px-4 py-8 mt-5 ">
		{#each order_list as order}
			<div
				class="gap-2 flex flex-col px-4 py-4 bg-gray-100 rounded-lg hover:bg-gray-300 cursor-pointer"
				on:click={() => {
					push(`/order_details/${order._id}`);
				}}
			>
				<div class="flex text-4xl text-red-400 font-semibold">
					# {order._id}
				</div>
				<div class="flex gap-5">
					<div class="flex w-[100px] h-[100px]">
						<img
							class="aspect-square rounded-lg "
							src={imageSrc(order.restaurtant.logo)}
							alt={order.restaurtant.name}
						/>
					</div>
					<div class="flex flex-col gap-2 ">
						<div class="text-3xl font-semibold">{order.restaurtant.name}</div>
						<div class="text-2xl">
							{order.restaurtant.address.area}
							{order.restaurtant.address.city}
						</div>
					</div>
				</div>
				<div
					class="flex w-max text-3xl font-Montserrat px-3 py-2 rounded-md bg-red-500 text-white"
				>
					{#if order.order_status === "payment_success"}
						Not Accepted Yet
					{:else if order.order_status === "accepted"}
						Accepted
					{:else if order.order_status === "rejected"}
						Rejected
					{:else if order.order_status === "preparing"}
						preparing
					{:else if order.order_status === "on_the_way"}
						on the way
					{:else if order.order_status === "deliverd"}
						delivered
					{:else if order.order_status === "refunded"}
						Refunded
					{/if}
				</div>
				<div class="flex flex-col gap-2">
					<div class="flex gap-3">
						<div class="flex text-2xl font-medium text-gray-500">Amount:</div>
						<div class="flex text-2xl font-medium ">
							₹ {order.payble_amount}
						</div>
					</div>

					<div class="flex gap-3">
						<div class="flex text-2xl font-medium text-gray-500">Date:</div>
						<div class="flex text-2xl font-medium ">
							{dayjs(order.order_placed_on).format("DD-MM-YYYY hh:mm A")}
						</div>
					</div>

					<div class="flex gap-3">
						<div class="flex text-2xl font-medium text-gray-500">
							items Ordered:
						</div>
						<div class="flex flex-col text-2xl font-medium ">
							{#each order.items as item}
								<div class="flex">
									<div class="flex">{item.quantity} x</div>
									<div class="text-2xl ml-2">{item.item_name}</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<h2 class="text-center text-red-500 text-2xl p-5">You have no orders yet.</h2>
{/if}
