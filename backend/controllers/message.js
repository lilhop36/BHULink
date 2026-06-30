const Chat = require("../models/chat");
const Message = require("../models/message");

const createMessage = async (req, res) => {
	const { message, chatId } = req.body;
	
	// Check if chatId is provided
	if (!chatId) {
		return res.status(400).json({ 
			success: false,
			message: "Chat ID is required" 
		});
	}
	
	// Check if either message text or file is provided
	if (!message && !req.file) {
		return res.status(400).json({ 
			success: false,
			message: "Message or file is required" 
		});
	}

	const messageData = {
		sender: req.user._id,
		chat: chatId,
	};

	// Add message text if provided (and not empty)
	if (message && message.trim()) {
		messageData.message = message.trim();
	}

	// Add file info if file is uploaded
	if (req.file) {
		const baseUrl = `${req.protocol}://${req.get("host")}`;
		const publicFileUrl = `${baseUrl}/uploads/messages/${req.file.filename}`;
		messageData.file = {
			filename: req.file.filename,
			originalName: req.file.originalname,
			// Store a public URL (not a server filesystem path)
			path: publicFileUrl,
			size: req.file.size,
			mimeType: req.file.mimetype,
		};
	}

	try {
		const newMessage = await Message.create(messageData);
		
		// Update chat with latest message
		await Chat.findByIdAndUpdate(chatId, {
			latestMessage: newMessage._id,
		});
		
		// Populate full message details
		const fullMessage = await Message.findById(newMessage._id)
			.populate("sender", "-password")
			.populate({
				path: "chat",
				populate: { path: "users groupAdmin", select: "-password" },
			});
		
		return res.status(201).json({ 
			success: true,
			data: fullMessage 
		});
	} catch (error) {
		console.error("Error creating message:", error);
		return res.status(500).json({ 
			success: false,
			message: error.message || "Failed to create message" 
		});
	}
};

const allMessage = async (req, res) => {
	const chatId = req.params.chatId;
	const messages = await Message.find({ chat: chatId })
		.populate("sender", "-password")
		.populate("chat");
	return res.status(200).json({ data: messages });
};
const clearChat = async (req, res) => {
	const chatId = req.params.chatId;
	await Message.deleteMany({ chat: chatId });
	return res.status(200).json({ message: "success" });
};

module.exports = { createMessage, allMessage, clearChat };
