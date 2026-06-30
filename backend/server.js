const dotenv = require("dotenv"); 
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs"); // <-- added for directory check
const { Server } = require("socket.io");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();

const corsOptions = {
	origin: ["http://localhost:5176", "http://127.0.0.1:5176", "http://localhost:3000", "http://127.0.0.1:3000"],
	methods: ["GET", "POST", "DELETE", "PUT"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists (added without affecting other code)
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
	console.log("Created uploads directory");
}

// Serve uploads folder
app.use("/uploads", express.static(uploadsDir));

const PORT = process.env.PORT || 3000;

// All routers
const authRouter = require("./routes/auth");
const auth2Router = require("./routes/auth2");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");
const postRouter = require("./routes/post");
const reelRouter = require("./routes/reel");
const adminRouter = require("./routes/admin");
const announcementRouter = require("./routes/announcement");
const notificationRouter = require("./routes/notification");
const jobApplicationRouter = require("./routes/jobApplication");

// Connect to Database and start server
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chat-app";

async function startServer() {
	try {
		await mongoose.connect(mongoUri);
		console.log("Database Connection established");

		const server = app.listen(PORT);

		server.on("listening", () => {
			console.log(`Server listening on ${PORT}`);

			// Socket.IO setup
			const io = new Server(server, {
				pingTimeout: 60000,
				transports: ["websocket"],
				cors: corsOptions,
			});

			io.on("connection", (socket) => {
				console.log("Connected to socket.io:", socket.id);

				// Store socket instance in app for controllers to access
				app.set('socketio', io);

				const setupHandler = (userId) => {
					if (!socket.hasJoined) {
						socket.join(userId);
						socket.hasJoined = true;
						console.log("👤 User joined socket room:", userId);
						console.log("📡 Socket rooms:", socket.rooms);
						socket.emit("connected");
					} else {
						console.log("🔄 User already joined:", userId);
					}
				};

				const newMessageHandler = (newMessageReceived) => {
					let chat = newMessageReceived?.chat;
					chat?.users.forEach((user) => {
						if (user._id === newMessageReceived.sender._id) return;
						console.log("Message received by:", user._id);
						socket.in(user._id).emit("message received", newMessageReceived);
					});
				};

				const joinChatHandler = (room) => {
					if (socket.currentRoom) {
						if (socket.currentRoom === room) {
							console.log(`User already in Room: ${room}`);
							return;
						}
						socket.leave(socket.currentRoom);
						console.log(`User left Room: ${socket.currentRoom}`);
					}
					socket.join(room);
					socket.currentRoom = room;
					console.log("User joined Room:", room);
				};

				const typingHandler = (room) => {
					socket.in(room).emit("typing");
				};

				const stopTypingHandler = (room) => {
					socket.in(room).emit("stop typing");
				};

				const clearChatHandler = (chatId) => {
					socket.in(chatId).emit("clear chat", chatId);
				};

				const deleteChatHandler = (chat, authUserId) => {
					chat.users.forEach((user) => {
						if (authUserId === user._id) return;
						console.log("Chat delete:", user._id);
						socket.in(user._id).emit("delete chat", chat._id);
					});
				};

				const chatCreateChatHandler = (chat, authUserId) => {
					chat.users.forEach((user) => {
						if (authUserId === user._id) return;
						console.log("Create chat:", user._id);
						socket.in(user._id).emit("chat created", chat);
					});
				};

				socket.on("setup", setupHandler);
				socket.on("new message", newMessageHandler);
				socket.on("join chat", joinChatHandler);
				socket.on("typing", typingHandler);
				socket.on("stop typing", stopTypingHandler);
				socket.on("clear chat", clearChatHandler);
				socket.on("delete chat", deleteChatHandler);
				socket.on("chat created", chatCreateChatHandler);

				socket.on("disconnect", () => {
					console.log("User disconnected:", socket.id);
					socket.off("setup", setupHandler);
					socket.off("new message", newMessageHandler);
					socket.off("join chat", joinChatHandler);
					socket.off("typing", typingHandler);
					socket.off("stop typing", stopTypingHandler);
					socket.off("clear chat", clearChatHandler);
					socket.off("delete chat", deleteChatHandler);
					socket.off("chat created", chatCreateChatHandler);
				});
			});
		});

		server.on("error", (err) => {
			if (err.code === "EADDRINUSE") {
				console.error(`Port ${PORT} is already in use. Please stop the process using this port or choose another.`);
				process.exit(1);
			} else {
				console.error("Server error:", err);
				process.exit(1);
			}
		});
	} catch (err) {
		console.error("Database connection error:", err);
		process.exit(1);
	}
}

startServer();

// Root route
app.get("/", (req, res) => {
	res.json({
		message: "Welcome to Chat Application!",
		frontend_url: process.env.FRONTEND_URL,
	});
});

// All routes
app.use("/api/auth", authRouter);
app.use("/api/auth2", auth2Router);
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/post", postRouter);
app.use("/api/reel", reelRouter);
app.use("/api/admin", adminRouter);
app.use("/api/announcement", announcementRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/job-application", require("./routes/jobApplication"));

// Invalid routes
app.all("*", (req, res) => {
	res.json({ error: "Invalid Route" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	const errorMessage = err.message || "Something Went Wrong!";
	res.status(500).json({ message: errorMessage });
});