<script>
	export let title = "Get it delivered";
	export let page_to_redirect = "sample page";
	export let image = "";
</script>

<div
	style={`background-image: url('${image}');`}
	class="hover:scale-110 cursor-pointer transition-transform rounded-xl image_bg w-[80%] sm:w-[70%] md:w-[60%] lg:w-96 sm:h-64 md:h-96 flex items-end justify-end p-5"
>
	<h2
		class="text-white font-semibold capitalize md:text-center text-xl sm:text-3xl md:text-3xl lg:text-5xl md:w-9/12"
	>
		{title}
	</h2>
</div>

<style>
	.image_bg {
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}
</style>
