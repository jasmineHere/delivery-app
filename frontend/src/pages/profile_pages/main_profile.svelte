<script>
	export let user = null;

	import Validator from "validator";

	import TextField from "../../components/forms/text_field.svelte";
	import Close_svg from "../../svgs/close_icon.svelte";

	import { getLocation } from "./../../utils/location.js";

	import * as config from "../../config/config.js";
	import { onMount, onDestroy, afterUpdate } from "svelte";
	const imageSrc = (image) => {
		return `${config.server_base_url}/image/${image}`;
	};

	let current_password = "";
	let wrong_currunt_password = false;
	let new_password = "";
	let confirm_password = "";

	let openPopup = ""; // "update_image" "update_profile" "update_address" "add_address"
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
	const updatePassword = async (e) => {
		wrong_currunt_password = false;
		const res = await fetch(`${config.server_base_url}/user/update_password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				token: localStorage.getItem("token"),
			},
			body: JSON.stringify({
				old_password: current_password,
				new_password: new_password,
			}),
		});
		const data = await res.json();
		if (data.error) {
			wrong_currunt_password = true;
			return;
		} else {
			
			current_password = "";
			new_password = "";
			confirm_password = "";
		}
	};
	let profile_image_preview = null;
	let updated_profile_image = null;

	let new_name = "";
	let new_phone = "";

	let isNameValid = true;
	let isPhoneValid = true;
	const onProfileImageChange = async (e) => {
		const res = await fetch(
			`${config.server_base_url}/user/update_name_phone_image_customer`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
				body: JSON.stringify({
					profile_image: await uploadImage(updated_profile_image),
				}),
			}
		);
		const data = res.json();
		openPopup = "";
		profile_image_preview = null;
		updated_profile_image = null;
		location.reload();
	};

	const onProfileNamePhoneChange = async (e) => {
		Validator.isMobilePhone(new_phone.toString(), "en-IN")
			? (isPhoneValid = true)
			: (isPhoneValid = false);
		new_name.length > 0 ? (isPhoneValid = true) : (isPhoneValid = false);
		if (!isNameValid && !isPhoneValid) {
			return;
		}
		const res = await fetch(
			`${config.server_base_url}/user/update_name_phone_image_customer`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
				body: JSON.stringify({
					name: new_name,
					phone: new_phone,
				}),
			}
		);
		const data = res.json();
		if (res.status === 200) {
			openPopup = "";
			new_name = "";
			new_phone = "";
			isPhoneValid = true;
			isNameValid = true;
			location.reload();
		} else {
			alert("Something went wrong");
		}
	};

	let map = null;
	let mapContainer;
	let mapContainer2;
	let currentPointerLocation = {};

	let address = "";
	let address_label = "";
	let isAddressLabelValid = true;
	let isAddressValid = true;
	const showMapNewAddress = async () => {
			let location = await getLocation().catch((err) => {
			console.log(err);
			window.alert(err.message);
		});
		currentPointerLocation = location;
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
			currentPointerLocation.lat = e.latLng.lat();
			currentPointerLocation.lng = e.latLng.lng();
		});
	};
	const showMapAddressEdit = async () => {
		console.log(mapContainer2);
		map = new window.google.maps.Map(mapContainer2, {
			center: currentPointerLocation,
			zoom: 15,
		});
		const marker = new window.google.maps.Marker({
			position: currentPointerLocation,
			map: map,
			draggable: true,
		});
		marker.addListener("dragend", (e) => {
			currentPointerLocation.lat = e.latLng.lat();
			currentPointerLocation.lng = e.latLng.lng();
		});
	};

	const updateAddress = async (index) => {
		let user_address = user.customer.address;
		user_address[index].address = address;
		user_address[index].type = address_label;
		user_address[index].location = {
			type: "Point",
			coordinates: [currentPointerLocation.lng, currentPointerLocation.lat],
		};
		console.log("update_address", user_address);
	};

	const updateAddressRequest = async (addressToUpdate) => {
		const res = await fetch(
			`${config.server_base_url}/user/update_address_customer`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					token: localStorage.getItem("token"),
				},
				body: JSON.stringify({
					addresses: addressToUpdate,
				}),
			}
		);
		const data = res.json();
	};

	const addNewAddress = async () => {
		let user_address = user.customer.address;
		user_address.push({
			address: address,
			type: address_label,
			location: {
				type: "Point",
				coordinates: [currentPointerLocation.lng, currentPointerLocation.lat],
			},
		});
		console.log("_address", user_address);
		await updateAddressRequest(user_address);
		openPopup = "";
		location.reload();
	};

	const deleteAddress = async (index) => {
		let user_address = user.customer.address;
		user_address.splice(index, 1);
		console.log("delete_address", user_address);
		await updateAddressRequest(user_address);
		openPopup = "";
		location.reload();
	};
</script>

{#if user}
	<div class="relative">
		{#if openPopup.length}
			<div
				class="flex min-h-screen w-full items-center justify-center top-0 left-0 fixed bg-black bg-opacity-50 z-10"
			>
				{#if openPopup === "update_image"}
					<div
						class="max-h-[90vh]  w-full sm:w-[95%] md:w-[70%] lg:w-[60%] xl:w-[50%] bg-white py-4 px-8 pb-0 rounded-lg"
					>
						<div
							class="flex text-3xl text-black font-semibold justify-between items-center"
						>
							<div class="capitalize">Update profile image</div>
							<div
								class="cursor-pointer"
								on:click={(_) => {
									openPopup = "";
									profile_image_preview = null;
									updated_profile_image = null;
								}}
							>
								<Close_svg width="24" height="24" fill="#000" />
							</div>
						</div>
						<div
							class="flex px-3 py-4 flex-col w-full justify-center items-center"
						>
							<div class="flex w-[200px] h-[200px]">
								<img src={profile_image_preview} alt="preview" srcset="" />
							</div>
							<div class="flex px-3 py-4">
								<input
									type="file"
									accept="image/*"
									name="file upload"
									on:change={(e) => {
										updated_profile_image = e.target.files[0];
										profile_image_preview = URL.createObjectURL(
											e.target.files[0]
										);
									}}
								/>
							</div>
						</div>
						<div class="flex py-3 px-3 items-end justify-end">
							<div
								class="flex px-4 text-2xl capitalize py-2 rounded-md"
								on:click={(_) => {
									openPopup = "";
									profile_image_preview = null;
									updated_profile_image = null;
								}}
							>
								cancle
							</div>
							<div
								on:click={onProfileImageChange}
								class="flex px-4 text-2xl capitalize py-2 bg-red-400 text-white rounded-md"
							>
								Update profile image
							</div>
						</div>
					</div>
				{:else if openPopup === "update_profile"}
					<div
						class="max-h-[90vh]  w-full sm:w-[95%] md:w-[70%] lg:w-[60%] xl:w-[50%] bg-white py-4 px-8 pb-0 rounded-lg"
					>
						<div
							class="flex text-3xl text-black font-semibold justify-between items-center"
						>
							<div class="capitalize">Update Profile</div>
							<div
								class="cursor-pointer"
								on:click={(_) => {
									openPopup = "";
									profile_image_preview = null;
									updated_profile_image = null;
									new_name = null;
									new_phone = null;
								}}
							>
								<Close_svg width="24" height="24" fill="#000" />
							</div>
						</div>
						<div class="flex px-3 py-4 flex-col w-full">
							<div class="flex w-full">
								<div class="flex text-xl w-full">
									<TextField
										name="name"
										title_text="new name"
										type="text"
										placeholder="john moris"
										error_string="name is required"
										is_valid={isNameValid}
										bind:value={new_name}
									/>
								</div>
							</div>
							<div class="flex w-full">
								<div class="flex text-xl w-full">
									<TextField
										title_text="new phone"
										name="New Phone"
										type="number"
										placeholder="00000 00000"
										error_string="phone number is not valid"
										is_valid={isPhoneValid}
										bind:value={new_phone}
									/>
								</div>
							</div>
						</div>
						<div class="flex py-3 px-3 items-end justify-end">
							<div
								class="flex px-4 text-2xl capitalize py-2 rounded-md"
								on:click={(_) => {
									openPopup = "";
									profile_image_preview = null;
									updated_profile_image = null;
								}}
							>
								cancle
							</div>

							<div
								on:click={onProfileNamePhoneChange}
								class="flex px-4 text-2xl capitalize py-2 bg-red-400 text-white rounded-md"
							>
								Update Profile
							</div>
						</div>
					</div>
				{:else if openPopup === "update_address" || openPopup === "add_address"}
					<div
						class="max-h-[90vh]  w-full sm:w-[95%] md:w-[70%] lg:w-[60%] xl:w-[50%] bg-white py-4 px-8 pb-0 rounded-lg"
					>
						<div
							class="flex text-3xl text-black font-semibold justify-between items-center"
						>
							<div class="capitalize">
								{#if openPopup === "add_address"}
									Add New Address
								{:else}
									Update Address
								{/if}
							</div>
							<div
								class="cursor-pointer"
								on:click={(_) => {
									openPopup = "";
								}}
							>
								<Close_svg width="24" height="24" fill="#000" />
							</div>
						</div>
						{#if openPopup === "update_address"}
							<div class="flex px-3 py-3 w-full">
								<div class="flex w-full h-[400px]" bind:this={mapContainer2} />
							</div>
						{:else}
							<div class="flex px-3 py-3 w-full">
								<div class="flex w-full h-[400px]" bind:this={mapContainer} />
							</div>
						{/if}

						<div class="flex text-xl w-full">
							<TextField
								title_text="label"
								name="address label"
								type="text"
								placeholder="Office, Home"
								error_string="label is required"
								is_valid={isAddressLabelValid}
								bind:value={address_label}
							/>
						</div>
						<div class="flex flex-col">
							<h2 class="text-2xl  py-3 font-semibold">Address</h2>
							<textarea
								class="resize-none h-[100px] text_input rounded-md"
								autocomplete="off"
								bind:value={address}
							/>
							<h4 hidden={isAddressValid} class={"text-red-400"}>
								Address must have 25 characters at minimum
							</h4>
						</div>
						<div class="flex py-3 px-3 items-end justify-end">
							<div
								class="flex px-4 text-2xl capitalize py-2 rounded-md"
								on:click={(_) => {
									openPopup = "";
									profile_image_preview = null;
									updated_profile_image = null;
								}}
							>
								cancle
							</div>
							{#if openPopup === "add_address"}
								<div
									on:click={addNewAddress}
									class="flex px-4 text-2xl capitalize py-2 bg-red-400 text-white rounded-md"
								>
									Add Address
								</div>
							{:else}
								<div
									on:click={updateAddress}
									class="flex px-4 text-2xl capitalize py-2 bg-red-400 text-white rounded-md"
								>
									Update Address
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}
		<div
			class="flex border-b-2 border-red-300 w-full uppercase text-6xl text-[#D12627] py-8 pl-6 font-bold font-Montserrat tracking-wide"
		>
			your profile
		</div>
		<div
			class="flex w-full capitalize text-4xl text-[#ff6868] py-3 pl-6 font-semibold"
		>
			personal details
		</div>
		<div class="flex pl-6 gap-4 w-max mt-4">
			<img
				class="max-w-sm rounded-xl aspect-square"
				src={imageSrc(user.customer.profile_image)}
				alt={user.name}
			/>
			<div
				on:click={(_) => (openPopup = "update_image")}
				class="flex p-2 h-min my-auto hover:bg-gray-300 rounded-full cursor-pointer"
			>
				<svg
					width="20"
					height="21"
					viewBox="0 0 20 21"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M15.9437 0.365493L19.6348 4.05665C20.1221 4.54397 20.1221 5.34081 19.6348 5.82814L17.5933 7.86963L12.1307 2.40699L14.1722 0.365493C14.6595 -0.121831 15.4563 -0.121831 15.9437 0.365493ZM11.5544 8.59238V8.59403C11.7059 8.7455 11.7816 8.94635 11.7816 9.14392C11.7816 9.34148 11.7059 9.54069 11.5544 9.6938V9.69545L11.5528 9.69709L6.60053 14.651H6.59889C6.55608 14.6938 6.50834 14.73 6.46059 14.7613H6.45895C6.40955 14.7926 6.35852 14.8173 6.30583 14.8354C6.03254 14.9309 5.71479 14.8683 5.49747 14.651H5.49582V14.6494C5.45302 14.6066 5.4168 14.5588 5.38551 14.5111V14.5094C5.35423 14.46 5.32954 14.409 5.31143 14.3563C5.21594 14.083 5.2785 13.7653 5.49417 13.5479V13.5463L10.4481 8.59238H10.4497C10.6012 8.44092 10.8021 8.36518 10.9996 8.36518C11.1972 8.36518 11.3964 8.44092 11.5495 8.59238H11.5544ZM7.48792 17.9635C6.00949 18.4212 4.5327 18.8772 3.05426 19.3349C-0.419571 20.41 -0.404754 21.1262 0.543553 17.7808L2.03681 12.5124L2.03187 12.5074L11.0968 3.4409L16.5594 8.90355L7.49286 17.9701L7.48792 17.9635ZM2.96865 13.4442L6.55608 17.0317C5.58473 17.3313 4.61337 17.6309 3.64366 17.9289C1.3618 18.6319 1.37167 19.1028 1.99235 16.9049L2.96865 13.4442Z"
						fill="gray"
					/>
				</svg>
			</div>
		</div>
		<div class="flex mt-8 pl-6 flex-col items-start gap-2">
			<div
				class="flex gap-2 justify-center items-center text-red-600 text-3xl font-semibold capitalize"
			>
				{user.name}
				<div
					on:click={(_) => (openPopup = "update_profile")}
					class="flex p-2 hover:bg-gray-300 rounded-full cursor-pointer"
				>
					<svg
						width="20"
						height="21"
						viewBox="0 0 20 21"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M15.9437 0.365493L19.6348 4.05665C20.1221 4.54397 20.1221 5.34081 19.6348 5.82814L17.5933 7.86963L12.1307 2.40699L14.1722 0.365493C14.6595 -0.121831 15.4563 -0.121831 15.9437 0.365493ZM11.5544 8.59238V8.59403C11.7059 8.7455 11.7816 8.94635 11.7816 9.14392C11.7816 9.34148 11.7059 9.54069 11.5544 9.6938V9.69545L11.5528 9.69709L6.60053 14.651H6.59889C6.55608 14.6938 6.50834 14.73 6.46059 14.7613H6.45895C6.40955 14.7926 6.35852 14.8173 6.30583 14.8354C6.03254 14.9309 5.71479 14.8683 5.49747 14.651H5.49582V14.6494C5.45302 14.6066 5.4168 14.5588 5.38551 14.5111V14.5094C5.35423 14.46 5.32954 14.409 5.31143 14.3563C5.21594 14.083 5.2785 13.7653 5.49417 13.5479V13.5463L10.4481 8.59238H10.4497C10.6012 8.44092 10.8021 8.36518 10.9996 8.36518C11.1972 8.36518 11.3964 8.44092 11.5495 8.59238H11.5544ZM7.48792 17.9635C6.00949 18.4212 4.5327 18.8772 3.05426 19.3349C-0.419571 20.41 -0.404754 21.1262 0.543553 17.7808L2.03681 12.5124L2.03187 12.5074L11.0968 3.4409L16.5594 8.90355L7.49286 17.9701L7.48792 17.9635ZM2.96865 13.4442L6.55608 17.0317C5.58473 17.3313 4.61337 17.6309 3.64366 17.9289C1.3618 18.6319 1.37167 19.1028 1.99235 16.9049L2.96865 13.4442Z"
							fill="gray"
						/>
					</svg>
				</div>
			</div>
			<div class="flex justify-center items-center text-2xl ">
				{user.email}
			</div>
			<div class="flex justify-center items-center text-2xl">
				{user.customer.phone}
			</div>
		</div>
		<div
			class="flex mt-8 w-full capitalize text-4xl text-[#ff6868] py-3 pl-6 font-semibold"
		>
			saved addresses
		</div>
		<div class="flex flex-col pl-6 mt-3 gap-4">
			{#each user.customer.address as address, index}
				<div
					class="flex flex-col  py-2 px-4 w-full md:w-[60%] border-red-300 border-2 rounded-xl"
				>
					<div
						class="flex  gap-4 uppercase text-red-500 font-semibold items-center"
					>
						<div class="flex text-2xl">{address.type}</div>
						<!-- <div
							on:click={
								e => {
									e.stopPropagation();
									openPopup = "update_address";
									address = address.address;
									currentPointerLocation = {
										lat: address.location.coordinates[1],
										lng: address.location.coordinates[0]
									}
									showMapAddressEdit().then()
								}
							}
							class="flex ml-auto  p-2 hover:bg-gray-300 rounded-full cursor-pointer"
						>
							<svg
								width="20"
								height="21"
								viewBox="0 0 20 21"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M15.9437 0.365493L19.6348 4.05665C20.1221 4.54397 20.1221 5.34081 19.6348 5.82814L17.5933 7.86963L12.1307 2.40699L14.1722 0.365493C14.6595 -0.121831 15.4563 -0.121831 15.9437 0.365493ZM11.5544 8.59238V8.59403C11.7059 8.7455 11.7816 8.94635 11.7816 9.14392C11.7816 9.34148 11.7059 9.54069 11.5544 9.6938V9.69545L11.5528 9.69709L6.60053 14.651H6.59889C6.55608 14.6938 6.50834 14.73 6.46059 14.7613H6.45895C6.40955 14.7926 6.35852 14.8173 6.30583 14.8354C6.03254 14.9309 5.71479 14.8683 5.49747 14.651H5.49582V14.6494C5.45302 14.6066 5.4168 14.5588 5.38551 14.5111V14.5094C5.35423 14.46 5.32954 14.409 5.31143 14.3563C5.21594 14.083 5.2785 13.7653 5.49417 13.5479V13.5463L10.4481 8.59238H10.4497C10.6012 8.44092 10.8021 8.36518 10.9996 8.36518C11.1972 8.36518 11.3964 8.44092 11.5495 8.59238H11.5544ZM7.48792 17.9635C6.00949 18.4212 4.5327 18.8772 3.05426 19.3349C-0.419571 20.41 -0.404754 21.1262 0.543553 17.7808L2.03681 12.5124L2.03187 12.5074L11.0968 3.4409L16.5594 8.90355L7.49286 17.9701L7.48792 17.9635ZM2.96865 13.4442L6.55608 17.0317C5.58473 17.3313 4.61337 17.6309 3.64366 17.9289C1.3618 18.6319 1.37167 19.1028 1.99235 16.9049L2.96865 13.4442Z"
									fill="gray"
								/>
							</svg>
						</div> -->
					</div>
					<div class="flex text-2xl py-4">{address.address}</div>
					{#if user.customer.address.length !== 1}
						<div class="flex">
							<div
								on:click={() => {
									deleteAddress(index);
								}}
								class="flex text-xl text-gray-500 cursor-pointer hover:text-red-500 hover:underline hover:underline-offset-4 uppercase"
							>
								delete
							</div>
						</div>
					{/if}
				</div>
			{/each}
			<div
				class="flex flex-col text-2xl justify-center cursor-pointer hover:bg-red-200 items-center py-8 px-4 w-full md:w-[60%] border-red-300 border-2 border-dashed rounded-xl"
				on:click={() => {
					openPopup = "add_address";
					showMapNewAddress().then();
				}}
			>
				<div class="flex bg-gray-400 p-3 rounded-full">
					<svg
						width="42"
						height="42"
						viewBox="0 0 42 42"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<line
							x1="21.5"
							y1="2.5"
							x2="21.5"
							y2="39.5"
							stroke="white"
							stroke-width="5"
							stroke-linecap="round"
						/>
						<line
							x1="2.5"
							y1="20.5"
							x2="39.5"
							y2="20.5"
							stroke="white"
							stroke-width="5"
							stroke-linecap="round"
						/>
					</svg>
				</div>
				<div class="flex mt-2">Add New address</div>
			</div>
		</div>

		<div
			class="flex mt-8 w-full capitalize text-4xl text-[#ff6868] py-3 pl-6 font-semibold"
		>
			security details
		</div>

		<div class="flex flex-col w-full pl-6 pb-6">
			<div class="flex flex-col w-[50%] gap-3">
				<div class="flex w-full flex-col">
					<TextField
						placeholder="current password"
						title_text="current password"
						type="password"
						bind:value={current_password}
					/>
					{#if wrong_currunt_password}
						<div class="flex">
							<div class="flex text-red-500 text-sm">
								current password is wrong
							</div>
						</div>
					{/if}
				</div>
				<div class="flex w-full flex-col">
					<TextField
						placeholder="new password"
						title_text="new password"
						type="password"
						bind:value={new_password}
					/>
				</div>
				<div class="flex w-full flex-col">
					<TextField
						placeholder="confirm new password"
						title_text="confirm new password"
						type="password"
						is_valid={new_password === confirm_password}
						error_string="passwords do not match"
						bind:value={confirm_password}
					/>
				</div>
				<div class="flex mt-4">
					<button
						disabled={!(
							current_password &&
							new_password &&
							confirm_password &&
							new_password === confirm_password &&
							current_password !== new_password &&
							new_password.length >= 6
						)}
						on:click={updatePassword}
						class="disabled:bg-slate-300 disabled:text-gray-400 py-3  text-2xl font-semibold rounded-xl bg-[#E25555] text-white border-solid w-1/2"
					>
						update password
					</button>
				</div>
			</div>
		</div>
	</div>
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
