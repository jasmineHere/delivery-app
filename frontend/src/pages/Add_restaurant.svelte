<script>
	import Loader_button from "../components/button_loader.svelte";
	import * as config from "./../config/config.js";
	import SignUp_nev from "../components/Signup_nav.svelte";
	import { onMount, onDestroy } from "svelte";
	import Validator from "validator";
	import Svelecte from "svelecte";
	import Text_field from "../components/forms/text_field.svelte";

	import { push, replace, pop } from "svelte-spa-router";
	let mapContainer;
	let map;
	let currentLocation = {
		lat: 0,
		lng: 0,
	};
	let cuisinesOptions = config.cuisines;
	let cuisinesLabelAsValue = true;
	let cuisin_selection = [];

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
	let restaurant_name = "";
	let owner_name = "";
	let email = "";
	let password = "";
	let mobile = "";

	let address_street = "";
	let address_landmark = "";
	let address_area = "";
	let address_city = "";
	let address_state = "Gujarat";

	let isEmailValid = true;
	let isPasswordValid = true;
	let isMobileValid = true;
	let logoFile = null;
	let logoFilePreview = null;

	let coverImageFile = null;
	let coverImageFilePreview = null;

	let cuisines = [];
	let opening_hour = "";
	let opening_miniute = "";
	let closing_hour = "";
	let closing_miniute = "";

	let serverSideError = null;
	$: buttonUsable =
		email.length &&
		restaurant_name.length &&
		owner_name.length &&
		password.length &&
		mobile.toString().length > 9 &&
		address_street.length &&
		address_landmark.length &&
		address_area.length &&
		address_city.length &&
		address_state.length &&
		cuisines.length &&
		logoFile &&
		coverImageFile &&
		opening_hour.toString().length &&
		opening_miniute.toString().length &&
		closing_hour.toString().length &&
		closing_miniute.toString().length;

	let loadingState = false;
	const uploadImage = async (file) => {
		const form = new FormData();
		form.append("file", file);
		const response = await fetch(`${config.server_base_url}/image_post`, {
			method: "POST",
			body: form,
		});
		const data = await response.json();
		return data.file;
	};
	const buttonHandler = async (e) => {
		if (loadingState === true) return;
		// loadingState = true;
		Validator.isEmail(email) ? (isEmailValid = true) : (isEmailValid = false);
		Validator.isLength(password, { min: 6 })
			? (isPasswordValid = true)
			: (isPasswordValid = false);
		Validator.isMobilePhone(mobile.toString(), "en-IN")
			? (isMobileValid = true)
			: (isMobileValid = false);

		if (!isEmailValid || !isPasswordValid || !isMobileValid) {
			return;
		}
		const requestBody = {
			resturant_name: restaurant_name,
			owner_name: owner_name,
			email: email,
			password: password,
			phone: mobile,
			location: {
				lat: currentLocation.lat,
				lng: currentLocation.lng,
			},
			address: {
				street: address_street,
				landmark: address_landmark,
				area: address_area,
				city: address_city,
				state: address_state,
			},
			cuisines: cuisines,
			logo: await uploadImage(logoFile),
			cover_image: await uploadImage(coverImageFile),
			opening_time: {
				hour: opening_hour,
				minute: opening_miniute,
			},
			closing_time: {
				hour: closing_hour,
				minute: closing_miniute,
			},
		};
		const response = await fetch(`${config.server_base_url}/user/restaurant`, {
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

	const onLogoFileChange = (e) => {
		logoFile = e.target.files[0];
		logoFilePreview = URL.createObjectURL(e.target.files[0]);
	};
	const onCoverFileChange = (e) => {
		coverImageFile = e.target.files[0];
		coverImageFilePreview = URL.createObjectURL(e.target.files[0]);
	};
</script>

<SignUp_nev />
<div class="flex justify-center p-8">
	<h2 class="text-5xl font-bold">Add Your Restaurant</h2>
</div>

<div
	class="flex gap-y-6 ml-auto mt-4 mr-auto flex-col py-4 w-[90%] sm:w-[80%] md:w-[75%] lg:w-[60%] xl:w-[45%]"
>
	<Text_field
		title_text="Restaurant Name"
		placeholder="Cookie Factory"
		name="restaurant_name"
		type="text"
		bind:value={restaurant_name}
	/>

	<Text_field
		title_text="Owner's Name"
		placeholder="Mr. Cookie"
		name="owner_name"
		type="text"
		bind:value={owner_name}
	/>

	<Text_field
		title_text="Email"
		placeholder="username@email.com"
		name="email"
		type="email"
		is_valid={isEmailValid}
		error_string="Please enter a valid email address"
		bind:value={email}
	/>

	<Text_field
		title_text="Password"
		placeholder="*********"
		name="password"
		type="password"
		is_valid={isPasswordValid}
		error_string="Password must be atleast 6 characters long"
		bind:value={password}
	/>

	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Phone</h2>
		<div class="flex items-center">
			<h2 class="text-2xl pr-3 font-semibold">+91</h2>
			<input
				class="text_input"
				type="number"
				name="phone"
				placeholder="9876543210"
				autocomplete="off"
				bind:value={mobile}
			/>
		</div>

		<h4 hidden={isMobileValid} class={"text-red-400"}>
			Phone number must have 10 degit
		</h4>
	</div>

	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Select Location From Map</h2>
		<div class="w-full h-[600px]" bind:this={mapContainer} />
	</div>

	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Address</h2>
		<div class="px-8">
			<Text_field
				title_text="Street"
				title_text_size="text-xl"
				placeholder="27 main street"
				name="address_street"
				type="text"
				bind:value={address_street}
			/>
			<Text_field
				title_text="Landmark"
				title_text_size="text-xl"
				placeholder="Near Postoffice"
				name="address_landmark"
				type="text"
				bind:value={address_landmark}
			/>
			<Text_field
				title_text="Area"
				title_text_size="text-xl"
				placeholder="Down Town"
				name="address_area"
				type="text"
				bind:value={address_area}
			/>
			<Text_field
				title_text="City"
				title_text_size="text-xl"
				placeholder="Las Vegas"
				name="address_city"
				type="text"
				bind:value={address_city}
			/>
			<h2 class="text-xl py-3 font-semibold">Select State</h2>
			<select
				bind:value={address_state}
				name="state_select"
				placeholder="State"
				class="w-full text_input"
			>
				{#each config.indian_states as state}
					<option value={state}>{state}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Upload Your Logo</h2>
		<input
			accept="image/*"
			class="text_input"
			type="file"
			name="phone"
			autocomplete="off"
			on:change={onLogoFileChange}
		/>
		{#if logoFile}
			<img
				src={logoFilePreview}
				class="w-[30%] h-full mx-auto my-4 rounded-md"
				alt="logo"
			/>
		{/if}
	</div>

	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Upload Your Cover Photo</h2>
		<input
			accept="image/*"
			class="text_input"
			type="file"
			name="phone"
			autocomplete="off"
			on:change={onCoverFileChange}
		/>
		{#if coverImageFile}
			<img
				src={coverImageFilePreview}
				class="w-[70%] h-full mx-auto my-4 rounded-md"
				alt="cover"
			/>
		{/if}
	</div>

	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Select all cuisines you offer</h2>
		<Svelecte
			options={cuisinesOptions}
			labelAsValue={cuisinesLabelAsValue}
			bind:readSelection={cuisin_selection}
			bind:value={cuisines}
			multiple
			placeholder="Select cuisines"
		/>
	</div>

	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Opening Time</h2>
		<div class="px-4 w-full flex gap-8">
			<Text_field
				title_text="Hour"
				title_text_size="text-xl"
				placeholder="07"
				min_number="0"
				max_number="23"
				name="opening_hour"
				type="number"
				bind:value={opening_hour}
			/>

			<Text_field
				title_text="Minute"
				title_text_size="text-xl"
				placeholder="30"
				min_number="0"
				max_number="59"
				name="opening_miniute"
				type="number"
				bind:value={opening_miniute}
			/>
		</div>
	</div>

	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Closing Time</h2>
		<div class="px-4 w-full flex gap-8">
			<Text_field
				title_text="Hour"
				title_text_size="text-xl"
				placeholder="21"
				min_number="0"
				max_number="23"
				name="closing_hour"
				type="number"
				bind:value={closing_hour}
			/>

			<Text_field
				title_text="Minute"
				title_text_size="text-xl"
				placeholder="30"
				min_number="0"
				max_number="59"
				name="closing_miniute"
				type="number"
				bind:value={closing_miniute}
			/>
		</div>
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
