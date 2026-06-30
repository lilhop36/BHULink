import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AiOutlineLike, AiFillLike, AiOutlineComment, AiOutlineShareAlt, AiOutlineLink } from "react-icons/ai";

const ReelItem = ({ reel, onUpdate }) => {
	const [comment, setComment] = useState("");
	const [showComments, setShowComments] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const videoRef = useRef(null);
	const authUser = useSelector((store) => store?.auth);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						// Video is in view, try to play it
						if (videoRef.current) {
							videoRef.current.play().catch(() => {
								// Auto-play failed (likely due to browser policy), keep muted
								setIsPlaying(false);
							});
						}
					} else {
						// Video is out of view, pause it
						if (videoRef.current) {
							videoRef.current.pause();
							setIsPlaying(false);
						}
					}
				});
			},
			{ threshold: 0.5 } // 50% of the video must be visible
		);

		if (videoRef.current) {
			observer.observe(videoRef.current);
		}

		return () => {
			if (videoRef.current) {
				observer.unobserve(videoRef.current);
			}
		};
	}, []);

	const handleLike = async () => {
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reel/${reel._id}/like`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			const json = await response.json();
			if (json.data) {
				onUpdate(json.data);
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Error liking reel");
		}
	};

	const handleComment = async (e) => {
		e.preventDefault();
		if (!comment.trim()) return;

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reel/${reel._id}/comment`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({ content: comment }),
			});
			const json = await response.json();
			if (json.data) {
				onUpdate(json.data);
				setComment("");
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Error adding comment");
		}
	};

	const handleShare = async () => {
		try {
			// Increment share count
			await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reel/${reel._id}/share`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			// Try Web Share API first
			if (navigator.share) {
				await navigator.share({
					title: "Check out this reel",
					text: reel.content,
					url: window.location.href,
				});
			} else {
				// Fallback to clipboard
				await navigator.clipboard.writeText(window.location.href);
				toast.success("Link copied to clipboard!");
			}
		} catch (error) {
			console.error("Error sharing:", error);
			toast.error("Error sharing reel");
		}
	};

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			toast.success("Link copied to clipboard!");
		} catch (error) {
			console.error("Error copying link:", error);
			toast.error("Error copying link");
		}
	};

	const togglePlayPause = () => {
		if (videoRef.current) {
			if (isPlaying) {
				videoRef.current.pause();
			} else {
				videoRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const isLiked = reel.likes.includes(authUser?._id);

	return (
		<div className="relative bg-black rounded-lg overflow-hidden max-w-md mx-auto">
			{/* Video */}
			<div className="relative aspect-[9/16] bg-black">
				<video
					ref={videoRef}
					src={reel.video.url}
					className="w-full h-full object-cover"
					loop
					muted
					playsInline
					autoPlay
					onClick={togglePlayPause}
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
				/>

				{/* Play/Pause Overlay */}
				{!isPlaying && (
					<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
						<div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
							<svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
							</svg>
						</div>
					</div>
				)}

				{/* User Info Overlay */}
				<div className="absolute top-4 left-4 right-16">
					<div className="flex items-center space-x-2">
						<img
							src={reel.user.image ? `${import.meta.env.VITE_BACKEND_URL}/${reel.user.image}` : '/boy.png'}
							alt={reel.user.firstName}
							className="w-10 h-10 rounded-full border-2 border-white"
						/>
						<div>
							<p className="text-white font-semibold text-sm">{reel.user.firstName} {reel.user.lastName}</p>
							<p className="text-gray-300 text-xs">{new Date(reel.createdAt).toLocaleDateString()}</p>
						</div>
					</div>
				</div>

				{/* Content Overlay */}
				<div className="absolute bottom-20 left-4 right-16">
					<p className="text-white text-sm leading-relaxed">{reel.content}</p>
				</div>

				{/* Action Buttons Overlay */}
				<div className="absolute bottom-4 right-4 flex flex-col space-y-4">
					{/* Like Button */}
					<div className="flex flex-col items-center">
						<button
							onClick={handleLike}
							className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
								isLiked ? 'bg-red-500' : 'bg-black bg-opacity-50'
							} hover:bg-opacity-70`}
						>
							{isLiked ? (
								<AiFillLike className="text-white text-xl" />
							) : (
								<AiOutlineLike className="text-white text-xl" />
							)}
						</button>
						<span className="text-white text-xs mt-1">{reel.likes.length}</span>
					</div>

					{/* Comment Button */}
					<div className="flex flex-col items-center">
						<button
							onClick={() => setShowComments(!showComments)}
							className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
						>
							<AiOutlineComment className="text-white text-xl" />
						</button>
						<span className="text-white text-xs mt-1">{reel.comments.length}</span>
					</div>

					{/* Share Button */}
					<div className="flex flex-col items-center">
						<button
							onClick={handleShare}
							className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
						>
							<AiOutlineShareAlt className="text-white text-xl" />
						</button>
						<span className="text-white text-xs mt-1">{reel.shares}</span>
					</div>

					{/* Copy Link Button */}
					<div className="flex flex-col items-center">
						<button
							onClick={handleCopyLink}
							className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
						>
							<AiOutlineLink className="text-white text-xl" />
						</button>
						<span className="text-white text-xs mt-1">Link</span>
					</div>
				</div>
			</div>

				{/* Comments Overlay */}
				{showComments && (
					<div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
						<div className="w-full bg-gray-900 rounded-t-2xl p-4 max-h-80 overflow-y-auto">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-white font-semibold">Comments</h3>
								<button
									onClick={() => setShowComments(false)}
									className="text-white text-xl"
								>
									×
								</button>
							</div>
							<div className="space-y-3">
								{reel.comments.map((comment, index) => (
									<div key={index} className="flex space-x-2">
										<img
											src={comment.user.image ? `${import.meta.env.VITE_BACKEND_URL}/${comment.user.image}` : '/boy.png'}
											alt={comment.user.firstName}
											className="w-8 h-8 rounded-full"
										/>
										<div className="flex-1">
											<p className="text-white text-sm">
												<span className="font-semibold">{comment.user.firstName} {comment.user.lastName}</span>
												<span className="ml-2 text-gray-300">{comment.content}</span>
											</p>
											<p className="text-gray-500 text-xs">{new Date(comment.createdAt).toLocaleDateString()}</p>
										</div>
									</div>
								))}
							</div>

							{/* Add Comment */}
							<form onSubmit={handleComment} className="flex space-x-2 mt-4 pt-4 border-t border-gray-700">
								<img
									src={authUser?.image ? `${import.meta.env.VITE_BACKEND_URL}/${authUser.image}` : '/boy.png'}
									alt={authUser?.firstName}
									className="w-8 h-8 rounded-full"
								/>
								<div className="flex-1 flex space-x-2">
									<input
										type="text"
										value={comment}
										onChange={(e) => setComment(e.target.value)}
										placeholder="Add a comment..."
										className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
									<button
										type="submit"
										className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
									>
										Post
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
		</div>
	);
};

export default ReelItem;