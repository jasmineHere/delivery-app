<script>
	import NavBar from "./../components/Restuarant_nav.svelte";

	import Close_svg from "./../svgs/close_icon.svelte";

	import dayjs from "dayjs";
	import { link, push, replace, pop } from "svelte-spa-router";
	import { onMount, onDestroy } from "svelte";

	import * as config from "../config/config.js";
	import { user as userStore } from "./../stores/user.js";
	let current_time = {
		hour: dayjs().hour(),
		minute: dayjs().minute(),
	};

	const TAX_PERCENTAGE = 18;
	const DELIVERY_FEES_PER_KM = 8;

	let cart = {};
	let restaurant_id = "";
	let restaurant_details = null;

	//
	let selected_address_index = -1;
	let selected_address = null;

	//
	let selected_offer_index = -1;
	let selected_offer = null;
	let discount = 0;

	$: tax = (cart.total_price - discount) * (18 / 100);

	let delivery_fees = 0;
	let delivery_distance = null;
	//
	$: grand_total = cart.total_price - discount + tax + delivery_fees;

	console.log($userStore);
	onMount(async () => {
		console.log("running");
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
		selected_address_index = 0;
		selected_address = $userStore.customer.address[selected_address_index];
		const cartLocalstorage = localStorage.getItem("cart");
		const cartRestaurantId = localStorage.getItem("cart_restaurant_id");
		if (cartLocalstorage && cartRestaurantId) {
			cart = JSON.parse(cartLocalstorage);
			restaurant_id = cartRestaurantId;

			let res = await fetch(
				`${config.server_base_url}/restaurant/${restaurant_id}`
			);
			let data = await res.json();
			restaurant_details = data.restaurant;
			restaurant_details.location = {
				lat: data.location.coordinates[1],
				lng: data.location.coordinates[0],
			};

			const restaurant_location = {
				lat: restaurant_details.location.lat,
				lng: restaurant_details.location.lng,
			};
			console.log($userStore);
			const customer_location = {
				lat: selected_address.location.coordinates[1],
				lng: selected_address.location.coordinates[0],
			};
			calcDeliveryCharge(customer_location, restaurant_location);
		} else {
			return replace("/get_delivery");
		}
	});
	const imageSrc = (image) => {
		return `${config.server_base_url}/image/${image}`;
	};

	const calcOfferDiscount = (
		offer_percentage,
		order_amount,
		min_order_amount,
		max_discount
	) => {
		console.log(arguments);
		if (order_amount < min_order_amount) {
			return 0;
		}
		let discount_by_percentage = (order_amount * offer_percentage) / 100;
		if (discount_by_percentage > max_discount) {
			discount = max_discount;
		} else {
			discount = discount_by_percentage;
		}
		return discount;
	};

	const calcDeliveryCharge = async (customerLocation, restuartantLocation) => {
		const res = await fetch(
			`${config.server_base_url}/order/distance_and_fees?origins=${customerLocation.lat},${customerLocation.lng}&destinations=${restuartantLocation.lat},${restuartantLocation.lng}`,
			{
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
			}
		);
		const data = await res.json();
		console.log(data);
		delivery_fees = Math.floor(data.delivery_fees);
		delivery_distance = data.distance;
	};
	$: {
		console.log("ran");
		if (selected_address_index !== -1 && restaurant_details) {
			const restaurant_location = {
				lat: restaurant_details.location.lat,
				lng: restaurant_details.location.lng,
			};
			const customer_location = {
				lat: selected_address.location.coordinates[1],
				lng: selected_address.location.coordinates[0],
			};
			calcDeliveryCharge(customer_location, restaurant_location);
		}
	}
	$: {
		if (selected_offer_index !== -1) {
			selected_offer = restaurant_details.offers[selected_offer_index];
			discount = calcOfferDiscount(
				selected_offer.discount_percentage,
				cart.total_price,
				selected_offer.min_amount,
				selected_offer.max_discount
			);
		}
	}

	const placeOrder = async (e) => {
		e.preventDefault();
		const response = await fetch(`${config.server_base_url}/order/food_order`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				token: localStorage.getItem("token"),
			},
			body: JSON.stringify({
				restaurant_id: restaurant_id,
				items: cart.items.map((item) => {
					return {
						item_name: item.name,
						item_price: item.total_price / item.quantity,
						quantity: item.quantity,
						extras: item.selected_extras.map((extra) => {
							return {
								extra_name: extra.name,
								extra_price: extra.price,
							};
						}),
						selected_size: item.selected_size.name || null,
					};
				}),
				total_price: Math.floor(cart.total_price - discount),
				discount_applied: discount,
				delivery_fees: Math.floor(delivery_fees),
				tax: Math.floor(tax),
				payble_amount: Math.floor(grand_total),
				address: selected_address,
				offer: selected_offer_index !== -1 ? selected_offer : null,
			}),
		});
		const data = await response.json();

		if (response.status === 200) {
			localStorage.removeItem("cart");
			localStorage.removeItem("cart_restaurant_id");
			location.href = data.stripe_session_url;
		} else {
			return replace("/");
		}
	};

	let selectedAddressPopup = false;
</script>

<div class="relative">
	{#if restaurant_details !== null}
		<NavBar
			userName={$userStore.name}
			image_url={imageSrc($userStore.customer.profile_image)}
			back_url={`/restaurant/${restaurant_id}`}
			back_text="Back"
		/>
		<div
			class="flex w-5/6 mx-auto px-4 py-3 text-4xl font-bold capitalize items-center justify-center"
		>
			checkout
		</div>
		<div class="flex flex-col w-5/6 md:w-[60%] mx-auto mt-4 pb-[100px]">
			<div class="flex gap-3">
				<div class="flex w-[100px] h-[100px] ">
					<img
						class="aspect-square rounded-xl"
						src={imageSrc(restaurant_details.logo)}
						alt="resturant's logo"
					/>
				</div>
				<div class="flex flex-col">
					<div class="flex text-3xl font-semibold">
						{restaurant_details.name}
					</div>
					<div class="flex text-gray-500 text-2xl">
						{restaurant_details.address.area}
						{restaurant_details.address.city}
					</div>
				</div>
			</div>

			<div class="flex flex-col mt-5 gap-3">
				<div class="flex text-3xl text-red-400 font-bold">Delivery Address</div>
				<div class="flex flex-col gap-2">
					<div class="flex text-2xl capitalize font-semibold">
						{$userStore.name}
					</div>
					<div
						class="flex text-2xl uppercase text-red-800 font-normal items-end"
					>
						{$userStore.customer.address[selected_address_index].type}

						{#if $userStore.customer.address.length > 1}
							<div
								on:click={(_) => (selectedAddressPopup = true)}
								class="underline text-base text-blue-500 ml-2 lowercase"
							>
								change
							</div>
						{/if}
					</div>
					<div class="flex text-2xl">
						{$userStore.customer.address[selected_address_index].address}
					</div>
				</div>
			</div>

			<div class="flex flex-col mt-5 gap-3">
				<div class="flex text-3xl text-red-400 font-bold capitalize">
					Order Details
				</div>
				<div class="flex flex-col gap-2">
					{#each cart.items as item}
						<div class="flex flex-col px-2 py-4 gap-2">
							<div
								class="flex text-2xl font-semibold capitalize justify-between"
							>
								<div class="flex">{item.name}</div>
								<div class="flex font-semibold">
									{item.total_price} ₹
								</div>
							</div>

							{#if item.selected_size.id}<div class="flex">
									{item.selected_size.name} (₹ {item.selected_size.size_price})
								</div>
							{/if}
							{#if item.selected_extras.length}
								<div class="flex gap-2">
									<div class="flex font-semibold capitalize">extras:</div>
									{#each item.selected_extras as extra}
										<div class="flex">{extra.name} (₹ {extra.price})</div>
									{/each}
								</div>
							{/if}
							<div class="flex gap-3 items-center text-xl">
								<div
									class="flex py-1 px-2 bg-green-500 rounded text-white font-bold"
								>
									{item.quantity}
								</div>
								<div class="flex">X</div>
								<div class="flex font-semibold">
									₹ {item.total_price / item.quantity}
								</div>
							</div>
						</div>
					{/each}
				</div>
				{#if restaurant_details.offers.length > 0}
					<div class="flex text-3xl text-red-400 font-bold">Offers</div>
					<div class="flex px-2 py-4 flex-wrap gap-2">
						{#each restaurant_details.offers as offer, index}
							<div
								class={`flex flex-col w-max px-3 py-2 ${
									offer.min_amount > cart.total_price
										? "bg-gray-400"
										: selected_offer_index === index
										? "bg-red-400"
										: "bg-blue-400 hover:bg-blue-500"
								} text-white rounded-lg cursor-pointer `}
								on:click={(e) => {
									if (offer.min_amount < cart.total_price) {
										console.log("set");
										selected_offer_index = index;
									}
								}}
							>
								<div class="flex font-bold">{offer.offer_name}</div>
								<div class="flex">{offer.discount_percentage}% off</div>
								<div class="flex font-thin">
									over order of ₹ {offer.min_amount}
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<div class="flex w-full h-1 bg-gray-400 " />
				<div class="flex  capitalize justify-between">
					<div class="text-3xl text-gray-600 font-bold">sub total</div>
					<div class="flex text-3xl font-bold text-gray-600">
						{cart.total_price} ₹
					</div>
				</div>
				{#if selected_offer_index !== -1}
					<div class="flex  capitalize justify-between">
						<div class="text-2xl text-gray-400 font-bold">
							offer discount <span
								on:click={(e) => {
									selected_offer_index = -1;
									selected_offer = null;
									discount = 0;
								}}
								class="text-lg text-blue-400 font-thin underline cursor-pointer"
								>remove</span
							>
						</div>
						<div class="flex text-2xl font-bold text-gray-400">
							- {discount} ₹
						</div>
					</div>
				{/if}
				<div class="flex  capitalize justify-between">
					<div class="text-2xl text-gray-400 font-bold">
						GST tax {TAX_PERCENTAGE}%
					</div>
					<div class="flex text-2xl font-bold text-gray-400">
						+ {Math.floor(tax)} ₹
					</div>
				</div>
				<div class="flex  capitalize justify-between">
					<div class="text-2xl text-gray-400 font-bold">
						Delivery charge ({delivery_distance})
					</div>
					<div class="flex text-2xl font-bold text-gray-400">
						+ {Math.floor(delivery_fees)} ₹
					</div>
				</div>
				<div class="flex mt-4 capitalize justify-between">
					<div class="text-3xl text-gray-700 font-bold">grand total</div>
					<div class="flex text-3xl font-bold text-gray-700">
						{Math.floor(grand_total)} ₹
					</div>
				</div>

				<div class="flex mt-6 capitalize justify-center">
					<div
						on:click={placeOrder}
						class="flex font-semibold text-2xl capitalize px-4 py-3 rounded-lg cursor-pointer font-Roboto text-white bg-red-400 hover:bg-red-500"
					>
						Pay and place order
					</div>
				</div>
			</div>
		</div>

		{#if selectedAddressPopup === true}
			<div
				class="flex min-h-screen w-full items-center justify-center top-0 left-0 fixed bg-black bg-opacity-50 z-10"
			>
				<div
					class="max-h-[90vh]  w-full sm:w-[95%] md:w-[70%] lg:w-[60%] xl:w-[50%] bg-white py-4 px-8 pb-0 rounded-lg"
				>
					<div
						class="flex text-3xl text-black font-semibold justify-between items-center"
					>
						<div class="capitalize">Change Delivery Address</div>
						<div
							class="cursor-pointer"
							on:click={(_) => {
								selectedAddressPopup = false;
							}}
						>
							<Close_svg width="24" height="24" fill="#000" />
						</div>
					</div>
					<div class="flex flex-col py-4 px-3 overflow-y-auto">
						{#each $userStore.customer.address as address, index}
							<div
								on:click={ e => {
									selected_address_index = index
									selected_address = address
									selectedAddressPopup = false;
								}
									
								}
								class="flex flex-col hover:border-2 hover:border-red-400  py-2 px-4 w-full  border-red-300 border-2 rounded-xl"
							>
								<div
									class="flex  gap-4 uppercase text-red-500 font-semibold items-center"
								>
									<div class="flex text-2xl">{address.type}</div>
								</div>
								<div class="flex text-2xl py-4">{address.address}</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>
