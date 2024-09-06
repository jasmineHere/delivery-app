<script>
	import Tailwindcss from "../Tailwindcss.svelte";
	import { link, push, replace, pop } from "svelte-spa-router";
	import { onMount, onDestroy } from "svelte";
</script>

<nav class="hidden sm:block w-full sm:p-8 bg-black bg-opacity-40">
	<div class="flex w-full font-bold justify-between text-white text-base ">
		<div class="flex">
			<div class="cursor-pointer" on:click={(e) => push("/add_restaurant")}>
				Add Your Restaurant
			</div>
			<div class="ml-4 cursor-pointer" on:click={(e) => push("/add_delivery_person")}>
				Join as Delivery Person
			</div>
		</div>
		<div class="flex">
			<div
				class="hover:text-gray-400 cursor-pointer"
				on:click={(e) => {
					push("/login");
				}}
			>
				Login
			</div>
			<div
				class="ml-4 hover:text-gray-400 cursor-pointer"
				on:click={(e) => {
					push("/sign_up");
				}}
			>
				Sign Up
			</div>
		</div>
	</div>
</nav>

<style>
</style>
