const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth");
const wrapAsync = require("../middlewares/wrapAsync");

router.post("/signup", wrapAsync(authControllers.registerUser));
router.post("/signin", wrapAsync(authControllers.loginUser));
router.post("/send-otp", wrapAsync(authControllers.sendOTP));
router.post("/verify-otp", wrapAsync(authControllers.verifyOTP));

module.exports = router;
