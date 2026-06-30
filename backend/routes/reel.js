const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createReel, getReels, likeReel, commentOnReel, shareReel } = require("../controllers/reel");
const { authorization } = require("../middlewares/authorization");

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
		fileSize: 100 * 1024 * 1024, // 100MB limit
	},
	fileFilter: (req, file, cb) => {
		if (file.mimetype.startsWith('video/')) {
			cb(null, true);
		} else {
			cb(new Error('Only video files are allowed!'), false);
		}
	}
});

router.post("/", authorization, upload.single("video"), (req, res, next) => {
	console.log("📹 Reel POST route hit");
	console.log("Headers:", req.headers['content-type']);
	console.log("Body keys:", Object.keys(req.body || {}));
	console.log("File:", req.file ? "File received" : "No file");
	next();
}, createReel);
router.get("/", authorization, getReels);
router.post("/:id/like", authorization, likeReel);
router.post("/:id/comment", authorization, commentOnReel);
router.post("/:id/share", authorization, shareReel);

module.exports = router;