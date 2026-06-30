const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");
const messageController = require("../controllers/message");

// Ensure uploads directory exists
// Keep this consistent with `server.js` which serves `process.cwd()/uploads` at `/uploads`
const uploadsDir = path.join(process.cwd(), "uploads", "messages");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now, like Telegram
    cb(null, true);
  }
});

router.post("/", authorization, upload.single('file'), wrapAsync(messageController.createMessage));
router.get("/:chatId", authorization, wrapAsync(messageController.allMessage));
router.get(
	"/clearChat/:chatId",
	authorization,
	wrapAsync(messageController.clearChat)
);

module.exports = router;
