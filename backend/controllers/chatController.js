const Chat = require("../models/chat");
const Message = require("../models/message");
const User = require("../models/user");

// ---------- Existing methods (adjust to your actual models if needed) ----------
// @desc    Create or fetch one-to-one chat
exports.postChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) throw new Error("UserId param not sent");

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "firstName lastName email profilePic",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
    res.status(200).json(fullChat);
  }
};

// @desc    Get all chats for logged in user
exports.getChat = async (req, res) => {
  let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  results = await User.populate(results, {
    path: "latestMessage.sender",
    select: "firstName lastName email profilePic",
  });

  res.status(200).json(results);
};

// @desc    Create group chat
exports.createGroup = async (req, res) => {
  const { users, name } = req.body;
  if (!users || !name) throw new Error("Please fill all fields");
  if (users.length < 2) throw new Error("Need at least 2 users for a group");

  users.push(req.user._id);
  const groupChat = await Chat.create({
    chatName: name,
    users: users,
    isGroupChat: true,
    groupAdmin: req.user._id,
  });

  const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(fullGroupChat);
};

// @desc    Rename group
exports.renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!updatedChat) throw new Error("Chat not found");
  res.status(200).json(updatedChat);
};

// @desc    Remove user from group
exports.removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  const removed = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!removed) throw new Error("Chat not found");
  res.status(200).json(removed);
};

// @desc    Add user to group
exports.addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  if (!added) throw new Error("Chat not found");
  res.status(200).json(added);
};

// @desc    Delete group chat
exports.deleteGroup = async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId);
  if (!chat) throw new Error("Chat not found");
  if (!chat.isGroupChat) throw new Error("Only group chats can be deleted via this endpoint");
  await Chat.findByIdAndDelete(chatId);
  res.status(200).json({ message: "Group deleted successfully" });
};

// ---------- NEW: File upload handler ----------
exports.uploadFile = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('req.user:', req.user);
    
    if (!req.file) {
      console.log('Error: No file uploaded');
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const chatId = req.body.chatId;
    if (!chatId) {
      console.log('Error: chatId is required');
      return res.status(400).json({ error: "chatId is required" });
    }

    // Optional: verify user is part of the chat
    let chat;
    try {
      chat = await Chat.findOne({ 
        _id: chatId, 
        users: { $elemMatch: { $eq: req.user._id } } 
      });
    } catch (dbError) {
      console.log('Database error:', dbError);
      return res.status(500).json({ error: "Database error: " + dbError.message });
    }
    
    if (!chat) {
      console.log('Error: User not in chat');
      return res.status(403).json({ error: "You are not a participant of this chat" });
    }

    const baseUrl = "http://localhost:9000";
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    console.log('File URL generated:', fileUrl);
    
    res.status(200).json({
      success: true,
      file: {
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.log('Upload controller error:', error);
    return res.status(500).json({ error: error.message });
  }
};