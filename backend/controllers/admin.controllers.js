import User from "./../models/user.model.js";
import Order from "./../models/orders.model.js";
import Reservation from "../models/reservation.model.js";
import Withdraw from "../models/withdraw.model.js";
import Earnings_res from "../models/earnings_res.model.js";
import config from "../configs/globle.conf.js";
import Stripe from "stripe";
import ejs from "ejs";
import dayjs from "dayjs";
export const POSTUpdateProfile = async (req, res) => {
	const user = req.exports.user;
	const { name, profile_image } = req.body;
	const userDocument = await User.findByIdAndUpdate(user._id, {
		name: name,
		"admin.profile_image": profile_image,
	});
	res.json({ done: true });
};

export const GETallResturant = async (req, res) => {
	const allResturant = await User.find({ type: "restaurant" });
	res.json(allResturant);
};

export const GETAllCustomers = async (req, res, next) => {
	const allCustomers = await User.find({ type: "customer" });
	res.json(allCustomers);
};

export const GETAllDelivery = async (req, res, next) => {
	const allDelivery = await User.find({ type: "delivery" });
	res.json(allDelivery);
};

export const GETAllTypeOfUserByID = async (req, res, next) => {
	const { id } = req.params;
	const customer = await User.findById(id);
	res.json(customer);
};

export const POSTStatusRes = async (req, res, next) => {
	const { id, stautsToSet } = req.body;
	console.log(id, stautsToSet);
	const user = await User.findByIdAndUpdate(id, {
		"restaurant.is_verified": stautsToSet,
	});
	res.json({ done: true });
};

export const POSTStatusDel = async (req, res, next) => {
	const { id, stautsToSet } = req.body;
	const user = await User.findByIdAndUpdate(id, {
		"delivery_person.is_verified": stautsToSet,
	});
	res.json({ done: true });
};

export const GETOrders = async (req, res, next) => {
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
			$and: [
				{ order_status: { $ne: "payment_pending" } },
				{ order_status: { $ne: "payment_failed" } },
			],
			...monthFilter,
		},
		{},
		{
			populate: ["customer_id", "delivery_person", "restaurant_id"],
			sort: { order_placed_on: 1 },
		}
	);
	res.json(orders);
};

export const GETOrderDetails = async (req, res, next) => {
	const user = req.exports.user;
	const { id } = req.params;
	const order = await Order.findById(
		id,
		{},
		{
			populate: ["customer_id", "delivery_person", "restaurant_id"],
		}
	);
	if (!order) {
		return res.status(404).json({});
	}
	res.json(order);
};

export const GETReservations = async (req, res, next) => {
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
	const reservations = await Reservation.find(
		{
			$and: [
				{ reservation_status: { $ne: "payment_pending" } },
				{ reservation_status: { $ne: "payment_failed" } },
			],
			...monthFilter,
		},
		{},
		{
			populate: ["customer_id", "restaurant_id"],
			sort: { made_on: 1 },
		}
	);
	res.json(reservations);
};

export const GETReservationsDetails = async (req, res, next) => {
	const user = req.exports.user;
	const { id } = req.params;

	const reservation = await Reservation.findById(
		id,
		{},
		{
			populate: ["customer_id", "restaurant_id"],
		}
	);
	if (!reservation) {
		return res.status(404).json({});
	}
	res.json(reservation);
};

export const GETEarnings = async (req, res, next) => {
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
	const earnings = await Earnings_res.find(
		{
			...monthFilter,
		},
		{},
		{
			sort: { created_on: 1 },
			populate: ["order_id", "reservation_id", "restaurant_id"],
		}
	);

	res.json(earnings);
};

export const getAllWithdrawal = async (req, res) => {
	const user = req.exports.user;
	const { start, end } = req.query;
	const monthFilter = {};
	if (start && end) {
		const temp = dayjs(end).add(1, "day").toDate();
		monthFilter.made_on = {
			$gte: new Date(start),
			$lt: temp,
		};
	}
	console.log(monthFilter);
	const withdraw = await Withdraw.find(
		monthFilter,
		{},
		{
			sort: {
				made_on: 1,
			},
			populate: ["user_id"],
		}
	);
	res.json(withdraw);
};

export const getWithdrawal = async (req, res) => {
	const user = req.exports.user;
	const withdraw = await Withdraw.findById(
		req.params.id,
		{},
		{
			populate: ["user_id"],
		}
	);
	if (!withdraw) {
		return res.status(404).json({});
	}
	return res.json(withdraw);
};

export const POSTApproveWithdrawal = async (req, res) => {
	const user = req.exports.user;
	const withdraw = await Withdraw.findById(
		req.body.id,
		{},
		{
			populate: ["user_id"],
		}
	);
	if (!withdraw) {
		return res.status(404).json({});
	}
	withdraw.status = "approved";
	withdraw.save();
	return res.json(withdraw);
};

export const Dashboard = async (req, res) => {
	try {
		const { id } = req.params;
		console.log(req.params);
		let query = {};
		if (id) {
			query._id = id;
		}
		const restaurant = await User.count({ type: "restaurant" });
		const deliveryperson = await User.count({ type: "delivery" });
		const customer = await User.count({ type: "customer" });
		const pendingorder = await Order.count({
			order_status: "payment_success",
			...query,
		});
		const acceptedorder = await Order.count({
			order_status: "accepted",
			...query,
		});
		const preparingorder = await Order.count({
			order_status: "preparing",
			...query,
		});
		const ontheway = await Order.count({
			order_status: "on_the_way",
			...query,
		});

		res.status(200).json({
			restaurant,
			deliveryperson,
			customer,
			pendingorder,
			acceptedorder,
			preparingorder,
			ontheway,
		});
	} catch (err) {
		res.status(500).json(err);
	}
};
