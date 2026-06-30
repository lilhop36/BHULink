const express = require("express");
const router = express.Router();
const postControllers = require("../controllers/post");
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");
const multer = require("multer");

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/');
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + '-' + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	// Accept images and videos
	if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
		cb(null, true);
	} else {
		cb(new Error('Only image and video files are allowed'), false);
	}
};

const upload = multer({ 
	storage,
	fileFilter,
	limits: {
		fileSize: 50 * 1024 * 1024, // 50MB limit
	}
});

router.post("/", authorization, upload.single('media'), wrapAsync(postControllers.createPost));
router.get("/", authorization, wrapAsync(postControllers.getPosts));
router.post("/:id/like", authorization, wrapAsync(postControllers.likePost));
router.post("/:id/comment", authorization, wrapAsync(postControllers.commentOnPost));
router.delete("/:id", authorization, wrapAsync(postControllers.deletePost));

module.exports = router;