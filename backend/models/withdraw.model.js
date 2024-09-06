import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const model = new Schema({
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	amount: { type: Number },
	status: {
		type: String,
		default: "pending",
		enum: ["pending", "approved"],
	},
	approved_on: { type: Date },
	made_on: { type: Date, default: Date.now },
});

export default mongoose.model("Withdraw", model);
