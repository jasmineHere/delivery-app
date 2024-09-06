<script>
	export let restaurant = null;
	export let user = null
</script>

{#if restaurant && user}
	<div class="flex flex-col mt-10 pl-6">
		<h3 class="text-xl">
			Restaurant Name: {restaurant.name}
		</h3>
		<h3 class="text-xl">
			Restaurant Address: {`${restaurant.address.street} ${restaurant.address.landmark} ${restaurant.address.city} ${restaurant.address.state}`}
		</h3>
		<h3 class="text-xl">
			Restaurant Phone: {restaurant.phone}
		</h3>
		<h3 class="text-xl">
			Owner Email: {user.email}
		</h3>
		<h3 class="text-xl">
			Owner Name: {user.name}
		</h3>
	</div>
{/if}
