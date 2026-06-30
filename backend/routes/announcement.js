const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/announcements');
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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, Word, and Excel files are allowed.'), false);
    }
  }
});

// Import controllers and middleware
const announcementController = require("../controllers/announcementController");
const { authorization } = require("../middlewares/authorization");
const wrapAsync = require("../middlewares/wrapAsync");

// Routes
// Public route for landing page (no authorization required)
router.get("/public", wrapAsync(announcementController.getPublicAnnouncements));
// Protected routes
router.get("/", authorization, wrapAsync(announcementController.getAllAnnouncements));
router.get("/:id", authorization, wrapAsync(announcementController.getAnnouncement));
router.post("/", 
  authorization, 
  upload.array('attachments', 5), // Allow up to 5 files
  wrapAsync(announcementController.createAnnouncement)
);
router.put("/:id", authorization, wrapAsync(announcementController.updateAnnouncement));
router.delete("/:id", authorization, wrapAsync(announcementController.deleteAnnouncement));

module.exports = router;
