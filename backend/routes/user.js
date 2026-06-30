const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/user");
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");
const multer = require("multer");
const { checkRole } = require("../middlewares/roleAuth");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

const upload = multer({
	storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed!'), false);
		}
	}
});

router.get("/profile", authorization, wrapAsync(userControllers.getAuthUser));
router.get("/users", authorization, wrapAsync(userControllers.getAllUsers));
router.post("/users", authorization, wrapAsync(userControllers.createUser));
router.post("/follow/:userId", authorization, wrapAsync(userControllers.followUser));
router.post("/unfollow/:userId", authorization, wrapAsync(userControllers.unfollowUser));
router.post("/update-profile-picture", authorization, upload.single("image"), wrapAsync(userControllers.updateProfilePicture));

module.exports = router;
