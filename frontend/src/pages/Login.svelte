<script>
	import Tailwindcss from "../Tailwindcss.svelte";
	import Login_nav from "../components/Login_nav.svelte";
	import * as config from "./../config/config.js";
	import Loader_button from "../components/button_loader.svelte";
	import Validator from "validator";

	import { user as userStore } from "./../stores/user";

	let email = "";
	let password = "";

	import { push, replace, pop } from "svelte-spa-router";
	let isEmailValid = true;
	let isPasswordValid = true;

	$: buttonUsable = email.length && password.length;

	let serverError = null;
	let loadingState = null;
	const buttonHandler = async (e) => {
		// e.preventDefault();
		if (loadingState === true) return false;

		Validator.isEmail(email) ? (isEmailValid = true) : (isEmailValid = false);
		Validator.isLength(password, { min: 6 })
			? (isPasswordValid = true)
			: (isPasswordValid = false);
		if (!isEmailValid || !isPasswordValid) {
			return;
		}
		console.log(isEmailValid, isPasswordValid);

		loadingState = true;
		const response = await fetch(`${config.server_base_url}/user/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: email,
				password: password,
			}),
		});
		loadingState = false;
		const data = await response.json();
		if (response.status === 200) {
			console.log(data);
			userStore.set(data);
			localStorage.setItem("token", data.token);
			localStorage.setItem("user_type", data.user.type);
			localStorage.setItem("user_id", data.user._id);
			localStorage.setItem("user_name", data.user.name);
			localStorage.setItem("user_email", data.user.email);
			// ["customer", "admin", "delivery", "restaurant"]
			if (data.user.type === "customer") {
				push("/");
			} else if (data.user.type === "admin") {
				push("/admin_ui");
			} else if (data.user.type === "delivery") {
				push("/delivery_ui");
			} else if (data.user.type === "restaurant") {
				push("/restaurant_ui");
			}
		} else {
			if (data.error === "Email_not_found") {
				serverError = "Account Not found for this email";
			} else if (data.error === "Wrong_password") {
				serverError = "Password Incorrect";
			} else {
				serverError = "Something went wrong";
			}
		}
	};
</script>

<Login_nav />
<div class="flex justify-center p-8">
	<h2 class="text-5xl font-bold">Login</h2>
</div>

<div
	class="flex ml-auto mt-4 mr-auto flex-col py-4 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%]"
>
	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Email</h2>
		<input
			class="w-full p-4 text-xl rounded-xl border-2 bg-slate-200 border-black border-solid focus:border-[#E25555] focus:ring-0"
			type="text"
			name="email"
			id="email"
			autocomplete="off"
			bind:value={email}
		/>
		<h4 hidden={isEmailValid} class={"text-red-400"}>Email is not Valid</h4>
	</div>
	<div class="flex flex-col">
		<h2 class="text-2xl py-3 font-semibold">Password</h2>
		<input
			class="w-full p-4 text-xl rounded-xl border-2 bg-slate-200 border-black border-solid focus:border-[#E25555] focus:ring-0"
			type="password"
			name="password"
			autocomplete="off"
			bind:value={password}
		/>
		<h4 hidden={isPasswordValid} class={"text-red-400"}>
			Password must have 6 characters at minimum
		</h4>
	</div>
	{#if serverError}
		<h4 class="text-red-500 text-2xl text-center">{serverError}</h4>
	{/if}
	<div class="flex flex-col py-8 justify-center">
		{#if loadingState}
			<div class="self-center">
				<Loader_button />
			</div>
		{:else}
			<button
				disabled={!buttonUsable}
				on:click={buttonHandler}
				class="disabled:bg-slate-300 disabled:text-gray-400 py-5 mx-auto text-3xl font-semibold rounded-xl bg-[#E25555]
             text-white border-solid w-1/2"
			>
				Login
			</button>
		{/if}
	</div>
</div>
