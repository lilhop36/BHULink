const Reel = require("../models/reel");
const User = require("../models/user");

const createReel = async (req, res) => {
	try {
		console.log("🎬 Creating reel...");
		console.log("Request body:", req.body);
		console.log("Request file:", req.file);
		console.log("Request user:", req.user ? req.user._id : "No user");

		const { content } = req.body;
		let video = null;

		if (req.file) {
			if (!req.file.mimetype.startsWith('video/')) {
				return res.status(400).json({ message: "Only video files are allowed for reels" });
			}
			video = {
				url: req.file.path,
				mimeType: req.file.mimetype,
			};
		} else {
			return res.status(400).json({ message: "Video is required for reels" });
		}

		const reel = new Reel({
			user: req.user._id,
			content,
			video,
		});

		await reel.save();
		await reel.populate('user', 'firstName lastName image');

		console.log("Reel created successfully:", reel);
		res.status(201).json({ data: reel });
	} catch (error) {
		console.error("Error creating reel:", error);
		res.status(500).json({ message: "Error creating reel" });
	}
};

const getReels = async (req, res) => {
	try {
		const reels = await Reel.find()
			.populate('user', 'firstName lastName image')
			.populate('comments.user', 'firstName lastName image')
			.sort({ createdAt: -1 });

		res.status(200).json({ data: reels });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching reels" });
	}
};

const likeReel = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user._id;

		const reel = await Reel.findById(id);
		if (!reel) {
			return res.status(404).json({ message: "Reel not found" });
		}

		const isLiked = reel.likes.includes(userId);
		if (isLiked) {
			reel.likes = reel.likes.filter(id => id.toString() !== userId.toString());
		} else {
			reel.likes.push(userId);
		}

		await reel.save();
		await reel.populate('user', 'firstName lastName image');
		await reel.populate('comments.user', 'firstName lastName image');

		res.status(200).json({ data: reel });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error liking reel" });
	}
};

const commentOnReel = async (req, res) => {
	try {
		const { id } = req.params;
		const { content } = req.body;

		const reel = await Reel.findById(id);
		if (!reel) {
			return res.status(404).json({ message: "Reel not found" });
		}

		reel.comments.push({
			user: req.user._id,
			content,
		});

		await reel.save();
		await reel.populate('user', 'firstName lastName image');
		await reel.populate('comments.user', 'firstName lastName image');

		res.status(200).json({ data: reel });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error commenting on reel" });
	}
};

const shareReel = async (req, res) => {
	try {
		const { id } = req.params;

		const reel = await Reel.findById(id);
		if (!reel) {
			return res.status(404).json({ message: "Reel not found" });
		}

		reel.shares += 1;
		await reel.save();

		res.status(200).json({ data: reel });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error sharing reel" });
	}
};

module.exports = {
	createReel,
	getReels,
	likeReel,
	commentOnReel,
	shareReel,
};