<script>
	export let userName = "";
	export let image_url = "";
	import { link, push, replace, pop } from "svelte-spa-router";


</script>

<nav class="hidden sm:block w-full sm:p-6 bg-black bg-opacity-40">
	<div class="flex w-full font-bold justify-end text-white text-base ">
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
