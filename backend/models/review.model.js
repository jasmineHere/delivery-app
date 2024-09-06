import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const model = new Schema({
	order_id: { type: Types.ObjectId, ref: "Order" },
	restaurant_id: { type: Types.ObjectId, ref: "User" },
	customer_id: { type: Types.ObjectId, ref: "User" },
	text: { type: String },
	rating: { type: Number },
	posted_on: { type: Date, default: Date.now },
});
export default mongoose.model("Review", model);
