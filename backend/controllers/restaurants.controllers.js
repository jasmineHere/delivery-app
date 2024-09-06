import User from "../models/user.model.js";
import Review from "../models/review.model.js";
import jwt from "jsonwebtoken";
import Validator from "validatorjs";
import config from "../configs/globle.conf.js";
import bcrypt from "bcrypt";

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export const GETsearchRestaurants = async (req, res) => {
	const METERS_PER_MILE = 1609.34;
	const { search } = req.query;
	const { lat } = req.query;
	const { lng } = req.query;
	const { sort_by } = req.query;
	const { rating } = req.query;
	const { cuisine } = req.query;
	console.log(req.query);
	const searchQuery = {
		type: "restaurant",
	};
	const searchOption = {};
	if (lat && lng) {
		searchQuery.location = {
			$nearSphere: {
				$geometry: {
					type: "Point",
					coordinates: [lng, lat],
				},
				$maxDistance: 10 * METERS_PER_MILE,
			},
		};
	}
	if (cuisine) {
		console.log("here");
		searchQuery["restaurant.cuisines"] = {
			$in: cuisine.split(","),
		};
	}
	if (search) {
		const regex = new RegExp(escapeRegex(search), "gi");
		searchQuery["restaurant.name"] = regex;
	}
	if (rating) {
		searchQuery["restaurant.overall_rating"] = {
			$gte: +rating,
		};
	}
	if (sort_by) {
		if (sort_by === "rating_high_low") {
			searchOption.sort = {
				"restaurant.overall_rating": 1,
			};
		} else if (sort_by === "rating_low_high") {
			searchOption.sort = {
				"restaurant.overall_rating": -1,
			};
		} else {
		}
	}
	const restaurants = await User.find(
		{
			...searchQuery,
			"restaurant.is_verified": true,
		},
		{},
		searchOption
	);
	res.json(restaurants);
};

export const GETRestaurant = async (req, res) => {
	const { id } = req.params;
	const restaurant = await User.findById(id);
	res.json(restaurant);
};

export const GETALLReviewsForRes = async (req, res) => {
	const { id } = req.params;
	const reviews = await Review.find(
		{ restaurant_id: id },
		{},
		{
			populate: ["customer_id"],
		}
	);
	res.json(reviews);
};

export const GETOfferList = async (req, res) => {
	const { id } = req.params;
	const deliveryperson = await User.find({ _id: id });
	res.json(deliveryperson);
};

// export const GETOfferList = async (req, res) => {
// 	const deliveryperson = await User.find();
// 	res.json(deliveryperson);
// };

export const updateRestaurant = async (req, res) => {
	const data = req.body;
	console.log(data);
	const deliveryperson = await User.findByIdAndUpdate(data._id, data).exec();
	res.json(deliveryperson);
};
