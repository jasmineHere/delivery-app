import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const model = new Schema({
	restaurant_id: { type: Types.ObjectId, ref: "User" },
	order_id: { type: Types.ObjectId, ref: "Order" },
	reservation_id: { type: Types.ObjectId, ref: "Reservation" },
	stripe_payment_id: { type: String },
	total_price: { type: Number },
	tax: { type: Number },
	payble_amount: { type: Number },
	earning: { type: Number },
	bmd_earning: { type: Number },
	is_withdrawed: { type: Boolean, default: false },
	created_on: { type: Date, default: Date.now },
});

export default mongoose.model("Earning_res", model);
