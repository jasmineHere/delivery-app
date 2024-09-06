import mongoose from "mongoose";
import cors from "cors";
import cookie_parser from "cookie-parser";
import express from "express";
import multer from "multer";
import { v4 as uuid } from "uuid";
import body_parser from "body-parser";
import config from "./configs/globle.conf.js";
import fs from "fs";
import path from "path";
import { Router } from "express";
const { json: JSONbodyParser } = body_parser;
import { fileURLToPath } from "url";
const { connect, connection } = mongoose;
// extra
const wait = ms => new Promise(_ => setTimeout(_, ms));

const apiRouter = Router();
const app = express();

const upload = multer({
	dest: "images/", // this saves your file into a directory called "uploads"
	fileFilter: (req, file, cb) => {
		if (
			file.mimetype !== "image/png" &&
			file.mimetype !== "image/jpeg" &&
			file.mimetype !== "image/jpg"
		) {
			return cb(new Error("Only images are allowed"));
		}
		cb(null, true);
	},
	storage: multer.diskStorage({
		filename: (req, file, cb) => {
			file.originalname = uuid() + path.extname(file.originalname);
			cb(null, file.originalname);
		},
		destination: (req, file, cb) => {
			cb(null, "images/");
		},
	}),
});
app.use(JSONbodyParser({ limit: "10mb" }));
app.use(cors());
app.use(cookie_parser());

app.use((_, __, next) => {
	_.exports = {};
	next();
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import UserRoutes from "./routes/user.routes.js";
import AdminRoutes from "./routes/admin.routes.js";
import RestaurantRoutes from "./routes/restaurants.routes.js";
import OrderRoutes from "./routes/order.routes.js";

import RestaurantAdminRoutes from "./routes/restaurant_admin.routes.js";
import DeliveryAdminRoutes from "./routes/delivery_admin.routes.js";

app.use("/api", apiRouter);

apiRouter.use("/user", UserRoutes);
apiRouter.use("/admin", AdminRoutes);
apiRouter.use("/restaurant", RestaurantRoutes);

apiRouter.use("/restaurant_admin", RestaurantAdminRoutes);
apiRouter.use("/delivery_admin", DeliveryAdminRoutes);
apiRouter.use("/order", OrderRoutes);

console.log(__dirname);
apiRouter.get("/image/:file", (req, res) => {
	// send pdf content type if incoming file is pdf
	if (req.params.file.endsWith(".pdf")) {
		res.setHeader("Content-Type", "application/pdf");
	} else {
		res.setHeader("Content-Type", "image/jpg");
	}
	try {
		if (fs.existsSync(`${__dirname}/images/${req.params.file}`)) {
			fs.createReadStream(path.join(__dirname, "images", req.params.file)).pipe(
				res
			);
		} else {
			fs.createReadStream(
				path.join(__dirname, "images", "placeholder.png")
			).pipe(res);
		}
	} catch (error) {
		fs.createReadStream(path.join(__dirname, "images", "placeholder.png")).pipe(
			res
		);
	}
});

apiRouter.post("/image_post", upload.single("file"), (req, res) => {
	res.json({
		file: req.file.filename,
	});
});

await connect(config.MONGO_DB, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
console.log(config.MONGO_DB);
app.use((req, res, next) => {
	res.json({
		url: req.url,
		ip: req.ip,
		message:
			"The request has reached at the end. you must have missed in routes or controllers of the url.",
	});
});

const server = app.listen(config.SERVER_PORT, config.SERVER_HOST, () => {
	console.log(
		`Server started at http://${config.SERVER_HOST}:${config.SERVER_PORT}`
	);
});

export default server;
