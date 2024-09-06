import Validator from "validatorjs";
import User from "../models/user.model.js";
import { v4 as uuid } from "uuid";
import Orders from "../models/orders.model.js";
import Reservation from "./../models/reservation.model.js";
import Earnings_res from "../models/earnings_res.model.js";
import Withdraw from "../models/withdraw.model.js";
import config from "../configs/globle.conf.js";
import Stripe from "stripe";
import ejs from "ejs";
import dayjs from "dayjs";
import html_pdf from "html-pdf-node";
import { promisify } from "util";
ejs.renderFile = promisify(ejs.renderFile);
const stripe = Stripe(config.STRIPE_SECRET_KEY);
export const POSTprofile_change = async (req, res) => {
	const user = req.exports.user;
	const {
		name,
		owner_name,
		address,
		phone,
		logo,
		cover_image,
		images,
		cuisines,
		opening_time,
		closing_time,
		bank_details,
	} = req.body;
	const userDocument = await User.findByIdAndUpdate(user._id, {
		name: owner_name,
	});
};

export const POSTUpdateMenu = async (req, res) => {
	const user = req.exports.user;

	const newMenu = req.body.menu;

	const userDocument = await User.findByIdAndUpdate(
		user._id,
		{
			"restaurant.menu": newMenu,
		},
		{ new: true }
	);

	res.json({
		...userDocument,
	});
};

export const POSTUpdateReservationSlots = async (req, res) => {
	const user = req.exports.user;
	const slots = req.body.reservation_slots;

	const userDocument = await User.findByIdAndUpdate(
		user._id,
		{
			"restaurant.reservation_time_slots": slots,
		},
		{ new: true }
	);
	res.json({
		...userDocument,
	});
};

export const POSTUpdateOffers = async (req, res) => {
	const user = req.exports.user;
	const offers = req.body.offers;

	const userDocument = await User.findByIdAndUpdate(
		user._id,
		{
			"restaurant.offers": offers,
		},
		{ new: true }
	);
	res.json({
		...userDocument,
	});
};

export const GETAllActiveOrders = async (req, res) => {
	const user = req.exports.user;
	const orders = await Orders.find(
		{
			restaurant_id: user._id,
			$and: [
				{ order_status: { $ne: "payment_pending" } },
				{ order_status: { $ne: "rejected" } },
				{ order_status: { $ne: "refunded" } },
				{ order_status: { $ne: "payment_failed" } },
			],
		},
		{},
		{
			populate: ["customer_id", "delivery_person"],
		}
	);
	res.json(orders);
};

export const GETActiveOrder = async (req, res) => {
	const user = req.exports.user;
	const { id } = req.params;
	const order = await Orders.findOne(
		{
			_id: id,
			restaurant_id: user._id,
		},
		{},
		{
			populate: ["customer_id", "delivery_person"],
		}
	);
	if (!order) return res.status(404).json({});
	res.json(order);
};

export const GETAllOrders = async (req, res) => {
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
	const orders = await Orders.find(
		{
			restaurant_id: user._id,
			$and: [
				{ order_status: { $ne: "payment_pending" } },
				{ order_status: { $ne: "payment_failed" } },
			],
			...monthFilter,
		},
		{},
		{
			populate: ["customer_id", "delivery_person"],
			sort: { order_placed_on: -1 },
		}
	);
	res.json(orders);
};

export const POSTOrderStatusUpdate = async (req, res) => {
	const user = req.exports.user;
	const { order_id, change_to } = req.body;

	const updated = await Orders.findOneAndUpdate(
		{
			_id: order_id,
			restaurant_id: user._id,
		},
		{
			order_status: change_to,
		}
	);
	if (change_to === "rejected") {
		const refund = await stripe.refunds.create({
			payment_intent: updated.stripe_payment_id,
		});
		console.log("order Refunded Response", refund);
	} else if (change_to === "on_the_way") {
		const bmd_earning = updated.total_price * (config.EARNING_CUT / 100);
		const earning = updated.total_price - bmd_earning;
		const newEarning = await Earnings_res.create({
			restaurant_id: user._id,
			order_id: order_id,
			reservation_id: null,
			stripe_payment_id: updated.stripe_payment_id,
			total_price: updated.total_price,
			tax: updated.tax,
			earning: earning,
			bmd_earning: bmd_earning,
			payble_amount: updated.payble_amount,
			is_withdrawed: false,
		});
		user.restaurant.earning_available += earning;
		await user.save();
		// todo update resutaurant earnings in user
	}
	res.json(updated);
};

export const updateReservationStatus = async (req, res) => {
	const data = req.body;
	console.log(data);
	const deliveryperson = await Reservation.findByIdAndUpdate(
		data._id,
		data
	).exec();
	res.json(deliveryperson);
};

export const createReportOrderSummery = async (req, res) => {
	const {
		restaurant_name,
		restaurant_address,
		restaurant_phone,
		from_date,
		to_date,
		data,
	} = req.body;
	console.log(data);
	const html = await ejs.renderFile("./templates/order_history.ejs", {
		res_name: restaurant_name,
		res_address: restaurant_address,
		res_phone: restaurant_phone,
		from_date,
		to_date,
		data,
	});
	const file = `./images/report_${uuid()}.pdf`;
	const response = file.split("/")[2];
	await html_pdf.generatePdf(
		{
			content: html,
		},
		{
			path: file,
			formate: "A4",
			printBackground: true,
		}
	);
	res.json({
		file: response,
	});
};

export const createReportReservationSummery = async (req, res) => {
	const {
		restaurant_name,
		restaurant_address,
		restaurant_phone,
		from_date,
		to_date,
		data,
	} = req.body;
	console.log(data);
	const html = await ejs.renderFile("./templates/reservation_history.ejs", {
		res_name: restaurant_name,
		res_address: restaurant_address,
		res_phone: restaurant_phone,
		from_date,
		to_date,
		data,
	});
	const file = `./images/report_${uuid()}.pdf`;
	const response = file.split("/")[2];
	await html_pdf.generatePdf(
		{
			content: html,
		},
		{
			path: file,
			formate: "A4",
			printBackground: true,
		}
	);
	res.json({
		file: response,
	});
};

export const createReportEarningSummery = async (req, res) => {
	const {
		restaurant_name,
		restaurant_address,
		restaurant_phone,
		from_date,
		to_date,
		data,
	} = req.body;
	console.log(data);
	const html = await ejs.renderFile("./templates/earning_report.ejs", {
		res_name: restaurant_name,
		res_address: restaurant_address,
		res_phone: restaurant_phone,
		from_date,
		to_date,
		data,
	});
	const file = `./images/report_${uuid()}.pdf`;
	const response = file.split("/")[2];
	await html_pdf.generatePdf(
		{
			content: html,
		},
		{
			path: file,
			formate: "A4",
			printBackground: true,
		}
	);
	res.json({
		file: response,
	});
};

export const getReservations = async (req, res) => {
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
	const reservations = await Reservation.find(
		{
			restaurant_id: user._id,
			$and: [
				{ status: { $ne: "payment_pending" } },
				{ status: { $ne: "payment_failed" } },
			],
			...monthFilter,
		},
		{},
		{
			populate: ["customer_id"],
			sort: { slot_dateTime: 1 },
		}
	);
	await Promise.allSettled(
		reservations.map(async _ => {
			const diffHour = dayjs(_.slot_dateTime).diff(dayjs(), "hours");
			if (diffHour < -1 && _.reservation_status !== "completed") {
				_.reservation_status = "completed";
				const bmd_earning = _.total_price * (config.EARNING_CUT / 100);
				const earning = _.total_price - bmd_earning;
				const newEarning = await Earnings_res.create({
					restaurant_id: user._id,
					order_id: null,
					reservation_id: _._id,
					stripe_payment_id: _.stripe_payment_id,
					total_price: _.total_price,
					tax: _.tax,
					earning: earning,
					payble_amount: _.payble_amount,
					bmd_earning: bmd_earning,
					is_withdrawed: true,
					created_on: Date.now(),
				});
				// todo update resutaurant earnings in user
				user.restaurant.earning_available += earning;
				await user.save();
				await _.save();
			}
		})
	);
	res.json(reservations);
};

export const POSTMarkReservationComplete = async (req, res) => {
	const user = req.exports.user;
	const { id } = req.body;
	const reservation = await Reservation.findByIdAndUpdate(id, {
		reservation_status: "completed",
	});
	res.json(reservation);
};

export const GETReservationID = async (req, res) => {
	const user = req.exports.user;
	const { id } = req.params;
	const reservation = await Reservation.findOne(
		{
			_id: id,
			restaurant_id: user._id,
		},
		{},
		{
			populate: ["customer_id"],
		}
	);
	if (!reservation) return res.status(404).json({});
	res.json(reservation);
};

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
	const earnings = await Earnings_res.find(
		{
			restaurant_id: user._id,
			...monthFilter,
		},
		{},
		{
			sort: { created_on: 1 },
			populate: ["order_id", "reservation_id"],
		}
	);
	res.json(earnings);
};

export const POSTWithdraw = async (req, res) => {
	const user = req.exports.user;
	const { amount } = req.body;
	const withdraw = await Withdraw.create({
		user_id: user._id,
		amount: user.restaurant.earning_available,
		status: "pending",
	});
	user.restaurant.earning_available = 0;
	user.save();
	res.json(withdraw);
};
