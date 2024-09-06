<script>
	export let userName = "";
	export let image_url = "";
	export let back_url = "/";
	export let back_text = "Home";
	import { link, push, replace, pop } from "svelte-spa-router";
</script>

<nav class="hidden sm:block w-full sm:p-6 bg-black bg-opacity-40">
	<div class="flex w-full font-bold justify-between text-white text-base ">
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
				<div class="flex cursor-pointer" on:click={(_) => replace(back_url)}>
					{back_text}
				</div>
			</div>
		</div>
		<div class="flex items-center justify-center">
			<h1 class="text-5xl w-full">Book My Dine</h1>
		</div>
		<div
			class="flex items-center cursor-pointer"
			on:click={(e) => {
				push("/profile");
			}}
		>
			<img
				src={image_url}
				alt="Profile"
				class="h-10 w-10 aspect-square rounded-full"
			/>
			<h4 class="px-4 capitalize text-[#8BFF7E]">
				{userName}
			</h4>
		</div>
	</div>
</nav>
