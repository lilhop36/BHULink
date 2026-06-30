const express = require("express");
const router = express.Router();
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");
const notificationController = require("../controllers/notificationController");

// Get user notifications
router.get("/", authorization, wrapAsync(notificationController.getUserNotifications));

// Mark notification as read
router.put("/:id/read", authorization, wrapAsync(notificationController.markAsRead));

// Delete notification
router.delete("/:id", authorization, wrapAsync(notificationController.deleteNotification));

module.exports = router;
