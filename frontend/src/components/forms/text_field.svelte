<script>
	export let placeholder = "";
	export let title_text = "";
	export let title_text_size = "text-2xl";
	export let name = "";
	export let value = "";
	export let error_string = "";
	export let is_valid = true;
	export let min_number = 0;
	export let max_number = Infinity;
	export let type = "text";
</script>

<div class="flex flex-col">
	<h2 class={`${title_text_size} py-3 font-semibold capitalize`}>{title_text}</h2>
	{#if type == "text"}
		<input
			class="text_input"
			type="text"
			{name}
			autocomplete="off"
			{placeholder}
			bind:value
		/>
	{:else if type == "password"}
		<input
			class="text_input"
			type="password"
			{name}
			{placeholder}
			autocomplete="off"
			bind:value
		/>
	{:else if type == "number"}
		<input
			class="text_input"
			type="number"
			{name}
			{placeholder}
			min={max_number}
			max={max_number}
			autocomplete="off"
			bind:value
		/>
	{:else if type == "email"}
		<input
			class="text_input"
			type="email"
			{name}
			{placeholder}
			autocomplete="off"
			bind:value
		/>
	{:else if type == "tel"}
		<input
			class="text_input"
			type="tel"
			{name}
			{placeholder}
			autocomplete="off"
			bind:value
		/>
	{/if}
	<h4 hidden={is_valid} class={"text-red-400"}>{error_string}</h4>
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
