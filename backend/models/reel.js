const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		video: {
			url: {
				type: String,
				required: true,
			},
			mimeType: {
				type: String,
			},
		},
		likes: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}],
		comments: [{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
			content: {
				type: String,
				required: true,
			},
			createdAt: {
				type: Date,
				default: Date.now,
			},
		}],
		shares: {
			type: Number,
			default: 0,
		},
		reports: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Reel", reelSchema);