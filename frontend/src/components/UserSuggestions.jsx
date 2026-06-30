import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addFollowing, removeFollowing } from "../redux/slices/authSlice";
import { addNewChat, addSelectedChat } from "../redux/slices/myChatSlice";
import { getChatImage } from "../utils/getChatImage";

const UserSuggestions = () => {
	// Helper function to get user initials
	const getUserInitials = (user) => {
		if (user.firstName && user.lastName) {
			return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
		} else if (user.firstName) {
			return user.firstName.charAt(0).toUpperCase();
		} else if (user.email) {
			return user.email.charAt(0).toUpperCase();
		}
		return 'U';
	};

	// Helper function to get user display name
	const getDisplayName = (user) => {
		if (user.firstName && user.lastName) {
			return `${user.firstName} ${user.lastName}`;
		} else if (user.firstName) {
			return user.firstName;
		} else if (user.email) {
			return user.email.split('@')[0];
		}
		return 'Unknown User';
	};
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const authUser = useSelector((store) => store?.auth);
	const dispatch = useDispatch();

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			console.log('Fetching users from:', `${import.meta.env.VITE_BACKEND_URL}/api/user/users`);
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/users`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			console.log('User suggestions response status:', response.status);
			const json = await response.json();
			console.log('User suggestions response data:', json);
			
			if (json.data && Array.isArray(json.data)) {
				console.log('Setting users:', json.data.length);
				setUsers(json.data);
			} else {
				console.log('No users data found or invalid format');
				setUsers([]);
			}
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error("Could not load users");
			setUsers([]);
		}
		setLoading(false);
	};

	const handleFollow = async (userId) => {
		try {
			console.log('Following user:', userId);
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/follow/${userId}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			const json = await response.json();
			console.log('Follow response:', json);
			if (json.message) {
				toast.success(json.message);
				dispatch(addFollowing(userId));
				fetchUsers();
			}
		} catch (error) {
			console.error("Error following user:", error);
			toast.error("Error following user");
		}
	};

	const handleUnfollow = async (userId) => {
		try {
			console.log('Unfollowing user:', userId);
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/unfollow/${userId}`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			const json = await response.json();
			console.log('Unfollow response:', json);
			if (json.message) {
				toast.success(json.message);
				dispatch(removeFollowing(userId));
				fetchUsers();
			}
		} catch (error) {
			console.error("Error unfollowing user:", error);
			toast.error("Error unfollowing user");
		}
	};

	const handleChat = async (userId) => {
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ userId }),
			});
			const json = await response.json();
			if (json.data) {
				dispatch(addNewChat(json.data));
				dispatch(addSelectedChat(json.data));
				toast.success("Chat opened");
			}
		} catch (error) {
			console.error("Error creating chat:", error);
			toast.error("Error opening chat");
		}
	};

	if (loading) {
		return (
			<div className="p-4 h-full flex flex-col">
				<h2 className="text-xl font-semibold mb-4 text-white">Friend Suggestions</h2>
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
						<p className="text-gray-300">Loading friend suggestions...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 h-full flex flex-col">
			<h2 className="text-xl font-semibold mb-4 text-white">Friend Suggestions</h2>
			<div className="flex-1 overflow-y-auto space-y-3 max-h-[60vh] pr-2 custom-scrollbar">
				{users.map((user) => (
					<div key={user._id} className="flex items-center justify-between p-4 border border-white/20 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all shadow-lg hover:shadow-xl">
						<div className="flex items-center flex-1">
							<div className="relative">
								{user.image ? (
									<img
										src={user.image}
										alt={getDisplayName(user)}
										className="w-12 h-12 rounded-full mr-4 border-2 border-white/30 object-cover"
										onError={(e) => {
											e.target.style.display = 'none';
											e.target.nextElementSibling.style.display = 'flex';
										}}
									/>
								) : null}
								{/* Fallback with initials */}
								<div 
									className={`w-12 h-12 rounded-full mr-4 border-2 border-white/30 flex items-center justify-center text-white font-semibold text-lg bg-gradient-to-br from-blue-500 to-purple-600 ${user.image ? 'hidden' : 'flex'}`}
									style={{ display: user.image ? 'none' : 'flex' }}
								>
									{getUserInitials(user)}
								</div>
								{/* Online indicator */}
								<div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
							</div>
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-white text-lg truncate">
									{getDisplayName(user)}
								</h3>
								<p className="text-sm text-gray-300 truncate">
									{user.email}
								</p>
								{user.department && (
									<p className="text-xs text-blue-300 mt-1">
										{user.department}
									</p>
								)}
								{user.role && (
									<p className="text-xs text-purple-300 mt-1">
										{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
									</p>
								)}
							</div>
						</div>
						<div className="flex gap-2 ml-4">
							{authUser.following && authUser.following.includes(user._id) ? (
								<button
									onClick={() => handleUnfollow(user._id)}
									className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600/80 text-sm font-medium transition-all hover:scale-105"
									title="Unfollow user"
								>
									Unfollow
								</button>
							) : (
								<button
									onClick={() => handleFollow(user._id)}
									className="px-4 py-2 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600/80 text-sm font-medium transition-all hover:scale-105"
									title="Follow user"
								>
									Follow
								</button>
							)}
							<button
								onClick={() => handleChat(user._id)}
								className="px-4 py-2 bg-green-500/80 text-white rounded-lg hover:bg-green-600/80 text-sm font-medium transition-all hover:scale-105"
								title="Start chat"
							>
								Chat
							</button>
						</div>
					</div>
				))}
			</div>
			{users.length === 0 && (
				<div className="text-center py-12 text-white">
					<div className="mb-4">
						<div className="w-16 h-16 bg-gray-600 rounded-full mx-auto flex items-center justify-center">
							<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v2M7 20H5a3 3 0 01-3.356-1.857M7 20v-2m6 0v2m0 0V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z" />
							</svg>
						</div>
					</div>
					<p className="text-gray-400 text-lg">No users found</p>
					<p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
				</div>
			)}
		</div>
	);
};

export default UserSuggestions;
