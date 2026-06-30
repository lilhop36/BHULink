const dotenv = require("dotenv"); 
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();

// CORS configuration for Vercel
const corsOptions = {
	origin: process.env.NODE_ENV === 'production' 
		? [process.env.FRONTEND_URL, 'https://your-vercel-app.vercel.app']
		: ["http://localhost:5176", "http://127.0.0.1:5176", "http://localhost:3000", "http://127.0.0.1:3000"],
	methods: ["GET", "POST", "DELETE", "PUT"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
	console.log("Created uploads directory");
}

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Import routes
const authRoutes = require("../routes/authRoutes");
const messageRoutes = require("../routes/messageRoutes");
const userRoutes = require("../routes/userRoutes");
const chatRoutes = require("../routes/chatRoutes");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.status(200).json({ status: "OK", message: "Server is running" });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log("MongoDB connected successfully");
		
		// Start server only if not in serverless environment
		if (process.env.NODE_ENV !== 'production') {
			const PORT = process.env.PORT || 9000;
			const server = app.listen(PORT);
			
			server.on("listening", () => {
				console.log(`Server listening on ${PORT}`);
				
				// Socket.io setup
				const io = new Server(server, {
					cors: corsOptions,
					transports: ["websocket", "polling"],
				});
				
				// Socket.io handlers
				require("../socket/socketHandlers")(io);
			});
			
			server.on("error", (error) => {
				if (error.code === "EADDRINUSE") {
					console.error(`Port ${PORT} is already in use. Please stop the process using this port or choose another.`);
				} else {
					console.error("Server error:", error);
				}
			});
		}
	})
	.catch((error) => {
		console.error("MongoDB connection error:", error);
		process.exit(1);
	});

// Export for Vercel serverless
module.exports = app;
