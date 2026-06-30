const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");
const chatController = require("../controllers/chat");

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created uploads directory");
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// ---------- Existing chat routes ----------
router.post("/", authorization, wrapAsync(chatController.postChat));
router.get("/", authorization, wrapAsync(chatController.getChat));

router.post("/group", authorization, wrapAsync(chatController.createGroup));
router.delete("/deleteGroup/:chatId", authorization, wrapAsync(chatController.deleteGroup));
router.post("/rename", authorization, wrapAsync(chatController.renameGroup));
router.post("/groupremove", authorization, wrapAsync(chatController.removeFromGroup));
router.post("/groupadd", authorization, wrapAsync(chatController.addToGroup));

// ---------- New file upload route ----------
router.post(
  "/upload",
  authorization,
  upload.single("file"),
  wrapAsync(chatController.uploadFile)
);

module.exports = router;