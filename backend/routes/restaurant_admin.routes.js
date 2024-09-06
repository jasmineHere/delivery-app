import { Router } from "express";
const router = new Router();
export default router;

import userAuth from "../middleware/user.auth.js";

import {
	POSTUpdateMenu,
	updateReservationStatus,
	POSTUpdateReservationSlots,
	POSTUpdateOffers,
	GETAllActiveOrders,
	GETActiveOrder,
	GETAllOrders,
	POSTOrderStatusUpdate,
	createReportOrderSummery,
	createReportReservationSummery,
	createReportEarningSummery,
	getReservations,
	GETReservationID,
	POSTMarkReservationComplete,
	GETEarnings,
	POSTWithdraw
} from "../controllers/restaurant_admin.controllers.js";
//
// router.get("/reservations");
router.get("/active_orders", userAuth, GETAllActiveOrders);
router.get("/order/:id", userAuth, GETActiveOrder);
router.get("/orders", userAuth, GETAllOrders);
router.post("/order/status_update", userAuth, POSTOrderStatusUpdate);
// router.post("/reservations/status_change");
// router.post("/orders/status_change");

router.post("/update_menu", userAuth, POSTUpdateMenu);
router.post("/update_reservation_slots", userAuth, POSTUpdateReservationSlots);
router.post("/update_offers", userAuth, POSTUpdateOffers);

router.put("/updateReservationStatus", updateReservationStatus);

router.post("/report/order_summery", userAuth, createReportOrderSummery);
router.post("/report/reservation_summery", userAuth, createReportReservationSummery);
router.post("/report/earning_summery", userAuth, createReportEarningSummery);
router.get("/reservation/:id", userAuth, GETReservationID);
router.get("/reservations", userAuth, getReservations);
router.post("/reservations/complete", userAuth, POSTMarkReservationComplete);

router.get("/earnings", userAuth, GETEarnings);
router.post("/withdraw", userAuth, POSTWithdraw);
