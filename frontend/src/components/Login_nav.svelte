<script>
	import Tailwindcss from "../Tailwindcss.svelte";
	import { link, push, replace, pop } from "svelte-spa-router";

	import BMD_logo from "../svgs/bmd_logo.svelte";
</script>

<nav class=" sm:block w-full p-8">
	<div
		class="flex w-full flex_grow_false text-lg font-bold justify-between text-[#D12627] "
	>
		<div class="flex ">
			<div class="flex justify-center flex_grow_false items-center">
				<svg
					class="mr-2"
					width="20"
					height="20"
					viewBox="0 0 12 13"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M-3.27835e-07 6.5L11.25 0.00480984L11.25 12.9952L-3.27835e-07 6.5Z"
						fill="#D12627"
					/>
				</svg>
				<div class="flex cursor-pointer" on:click={(_) => replace("/")}>
					Home
				</div>
			</div>
		</div>
		<div class="flex items-center justify-center">
			<h1 class="text-5xl w-full">Book My Dine</h1>
		</div>
		<div class="flex">
			<div
				class="flex justify-center items-center cursor-pointer"
				on:click={(_) => push("/sign_up")}
			>
				Sign Up
			</div>
		</div>
	</div>
</nav>

<style>
	.flex_grow_false {
		flex: 1 1 0px;
	}
</style>
