<script>
	import Star_svg from "../svgs/star.svelte";
	import Close_svg from "../svgs/close_icon.svelte";
	import PlusSign from "../svgs/plus_sign.svelte";
	import MinusSign from "../svgs/minus_sign.svelte";
	import Svelecte from "svelecte";
	import dayjs from "dayjs";
	import { user as userStore } from "../stores/user";
	import GetDeliveryNav from "./../components/Restuarant_nav.svelte";
	export let params = {};
	import { link, push, replace, pop } from "svelte-spa-router";
	import HomeNav from "../components/Home_nav.svelte";
	import {
		searchResults as searchResultsStore,
		searchTerm as searchTermStore,
	} from "../stores/search_res";
	import * as config from "./../config/config.js";
	import { onMount, onDestroy, afterUpdate } from "svelte";

	import { getLocation } from "../utils/location";
	let user;
	let isUserLoggedIn;
	let current_time = {
		hour: dayjs().hour(),
		minute: dayjs().minute(),
	};
	let restaurant_details = null;
	let reviews = [
		{
			customer_name: "",
			star: 0,
			text: "",
		},
	];
	let isOpen = false;
	let locationMapEle;
	let selectedTab = "overview"; // overview, order_online , make_reservation, reviews,
	let selectedReservationTab = "today";

	let has_menu = false;
	let menu_search_options = [];
	let menu_search_selected_value = "";
	$: {
		console.log(menu_search_selected_value);
	}
	let menu_selected_category = "";

	let isModificationPopUpOpen = false;
	let isCartPopUpOpen = false;
	let isReservationPopUpOpen = false;

	let modification_popup_data = {
		item_name: "",
		sizes: [],
		size_selected_index: undefined,
		total_price: 0,
	};
	let reservation_popup_data = {
		slot_name: null,
		slot_price: null,
		day: "today",
		time: null,
	};
	const updatePriceModificationPopup = () => {
		let totalPrice = modification_popup_data.item_price;
		if (modification_popup_data.sizes.length > 0) {
			if (modification_popup_data.size_selected_index !== undefined) {
				totalPrice =
					modification_popup_data.sizes[
						modification_popup_data.size_selected_index
					].size_price;
			}
		}
		if (modification_popup_data.extras.length > 0) {
			modification_popup_data.extras.forEach((extra) => {
				if (extra.selected) {
					totalPrice += extra.extra_price;
				}
			});
		}
		modification_popup_data.total_price =
			totalPrice * modification_popup_data.quantity;
	};
	let cart = {
		items: [
			// {
			// 	id: "",
			// 	name: "",
			// 	total_price: 0,
			// 	quantity: 1,
			// 	selected_extras: [
			// 		{
			// 			id: "",
			// 			name: "",
			// 			extras_price: 0,
			// 		},
			// 	],
			// 	selected_size: {
			// 		id: "",
			// 		name: "",
			// 		size_price: 0,
			// 	},
			// },
		],
		total_price: 0,
	};
	let addItemToCard = (
		item_id,
		item_name,
		item_price,
		quantity = 1,
		selected_size_name = {
			id,
			name,
			size_price,
		},
		selected_modfication = [
			{
				id,
				name,
				extras_price,
			},
		]
	) => {
		let item = {
			id: item_id,
			name: item_name,
			total_price: item_price,
			quantity: quantity,

			selected_extras: selected_modfication,
			selected_size: selected_size_name,
		};
		cart.items.push(item);
		cart.total_price += item_price;
		cart = cart;
	};
	const updateLocalStorage = (forceUpdate = false) => {
		if ((cart && cart.items && cart.items.length > 0) || forceUpdate) {
			console.log("to Local Storage");
			window.localStorage.setItem("cart_restaurant_id", params.id);
			window.localStorage.setItem("cart", JSON.stringify(cart));
			if (cart.items.length === 0) {
				window.localStorage.removeItem("cart");
				window.localStorage.removeItem("cart_restaurant_id");
			}
		}
	};
	$: {
		console.log(cart);
		updateLocalStorage();
	}

	let removeItemFromCard = (index) => {
		let item = cart.items[index];
		cart.total_price -= item.total_price;
		cart.items.splice(index, 1);
		if (cart.items.length === 0) {
			updateLocalStorage(true);
		}
		cart = cart;
	};

	let updateItemQuantity = (index, quantity) => {
		let item = cart.items[index];

		cart.total_price -= item.total_price;

		let unitPrice = item.total_price / item.quantity;

		cart.items[index].quantity = quantity;

		cart.items[index].total_price = cart.items[index].quantity * unitPrice;

		cart.total_price += cart.items[index].total_price;
	};

	let updateItemExtras = (index, extras) => {
		let item = cart.items[index];
		cart.total_price -= item.total_price;
		item.selected_extras = extras;
		item.total_price = item.quantity * item.price;
		cart.total_price += item.total_price;
	};

	let updateItemSize = (index, size) => {
		let item = cart.items[index];
		cart.total_price -= item.total_price;
		item.selected_size = size;
		item.total_price = item.quantity * item.price;
		cart.total_price += item.total_price;
	};

	const loadLocationMap = () => {
		let map = new window.google.maps.Map(locationMapEle, {
			center: restaurant_details.location,
			zoom: 15,
		});
		const marker = new window.google.maps.Marker({
			position: restaurant_details.location,
			map: map,
		});
	};
	afterUpdate(() => {
		if (restaurant_details && selectedTab === "overview") {
			loadLocationMap();
		}
	});
	onMount(async () => {
		current_time = {
			hour: dayjs().hour(),
			minute: dayjs().minute(),
		};
		if (params.id) {
			// fetch restuartant details
			let res = await fetch(
				`${config.server_base_url}/restaurant/${params.id}`
			);
			let data = await res.json();
			restaurant_details = data.restaurant;
			restaurant_details.location = {
				lat: data.location.coordinates[1],
				lng: data.location.coordinates[0],
			};

			if (
				current_time.hour >= restaurant_details.opening_time.hour &&
				current_time.hour <= restaurant_details.closing_time.hour
			) {
				if (current_time.hour === restaurant_details.opening_time.hour) {
					if (current_time.minute >= restaurant_details.opening_time.minute) {
						isOpen = true;
					}
				} else {
					isOpen = true;
				}
			}
			if (restaurant_details.menu) {
				has_menu = true;
				menu_selected_category = restaurant_details.menu.categories[0];
				menu_search_options = restaurant_details.menu.categories.map(
					(category) => {
						return {
							label: category.category_name,
							options: category.items.map((item) => {
								return {
									label: item.item_name,
									value: item._id,
								};
							}),
						};
					}
				);
				const localStorageRestaurantId =
					window.localStorage.getItem("cart_restaurant_id");
				const localStorageCart = window.localStorage.getItem("cart");
				if (localStorageRestaurantId === params.id) {
					cart = JSON.parse(localStorageCart);
				} else {
					cart = {
						items: [],
						total_price: 0,
					};
				}
			}

			let reviewRes = await fetch(
				`${config.server_base_url}/restaurant/${params.id}/reviews`
			);
			let reviewsData = await reviewRes.json();
			reviews = reviewsData.map((_) => {
				return {
					customer_name: _.customer_id.name,
					star: _.rating,
					text: _.text,
				};
			});
		} else {
			replace("/");
		}
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
			userStore.set(data.user);
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

	const makeReservation = async (e) => {
		e.preventDefault();
		if (!isUserLoggedIn) return push("/login");
		const response = await fetch(
			`${config.server_base_url}/order/create_reservation`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
				body: JSON.stringify({
					restaurant_id: params.id,
					slot_name: reservation_popup_data.slot_name,
					slot_time:
						reservation_popup_data.time.hour +
						":" +
						reservation_popup_data.time.minute,
					price: reservation_popup_data.slot_price,
					day: reservation_popup_data.day,
					person_count: reservation_popup_data.person_count,
				}),
			}
		);
		const data = await response.json();
		if (response.status === 200) {
			console.log(data);

			location.href = data.stripe_session_url;
		} else {
			replace("/");
		}
	};

	const imageSrc = (image) => {
		return `${config.server_base_url}/image/${image}`;
	};
</script>

<div class="min-h-screen relative bg-white">
	{#if isModificationPopUpOpen}
		<div
			class="fixed flex p-4 items-center justify-center top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"
		>
			<div
				class="relative max-h-[90vh]  w-full sm:w-[95%] md:w-[95%] lg:w-[90] xl:w-[80%] 2xl:w-[70%] bg-white py-4 px-8 pb-0 rounded-lg"
			>
				<div
					class="flex text-3xl text-black font-semibold justify-between items-center"
				>
					<div class="">{modification_popup_data.item_name}</div>
					<div
						class="cursor-pointer"
						on:click={(_) => (isModificationPopUpOpen = false)}
					>
						<Close_svg width="24" height="24" fill="#000" />
					</div>
				</div>
				<div class="flex text-xl text-gray-500">
					{modification_popup_data.description}
				</div>
				<div class="overflow-y-auto max-h-[70vh]">
					{#if modification_popup_data.sizes.length}
						<div
							class="flex flex-col w-full mt-4 border-t-2 border-gray-400  font-semibold font-Montserrat text-black"
						>
							<div class="flex mt-2 text-2xl">Sizes</div>
							<div class="text-lg text-gray-400">Select a Size</div>
						</div>
						<div class="flex flex-col py-2 px-2 w-full max-w-[400px] gap-2">
							{#each modification_popup_data.sizes as size, index}
								<div
									class={`flex w-full px-4 py-2 text-xl rounded-md cursor-pointer justify-between ${
										index === modification_popup_data.size_selected_index
											? "bg-red-500 text-white"
											: "bg-gray-200"
									}`}
									on:click={(e) => {
										if (index === modification_popup_data.size_selected_index)
											return;
										modification_popup_data.size_selected_index = index;
										updatePriceModificationPopup();
									}}
								>
									<div class="flex">{size.size_name}</div>
									<div class="flex">₹ {size.size_price}</div>
								</div>
								<!-- show price of size -->
							{/each}
						</div>
					{/if}

					{#if modification_popup_data.extras.length}
						<div
							class="flex flex-col w-full mt-4 border-t-2 border-gray-200  font-semibold font-Montserrat text-black"
						>
							<div class="flex mt-2 text-2xl">Extras</div>
							<div class="text-lg text-gray-400">
								Add extras and customize it
							</div>
						</div>
						<div class="flex flex-col py-2 px-2 w-full gap-2">
							{#each modification_popup_data.extras as extra, index}
								<div
									class={`flex w-full px-4 py-2 text-xl rounded-md cursor-pointer justify-between ${
										extra.selected ? "bg-red-500 text-white" : ""
									}`}
								>
									<div class="flex">{extra.extra_name}</div>
									<div class="flex">
										₹ {extra.extra_price}
										{#if extra.selected}<div
												class="flex capitalize text-xl underline px-4 text-white"
												on:click={(e) => {
													extra.selected = false;
													updatePriceModificationPopup();
												}}
											>
												Remove
											</div>{:else}<div
												class="flex capitalize text-xl underline px-4 text-[#D12627]"
												on:click={(e) => {
													extra.selected = true;
													updatePriceModificationPopup();
												}}
											>
												Add
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
				<div class="flex w-full p-4 pr-0 justify-between">
					<div class="flex items-center">
						<div class="flex w-full">
							<div class="flex text-2xl">Total</div>
							<div class="px-4 flex text-2xl font-semibold">
								₹ {modification_popup_data.total_price}
							</div>
						</div>
					</div>
					<div class="flex items-center">
						<div class="flex px-4 text-2xl items-center">
							<div
								class="w-12 h-12 rounded-md flex justify-center items-center bg-red-500 text-white cursor-pointer"
								on:click={(e) => {
									if (modification_popup_data.quantity === 1) return;
									let unitPrice = parseInt(
										modification_popup_data.total_price /
											modification_popup_data.quantity
									);
									modification_popup_data.quantity -= 1;
									modification_popup_data.total_price =
										unitPrice * modification_popup_data.quantity;
								}}
							>
								-
							</div>
							<div class="flex text-2xl px-3">
								{modification_popup_data.quantity}
							</div>
							<div
								class="w-12 h-12 rounded-md flex justify-center items-center bg-red-500 text-white cursor-pointer"
								on:click={(e) => {
									let unitPrice = parseInt(
										modification_popup_data.total_price /
											modification_popup_data.quantity
									);
									modification_popup_data.quantity += 1;
									modification_popup_data.total_price =
										unitPrice * modification_popup_data.quantity;
								}}
							>
								+
							</div>
						</div>
						<div
							class="flex capitalize py-3 px-6 bg-red-500 text-white text-2xl rounded-md cursor-pointer"
							on:click={() => {
								let selected_modifications = modification_popup_data.extras.map(
									(_) => {
										if (_.selected) {
											return {
												id: _._id,
												name: _.extra_name,
												price: _.extra_price,
											};
										}
									}
								);
								let size = {
									id: null,
									name: null,
									price: null,
								};
								// if (modification_popup_data.size_selected_index !== undefined) {
								// 	const selectedsize =
								// 		modification_popup_data.sizes[
								// 			modification_popup_data.size_selected_index
								// 		];
								// 	size.id = selectedsize._id;
								// 	size.name = selectedsize.size_name;
								// 	size.price = selectedsize.size_price;
								// }
								if (
									!(
										modification_popup_data.sizes.length > 0 ||
										modification_popup_data.extras.length > 0
									)
								) {
									const cardItemAlreadyIndex =
										modification_popup_data.cardItems.findIndex((_) => {
											return _.id === modification_popup_data.item_id;
										});
									if (cardItemAlreadyIndex !== -1) {
										modification_popup_data.cardItems[
											cardItemAlreadyIndex
										].quantity += 1;
									}
								}
								addItemToCard(
									modification_popup_data._id,
									modification_popup_data.item_name,
									modification_popup_data.total_price,
									modification_popup_data.quantity,
									{
										id: size.id,
										name: size.name,
										size_price: size.price,
									},
									selected_modifications.filter(Boolean)
								);
								isModificationPopUpOpen = false;
							}}
						>
							Add To Card
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
	{#if isReservationPopUpOpen}
		<div
			class="fixed flex p-4 items-center justify-center top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"
		>
			<div
				class="relative max-h-[90vh]  w-full sm:w-[95%] md:w-[95%] lg:w-[90] xl:w-[80%] 2xl:w-[70%] bg-white py-4 px-8 rounded-lg"
			>
				<div
					class="flex text-4xl text-black font-bold justify-between items-center border-gray-200 border-b-2 pb-4"
				>
					<div class="capitalize font-Montserrat">make a Reservation</div>
					<div
						class="cursor-pointer"
						on:click={(_) => (isReservationPopUpOpen = false)}
					>
						<Close_svg width="24" height="24" fill="#000" />
					</div>
				</div>
				<div class="flex flex-col py-3 w-full">
					<div class="flex capitalize text-3xl text-red-400 font-semibold">
						{reservation_popup_data.slot_name}
					</div>
					<div class="flex w-max pt-2">
						<div
							class="flex text-2xl py-3 px-6 bg-red-400 text-white rounded-xl font-semibold capitalize"
						>
							{reservation_popup_data.day} at
							{reservation_popup_data.time.hour > 12
								? reservation_popup_data.time.hour -
								  12 +
								  `:${
										reservation_popup_data.time.minute == 0
											? "00"
											: reservation_popup_data.time.minute
								  } PM`
								: reservation_popup_data.time.hour +
								  `:${
										reservation_popup_data.time.minute == 0
											? "00"
											: reservation_popup_data.time.minute
								  } AM`}
						</div>
					</div>

					<div class="flex capitalize text-2xl pt-3">
						Fees For this Reservation: <span class="flex ml-3 font-semibold"
							>₹ {reservation_popup_data.slot_price}</span
						>
					</div>
				</div>
				<div
					class="flex w-full justify-between items-center pt-3 border-t-2 border-gray-200"
				>
					<div class="flex text-2xl items-center justify-start">
						For
						<div
							class="w-12 h-12 rounded-md text-3xl flex justify-center items-center bg-red-500 text-white cursor-pointer ml-2"
							on:click={(e) => {
								if (reservation_popup_data.person_count === 1) return false;
								reservation_popup_data.person_count -= 1;
							}}
						>
							-
						</div>
						<div class="flex text-2xl px-3">
							{reservation_popup_data.person_count}
						</div>
						<div
							class="w-12 h-12 rounded-md text-3xl flex justify-center items-center bg-red-500 text-white cursor-pointer mr-2"
							on:click={(e) => {
								if (reservation_popup_data.person_count >= 12) return false;
								reservation_popup_data.person_count += 1;
							}}
						>
							+
						</div>
						Person
					</div>
					<div
						class="flex text-3xl capitalize px-6 py-3 font-semibold bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer"
						on:click={makeReservation}
					>
						continue
					</div>
				</div>
			</div>
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
	{#if restaurant_details}
		<div
			class="w-full mt-16 flex flex-col mx-auto sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[65%] 2xl:w-[55%]"
		>
			<div class="flex gap-4">
				<img
					class="w-1/2 rounded-xl"
					src={`${config.server_base_url}/image/${restaurant_details.cover_image}`}
					alt="cover"
				/>
				<div class="grid grid-cols-2 gap-x-4 gap-y-4">
					{#each restaurant_details.images as image, index}
						{#if index < 3}
							<img
								class="rounded-xl"
								src={`${imageSrc(image)}`}
								alt=""
								srcset=""
							/>
						{/if}
					{/each}
					<div
						on:click={() => {
						selectedTab = "Photos"
						}}
						class="rounded-xl cursor-pointer text-2xl hover:bg-opacity-50  bg-gray-700 bg-opacity-25 font-semibold flex w-full items-center justify-center capitalize"
					>
						see all
					</div>
				</div>
			</div>
			<div class="flex mt-10">
				<img
					class="h-[200px] w-[200px] rounded-lg"
					src={`${imageSrc(restaurant_details.logo)}`}
					alt="logo"
				/>
				<div
					class="flex flex-col font-bold px-4 capitalize overflow-hidden whitespace-nowrap"
				>
					<div class="text-4xl text-ellipsis">{restaurant_details.name}</div>
					<div class="py-2 text-2xl font-semibold text-gray-500 text-ellipsis">
						{restaurant_details.cuisines.join(", ")}
					</div>
					<div
						class="font-medium text-2xl capitalize text-gray-400 text-ellipsis"
					>
						{restaurant_details.address.area}
						{restaurant_details.address.city}
					</div>
					<div class="font-medium py-2 text-2xl capitalize text-ellipsis">
						{#if isOpen}
							<span class="text-green-500">open Now</span>
						{:else}
							<span class="text-red-500">closed</span>
						{/if}
					</div>
					<div class="flex">
						<div
							class={`flex justify-center gap-2 items-center text-2xl pl-4 pr-2 pt-0.5 pb-1 rounded-md text-white ${
								restaurant_details.overall_rating >= 3
									? "bg-green-500"
									: "bg-red-500"
							}`}
						>
							{restaurant_details.overall_rating.toString().length === 1
								? `${restaurant_details.overall_rating}.0`
								: restaurant_details.overall_rating}
							<Star_svg />
						</div>
						<div class="flex text-2xl ml-2 items-center font-normal">
							{restaurant_details.total_reviews} Total Reviews
						</div>
					</div>
				</div>
			</div>
		</div>
		<div
			class="flex flex-col mt-8 w-full mx-auto sm:w-[95%] lg:w-[90%] xl:w-[80%] 2xl:w-[75%]"
		>
			<div
				class="flex w-full items-center justify-evenly  text-2xl capitalize tracking-wide font-Montserrat"
			>
				{#each ["overview", "order_online", "make_reservation", "reviews", "Photos"] as i}
					<div
						class={`py-4 border-b-4 cursor-pointer transition-all ${
							i === selectedTab
								? "text-[#D12627] border-[#D12627] font-bold tracking-wider"
								: "border-transparent"
						} `}
						on:click={(e) => (selectedTab = i)}
					>
						{i.replace(/_/g, " ")}
					</div>
				{/each}
			</div>
			<div
				class="flex w-full flex-col mt-4 min-h-[700px] bg-gray-50 rounded-lg"
			>
				{#if selectedTab === "overview"}
					<div
						class="w-full flex text-4xl p-8 capitalize font-semibold text-black tracking-wide"
					>
						about this restaurant
					</div>
					<div class="flex flex-col pt-4 px-8">
						<div class="capitalize text-2xl p-2">
							<b>Address:</b>
							{restaurant_details.address.street}
							{restaurant_details.address.landmark}
							{restaurant_details.address.area}
							{restaurant_details.address.city}
							{restaurant_details.address.state}
						</div>
						<div class="capitalize text-2xl p-2">
							<b>Phone:</b>
							{restaurant_details.phone}
						</div>
						<div class="capitalize text-2xl p-2 flex items-center">
							<b>cuisines offerd: </b>
							{#each restaurant_details.cuisines as i}
								<div class="px-4 bg-red-200 py-2 rounded-xl ml-2">{i}</div>
							{/each}
						</div>
						<div class="capitalize text-2xl p-2 flex flex-col">
							<b>Location and Direction: </b>
							<div
								on:click={(e) => {
									window.open(
										`https://www.google.com/maps/dir/?api=1&destination=${restaurant_details.location.lat},${restaurant_details.location.lng}`,
										"_blank"
									);
								}}
								class="cursor-pointer mt-4 px-8 py-4 rounded-lg capitalize text-2xl bg-[#D12627] text-white self-start"
							>
								Get Directions
							</div>
							<div
								class="aspect-video mt-4 rounded-md"
								bind:this={locationMapEle}
							/>
						</div>
					</div>
				{:else if selectedTab === "order_online"}
					<div class="flex flex-col px-2 md:px-4 lg:px-8 pb-10">
						<div
							class="py-8 capitalize text-4xl text-[#D12627] font-bold mx-auto"
						>
							Order Online
						</div>
						<div class="flex">
							{#if restaurant_details.menu.categories.length}
								<div
									class="flex flex-col w-[30%] overflow-hidden min-h-[700px] gap-2 px-4 overflow-y-scroll"
								>
									{#each restaurant_details.menu.categories as category_object}
										<div
											class={`flex overflow-hidden  px-4 py-2 text-ellipsis whitespace-nowrap text-2xl font-Roboto ${
												category_object.category_name ===
												menu_selected_category.category_name
													? "bg-gradient-to-l from-[#f8abab] text-[#D12627] border-r-4 border-red-600"
													: "hover:bg-gray-200 cursor-pointer"
											}`}
											on:click={(e) =>
												category_object.category_name ===
												menu_selected_category.category_name
													? null
													: (menu_selected_category = category_object)}
										>
											<span class="text-ellipsis">
												{category_object.category_name}
											</span>
										</div>
									{/each}
								</div>
								<div class="flex flex-col w-full pb-[100px]">
									<div class="flex w-1/2 self-center">
										<!-- <Svelecte
										options={menu_search_options}
										placeholder="Search Menu"
										valueAsObject=true
										bind:value={menu_search_selected_value}
									/> -->
									</div>
									{#if menu_selected_category}
										<div
											class="flex text-3xl color-black font-semibold font-Montserrat px-8 mt-8"
										>
											{menu_selected_category.category_name}
										</div>
									{/if}
									<div class="flex px-8 py-4 flex-wrap gap-2">
										{#each restaurant_details.offers as offer}
											<div
												class="flex flex-col w-max px-3 py-2 bg-blue-400 text-white rounded-lg"
											>
												<div class="flex font-bold">{offer.offer_name}</div>
												<div class="flex">{offer.discount_percentage}% off</div>
												<div class="flex font-thin">
													over order of ₹ {offer.min_amount}
												</div>
											</div>
										{/each}
									</div>
									<div class="flex w-full flex-col px-8 mt-10">
										{#if menu_selected_category}
											{#each menu_selected_category.items as item_object}
												<div class="flex p-2 overflow-hidden gap-4">
													<img
														src={imageSrc(item_object.item_image)}
														alt={item_object.item_name}
														class=" aspect-square w-1/5 rounded-lg"
													/>
													<div class="flex flex-col w-full">
														<div class="flex  text-3xl px-2 py-2 font-semibold">
															{item_object.item_name}
														</div>
														<div class="flex text-2xl px-2 py-2">
															₹{item_object.item_price}
														</div>
														<div
															class="w-[90%] text-ellipsis whitespace-nowrap overflow-hidden text-xl px-2 py-2"
														>
															{item_object.description}
														</div>
														<div class="flex items-center">
															{#if cart.items.length && cart.items.find((_) => {
																	return item_object._id === _.id;
																}) && item_object.sizes.length === 0 && item_object.extras.length === 0}
																<div
																	class="w-12 h-12 rounded-md flex justify-center items-center bg-red-500 text-white cursor-pointer"
																	on:click={(e) => {
																		const itemIndex = cart.items.findIndex(
																			(_) => {
																				return item_object._id === _.id;
																			}
																		);
																		const item = cart.items[itemIndex];
																		if (item.quantity === 1) {
																			removeItemFromCard(itemIndex);
																		} else {
																			updateItemQuantity(
																				itemIndex,
																				item.quantity - 1
																			);
																		}
																	}}
																>
																	-
																</div>
																<div class="flex text-2xl px-3">
																	{cart.items.find((_) => {
																		return item_object._id === _.id;
																	}).quantity}
																</div>
																<div
																	class="w-12 h-12 rounded-md flex justify-center items-center bg-red-500 text-white cursor-pointer"
																	on:click={(e) => {
																		const itemIndex = cart.items.findIndex(
																			(_) => {
																				return item_object._id === _.id;
																			}
																		);
																		const item = cart.items[itemIndex];
																		updateItemQuantity(
																			itemIndex,
																			item.quantity + 1
																		);
																	}}
																>
																	+
																</div>
															{:else}
																<div
																	class="hover:scale-105 transition-all flex flex-col px-4 py-2 text-lg bg-red-500 text-white rounded-lg cursor-pointer font-semibold"
																	on:click={(e) => {
																		if (
																			item_object.sizes.length ||
																			item_object.extras.length
																		) {
																			isModificationPopUpOpen = true;
																			modification_popup_data = item_object;
																			modification_popup_data.size_selected_index = 0;
																			modification_popup_data.quantity = 1;
																			modification_popup_data.total_price =
																				item_object.item_price;
																		} else {
																			addItemToCard(
																				item_object._id,
																				item_object.item_name,
																				item_object.item_price,
																				1,
																				{},
																				[]
																			);
																		}
																	}}
																>
																	Add +
																</div>
															{/if}
														</div>
													</div>
												</div>
											{/each}{/if}
									</div>
								</div>
							{/if}
						</div>
					</div>
				{:else if selectedTab === "make_reservation"}
					{#if restaurant_details.reservation_time_slots.length}
						<div class="flex flex-col gap-y-4">
							<div
								class="flex gap-4 items-center justify-center py-4 text-2xl font-Montserrat font-semibold"
							>
								{#each ["today", "tomorrow"] as i}
									<div
										class={`flex px-4 py-3 ${
											selectedReservationTab == i
												? "bg-red-400 text-white"
												: "bg-gray-300 text-black cursor-pointer"
										} rounded-md `}
										on:click={(e) => {
											selectedReservationTab = i;
										}}
									>
										{i}'s Reservation
									</div>
								{/each}
							</div>
							<div
								class="w-full md:w-10/12 lg:w-9/12 xl:w-[70%] mx-auto flex flex-col gap-4"
							>
								{#each restaurant_details.reservation_time_slots as reservation_slot}
									{#if selectedReservationTab === "today"}
										{#if current_time.hour + 1 < reservation_slot.slot_time.hour && reservation_slot.available.today}
											<div
												class="flex py-3 px-4 flex-col border-2 rounded-lg border-gray-300 hover:bg-red-400 hover:border-transparent hover:text-white"
												on:click={(e) => {
													reservation_popup_data = {
														slot_name: reservation_slot.slot_name,
														time: reservation_slot.slot_time,
														day: "today",
														slot_price: reservation_slot.reservation_fee,
														person_count: 2,
													};
													isReservationPopUpOpen = true;
												}}
											>
												<div class="flex text-2xl">
													{reservation_slot.slot_name}
												</div>
												<div
													class="flex flex-col px-4 py-2 text-lg rounded-lg cursor-pointer font-semibold"
												>
													{reservation_slot.slot_time.hour > 12
														? reservation_slot.slot_time.hour -
														  12 +
														  `:${
																reservation_slot.slot_time.minute == 0
																	? "00"
																	: reservation_slot.slot_time.minute
														  } PM`
														: reservation_slot.slot_time.hour +
														  `:${
																reservation_slot.slot_time.minute == 0
																	? "00"
																	: reservation_slot.slot_time.minute
														  } AM`}
												</div>
												<div
													class="flex flex-col px-4 py-2 text-lg rounded-lg cursor-pointer capitalize font-semibold"
												>
													₹ {reservation_slot.reservation_fee} Per reservation
												</div>
											</div>
										{/if}
									{:else if reservation_slot.available.tomorrow}
										<div
											class="flex py-3 px-4 flex-col border-2 rounded-lg border-gray-300 hover:bg-red-400 hover:border-transparent hover:text-white"
											on:click={(e) => {
												reservation_popup_data = {
													slot_name: reservation_slot.slot_name,
													time: reservation_slot.slot_time,
													day: "tomorrow",
													slot_price: reservation_slot.reservation_fee,
													person_count: 2,
												};
												isReservationPopUpOpen = true;
											}}
										>
											<div class="flex text-2xl">
												{reservation_slot.slot_name}
											</div>
											<div
												class="flex flex-col px-4 py-2 text-lg rounded-lg cursor-pointer font-semibold"
											>
												{reservation_slot.slot_time.hour > 12
													? reservation_slot.slot_time.hour -
													  12 +
													  `:${
															reservation_slot.slot_time.minute == 0
																? "00"
																: reservation_slot.slot_time.minute
													  } PM`
													: reservation_slot.slot_time.hour +
													  `:${
															reservation_slot.slot_time.minute == 0
																? "00"
																: reservation_slot.slot_time.minute
													  } AM`}
											</div>
											<div
												class="flex flex-col px-4 py-2 text-lg rounded-lg cursor-pointer capitalize font-semibold"
											>
												₹ {reservation_slot.reservation_fee} Per reservation
											</div>
										</div>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				{:else if selectedTab === "reviews"}
					<div class="flex flex-col ">
						{#each reviews as review}
							<div
								class="flex gap-3 flex-col  min-w-[500px]  border-b-2 border-gray-400 py-3 "
							>
								<div class="text-2xl capitalize font-medium">
									{review.customer_name}
								</div>
								<div
									class={`flex justify-center gap-2 items-center text-2xl pl-4 pr-2 pt-0.5 pb-1 w-max rounded-md text-white ${
										review.star >= 3 ? "bg-green-500" : "bg-red-500"
									}`}
								>
									{review.star}
									<Star_svg />
								</div>
								<div class="text-xl">{review.text}</div>
							</div>
						{/each}
					</div>
				{:else if selectedTab === "Photos"}
					<div class="flex w-full flex-wrap gap-3 justify-center">
						{#each restaurant_details.images as image, index}
							<div class="flex w-[500px] aspect-video">
								<img
									src={imageSrc(image)}
									class="w-full rounded-md  shadow-md"
									alt="customer profile "
								/>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
	{#if cart && cart.items.length && selectedTab === "order_online"}
		<div
			class="fixed  min-h-min max-h-[70vh] bottom-0 py-3 px-8 border-t-2 border-t-gray-300 w-full bg-gray-200 z-9 flex flex-col"
		>
			{#if isCartPopUpOpen}
				<div
					class="flex sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[65%] 2xl:w-[55%] mx-auto flex-col"
				>
					<div
						class="flex text-3xl text-black font-semibold justify-between items-center w-full pb-4"
					>
						<div class="capitalize">cart</div>
						<div
							class="cursor-pointer"
							on:click={(_) => (isCartPopUpOpen = false)}
						>
							<Close_svg width="24" height="24" fill="#000" />
						</div>
					</div>
					<div
						style="max-height: 50vh;"
						class="pb-8 overflow-y-auto max-h-[50vh]"
					>
						{#each cart.items as item, index}
							<div class=" w-full ">
								<div class="flex w-full justify-between mt-4">
									<div class="flex flex-col">
										<div class="text-2xl font-semibold capitalize">
											{item.name}
										</div>
										{#if item.selected_size.id}
											<div class="flex capitalize font-xl text-gray-600">
												<div class="text-sm text-gray-600">
													{item.selected_size.name}
												</div>
											</div>
										{/if}
										{#if item.selected_extras.length}
											<div class="flex capitalize font-xl text-gray-600">
												<div class="text-sm text-gray-600 flex">
													Extras:
													{#each item.selected_extras as extra}
														<div class="ml-2">{extra.name}</div>
													{/each}
												</div>
											</div>
										{/if}
										<!-- qnt -->
										<div class="flex text-2xl items-center justify-start">
											<div
												class="w-8 h-8 rounded-md flex justify-center items-center bg-red-500 text-white cursor-pointer"
												on:click={(e) => {
													if (item.quantity === 1) {
														removeItemFromCard(index);
													} else {
														updateItemQuantity(index, item.quantity - 1);
													}
												}}
											>
												-
											</div>
											<div class="flex text-2xl px-3">
												{item.quantity}
											</div>
											<div
												class="w-8 h-8 rounded-md flex justify-center items-center bg-red-500 text-white cursor-pointer"
												on:click={(e) => {
													updateItemQuantity(index, item.quantity + 1);
												}}
											>
												+
											</div>
										</div>
									</div>
									<div class="flex">
										<div class="text-2xl font-semibold">
											₹ {item.total_price}
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			<div
				class="flex mx-auto sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[65%] 2xl:w-[55%] justify-between items-center"
			>
				<div class="flex text-2xl">
					<div class="px-4">Total:</div>
					<span class="font-bold">₹ {cart.total_price}</span>
					<div class="pl-4 font-semibold">
						({cart.items.length} item{#if cart.items.length > 1}s{/if})
					</div>
				</div>
				{#if isCartPopUpOpen}
					<div
						class="flex capitalize text-xl text-gray-700 cursor-pointer"
						on:click={(e) => {
							isCartPopUpOpen = false;
						}}
					>
						<svg
							width="31"
							height="19"
							viewBox="0 0 31 19"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							class="rotate-180"
						>
							<line
								x1="2"
								y1="-2"
								x2="19.2132"
								y2="-2"
								transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 28 18)"
								stroke="#787878"
								stroke-width="4"
								stroke-linecap="square"
							/>
							<line
								x1="2"
								y1="-2"
								x2="19.2132"
								y2="-2"
								transform="matrix(0.707107 -0.707107 -0.707107 -0.707107 0 16)"
								stroke="#787878"
								stroke-width="4"
								stroke-linecap="square"
							/>
						</svg>
					</div>
				{:else}
					<div
						class="flex capitalize text-xl text-gray-700 cursor-pointer"
						on:click={(e) => {
							isCartPopUpOpen = true;
						}}
					>
						<svg
							width="31"
							height="19"
							viewBox="0 0 31 19"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<line
								x1="2"
								y1="-2"
								x2="19.2132"
								y2="-2"
								transform="matrix(-0.707107 -0.707107 -0.707107 0.707107 28 18)"
								stroke="#787878"
								stroke-width="4"
								stroke-linecap="square"
							/>
							<line
								x1="2"
								y1="-2"
								x2="19.2132"
								y2="-2"
								transform="matrix(0.707107 -0.707107 -0.707107 -0.707107 0 16)"
								stroke="#787878"
								stroke-width="4"
								stroke-linecap="square"
							/>
						</svg>
					</div>
				{/if}
				{#if isOpen}
					<div
						class="flex capitalize bg-[#D12627] text-white rounded-lg py-3 px-6 text-2xl cursor-pointer"
						on:click={() => {
							if (cart.items.length > 0) {
								push("/order_checkout");
							}
						}}
					>
						Place Order
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
