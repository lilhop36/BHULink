const { getUserIdFromToken } = require("../config/jwtProvider");
const User = require("../models/user");
const wrapAsync = require("./wrapAsync");

const authorization = wrapAsync(async (req, res, next) => {
	console.log("Authorization middleware called");
	const token = req.headers.authorization?.split(" ")[1];
	console.log("Token:", token ? "present" : "missing");
	if (!token) {
		return res.status(404).send({ message: "Token not found" });
	}
	const userId = getUserIdFromToken(token);
	console.log("User ID from token:", userId);
	if (userId) {
		req.user = await User.findById(userId).select("-password");
		console.log("User found:", req.user ? "yes" : "no");
	}
	next();
});

module.exports = { authorization };
