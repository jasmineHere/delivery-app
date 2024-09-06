import mongoose from "mongoose";
import config from "./configs/globle.conf.js";
import User from "./models/user.model.js";
const { connect, connection } = mongoose;
await connect(config.MONGO_DB, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

await User.findByIdAndUpdate("6221b6b372eb0d5bba9d0560", {
	$set: {
		// "restaurant.menu": {
		// 	categories: [
		// 		{
		// 			category_name: "Sendwichs",
		// 			items: [
		// 				{
		// 					item_name: "Baloni",
		// 					item_price: "100",
		// 					description: "Made with fresh baloni and cheese",
		// 					item_image: "7bf9cb66-2c3c-4230-a2dc-5e400ab95f6d.jpg",
		// 					extras: [],
		// 					sizes: [],
		// 				},

		// 				{
		// 					item_name: "Full house",
		// 					item_price: "320",
		// 					description: "with cheese, salad, and bacon",
		// 					item_image: "7bf9cb66-2c3c-4230-a2dc-5e400ab95f6d.jpg",
		// 					extras: [],
		// 					sizes: [],
		// 				},
		// 			],
		// 		},
		// 		{
		// 			category_name: "Beverages",
		// 			items: [
		// 				{
		// 					item_name: "Coffee",
		// 					item_price: "10",
		// 					description: "Good Coffee.",
		// 					item_image: "7bf9cb66-2c3c-4230-a2dc-5e400ab95f6d.jpg",
		// 					extras: [
		// 						{
		// 							extra_name: "Milk",
		// 							extra_price: "5",
		// 						},
		// 						{
		// 							extra_name: "Sugar",
		// 							extra_price: "5",
		// 						},
		// 						{
		// 							extra_name: "Chocolate",
		// 							extra_price: "5",
		// 						},
		// 					],
		// 					sizes: [
		// 						{
		// 							size_name: "Small (100g)",
		// 							size_price: "10",
		// 						},
		// 						{
		// 							size_name: "Medium (200g)",
		// 							size_price: "20",
		// 						},
		// 						{
		// 							size_name: "Large (300g)",
		// 							size_price: "30",
		// 						},
		// 					],
		// 				},
		// 				{
		// 					item_name: "Tea",
		// 					item_price: "10",
		// 					description: "Good Tea.",
		// 					item_image: "7bf9cb66-2c3c-4230-a2dc-5e400ab95f6d.jpg",
		// 					extras: [
		// 						{
		// 							extra_name: "Milk",
		// 							extra_price: "5",
		// 						},
		// 						{
		// 							extra_name: "Sugar",
		// 							extra_price: "5",
		// 						},
		// 						{
		// 							extra_name: "Chocolate",
		// 							extra_price: "5",
		// 						},
		// 					],
		// 					sizes: [
		// 						{
		// 							size_name: "Small (100g)",
		// 							size_price: "10",
		// 						},
		// 						{
		// 							size_name: "Medium (200g)",
		// 							size_price: "20",
		// 						},
		// 						{
		// 							size_name: "Large (300g)",
		// 							size_price: "30",
		// 						},
		// 					],
		// 				},
		// 			],
		// 		},
		// 		{
		// 			category_name: "Pizza",
		// 			items: [
		// 				{
		// 					item_name: "Margherita",
		// 					item_price: "250",
		// 					description: "Good Pizza.",
		// 					item_image: "7bf9cb66-2c3c-4230-a2dc-5e400ab95f6d.jpg",
		// 					extras: [
		// 						{
		// 							extra_name: "cheese",
		// 							extra_price: "50",
		// 						},
		// 						{
		// 							extra_name: "tomato",
		// 							extra_price: "25",
		// 						},
		// 						{
		// 							extra_name: "olives",
		// 							extra_price: "85",
		// 						},
		// 					],
		// 					sizes: [
		// 						{
		// 							size_name: "Small 8 Inch",
		// 							size_price: "250",
		// 						},
		// 						{
		// 							size_name: "Medium 12 Inch",
		// 							size_price: "350",
		// 						},
		// 						{
		// 							size_name: "Large 16 Inch",
		// 							size_price: "500",
		// 						},
		// 					],
		// 				},
		// 				{
		// 					item_name: "Pepperoni",
		// 					item_price: "850",
		// 					description: "Good Pizza.",
		// 					item_image: "7bf9cb66-2c3c-4230-a2dc-5e400ab95f6d.jpg",
		// 					extras: [
		// 						{
		// 							extra_name: "cheese",
		// 							extra_price: "85",
		// 						},
		// 						{
		// 							extra_name: "tomato",
		// 							extra_price: "100",
		// 						},
		// 						{
		// 							extra_name: "olives",
		// 							extra_price: "95",
		// 						},
		// 					],
		// 					sizes: [
		// 						{
		// 							size_name: "Small 8 Inch",
		// 							size_price: "850",
		// 						},
		// 						{
		// 							size_name: "Medium 12 Inch",
		// 							size_price: "1100",
		// 						},
		// 						{
		// 							size_name: "Large 16 Inch",
		// 							size_price: "1500",
		// 						},
		// 					],
		// 				},
		// 			],
		// 		},
		// 	],
		// },
		"restaurant.reservation_time_slots": [
			{
				slot_name: "Morning at 10:00 AM",
				reservation_fee: 30,
				slot_time: {
					hour: 10,
					minute: 0,
				},
				available: {
					today: true,
					tomorrow: true,
				},
			},
			{
				slot_name: "Morning at 11:00 AM",
				reservation_fee: 30,
				slot_time: {
					hour: 11,
					minute: 0,
				},
				available: {
					today: true,
					tomorrow: true,
				},
			},
			{
				slot_name: "Lunch at 12:00 AM",
				reservation_fee: 30,
				slot_time: {
					hour: 12,
					minute: 0,
				},
				available: {
					today: true,
					tomorrow: true,
				},
			},
			{
				slot_name: "Lunch at 1:00 PM",
				reservation_fee: 30,
				slot_time: {
					hour: 13,
					minute: 0,
				},
				available: {
					today: true,
					tomorrow: true,
				},
			},
			{
				slot_name: "Lunch at 2:00 PM",
				reservation_fee: 30,
				slot_time: {
					hour: 14,
					minute: 0,
				},
				available: {
					today: true,
					tomorrow: true,
				},
			},
			{
				slot_name: "Lunch at 3:00 PM",
				reservation_fee: 30,
				slot_time: {
					hour: 15,
					minute: 0,
				},
				available: {
					today: true,
					tomorrow: true,
				},
			},
			{
				slot_name: "Dinner at 6:00 PM",
				reservation_fee: 30,
				slot_time: {
					hour: 18,
					minute: 0,
				},
				available: {
					today: true,
					tomorrow: true,
				},
			},
			{
				slot_name: "Dinner at 7:00 PM",
				reservation_fee: 30,
				slot_time: {
					hour: 19,
					minute: 0,
				},
				available: {
					today: true,
					tomorrow: true,
				},
			},
			{
				slot_name: "Dinner at 8:00 PM",
				reservation_fee: 30,
				slot_time: {
					hour: 20,
					minute: 0,
				},
				available: {
					today: true,
					tomorrow: true,
				},
			},
			{
				slot_name: "Dinner at 9:00 PM",
				reservation_fee: 30,
				slot_time: {
					hour: 21,
					minute: 0,
				},
				available: {
					today: true,
					tomorrow: true,
				},
			},
		],
	},
});

await mongoose.disconnect();
