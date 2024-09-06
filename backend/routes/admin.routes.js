import { Router } from "express";
const router = new Router();
export default router;

import {
	GETallResturant,
	Dashboard,
	POSTUpdateProfile,
	GETAllCustomers,
	GETAllDelivery,
	GETAllTypeOfUserByID,
	POSTStatusRes,
	POSTStatusDel,
	GETOrders,
	GETOrderDetails,
	GETReservations,
	GETReservationsDetails,
	getAllWithdrawal,
	GETEarnings,
	getWithdrawal,
	POSTApproveWithdrawal,
} from "../controllers/admin.controllers.js";

import userAuth from "../middleware/user.auth.js";
router.get("/restaurant", userAuth, GETallResturant);
router.get("/customers", userAuth, GETAllCustomers);
router.get("/delivery", userAuth, GETAllDelivery);

router.get("/user/:id", userAuth, GETAllTypeOfUserByID);

router.post("/status/res", userAuth, POSTStatusRes);
router.post("/status/del", userAuth, POSTStatusDel);

router.get("/orders", userAuth, GETOrders);
router.get("/order/:id", userAuth, GETOrderDetails);
router.get("/reservations", userAuth, GETReservations);
router.get("/reservation/:id", userAuth, GETReservationsDetails);

router.get("/earnings", userAuth, GETEarnings);
router.get("/withdrawal", userAuth, getAllWithdrawal);
router.get("/withdrawal/:id", userAuth, getWithdrawal);
router.post("/withdrawal_approve", userAuth, POSTApproveWithdrawal);
// router.get("/dashboard/:id?", Dashboard);

router.put("/update_profile", userAuth, POSTUpdateProfile);
