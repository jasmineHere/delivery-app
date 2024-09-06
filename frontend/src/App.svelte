<script>
	import Router from "svelte-spa-router";
	import Home from "./pages/Home.svelte";
	import Login from "./pages/Login.svelte";
	import SignUp from "./pages/Sign_up.svelte";
	import Profile from "./pages/Profile.svelte";
	import GetDelivery from "./pages/Get_Delivery.svelte";
	import Add_restaurant from "./pages/Add_restaurant.svelte";
	import Add_delivery_person from "./pages/Add_delivery_person.svelte";
	import Restaurant_details_page from "./pages/Restaurant_details.svelte";
	import Order_checkout from "./pages/order_checkout.svelte";

	import Reservation_details from "./pages/profile_pages/reservation_details.svelte";
	import Order_details from './pages/profile_pages/order_details.svelte'

	import Restaurant_dashboard from "./pages/restaurant/dashboard.svelte";
	import Admin_dashboard from "./pages/admin/dashboard.svelte";
	import Delivery_dashboard from "./pages/delivery/dashboard.svelte";

	import { onMount, onDestroy } from "svelte";
	import { Loader } from "@googlemaps/js-api-loader";
	const loader = new Loader({
		apiKey: "AIzaSyAKhWTh4SBMS9BqiwBpBM1KWvohd2crbpY",
		version: "weekly",
	});
	onMount(async (_) => {
		await loader.load();
	});

	const routes = {
		"/": Home,
		"/login": Login,
		"/add_restaurant": Add_restaurant,
		"/add_delivery_person": Add_delivery_person,
		"/sign_up": SignUp,
		"/profile": Profile,
		"/reservation_details/:reservation_id": Reservation_details,
		'/order_details/:order_id': Order_details,
		"/get_delivery": GetDelivery,
		"/order_checkout": Order_checkout,
		"/restaurant/:id": Restaurant_details_page,
		"/admin_ui": Admin_dashboard,
		"/restaurant_ui": Restaurant_dashboard,
		"/delivery_ui": Delivery_dashboard,
	};
</script>

<Router {routes} />

<style global>
	@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap");
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
	html,
	body {
		padding: 0;
		margin: 0;
	}
</style>
