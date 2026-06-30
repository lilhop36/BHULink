const Post = require("../models/post");
const User = require("../models/user");

const createPost = async (req, res) => {
	try {
		const { content } = req.body;
		let media = null;
		let image = null;

		if (req.file) {
			media = {
				url: req.file.path,
				type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
				mimeType: req.file.mimetype,
			};
			// Also set image field for backward compatibility
			image = req.file.path;
		}

		const post = new Post({
			user: req.user._id,
			content,
			media,
			image, // Keep for backward compatibility
		});

		await post.save();
		await post.populate('user', 'firstName lastName image');

		res.status(201).json({ data: post });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error creating post" });
	}
};

const getPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.populate('user', 'firstName lastName image')
			.populate('comments.user', 'firstName lastName image')
			.sort({ createdAt: -1 });

		res.status(200).json({ data: posts });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error fetching posts" });
	}
};

const likePost = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user._id;

		const post = await Post.findById(id);
		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		const isLiked = post.likes.includes(userId);
		if (isLiked) {
			post.likes = post.likes.filter(id => id.toString() !== userId.toString());
		} else {
			post.likes.push(userId);
		}

		await post.save();
		await post.populate('user', 'firstName lastName image');
		await post.populate('comments.user', 'firstName lastName image');

		res.status(200).json({ data: post });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error liking post" });
	}
};

const commentOnPost = async (req, res) => {
	try {
		const { id } = req.params;
		const { content } = req.body;

		const post = await Post.findById(id);
		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		post.comments.push({
			user: req.user._id,
			content,
		});

		await post.save();
		await post.populate('user', 'firstName lastName image');
		await post.populate('comments.user', 'firstName lastName image');

		res.status(200).json({ data: post });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error adding comment" });
	}
};

const deletePost = async (req, res) => {
	try {
		const { id } = req.params;

		const post = await Post.findById(id);
		if (!post) {
			return res.status(404).json({ message: "Post not found" });
		}

		if (post.user.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Not authorized" });
		}

		await Post.findByIdAndDelete(id);
		res.status(200).json({ message: "Post deleted" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Error deleting post" });
	}
};

module.exports = { createPost, getPosts, likePost, commentOnPost, deletePost };