<script>
	import Tailwindcss from "../Tailwindcss.svelte";
	import Loader_button from "../components/button_loader.svelte";
	import * as config from "./../config/config.js";
	import SignUp_nev from "../components/Signup_nav.svelte";
	import { onMount, onDestroy } from "svelte";
	import Validator from "validator";

	import { push, replace, pop } from "svelte-spa-router";
	let mapContainer;
	let map;
	let currentLocation = {
		lat: 0,
		lng: 0,
	};

	const getLocation = (_) => {
		return new Promise((resolve, reject) => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(position) => {
						currentLocation.lat = position.coords.latitude;
						currentLocation.lng = position.coords.longitude;
						resolve(currentLocation);
					},
					(err) => {
						reject(err);
					},
					{
						enableHighAccuracy: true,
						maximumAge: 0,
					}
				);
			} else {
				reject("Geolocation is not supported by this browser.");
			}
		});
	};
	onMount(async (_) => {
		const location = await getLocation().catch((err) => {
			console.log(err);
			window.alert(err.message);
		});
		console.log(window.google);
		currentLocation = location;
		map = new window.google.maps.Map(mapContainer, {
			center: location,
			zoom: 15,
		});
		const marker = new window.google.maps.Marker({
			position: location,
			map: map,
			draggable: true,
		});
		marker.addListener("dragend", (e) => {
			currentLocation.lat = e.latLng.lat();
			currentLocation.lng = e.latLng.lng();
			console.log("new Location : ", currentLocation);
		});
	});
	let name = "";
	let email = "";
	let password = "";
	let mobile = "";
	let address = "";

	let isEmailValid = true;
	let isPasswordValid = true;
	let isMobileValid = true;
	let isAddressValid = true;

	let serverSideError = null;
	$: buttonUsable =
		email.length && name.length && password.length && mobile && address.length;

	let loadingState = false;
	const buttonHandler = async (e) => {
		if (loadingState === true) return;

		Validator.isEmail(email) ? (isEmailValid = true) : (isEmailValid = false);
		Validator.isLength(password, { min: 6 })
			? (isPasswordValid = true)
			: (isPasswordValid = false);
		Validator.isMobilePhone(mobile.toString(), "en-IN")
			? (isMobileValid = true)
			: (isMobileValid = false);
		Validator.isLength(address, { min: 25 })
			? (isAddressValid = true)
			: (isAddressValid = false);

		if (
			!isEmailValid ||
			!isPasswordValid ||
			!isMobileValid ||
			!isAddressValid
		) {
			return;
		}
		const requestBody = {
			name: name,
			email: email,
			password: password,
			address: address,
			phone: mobile,
			location: {
				lat: currentLocation.lat,
				lng: currentLocation.lng,
			},
		};
		loadingState = true;
		const response = await fetch(`${config.server_base_url}/user/customer`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});
		loadingState = false;
		const data = await response.json();
		if (response.status === 200) {
			replace("/login");
		} else {
			if (data.error === "Email_already_exists") {
				serverSideError = "Email already exists. Please try another email.";
			} else {
				serverSideError = "Something went wrong. Please try again later.";
			}
		}

		console.log(data);
	};
</script>

<SignUp_nev />
<div class="flex justify-center p-8">
	<h2 class="text-5xl font-bold">Sign Up</h2>
</div>

<div
	class="flex ml-auto mt-4 mr-auto flex-col py-4 w-[90%] sm:w-[80%] md:w-[75%] lg:w-[60%] xl:w-[45%]"
>
	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Name</h2>
		<input
			class="text_input"
			type="text"
			name="text"
			id="email"
			autocomplete="off"
			bind:value={name}
		/>
	</div>
	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Email</h2>
		<input
			class="text_input"
			type="email"
			name="email"
			autocomplete="off"
			bind:value={email}
		/>
		<h4 hidden={isEmailValid} class={"text-red-400"}>email is not valid</h4>
	</div>
	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Password</h2>
		<input
			class="text_input"
			type="password"
			name="password"
			autocomplete="off"
			bind:value={password}
		/>
		<h4 hidden={isPasswordValid} class={"text-red-400"}>
			Password must have 6 characters at minimum
		</h4>
	</div>
	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Phone</h2>
		<div class="flex items-center">
			<h2 class="text-2xl pr-3 font-semibold">+91</h2>
			<input
				class="text_input"
				type="number"
				name="phone"
				autocomplete="off"
				bind:value={mobile}
			/>
		</div>

		<h4 hidden={isMobileValid} class={"text-red-400"}>
			Phone number must have 10 degit
		</h4>
	</div>
	<div class="flex flex-col">
		<h2 class="text-2xl  py-3 font-semibold">Address</h2>
		<textarea
			class="resize-none h-[200px] text_input"
			autocomplete="off"
			bind:value={address}
		/>
		<h4 hidden={isAddressValid} class={"text-red-400"}>
			Address must have 25 characters at minimum
		</h4>
	</div>
	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Select Location From Map</h2>
		<div class="w-full h-[600px]" bind:this={mapContainer} />
	</div>
	<!-- signup button  -->
	{#if serverSideError}
		<h4 class="text-red-500 text-2xl text-center">{serverSideError}</h4>
	{/if}

	<div class="flex flex-col py-8 justify-center">
		{#if loadingState === false}
			<button
				disabled={!buttonUsable}
				on:click={buttonHandler}
				class="disabled:bg-slate-300 disabled:text-gray-400 py-5 mx-auto text-3xl font-semibold rounded-xl bg-[#E25555]
             text-white border-solid w-1/2"
			>
				Sign Up
			</button>
		{:else}
			<div class="self-center">
				<Loader_button />
			</div>
		{/if}
	</div>
</div>

<style>
	.text_input {
		@apply w-full p-4 text-xl rounded-xl border-2 bg-slate-200 border-black border-solid;
	}
	.text_input:focus {
		@apply ring-0;
		@apply border-[#E25555];
	}
</style>
