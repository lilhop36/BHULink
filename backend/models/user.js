const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		following: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}],
		image: {
			type: String,
			default:
				"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
		},
		role: {
			type: String,
			required: true,
			enum: ["student", "admin", "faculty"],
			default: "student",
		},
		department: {
			type: String,
			required: true,
		},
		lastLogin: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", userSchema);
module.exports = User;
