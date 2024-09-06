import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const model = new Schema({
	restaurant_id: { type: Types.ObjectId, ref: "User" },
	customer_id: { type: Types.ObjectId, ref: "User" },
	slot_name: { type: String },
	slot_time: {
		hour: { type: Number, default: 0 },
		minute: { type: Number, default: 0 },
	},
	slot_date: { type: String },
	slot_dateTime: { type: Date },
	person_count: { type: Number },
	total_price: { type: Number },
	tax: { type: Number },
	payble_amount: { type: Number },
	reservation_status: {
		type: String,
		enum: ["payment_pending", "waiting", "completed", "payment_failed"],
	},
	stripe_payment_id: { type: String },
	made_on: { type: Date, default: Date.now },
});

export default mongoose.model("Reservation", model);
