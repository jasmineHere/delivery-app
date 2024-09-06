import User from "./../models/user.model.js";
import Withdraw from "../models/withdraw.model.js";
import Order from "./../models/orders.model.js";
import Earning_del from "../models/earning_del.model.js";
import Stripe from "stripe";
import dayjs from "dayjs";
import config from "../configs/globle.conf.js";
const stripe = Stripe(config.STRIPE_SECRET_KEY);
const METERS_PER_MILE = 1609.34;
export const POSTUpdateProfile = async (req, res) => {
	const user = req.exports.user;
	const { name, profile_image, address, phone, vehicle_number, bank_details } =
		req.body;
	const userDocument = await User.findByIdAndUpdate(user._id, {
		name: name,
		"delivery_person.phone": phone,
		"delivery_person.address": address,
		"delivery_person.vehicle_number": vehicle_number,
		"delivery_person.bank_details": bank_details,
		"delivery_person.profile_image": profile_image,
	});
	res.json({ done: true });
};

export const POSTAcceptOrder = async (req, res) => {
	const user = req.exports.user;
	const { id } = req.body;
	const order = await Order.findOneAndUpdate(
		{
			_id: id,
		},
		{
			delivery_person: user._id,
		},
		{ new: true }
	);
	const profile = await User.findByIdAndUpdate(user._id, {
		"delivery_person.current_order": order._id,
	});
	res.json(order);
};

export const GETAllAvaOrder = async (req, res) => {
	const user = req.exports.user;
	const { lat, lng } = req.params;
	if (!user.delivery_person.is_verified) {
		return res.json([]);
	}
	const orders = await Order.find(
		{
			delivery_person: null,
			$and: [
				{ order_status: { $ne: "payment_success" } },
				{ order_status: { $ne: "payment_pending" } },
				{ order_status: { $ne: "rejected" } },
				{ order_status: { $ne: "refunded" } },
				{ order_status: { $ne: "deliverd" } },
				{ order_status: { $ne: "payment_failed" } },
			],
			"address.location": {
				$nearSphere: {
					$geometry: {
						type: "Point",
						coordinates: [lng, lat],
					},
					$maxDistance: 20 * METERS_PER_MILE,
				},
			},
		},
		{},
		{
			populate: ["customer_id", "restaurant_id"],
		}
	);
	res.json(orders);
};

export const GETOrder = async (req, res) => {
	const user = req.exports.user;
	const { id } = req.params;

	const order = await Order.findOne(
		{
			_id: id,
		},
		{},
		{
			populate: ["customer_id", "restaurant_id"],
		}
	);
	if (!order) return res.status(404).json({});
	res.json(order);
};

export const GETCurrentOrder = async (req, res) => {
	const user = req.exports.user;
	const order = await Order.findOne(
		{
			_id: user.delivery_person.current_order,
		},
		{},
		{
			populate: ["customer_id", "restaurant_id"],
		}
	);
	if (order) {
		res.json(order);
	} else {
		res.status(404).json({});
	}
};

export const GETOrderHistory = async (req, res) => {
	const user = req.exports.user;
	const { start, end } = req.query;
	const monthFilter = {};
	if (start && end) {
		const temp = dayjs(end).add(1, "day").toDate();
		monthFilter.order_placed_on = {
			$gte: new Date(start),
			$lt: temp,
		};
	}
	const orders = await Order.find(
		{
			delivery_person: user._id,
			$or: [
				{ order_status: "deliverd" },
				{ order_status: "refunded" },
				{ order_status: "rejected" },
			],
			...monthFilter,
		},
		{},
		{
			populate: ["customer_id", "restaurant_id"],
		}
	);
	res.json(orders);
};

export const POSTMarkActiveOrderAsDone = async (req, res) => {
	const user = req.exports.user;
	const order = await Order.findOneAndUpdate(
		{
			_id: user.delivery_person.current_order,
		},
		{
			order_status: "deliverd",
		},
		{ new: true }
	);
	const profile = await User.findByIdAndUpdate(user._id, {
		"delivery_person.current_order": null,
	});
	const earning = await Earning_del.create({
		delivery_person: user._id,
		order_id: order._id,
		stripe_payment_id: order.stripe_payment_id,
		delivery_fees: order.delivery_fees,
		earning: order.delivery_fees,
	});
	user.delivery_person.earning_available += earning.earning;
	await user.save();
	res.json(order);
};

export const POSTMarkCancleDeliveryTask = async (req, res) => {
	const user = req.exports.user;
	const order = await Order.findById(user.delivery_person.current_order);
	if (order.order_status === "on_the_way") {
		const updated_order = await Order.findOneAndUpdate(
			{
				_id: user.delivery_person.current_order,
			},
			{
				order_status: "refunded",
			},
			{ new: true }
		);
		// issue customer a refund
		const refund = await stripe.refunds.create({
			payment_intent: updated_order.stripe_payment_id,
		});
		// console.log("order Refunded Response", refund);
	} else {
		const cancled_order = await Order.findOneAndUpdate(
			{
				_id: user.delivery_person.current_order,
			},
			{
				delivery_person: null,
			},
			{ new: true }
		);
	}
	const profile = await User.findByIdAndUpdate(user._id, {
		"delivery_person.current_order": null,
	});
	res.json({});
};

export const createOrderReport = async (req, res, next) => {};

export const GETEarnings = async (req, res) => {
	const user = req.exports.user;
	const { start, end } = req.query;
	const monthFilter = {};
	if (start && end) {
		const temp = dayjs(end).add(1, "day").toDate();
		monthFilter.created_on = {
			$gte: new Date(start),
			$lt: temp,
		};
	}
	const earnings = await Earning_del.find(
		{
			delivery_person: user._id,
			...monthFilter,
		},
		{},
		{
			sort: { created_on: 1 },
		}
	);
	res.json(earnings);
};

export const POSTWithdraw = async (req, res) => {
	const user = req.exports.user;
	const { amount } = req.body;
	const withdraw = await Withdraw.create({
		user_id: user._id,
		amount: user.delivery_person.earning_available,
		status: "pending",
	});
	user.delivery_person.earning_available = 0;
	user.save();
	res.json(withdraw);
};
