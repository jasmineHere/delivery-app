<script>
	export let params = {};
	import Home_nav_user from "../../components/Home_nav_user.svelte";
	import NavBar from "../../components/Restuarant_nav.svelte";
	import Star_svg from "./../../svgs/star.svelte";
	import dayjs from "dayjs";
	import { link, push, replace, pop } from "svelte-spa-router";
	import { onMount, onDestroy } from "svelte";

	import * as config from "../../config/config.js";
	import { user as userStore } from "./../../stores/user.js";
	let current_time = {
		hour: dayjs().hour(),
		minute: dayjs().minute(),
	};
	let order_review = null;
	let new_review = {
		selected_star: 3,
		text: "",
		text_valid: false,
	};
	const imageSrc = (image) => {
		return `${config.server_base_url}/image/${image}`;
	};
	let order_details = null;
	let restaurtant = null;
	const fetchAndUpdateOrderDetails = async () => {
		const orderResponse = await fetch(
			`${config.server_base_url}/order/food_order/${params.order_id}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
			}
		);
		return orderResponse.json();
	};
	let orderRefreshInterval = null;
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

		order_details = await fetchAndUpdateOrderDetails();
		restaurtant = order_details.restaurant_id.restaurant;
		restaurtant.location = {
			lat: order_details.restaurant_id.location.coordinates[1],
			lng: order_details.restaurant_id.location.coordinates[0],
		};
		console.log(restaurtant);
		console.log(order_details);
		const review = await fetch(
			`${config.server_base_url}/order/review/${params.order_id}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
			}
		);
		const reviewData = await review.json();
		if (reviewData.error) {
			order_review = null;
		} else {
			order_review = reviewData;
			console.log(order_review);
		}
		orderRefreshInterval = setInterval(async () => {
			order_details = await fetchAndUpdateOrderDetails();
			console.log(order_details);
		}, 3000);
	});

	onDestroy(() => {
		clearInterval(orderRefreshInterval);
	});

	const postReview = async () => {
		const review = await fetch(
			`${config.server_base_url}/order/review/${params.order_id}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
				body: JSON.stringify({
					stars: new_review.selected_star,
					review: new_review.text,
				}),
			}
		);
		const reviewData = await review.json();
		if (reviewData.error) {
			console.log(reviewData.error);
		} else {
			order_review = reviewData;
			console.log(order_review);
		}
	};
	const downloadInvoice = async () => {
		const invoice = await fetch(
			`${config.server_base_url}/order/invoice/${params.order_id}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
			}
		);
		const invoiceData = await invoice.json();
		if (invoice.status === 200) {
			console.log(invoiceData);
			window.open(imageSrc(invoiceData.file), "_blank");
		} else {
			alert(invoice.status);
			window.location.reload();
		}
	};
</script>

{#if $userStore !== null}
	<NavBar
		userName={$userStore.name}
		image_url={imageSrc($userStore.customer.profile_image)}
		back_url="/profile?page=orders"
	/>
	{#if order_details !== null}
		<div
			class="flex justify-start items-start flex-col w-[95%] md:w-[80%] xl:w-[70%] mx-auto pb-24"
		>
			<div
				class="flex pl-8 mt-4 gap-4 flex-col text-5xl mx-auto font-Montserrat text-red-400 capitalize font-semibold tracking-wide"
			>
				Your Order #{order_details._id}

				<span class="text-black font-semibold text-3xl text-center">
					{#if order_details.order_status === "payment_success"}
						will be accepted soon
					{:else if order_details.order_status === "accepted"}
						will soon start preparing
					{:else if order_details.order_status === "rejected"}
						your order was rejected and you will be refunde
					{:else if order_details.order_status === "preparing"}
						is being prepared
					{:else if order_details.order_status === "on_the_way"}
						is on the way
					{:else if order_details.order_status === "deliverd"}
						was delivered successfully
					{:else if order_details.order_status === "refunded"}
						was not delivered and you will be refunded
					{/if}
				</span>
			</div>
			<!--  -->

			<div class="flex flex-col mt-5 gap-3">
				<div class="flex capitalize text-3xl font-bold">Delivery address</div>
				<div class="flex capitalize text-2xl font-semibold text-gray-600">
					{$userStore.name}
				</div>
				<div class="flex capitalize text-2xl text-gray-600">
					{order_details.address.address}
				</div>
			</div>
			{#if order_details.delivery_person}
				<div class="flex flex-col mt-5 gap-3">
					<div class="flex capitalize text-3xl font-bold">Delivery Person</div>
					<div class="flex capitalize text-2xl font-semibold text-gray-600">
						{order_details.delivery_person.name}
					</div>
					<div class="flex capitalize text-2xl text-gray-600">
						+91 {order_details.delivery_person.delivery_person.phone}
					</div>
				</div>
			{/if}
			<div class="flex h-1 bg-gray-400 w-full mt-10 mx-auto rounded" />

			<div class="flex flex-col mt-5">
				<div class="flex gap-4">
					<div class="flex w-[100px]">
						<img
							class="aspect-square rounded-lg"
							src={imageSrc(restaurtant.logo)}
							alt={restaurtant.name}
						/>
					</div>
					<div class="flex flex-col gap-2 py-2">
						<div class="flex text-3xl font-semibold text-black capitalize">
							{restaurtant.name}
						</div>
						<div class="flex text-3xl font-medium text-gray-500 capitalize">
							{restaurtant.address.area}
							{restaurtant.address.city}
						</div>
					</div>
				</div>

				<div class="flex flex-col mt-5">
					<div class="flex capitalize text-3xl font-bold">Order items</div>
					<div class="flex flex-col mt-3 w-full gap-3">
						{#each order_details.items as item}
							<div class="flex flex-col px-2 py-4">
								<div
									class="flex text-2xl font-semibold capitalize justify-between"
								>
									<div class="flex">{item.item_name}</div>
									<div class="flex font-semibold">
										{item.item_price} ₹
									</div>
								</div>

								{#if item.extras.length}
									<div class="flex gap-2">
										<div class="flex font-semibold capitalize">extras:</div>
										{#each item.extras as extra}
											<div class="flex">
												{extra.extra_name} (₹ {extra.extra_price})
											</div>
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
										₹ {item.item_price / item.quantity}
									</div>
								</div>
							</div>
						{/each}
					</div>

					<div class="flex flex-col mt-6 gap-3">
						<div class="flex w-full">
							<div class="flex justify-center items-center text-2xl w-full">
								<div class="font-medium">Delivery fees</div>
								<div class="flex ml-auto">
									{order_details.delivery_fees} ₹
								</div>
							</div>
						</div>
						<div class="flex w-full">
							<div class="flex justify-center items-center text-2xl w-full">
								<div class="font-medium">Tax</div>
								<div class="flex ml-auto">
									{order_details.tax} ₹
								</div>
							</div>
						</div>
						<div class="flex w-full">
							<div class="flex justify-center items-center text-3xl w-full">
								<div class="font-bold">Total</div>
								<div class="flex ml-auto font-bold">
									{order_details.payble_amount} ₹
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="flex h-1 bg-gray-400 w-full mt-10 mx-auto rounded" />
			<div class="flex flex-col mt-5 w-full">
				{#if order_details.order_status === "deliverd"}
					<div class="flex capitalize text-3xl font-bold">Your Review</div>
					<div class="flex flex-col py-2">
						{#if order_review}
							<div class="flex">
								<div
									class={`flex justify-center gap-2 items-center text-2xl pl-4 pr-2 pt-0.5 pb-1 cursor-pointer rounded-md text-white
										${order_review.rating === 1 ? "bg-red-500" : ""}
										${order_review.rating === 2 ? "bg-orange-500" : ""}
										${order_review.rating === 3 ? "bg-yellow-500" : ""}
										${order_review.rating === 4 ? "bg-green-500" : ""}
										${order_review.rating === 5 ? "bg-blue-500" : ""}
									`}
								>
									{order_review.rating}
									<Star_svg />
								</div>
							</div>
							<div class="flex text-2xl font-semibold capitalize">
								{order_review.text}
							</div>
						{:else}
							<div class="flex text-xl font-medium pb-3">
								Select Start Rating
							</div>
							<div class="flex gap-2 pb-2">
								{#each [1, 2, 3, 4, 5] as star}
									<div
										on:click={(_) => (new_review.selected_star = star)}
										class={`flex justify-center gap-2 items-center text-2xl pl-4 pr-2 pt-0.5 pb-1 cursor-pointer rounded-md text-white 
									  ${new_review.selected_star === star ? "bg-red-500" : "bg-gray-500"}
							`}
									>
										{star}
										<Star_svg />
									</div>
								{/each}
							</div>
							<div class="flex text-xl font-medium pb-3">Write Your Review</div>
							<div class="flex w-full py-2">
								<textarea
									class="resize-none h-[200px] text_input"
									autocomplete="off"
									placeholder="Write your review here Min. 10 characters"
									bind:value={new_review.text}
								/>
							</div>

							<button
								disabled={new_review.text.length < 10}
								on:click={postReview}
								class="disabled:bg-slate-300 disabled:text-gray-400 py-2 px-4 text-2xl font-semibold rounded-xl bg-[#E25555] text-white border-solid w-max"
							>
								Post Review
							</button>
						{/if}
						<button
							on:click={downloadInvoice}
							class="disabled:bg-slate-300 disabled:text-gray-400 py-1 px-3 text-xl font-normal rounded-xl bg-[#8456e1] text-white border-solid w-max"
						>
							Download Inoice
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
{/if}

<style>
	.text_input {
		@apply w-full p-4 text-xl rounded-xl border-2 bg-slate-200 border-black border-solid;
	}
	.text_input:focus {
		@apply ring-0;
		@apply border-[#E25555];
	}
</style>
