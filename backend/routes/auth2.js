const express = require("express");
const router = express.Router();
const auth2Controllers = require("../controllers/auth2");
const wrapAsync = require("../middlewares/wrapAsync");

// Register user route
router.post("/register", wrapAsync(auth2Controllers.registerUser));

module.exports = router;
