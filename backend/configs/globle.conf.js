const mongo_config = {
	USERNAME: process.env["MONGO_USERNAME"] || "book_my_dine",
	PASSWORD: process.env["MOGNO_PASSWORD"] || "bookmydine2022",
	HOST: process.env["MONGO_HOST"] || "teo-site-dev.hz428.mongodb.net",
};
const config = {
	// aspire
	PRODUCT_NAME: "Aspire.io",
	COMPANY_NAME: "Aspire Co.",
	// Server
	SERVER_HOST: process.env["SERVER_HOST"] || "0.0.0.0",
	SERVER_PORT: process.env["SERVER_PORT"] || 3000,
	// Database
	MONGO_DB:
		process.env["MONGO_DB"] ||
		`mongodb+srv://${mongo_config.USERNAME}:${mongo_config.PASSWORD}@${mongo_config.HOST}/book_my_dine`,
	// Password
	PASSWORD_HASH_SALT: 10,
	// JWT
	JWT_ACCESS_TOKEN_SECRET:
		"d184bb49e2360b98106c186efca76ef94688a94ac75b4c6c17d954d294fdd74f51f32896b3780c2bbbdd720bd3fe2506538e79364e96cf0ba1d279ad277149a9f9678f12b8a549194",
	JWT_ACCESS_TOKEN_EXPIRE: "7d",
	JWT_REFRESH_TOKEN_SECRET:
		"9bf63dcb6f962d624386d45c1c8c2ccc83829ff9aa0586063bc74888ce12eeaef565673fc0648158f188d8b5ece0dafc7b1b94d9393e2458e97666f2b20957bba08a93c4b32c788f9",
	JWT_REFRESH_TOKEN_EXPIRE: "30d",
	JWT_TOKEN_ISSUER: "Book My Dine Co.",
	JWT_TOKEN_AUDIENCE: "Book My Dine Co.",
	JWT_TOKEN_ALGORITHM: "HS512",
	JWT_TOKEN_SUBJECT: "AUTH TOKEN",
	JWT_REFRESH_TOKEN_COOKIE_NAME: "X_refresh_token",
	JQT_TOKEN_TYPES: ["access", "refresh"],
	// User
	USER_TYPES: ["customer", "admin", "delivery", "restaurant"],
	// stripe
	STRIPE_SECRET_KEY:
		"sk_test_51HZ8bPK5Lc76ARxTOoUruuea3jibJg0GlWOS5wNlQWlCz4MMcQRbYMT0Dw25OgD4NfyoiemeibOF2YxA4TAjkrF000ThrtJF99",
	STRIPE_RESERVATION_PAYMENT_SUCCESS_URL:
		"http://localhost:3000/api/order/success_reservation_payment",
	STRIPE_RESERVATION_PAYMENT_CANCEL_URL:
		"http://localhost:3000/api/order/cancle_reservation_payment",
	RESERVATION_SUCCESS_REDIRECT_URL:
		"http://localhost:5000/#/reservation_details",

	// orders

	STRIPE_ORDER_PAYMENT_SUCCESS_URL:
		"http://localhost:3000/api/order/success_order_payment",
	STRIPE_ORDER_PAYMENT_CANCEL_URL:
		"http://localhost:3000/api/order/cancle_order_payment",
	ORDER_SUCCESS_REDIRECT_URL: "http://localhost:5000/#/order_details",

	// earning
	EARNING_CUT: 10,
};
export default config;
