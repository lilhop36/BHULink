import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { AiOutlineLike, AiFillLike, AiOutlineComment, AiOutlineShareAlt } from "react-icons/ai";

const PostItem = ({ post, onUpdate }) => {
    const [comment, setComment] = useState("");
    const [showComments, setShowComments] = useState(false);
    const authUser = useSelector((store) => store?.auth);

    const handleLike = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/post/${post._id}/like`, {
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
            toast.error("Error liking post");
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/post/${post._id}/comment`, {
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

    const handleShare = () => {
        navigator.share({
            title: "Check out this post",
            text: post.content,
            url: window.location.href,
        }).catch(() => {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        });
    };

    const mediaUrl = (() => {
        const rawUrl = post.media?.url || post.image;
        if (!rawUrl) return null;
        return rawUrl.startsWith("http")
            ? rawUrl
            : `${import.meta.env.VITE_BACKEND_URL}/${rawUrl}`;
    })();

    const isLiked = post.likes.includes(authUser?._id);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                        <div className="relative">
                            <img
                                src={post.user.image ? `${import.meta.env.VITE_BACKEND_URL}/${post.user.image}` : '/boy.png'}
                                alt={post.user.firstName}
                                className="w-12 h-12 rounded-full border-2 border-gray-200 mr-3"
                            />
                            <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{post.user.firstName} {post.user.lastName}</p>
                            <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}</p>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                        </svg>
                    </button>
                </div>
                
                <div className="mb-3">
                    <p className="text-gray-800 leading-relaxed">{post.content}</p>
                </div>
            </div>
            {mediaUrl && (
                <div className="mb-3 rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                    {(post.media?.type === 'image' || post.image) ? (
                        <img
                            src={mediaUrl}
                            alt="Post"
                            className="w-full object-cover max-h-[550px]"
                            loading="lazy"
                        />
                    ) : (
                        <div className="relative">
                            <video
                                src={mediaUrl}
                                controls
                                className="w-full max-h-96 object-cover rounded-lg"
                                poster={mediaUrl}
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                </svg>
                                Video
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className="px-4 pb-3">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-2 transition-colors duration-200 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}`}
                        >
                            <div className="relative">
                                {isLiked ? (
                                    <AiFillLike className="text-xl" />
                                ) : (
                                    <AiOutlineLike className="text-xl" />
                                )}
                                {isLiked && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                )}
                            </div>
                            <span className="font-medium">{post.likes.length}</span>
                        </button>
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors duration-200"
                        >
                            <AiOutlineComment className="text-xl" />
                            <span className="font-medium">{post.comments.length}</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors duration-200"
                        >
                            <AiOutlineShareAlt className="text-xl" />
                            <span className="font-medium">Share</span>
                        </button>
                    </div>
                    <button className="text-gray-500 hover:text-blue-500 transition-colors duration-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
                
                {showComments && (
                    <div className="border-t pt-3 space-y-3">
                        <div className="flex space-x-2">
                            <img
                                src={authUser?.image ? `${import.meta.env.VITE_BACKEND_URL}/${authUser.image}` : '/boy.png'}
                                alt={authUser?.firstName}
                                className="w-8 h-8 rounded-full"
                            />
                            <form onSubmit={handleComment} className="flex-1 flex space-x-2">
                                <input
                                    type="text"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition-colors duration-200"
                                >
                                    Post
                                </button>
                            </form>
                        </div>
                        
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {post.comments.map((cmt, index) => (
                                <div key={index} className="flex space-x-2">
                                    <img
                                        src={cmt.user.image ? `${import.meta.env.VITE_BACKEND_URL}/${cmt.user.image}` : '/boy.png'}
                                        alt={cmt.user.firstName}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="flex-1">
                                        <div className="bg-gray-100 rounded-2xl px-3 py-2">
                                            <p className="font-semibold text-sm text-gray-900">{cmt.user.firstName} {cmt.user.lastName}</p>
                                            <p className="text-sm text-gray-800">{cmt.content}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(cmt.createdAt).toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric', 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostItem;



