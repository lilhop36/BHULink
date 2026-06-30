const User = require("../models/user");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      department: department || ""
    });

    // Save user
    const user = await newUser.save();
    
    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      message: "User created successfully",
      data: user
    });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

const getAuthUser = async (req, res) => {
	if (!req.user) {
		return res.status(404).json({ message: `User Not Found` });
	}
	res.status(200).json({
		data: req.user,
	});
};

const getAllUsers = async (req, res) => {
	const allUsers = await User.find({ _id: { $ne: req.user._id } })
		.select("-password")
		.sort({ _id: -1 });
	res.status(200).send({ data: allUsers });
};

const followUser = async (req, res) => {
	const { userId } = req.params;
	const currentUser = req.user;

	if (currentUser.following.includes(userId)) {
		return res.status(400).json({ message: "Already following" });
	}

	currentUser.following.push(userId);
	await currentUser.save();

	// Create notification for the user being followed
	const Notification = require("../models/notification");
	const notification = new Notification({
		recipient: userId,
		sender: currentUser._id,
		type: 'follow',
		message: `${currentUser.firstName} ${currentUser.lastName} started following you`,
		relatedUser: currentUser._id,
	});
	await notification.save();

	// Emit socket event to the user being followed
	const reqSocket = req.app.get('socketio');
	console.log('🔌 Socket available in follow controller:', !!reqSocket);
	console.log('🎯 Emitting notification to user:', userId);
	
	if (reqSocket) {
		const notificationData = {
			_id: notification._id,
			sender: {
				_id: currentUser._id,
				firstName: currentUser.firstName,
				lastName: currentUser.lastName,
				email: currentUser.email,
				image: currentUser.image
			},
			type: 'follow',
			message: `${currentUser.firstName} ${currentUser.lastName} started following you`,
			createdAt: notification.createdAt,
			relatedUser: currentUser._id,
		};
		
		console.log('📤 Emitting notification data:', notificationData);
		reqSocket.to(userId).emit('newNotification', notificationData);
		console.log('✅ Notification emitted successfully');
	} else {
		console.log('❌ Socket not available in follow controller');
	}

	res.status(200).json({ message: "Followed successfully" });
};

const unfollowUser = async (req, res) => {
	const { userId } = req.params;
	const currentUser = req.user;

	currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
	await currentUser.save();

	res.status(200).json({ message: "Unfollowed successfully" });
};

const updateProfilePicture = async (req, res) => {
	try {
		const currentUser = req.user;

		if (!req.file) {
			return res.status(400).json({ message: "No image file provided" });
		}

		// Update user's image field with the uploaded file path
		currentUser.image = req.file.path;
		await currentUser.save();

		res.status(200).json({
			message: "Profile picture updated successfully",
			data: currentUser
		});
	} catch (error) {
		console.error("Error updating profile picture:", error);
		res.status(500).json({ message: "Error updating profile picture" });
	}
};

module.exports = { createUser, getAuthUser, getAllUsers, followUser, unfollowUser, updateProfilePicture };
