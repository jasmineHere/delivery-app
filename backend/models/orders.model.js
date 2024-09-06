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
	restaurant_id: { type: Types.ObjectId, ref: "User" },
	customer_id: { type: Types.ObjectId, ref: "User" },
	items: [
		{
			item_name: { type: String },
			item_price: { type: Number },
			quantity: { type: Number },
			extras: [
				{
					extra_name: { type: String },
					extra_price: { type: Number },
				},
			],
			selected_size: { type: String },
		},
	],
	discount_applied: { type: Number },
	total_price: { type: Number },
	delivery_fees: { type: Number },
	tax: { type: Number },
	payble_amount: { type: Number },
	order_status: {
		type: String,
		enum: [
			"payment_pending",
			"payment_success",
			"accepted",
			"rejected",
			"preparing",
			"on_the_way",
			"deliverd",
			"refunded",
			"payment_failed",
		],
	},
	offer_applied: {
		min_amount: { type: Number, default: 0 },
		max_discount: { type: Number, default: 0 },
		offer_name: { type: String },
		discount_percentage: { type: Number, default: 0 },
	},

	delivery_person: { type: Types.ObjectId, ref: "User" },
	address: {
		location: {
			type: pointSchema,
		},
		address: { type: String },
	},
	stripe_payment_id: { type: String },
	order_placed_on: { type: Date },
});
model.index({ "address.location": "2dsphere" });
export default mongoose.model("Order", model);
