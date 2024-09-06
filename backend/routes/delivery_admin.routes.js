import { Router } from "express";
const router = new Router();
export default router;

import userAuth from "../middleware/user.auth.js";

import {
	POSTUpdateProfile,
	POSTAcceptOrder,
	GETAllAvaOrder,
	GETCurrentOrder,
	POSTMarkActiveOrderAsDone,
	POSTMarkCancleDeliveryTask,
	GETOrderHistory,
	GETOrder,
	GETEarnings,
	POSTWithdraw
} from "./../controllers/delivery_admin.controllers.js";

router.put("/update_profile", userAuth, POSTUpdateProfile);
router.post("/accept_order", userAuth, POSTAcceptOrder);
router.post("/order/mark_as_done", userAuth, POSTMarkActiveOrderAsDone);
router.post("/order/mark_as_cancle", userAuth, POSTMarkCancleDeliveryTask);
router.get("/current_order", userAuth, GETCurrentOrder);
router.get("/order_history", userAuth, GETOrderHistory);
router.get("/all_ava_order/:lat/:lng", userAuth, GETAllAvaOrder);
router.get("/order/:id", userAuth, GETOrder);

router.get('/earnings', userAuth, GETEarnings);
router.post("/withdraw", userAuth, POSTWithdraw);