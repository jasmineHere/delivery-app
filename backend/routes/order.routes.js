import { Router } from "express";
const router = new Router();
export default router;

import {
	POSTCreateReservation,
	GETReservationPaymentSuccess,
	GETReservation,
	GETListReservation,
	GETDistanceAndFees,
	GETOrder,
	GETOrderPaymentSuccess,
	POSTOrder,
	GETOrderList,
	GETOrdersByStatus,
	GETOrderById,
	GETReservationList,
	GETReservationHistoryList,
	updateOrderStatus,
	GETInvoice,
	POSTReview,
	GETReview,
} from "../controllers/order.controllers.js";
import userAuth from "../middleware/user.auth.js";

router.post("/create_reservation", userAuth, POSTCreateReservation);
router.get("/reservation/:id", userAuth, GETReservation);

router.get("/success_reservation_payment", GETReservationPaymentSuccess);
router.get("/cancle_reservation_payment");

router.get("/list_reservation", userAuth, GETListReservation);
router.get("/distance_and_fees", userAuth, GETDistanceAndFees);

router.post("/food_order", userAuth, POSTOrder);
router.get("/list_food_orders", userAuth, GETOrderList);
router.get("/food_order/:id", userAuth, GETOrder);

router.get("/success_order_payment", GETOrderPaymentSuccess);
router.get("/cancle_order_payment");
router.get("/orderList/:order_status/:id?", GETOrdersByStatus);
router.put("/updateOrderStatus", updateOrderStatus);

router.get("/reservationlist/:id?", GETReservationList);
router.get("/reservationhistorylist", GETReservationHistoryList);

router.get("/:id", GETOrderById);

router.get("/review/:id", userAuth, GETReview);
router.post("/review/:id", userAuth, POSTReview);

router.get('/invoice/:id', userAuth, GETInvoice)