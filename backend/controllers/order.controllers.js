import Validator from "validatorjs";
import { v4 as uuid } from "uuid";
import User from "../models/user.model.js";
import Orders from "../models/orders.model.js";
import Reservation from "./../models/reservation.model.js";
import Review from "./../models/review.model.js";
import config from "../configs/globle.conf.js";
import Stripe from "stripe";
import axios from "axios";
import ejs from "ejs";
import dayjs from "dayjs";
import html_pdf from "html-pdf-node";
const stripe = Stripe(config.STRIPE_SECRET_KEY);

import advancedFormat from "dayjs/plugin/advancedFormat.js";
// dayjs.extend(advancedFormat);
const DELIVERY_FEES_PER_KM = 8;

export const POSTCreateReservation = async (req, res) => {
	const user = req.exports.user;
	let { restaurant_id, slot_name, slot_time, price, day, person_count } =
		req.body;
	console.log(req.body);
	const restaurant = await User.findById(restaurant_id);
	day =
		day === "today"
			? dayjs().format("DD/MM/YYYY")
			: dayjs().add(1, "day").format("DD/MM/YYYY");
	const dateTime = {
		hour: parseInt(slot_time.split(":")[0]),
		minute: parseInt(slot_time.split(":")[1]),
		day: day.split("/")[0] - 0,
		month: day.split("/")[1] - 1,
		year: day.split("/")[2] - 0,
	};
	console.log(dateTime);
	const slot_dateTime = dayjs(
		new Date(
			dateTime.year,
			dateTime.month,
			dateTime.day,
			dateTime.hour,
			dateTime.minute
		)
	).toDate();
	console.log("slot_dateTime", slot_dateTime);
	const reservation = new Reservation({
		restaurant_id: restaurant_id,
		customer_id: user._id,
		slot_name: slot_name,
		slot_time: {
			hour: slot_time.split(":")[0],
			minute: slot_time.split(":")[1],
		},
		slot_date: day,
		slot_dateTime,
		person_count: person_count,
		total_price: price,
		tax: 0,
		payble_amount: price,
		reservation_status: "payment_pending",
		stripe_payment_id: null,
		made_on: dayjs().toDate(),
	});
	const stripeSession = await stripe.checkout.sessions.create({
		line_items: [
			{
				name: "Reservation for " + person_count,
				amount: price * 100,
				currency: "inr",
				quantity: 1,
				description: `At ${
					restaurant.restaurant.name
				}, For ${person_count} person, For ${day} at ${dayjs(
					"1/1/1 " + slot_time
				).format("hh:mm a")}`,
			},
		],
		mode: "payment",
		success_url: `${config.STRIPE_RESERVATION_PAYMENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&res_id=${reservation._id}`,
		cancel_url: `${config.STRIPE_RESERVATION_PAYMENT_CANCEL_URL}?session_id={CHECKOUT_SESSION_ID}&res_id=${reservation._id}`,
	});
	reservation.stripe_payment_id = stripeSession.payment_intent;
	const reservationDocument = await reservation.save();
	res.json({
		reservation_id: reservationDocument._id,
		stripe_payment_id: stripeSession.payment_intent,
		stripe_session_id: stripeSession.id,
		stripe_session_url: stripeSession.url,
	});
};

export const GETReservationPaymentSuccess = async (req, res) => {
	const { session_id, res_id } = req.query;
	const reservation = await Reservation.findOne({
		_id: res_id,
	});
	if (!reservation)
		return res.status(404).json({ error: "Reservation not found" });
	reservation.reservation_status = "waiting";
	await reservation.save();
	res.redirect(`${config.RESERVATION_SUCCESS_REDIRECT_URL}/${res_id}`);
};

export const POSTOrder = async (req, res) => {
	const user = req.exports.user;
	const {
		restaurant_id,
		items,
		total_price,
		delivery_fees,
		tax,
		discount_applied,
		payble_amount,
		address,
		offer,
	} = req.body;
	console.log(req.body);
	// fetch the resturant
	const restaurant = await User.findById(restaurant_id);
	const order = new Orders({
		restaurant_id: restaurant_id,
		customer_id: user._id,
		items: items,
		total_price: total_price,
		delivery_fees: delivery_fees,
		tax: tax,
		payble_amount: payble_amount,
		address: address,
		offer: offer,
		discount_applied,
		order_status: "payment_pending",
		stripe_payment_id: null,
		delivery_person: null,
		order_placed_on: dayjs().toDate(),
	});
	const item_desc = items.map(item => {
		return `${item.item_name} x ${item.quantity}`;
	});
	const stripeSession = await stripe.checkout.sessions.create({
		line_items: [
			{
				name: `Order from ${restaurant.restaurant.name}`,
				description: item_desc.join(","),
				amount: total_price * 100,
				currency: "inr",
				quantity: 1,
			},
			{
				name: `Delivery charges`,
				amount: delivery_fees * 100,
				currency: "inr",
				quantity: 1,
			},
			{
				name: `Tax at 18%`,
				amount: tax * 100,
				currency: "inr",
				quantity: 1,
			},
		],
		mode: "payment",
		success_url: `${config.STRIPE_ORDER_PAYMENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
		cancel_url: `${config.STRIPE_ORDER_PAYMENT_CANCEL_URL}?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
	});
	order.stripe_payment_id = stripeSession.payment_intent;
	const orderDocument = await order.save();
	res.json({
		order_id: orderDocument._id,
		stripe_payment_id: stripeSession.payment_intent,
		stripe_session_id: stripeSession.id,
		stripe_session_url: stripeSession.url,
	});
};

export const GETOrderPaymentSuccess = async (req, res) => {
	const { session_id, order_id } = req.query;
	const order = await Orders.findOne({
		_id: order_id,
	});
	if (!order) return res.status(404).json({ error: "Reservation not found" });
	order.order_status = "payment_success";
	await order.save();
	res.redirect(`${config.ORDER_SUCCESS_REDIRECT_URL}/${order_id}`);
};

export const GETReservation = async (req, res) => {
	const user = req.exports.user;
	const { id } = req.params;
	const reservation = await Reservation.findOne(
		{
			_id: id,
			customer_id: user._id,
		},
		{},
		{
			populate: ["restaurant_id"],
		}
	);
	if (!reservation)
		return res.status(404).json({ error: "Reservation not found" });

	res.json(reservation);
};

export const GETListReservation = async (req, res) => {
	const user = req.exports.user;
	const reservation = await Reservation.find(
		{
			customer_id: user._id,
			reservation_status: { $ne: "payment_pending" },
		},
		{},
		{
			sort: {
				made_on: -1,
			},
			populate: ["restaurant_id"],
		}
	);
	if (!reservation)
		return res.status(404).json({ error: "Reservation not found" });
	res.json(reservation);
};

export const GETOrder = async (req, res) => {
	const user = req.exports.user;
	const { id } = req.params;
	const order = await Orders.findOne(
		{
			_id: id,
			customer_id: user._id,
		},
		{},
		{
			populate: ["restaurant_id", "delivery_person"],
		}
	);
	if (!order) return res.status(404).json({ error: "Order not found" });

	res.json(order);
};

export const GETOrderList = async (req, res) => {
	const user = req.exports.user;
	const order = await Orders.find(
		{
			customer_id: user._id,
		},
		{},
		{
			populate: ["restaurant_id", "delivery_person"],
			sort: {
				order_placed_on: -1,
			},
		}
	);
	res.json(order);
};

export const GETDistanceAndFees = async (req, res) => {
	const [originLat, originLng] = req.query.origins.split(",");
	const [destinationLat, destinationLng] = req.query.destinations.split(",");
	const response = await axios.get(
		`https://maps.googleapis.com/maps/api/distancematrix/json?&origins=${originLat},${originLng}&destinations=${destinationLat},${destinationLng}&key=AIzaSyAKhWTh4SBMS9BqiwBpBM1KWvohd2crbpY`
	);
	const data = await response.data.rows[0].elements[0];
	console.log(data);
	const distance = data.distance.value;
	const delivery_fees = (distance / 1000) * DELIVERY_FEES_PER_KM;
	res.json({
		delivery_fees,
		distance: data.distance.text,
	});
};

export const GETOrdersByStatus = async (req, res) => {
	const { order_status, id } = req.params;
	const query = { order_status };
	if (id) {
		query.restaurant_id = id;
	}
	const restaurant = await Orders.find(query).populate(["customer_id"]).exec();
	res.json(restaurant);
};

export const GETOrdersByStatusByID = async (req, res) => {
	const { order_status } = req.params;
	console.log(order_status);
	const restaurant = await Orders.find({ order_status })
		.populate(["customer_id"])
		.exec();
	res.json(restaurant);
};

export const GETOrderById = async (req, res) => {
	const { id } = req.params;
	// const user = req.exports.user;
	const order = await Orders.findOne({
		_id: id,
		// restaurant_id: user._id,
	})
		.populate(["customer_id"])
		.exec();
	if (!order) return res.status(404).json({ error: "Order not found" });

	res.json(order);
};

export const GETReservationList = async (req, res) => {
	const user = req.exports.user;
	const query = { reservation_status: "waiting" };
	const { id } = req.params;
	if (id && id !== "undefined" && id != "") {
		query.restaurant_id = id;
	}
	console.log(query);
	const order = await Reservation.find(query).populate(["customer_id"]).exec();
	if (!order) return res.status(404).json({ error: "Order not found" });

	res.json(order);
};

export const GETReservationHistoryList = async (req, res) => {
	const user = req.exports.user;
	const order = await Reservation.find({ reservation_status: "completed" })
		.populate(["customer_id"])
		.exec();
	if (!order) return res.status(404).json({ error: "Order not found" });

	res.json(order);
};

export const updateOrderStatus = async (req, res) => {
	const { order_status, _id } = req.body;
	const order = await Orders.findByIdAndUpdate({ _id }, { order_status });
	if (!order) return res.status(404).json({ error: "Order not found" });
	res.json(order);
};

export const GETReview = async (req, res) => {
	const user = req.exports.user;
	const { id } = req.params;
	const order_review = await Review.findOne({
		order_id: id,
		customer_id: user._id,
	}).populate(["customer_id"]);
	if (!order_review) return res.status(404).json({ error: "Review not found" });

	res.json(order_review);
};

export const POSTReview = async (req, res) => {
	const user = req.exports.user;
	const { id } = req.params;
	const { review, stars } = req.body;

	const order = await Orders.findOne({ _id: id });
	const restaurant = await User.findOne({ _id: order.restaurant_id });
	const order_review = await Review.create({
		order_id: id,
		restaurant_id: order.restaurant_id,
		customer_id: user._id,
		text: review,
		rating: stars,
	});
	const reviews = await Review.find({ restaurant_id: restaurant._id }, {});
	const total_reviews = reviews.length;
	const total_stars = reviews.reduce((acc, curr) => acc + curr.rating, 0);
	const avg_stars = parseFloat(total_stars / total_reviews).toFixed(1);

	restaurant.restaurant.overall_rating = avg_stars;
	restaurant.restaurant.total_reviews = total_reviews;
	restaurant.save();

	res.json(order_review);
};

export const GETInvoice = async (req, res) => {
	const user = req.exports.user;
	const { id } = req.params;
	const order = await Orders.findOne({ _id: id }).populate(["restaurant_id"]);
	if (!order) return res.status(404).json({ error: "Order not found" });
	const restaurant = order.restaurant_id;

	const html = await ejs.renderFile("./templates/customer_invoice.ejs", {
		order_id: id,
		cus_name: user.name,
		address: order.address.address,
		res_name: restaurant.restaurant.name,
		res_address: `${Object.entries(restaurant.restaurant.address)
			.map(_ => {
				return _[1];
			})
			.join(" ")}`,
		items: order.items,
		total_price: order.total_price,
		discount: order.discount_applied || 0,
		delivery_fees: order.delivery_fees || 0,
		tax: order.tax || 0,
		payble_amount: order.payble_amount || 0,
	});
	const file = `./images/invoice_${uuid()}.pdf`;
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
