import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import Validator from "validatorjs";
import config from "../configs/globle.conf.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "bookmydineservice@gmail.com",
		pass: "bookmydine_123",
	},
});
const createTokenPromise = (payload, key, options) => {
	return new Promise((resolve, reject) => {
		jwt.sign(payload, key, options, (error, token) => {
			if (error) return reject(error);
			resolve(token);
		});
	});
};
const verifyTokenPromise = (token, key, options) => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, key, options, (err, payload) => {
			if (err) reject(err);
			resolve(payload);
		});
	});
};
export const POSTCustomer = async (req, res) => {
	const requestBody = req.body;
	const validationRules = {
		name: "required",
		email: "required|email",
		password: "required|min:6",
		address: "required",
		location: {
			lat: "required",
			lng: "required",
		},
		phone: "required",
	};
	const validation = new Validator(requestBody, validationRules);
	if (validation.fails()) {
		return res.status(400).json({
			error: "Validation_failed",
			message: validation.errors.all(),
		});
	}
	const user = await User.findOne({ email: requestBody.email });
	if (user) {
		return res.status(400).json({
			error: "Email_already_exists",
			message: "Email already exists",
		});
	}
	const hashedPassword = await bcrypt.hash(requestBody.password, 10);

	const newUser = await User.create({
		name: requestBody.name,
		email: requestBody.email,
		password: hashedPassword,
		type: "customer",
		password_reset_otp: null,
		customer: {
			address: [
				{
					location: {
						type: "Point",
						coordinates: [requestBody.location.lng, requestBody.location.lat],
					},
					address: requestBody.address,
					default: true,
					type: "home",
				},
			],
			phone: requestBody.phone,
			profile_image: "profile.jpg",
			fav_resturants: [],
		},
		restaurant: null,
		delivery_person: null,
	});
	return res.json({
		message: "User created successfully",
		user_id: newUser._id,
	});
};
export const POSTLogin = async (req, res) => {
	const requestBody = req.body;
	const validationRules = {
		email: "required|email",
		password: "required|min:6",
	};
	const validation = new Validator(requestBody, validationRules);
	if (validation.fails()) {
		return res.status(400).json({
			error: "Validation_failed",
			message: validation.errors.all(),
		});
	}
	const user = await User.findOne({ email: requestBody.email });
	if (!user) {
		return res.status(400).json({
			error: "Email_not_found",
			message: "Email not found",
		});
	}
	const isPasswordValid = await bcrypt.compare(
		requestBody.password,
		user.password
	);
	if (!isPasswordValid) {
		return res.status(400).json({
			error: "Wrong_password",
			message: "Wrong password",
		});
	}
	const token = await createTokenPromise(
		{ user_id: user._id },
		config.JWT_ACCESS_TOKEN_SECRET,
		{
			expiresIn: config.JWT_ACCESS_TOKEN_EXPIRE,
		}
	);
	return res.json({
		message: "User logged in successfully",
		token,
		user,
	});
};

export const POSTRequestPasswordReset = async (req, res) => {
	const { email } = req.body;
	const user = await User.findOne({ email });
	if (!user) {
		return res.json({ error: "Email_not_found", message: "Email not found" });
	}
	const otp = Math.floor(100000 + Math.random() * 900000);

	const mailOptions = {
		from: "bookmydineservice@gmail.com",
		to: email,
		subject: "Password Reset",
		html: `<h2>Your OTP is <b> ${otp} </b> For Password reset on Book My Dine.  </h2>`,
		text: `Your OTP is ${otp} For Password reset on Book My Dine.`,
	};
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
			res.json({ error: "Email_not_sent", message: "Email not sent" });
		} else {
			console.log("Email sent: " + info.response);
			user.password_reset_otp = otp;
			user.save().then(_ => {
				res.json({ message: "Email sent successfully" });
			});
		}
	});
};

export const POSTForgotPasswordOTP = async (req, res) => {
	const { otp, new_password, email } = req.body;
	const user = await User.findOne({ email });
	if (user.password_reset_otp !== otp) {
		return res.json({ error: "Wrong_OTP", message: "Wrong OTP" });
	}
	const hashedPassword = await bcrypt.hash(new_password, 10);
	user.password = hashedPassword;
	user.password_reset_otp = null;
	await user.save();
	return res.json({ message: "OTP found" });
};

export const POSTUpdateUserPassowrd = async (req, res) => {
	const { old_password, new_password } = req.body;
	const user = req.exports.user;
	const isPasswordValid = await bcrypt.compare(old_password, user.password);
	console.log(user, isPasswordValid);
	if (!isPasswordValid) {
		return res.status(400).json({
			error: "Wrong_password",
			message: "Wrong password",
		});
	}

	// hash new passowrd
	const hashedPassword = await bcrypt.hash(new_password, 10);
	// save new password
	await User.findByIdAndUpdate(user._id, { password: hashedPassword });
	res.json({});
};

export const POSTUpdateNamePhoneImageCustomer = async (req, res) => {
	const { name, phone, profile_image } = req.body;
	const user = req.exports.user;
	const updateObj = {};
	if (name) updateObj.name = name;
	if (phone) updateObj["customer.phone"] = phone;
	if (profile_image) updateObj["customer.profile_image"] = profile_image;
	await User.findByIdAndUpdate(user._id, updateObj);
	res.json({
		success: true,
		name,
		phone,
		profile_image,
	});
};

export const POSTUpdateAddressCustomer = async (req, res) => {
	const { addresses } = req.body;
	const user = req.exports.user;

	await User.findByIdAndUpdate(user._id, {
		"customer.address": addresses,
	});
	res.json({
		addresses,
	});
};

export const GETUserInfo = async (req, res) => {
	const user = req.exports.user;
	return res.json({
		user,
	});
};

export const POSTRestaurant = async (req, res) => {
	const requestBody = req.body;
	const validationRules = {
		email: "required|email",
		password: "required|min:6",
		owner_name: "required",
		resturant_name: "required",
		address: {
			street: "required",
			landmark: "required",
			area: "required",
			city: "required",
			state: "required",
		},
		phone: "required",
		location: {
			lat: "required",
			lng: "required",
		},
		logo: "required",
		cover_image: "required",
		cuisines: "array|required",
		opening_time: {
			hour: "required|integer",
			minute: "required|integer",
		},
		closing_time: {
			hour: "required|integer",
			minute: "required|integer",
		},
	};

	const validation = new Validator(requestBody, validationRules);
	if (validation.fails()) {
		return res.status(400).json({
			error: "Validation_failed",
			message: validation.errors.all(),
		});
	}

	const user = await User.findOne({ email: requestBody.email });
	if (user) {
		return res.status(400).json({
			error: "Email_already_exists",
			message: "Email already exists",
		});
	}
	const hashedPassword = await bcrypt.hash(requestBody.password, 10);
	const restaurant = await User.create({
		name: requestBody.owner_name,
		email: requestBody.email,
		password: hashedPassword,
		type: "restaurant",
		password_reset_otp: null,
		customer: null,
		location: {
			type: "Point",
			coordinates: [requestBody.location.lng, requestBody.location.lat],
		},
		restaurant: {
			name: requestBody.resturant_name,
			address: {
				street: requestBody.address.street,
				landmark: requestBody.address.landmark,
				area: requestBody.address.area,
				city: requestBody.address.city,
				state: requestBody.address.state,
			},
			phone: requestBody.phone,
			logo: requestBody.logo,
			cover_image: requestBody.cover_image,
			cuisines: requestBody.cuisines,
			opening_time: {
				hour: requestBody.opening_time.hour,
				minute: requestBody.opening_time.minute,
			},
			closing_time: {
				hour: requestBody.closing_time.hour,
				minute: requestBody.closing_time.minute,
			},
			is_verified: false,
			bank_details: {
				IFSC: null,
				account_number: null,
				account_name: null,
				bank_name: null,
				branch_name: null,
			},
		},
	});
	res.json({
		message: "Restaurant_created",
		restaurant: restaurant,
	});
};

export const POSTDelivery = async (req, res) => {
	const requestBody = req.body;
	const validationRules = {
		name: "required",
		email: "required|email",
		password: "required",
		location: {
			lat: "required",
			lng: "required",
		},
		phone: "required",
		vehicle_number: "required",
		address: "required",
	};

	const validation = new Validator(requestBody, validationRules);
	if (validation.fails()) {
		return res.status(400).json({
			error: "Validation_failed",
			message: validation.errors.all(),
		});
	}

	const user = await User.findOne({ email: requestBody.email });
	if (user) {
		return res.status(400).json({
			error: "Email_already_exists",
			message: "Email already exists",
		});
	}
	const hashedPassword = await bcrypt.hash(requestBody.password, 10);
	const delivery = await User.create({
		name: requestBody.name,
		email: requestBody.email,
		password: hashedPassword,
		type: "delivery",
		password_reset_otp: null,
		customer: null,
		restaurant: null,
		location: {
			type: "Point",
			coordinates: [requestBody.location.lng, requestBody.location.lat],
		},
		delivery_person: {
			address: requestBody.address,
			phone: requestBody.phone,
			profile_image: requestBody.profile_image,
			vehicle_number: requestBody.vehicle_number,
			is_available: false,
			is_verified: false,
			bank_details: {
				IFSC: null,
				account_number: null,
				account_name: null,
				bank_name: null,
				branch_name: null,
			},
		},
	});
	res.json({
		message: "Delivery_created",
		delivery: delivery,
	});
};


export const getAllRestaurants = async (req, res) => {
	const restaurant = await User.find({ type: "restaurant" });
	res.json(restaurant);
};

export const getAllDeliveryperson = async (req, res) => {
	const deliveryperson = await User.find({ type: "delivery" });
	res.json(deliveryperson);
};

export const getAllCustomer = async (req, res) => {
	const deliveryperson = await User.find({ type: "customer" });
	res.json(deliveryperson);
};

export const POSTApproveRestaurant = async (req, res) => {
	const user = req.exports.user;
	if (user.type !== "admin")
		return res.status(403).json({
			error: "NOT_ALLOWED_REQUEST",
		});
	const requestBody = req.body;
	const validationRules = {
		restaurant_id: "required",
	};
	const validation = new Validator(requestBody, validationRules);
	if (validation.fails()) {
		return res.status(400).json({
			error: "Validation_failed",
			message: validation.errors.all(),
		});
	}
	const restaurant = await User.findOne({
		_id: requestBody.restaurant_id,
		type: "restaurant",
	});
	if (!restaurant) {
		return res.status(400).json({
			error: "Restaurant_not_found",
			message: "Restaurant not found",
		});
	}
	const updatedRestaurant = await User.findOneAndUpdate(
		{
			_id: requestBody.restaurant_id,
			type: "restaurant",
		},
		{
			$set: {
				is_verified: true,
			},
		},
		{ new: true }
	);
	res.json({
		message: "Restaurant_verified",
		restaurant: updatedRestaurant,
	});
};

export const POSTApproveDeliveryPerson = async (req, res) => {
	const user = req.user;
	if (user.type !== "admin")
		return res.status(403).json({
			error: "NOT_ALLOWED_REQUEST",
		});
	const requestBody = req.body;
	const validationRules = {
		delivery_id: "required",
	};
	const validation = new Validator(requestBody, validationRules);
	if (validation.fails()) {
		return res.status(400).json({
			error: "Validation_failed",
			message: validation.errors.all(),
		});
	}
	const delivery = await User.findOne({
		_id: requestBody.delivery_id,
		type: "delivery",
	});
	if (!delivery) {
		return res.status(400).json({
			error: "Delivery_not_found",
			message: "Delivery not found",
		});
	}
	const updatedDelivery = await User.findOneAndUpdate(
		{
			_id: requestBody.delivery_id,
			type: "delivery",
		},
		{
			$set: {
				is_verified: true,
			},
		},
		{ new: true }
	);
	res.json({
		message: "Delivery_verified",
		delivery: updatedDelivery,
	});
};

export const unVerifiedRestaurant = async (req, res) => {
	try {
		// const isapproved = Boolean(req.params.isapproved);
		// console.log(req.body, req.params, isapproved);
		const result = await User.find({
			type: "restaurant",
			"restaurant.is_verified": false,
		});
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json(err);
	}
};

export const unVerifiedDeliveryPerson = async (req, res) => {
	try {
		// const isapproved = Boolean(req.params.isapproved);
		// console.log(req.body, req.params, isapproved);
		const result = await User.find({
			type: "delivery",
			"delivery_person.is_verified": false,
		});
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json(err);
	}
};

export const updateRestaurant = async (req, res) => {
	try {
		const body = req.body;
		const user = req.exports.user;
		const result = await User.findOneAndUpdate(
			{ _id: user._id },
			{
				name: body.owner_name,
				location: {
					type: "Point",
					coordinates: [body.location.lng, body.location.lat],
				},
				restaurant: {
					...user.restaurant,
					name: body.name,
					address: body.address,
					phone: body.phone,
					logo: body.logo,
					cover_image: body.cover_image,
					images: body.images,
					cuisines: body.cuisines,
					bank_details: {
						IFSC: body.bank_details.IFSC,
						account_number: body.bank_details.account_number,
						account_name: body.bank_details.account_name,
						bank_name: body.bank_details.bank_name,
						branch_name: body.bank_details.branch_name,
					},
					opening_time: {
						hour: body.opening_time.hour,
						minute: body.opening_time.minute,
					},
					closing_time: {
						hour: body.closing_time.hour,
						minute: body.closing_time.minute,
					},
				},
			}
		);
		res.status(200).end();
	} catch (err) {
		console.log("error", err);
		res.status(500).json(err);
	}
};

export const updateDeliveryPerson = async (req, res) => {
	try {
		const id = req.body.id;
		console.log("........", id, req.body);

		let result = await User.findByIdAndUpdate(id, req.body);
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json(err);
	}
};
