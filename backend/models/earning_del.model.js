import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const model = new Schema({
	delivery_person: { type: Types.ObjectId, ref: "User" },
	order_id: { type: Types.ObjectId, ref: "Order" },
	stripe_payment_id: { type: String },
	delivery_fees: { type: Number },
	earning: { type: Number },
	is_withdrawed: { type: Boolean, default: false },
	created_on: { type: Date, default: Date.now },
});

export default mongoose.model("Earning_del", model);
