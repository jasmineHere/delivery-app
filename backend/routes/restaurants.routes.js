import { Router } from "express";
const router = new Router();
export default router;

import userAuth from "../middleware/user.auth.js";

import {
	GETsearchRestaurants,
	GETRestaurant,
	GETALLReviewsForRes,
	// updateRestaurant,
} from "../controllers/restaurants.controllers.js";

import { updateRestaurant } from "../controllers/user.controllers.js";

router.get("/search", GETsearchRestaurants);
router.get("/:id", GETRestaurant);
router.get("/:id/reviews", GETALLReviewsForRes);
router.put("/update_profile", userAuth, updateRestaurant);
