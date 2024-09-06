<script>
	export let cover_image = "";
	export let name = "name erqer dsdsrererererere";
	export let address = "";
	export let cuisines = [];
	export let id = "";
	
	import { link, push, replace, pop } from "svelte-spa-router";
	import { onMount, onDestroy } from "svelte";
	export let opening_hours = {
		hour: 0,
		minute: 0,
	};
	export let closing_hours = {
		hour: 0,
		minute: 0,
	};
	export let current_time = {
		hour: 0,
		minute: 0,
	};
	export let reviews = 3.5;
	let reviewColor = "#D12627";
	if (reviews > 3) {
		reviewColor = "#8BFF7E";
	}
	console.log(opening_hours, closing_hours)
	let isOpen = false;
	if (
		current_time.hour >= opening_hours.hour &&
		current_time.hour <= closing_hours.hour
	) {
		console.log("In the hours");
		if (current_time.hour === opening_hours.hour) {
			if (current_time.minute >= opening_hours.minute) {
				isOpen = true;
			}
		} else {
			isOpen = true;
		}
	}
</script>

<div
	class="flex flex-col p-5 bg-slate-800 bg-opacity-90 rounded-lg w-max hover:scale-110 transition-all "
	on:click={() => {
		console.log(id);
		push(`/restaurant/${id}`);
	}}
>
	<img
		src={`http://localhost:3000/api/image/${cover_image}`}
		alt="cover of Resturant"
		class="w-[250px] sm:w-[350px] md:w-[320px] lg:w-[360px] xl:w-[400px] 2xl:w-[450px] rounded-lg"
	/>
	<div class="flex flex-col w-full overflow-hidden">
		<h2
			class="text-4xl w-[250px] sm:w-[350px] md:w-[320px] lg:w-[360px] xl:w-[400px] 2xl:w-[450px] mt-4 text-white capitalize font-bold text-ellipsis whitespace-nowrap overflow-hidden"
		>
			{name}
		</h2>
		<div class="flex flex-row py-4 text-2xl text-gray-300 ">
			<div
				class="py-1 w-[250px] sm:w-[350px] md:w-[320px] lg:w-[360px] xl:w-[400px] 2xl:w-[450px] text-gray-300 text-ellipsis whitespace-nowrap overflow-hidden"
			>
				{cuisines.join(",  ")}
			</div>
		</div>
		<h2 class="text-2xl text-white capitalize font-semibold">
			{address}
		</h2>
		<h2
			class={"text-2xl flex justify-center items-center gap-2 text-white capitalize font-semibold  w-max pl-2 pr-2 py-1 mt-2 rounded-md " +
				`text-[${reviewColor}]`}
		>
			{reviews}
			<svg height="25" width="23" class="star rating" data-rating="1">
				<polygon
					fill={reviewColor}
					points="9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78"
					style="fill-rule:nonzero;"
				/>
			</svg>
		</h2>
		<h2
			class={`text-xl capitalize font-semibold ` + isOpen
				? "text-green-400"
				: "text-gray-500"}
		>
			{#if isOpen === true}
				Open
			{:else}
				Closed
			{/if}
		</h2>
		<!-- Rating and open or closed pending -->
	</div>
</div>
