const express = require("express");
const router = express.Router();
const adminControllers = require("../controllers/admin");
const { authorization } = require("../middlewares/authorization");
const { checkRole } = require("../middlewares/roleAuth");
const wrapAsync = require("../middlewares/wrapAsync");

// All admin routes require authentication (temporarily removed admin role for testing)
router.use(authorization);
// router.use(checkRole(['admin'])); // Temporarily commented for testing

// Get platform statistics
router.get("/stats", wrapAsync(adminControllers.getPlatformStats));

// Get all users
router.get("/users", wrapAsync(adminControllers.getAllUsers));

// Update user
router.put("/users/:id", wrapAsync(adminControllers.updateUser));

// Create test user (for testing only)
router.post("/create-test-user", wrapAsync(async (req, res) => {
  try {
    const User = require("../models/user");
    const bcrypt = require("bcryptjs");
    
    const testUser = new User({
      firstName: "Test",
      lastName: "User",
      email: "test@bhu.edu.et",
      password: bcrypt.hashSync("password123", 8),
      role: "student",
      department: "Computer Science"
    });
    
    await testUser.save();
    res.status(200).json({ message: "Test user created successfully", user: testUser });
  } catch (error) {
    res.status(500).json({ message: "Error creating test user", error: error.message });
  }
}));

// Get all posts
router.get("/posts", wrapAsync(adminControllers.getAllPosts));

// Update post
router.put("/posts/:id", wrapAsync(adminControllers.updatePost));

// Get all reels
router.get("/reels", wrapAsync(adminControllers.getAllReels));

// Update reel
router.put("/reels/:id", wrapAsync(adminControllers.updateReel));

// Get all resources
router.get("/resources", wrapAsync(adminControllers.getAllResources));

// Update resource
router.put("/resources/:id", wrapAsync(adminControllers.updateResource));

// Get all chats
router.get("/chats", wrapAsync(adminControllers.getAllChats));

// Delete user
router.delete("/users/:id", wrapAsync(adminControllers.deleteUser));

// Delete post
router.delete("/posts/:id", wrapAsync(adminControllers.deletePost));

// Delete reel
router.delete("/reels/:id", wrapAsync(adminControllers.deleteReel));

// Delete resource
router.delete("/resources/:id", wrapAsync(adminControllers.deleteResource));

// Delete chat
router.delete("/chats/:id", wrapAsync(adminControllers.deleteChat));

// Get reported content
router.get("/reports", wrapAsync(adminControllers.getReportedContent));

// Dismiss report from content
router.post("/dismiss/:type/:id", wrapAsync(adminControllers.dismissReport));

module.exports = router;
