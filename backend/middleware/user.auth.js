import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import Validator from "validatorjs";
import config from "../configs/globle.conf.js";
import bcrypt from "bcrypt";

const verifyTokenPromise = (token, key, options) => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, key, options, (err, payload) => {
			if (err) reject(err);
			resolve(payload);
		});
	});
};

export default async (req, res, next) => {
	const { token } = req.headers;
	if (!token) return res.status(401).json({ error: "Token is not provided" });
	try {
		const payload = await verifyTokenPromise(
			token,
			config.JWT_ACCESS_TOKEN_SECRET,
			{
				ignoreExpiration: false,
			}
		);
		const user = await User.findOne({ _id: payload.user_id });
		if (!user) return res.status(403).json({ error: "Invalid token" });
		req.exports.user = user;
		next();
	} catch (error) {
		return res.status(401).json({ error: "Invalid token" });
	}
};
