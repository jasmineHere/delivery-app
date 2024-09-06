<script>
	import * as config from "./../config/config.js";
	import Svelecte from "svelecte";
	export let onApply = (e) => {
		console.log("::on apply");
	};
	export let onClose = (e) => {
		console.log("::on close");
	};

	let cuisinesOptions = config.cuisines;
	let cuisinesLabelAsValue = true;
	let cuisin_selection = [];

	let selected_tab = "sort";

	export let selected_sort_by = "distance";
	export let selected_rating = "any";
	export let cuisines = [];

	let onReset = (e) => {
		selected_sort_by = "distance";
		cuisin_selection = [];
		cuisines = [];
		selected_rating = "any";
	};
</script>

<div class="flex w-[90%] sm:w-[90%] md:w-[75%] lg:w-[70%] xl:w-[65%] flex-col">
	<div class="flex flex-col w-full justify-center border-b-2 border-gray-400">
		<div
			class="flex text-3xl text-black rounded-t-md bg-white py-6 items-center justify-center font-bold"
		>
			Apply Filters
		</div>
	</div>
	<div class="flex flex-row bg-gray-50">
		<div class="flex flex-col text-2xl w-1/3 sm:w-1/3">
			{#each ["sort", "cuisines", "ratings"] as i}
				<div
					on:click={(e) => (selected_tab = i)}
					class={"py-6 px-6 capitalize flex items-center justify-center hover:bg-[#f87070] hover:text-white" +
						(selected_tab == i ? " text-[#fc4747] font-semibold" : "")}
				>
					{i}
				</div>
			{/each}
		</div>
		<div class="flex px-8 py-4 w-full">
			{#if selected_tab == "sort"}
				<div>
					<form class="flex flex-col gap-y-4">
						<div class="flex  items-center">
							<input
								type="radio"
								name="sorting"
								id="sorting"
								checked
								bind:group={selected_sort_by}
								value="distance"
							/>
							<label for="sorting" class="text-xl ml-2">Distance</label>
						</div>
						<div class="flex  items-center">
							<input
								type="radio"
								name="sorting"
								id="sorting"
								bind:group={selected_sort_by}
								value="rating_high_low"
							/>
							<label for="sorting" class="text-xl ml-2"
								>Ratings: High to Low</label
							>
						</div>
						<div class="flex  items-center">
							<input
								type="radio"
								name="sorting"
								id="sorting"
								bind:group={selected_sort_by}
								value="rating_low_high"
							/>
							<label for="sorting" class="text-xl ml-2"
								>Ratings: Low to High</label
							>
						</div>
					</form>
				</div>
			{:else if selected_tab == "cuisines"}
				<div class="flex w-full mt-8">
					<Svelecte
						options={cuisinesOptions}
						labelAsValue={cuisinesLabelAsValue}
						bind:readSelection={cuisin_selection}
						bind:value={cuisines}
						multiple
						placeholder="Select cuisines"
					/>
				</div>
			{:else if selected_tab == "ratings"}
				<div class="gap-x-2 flex w-full items-center justify-center">
					{#each ["any", "3.5", "4.0", "4.5"] as i}
						<div
							class={" rounded-full border-gray-500 flex capitalize py-2 text-2xl px-4  " +
								(selected_rating == i
									? "bg-[#fc4747] text-white"
									: "text-black border-2")}
							on:click={() => {
								selected_rating = i;
							}}
						>
							{#if i === "any"} {i} {:else} {i} + {/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
	<div
		class="flex flex-row text-xl py-4 px-10 border-t-2 border-gray-400 gap-x-4 rounded-b-md bg-white w-full justify-end items-center"
	>
		<div
			on:click={onReset}
			class="flex capitalize text-black py-2 px-6 hover:text-red-500 hover:underline cursor-pointer"
		>
			Reset All
		</div>
		<div
			on:click={onClose}
			class="flex capitalize text-black py-2 px-6 hover:text-red-500 hover:underline cursor-pointer"
		>
			close
		</div>
		<div
			on:click={(e) => {
				e.preventDefault();
				onApply(selected_sort_by, cuisines, selected_rating);
			}}
			class="flex capitalize text-white py-4 px-6 text-2xl bg-[#f87070] hover:bg-[#fc4747] font-semibold rounded-md cursor-pointer"
		>
			apply
		</div>
	</div>
</div>
