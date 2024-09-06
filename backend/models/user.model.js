import mongoose from "mongoose";
const { Schema, Types } = mongoose;
const pointSchema = new Schema({
	type: {
		type: String,
		enum: ["Point"],
		required: true,
	},
	coordinates: {
		type: [Number],
		required: true,
	},
});
const model = new Schema({
	name: { type: String },
	email: { type: String },
	password: { type: String },
	type: {
		type: String,
		default: "customer",
		enum: ["customer", "admin", "delivery", "restaurant"],
	},
	password_reset_otp: { type: String },
	location: { type: pointSchema },
	customer: {
		address: [
			{
				location: {
					type: pointSchema,
				},
				address: { type: String },
				default: { type: Boolean, default: false },
				type: { type: String, default: "home" },
			},
		],
		phone: { type: String },
		profile_image: { type: String },
		fav_resturants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
	},
	restaurant: {
		name: { type: String },
		address: {
			street: { type: String },
			landmark: { type: String },
			area: { type: String },
			city: { type: String },
			state: { type: String },
		},
		phone: { type: String },
		logo: { type: String },
		cover_image: { type: String },
		images: [String],
		items_offered: [String],
		cuisines: [String],
		overall_rating: { type: Number, default: 0 },
		total_reviews: { type: Number, default: 0 },
		opening_time: {
			hour: { type: Number, default: 0 },
			minute: { type: Number, default: 0 },
		},
		closing_time: {
			hour: { type: Number, default: 0 },
			minute: { type: Number, default: 0 },
		},
		menu: {
			categories: [
				{
					category_name: { type: String },
					items: [
						{
							item_name: { type: String },
							item_price: { type: Number },
							description: { type: String },
							item_image: { type: String },
							is_veg: { type: Boolean, default: true },
							extras: [
								{
									extra_name: { type: String },
									extra_price: { type: Number },
								},
							],
							sizes: [
								{
									size_name: { type: String },
									size_price: { type: Number },
								},
							],
						},
					],
				},
			],
		},
		reservation_time_slots: [
			{
				slot_name: { type: String },
				slot_time: {
					hour: { type: Number, default: 0 },
					minute: { type: Number, default: 0 },
				},
				reservation_fee: { type: Number, default: 0 },
				available: {
					today: { type: Boolean, default: true },
					tomorrow: { type: Boolean, default: true },
				},
			},
		],
		offers: [
			{
				min_amount: { type: Number, default: 0 },
				max_discount: { type: Number, default: 0 },
				offer_name: { type: String },
				discount_percentage: { type: Number, default: 0 },
			},
		],
		earning_in_review: { type: Number, default: 0 },
		earning_available: { type: Number, default: 0 },
		bank_details: {
			IFSC: { type: String },
			account_number: { type: String },
			account_name: { type: String },
			bank_name: { type: String },
			branch_name: { type: String },
		},
		is_verified: { type: Boolean, default: false },
	},
	delivery_person: {
		phone: { type: String },
		address: { type: String },
		profile_image: { type: String },
		vehicle_number: { type: String },
		is_available: { type: Boolean, default: false },
		bank_details: {
			IFSC: { type: String },
			account_number: { type: String },
			account_name: { type: String },
			bank_name: { type: String },
			branch_name: { type: String },
		},
		earning_available: { type: Number, default: 0 },
		current_order: { type: Types.ObjectId, ref: "Order" },
		is_verified: { type: Boolean, default: false },
	},
	admin: {
		profile_image: { type: String },
		joined_on: { type: Date, default: Date.now },
	},
});
model.index({ location: "2dsphere" });
export default mongoose.model("User", model);
