import { Router } from "express";
const router = new Router();
export default router;

import {
	POSTCustomer,
	POSTRestaurant,
	POSTDelivery,
	POSTLogin,
	GETUserInfo,
	POSTApproveDeliveryPerson,
	POSTApproveRestaurant,
	POSTUpdateNamePhoneImageCustomer,
	POSTUpdateAddressCustomer,
	POSTUpdateUserPassowrd,
	getAllRestaurants,
	getAllDeliveryperson,
	getAllCustomer,
	unVerifiedRestaurant,
	unVerifiedDeliveryPerson,
	updateRestaurant,
	updateDeliveryPerson,
	POSTForgotPasswordOTP,
	POSTRequestPasswordReset,
} from "../controllers/user.controllers.js";
import userAuth from "../middleware/user.auth.js";
router.post("/customer", POSTCustomer);
router.post("/restaurant", POSTRestaurant);
router.post("/delivery", POSTDelivery);
router.post("/admin");

router.post("/login", POSTLogin);
router.post("/update_password", userAuth, POSTUpdateUserPassowrd);
router.post(
	"/update_name_phone_image_customer",
	userAuth,
	POSTUpdateNamePhoneImageCustomer
);
router.post("/update_address_customer", userAuth, POSTUpdateAddressCustomer);
router.post("/forgot-password", POSTRequestPasswordReset);
router.post("/forgot-password/otp", POSTForgotPasswordOTP);

router.get("/", userAuth, GETUserInfo); //currently logged in user

router.post("/admin/approve/restaurant", userAuth, POSTApproveRestaurant);
router.post("/admin/approve/delivery", userAuth, POSTApproveDeliveryPerson);

router.get("/admin/restaurant", getAllRestaurants);
router.get("/admin/delivery", getAllDeliveryperson);
router.get("/customer", getAllCustomer);

router.get("/unverifiedrestaurant", unVerifiedRestaurant);
router.get("/unverifieddeliveryperson", unVerifiedDeliveryPerson);
router.put("/updaterestaurant", updateRestaurant);
router.put("/updatedeliveryperson", updateDeliveryPerson);
