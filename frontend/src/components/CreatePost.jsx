import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const CreatePost = ({ onPostCreated }) => {
    const authUser = useSelector((store) => store?.auth);
    const [content, setContent] = useState("");
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        console.log("File selected:", file);
        if (file) {
            setMedia(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log("File reader loaded, setting preview");
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearMedia = () => {
        setMedia(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("content", content);
        if (media) {
            formData.append("media", media);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/post`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            });
            const json = await response.json();
            if (json.data) {
                onPostCreated(json.data);
                setContent("");
                setMedia(null);
                setPreview(null);
                toast.success("Post created!");
            } else {
                toast.error(json.message || "Error creating post");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error creating post");
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-4">
            <div className="flex space-x-3">
                <img
                    src={authUser?.image ? `${import.meta.env.VITE_BACKEND_URL}/${authUser.image}` : '/boy.png'}
                    alt={authUser?.firstName}
                    className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={`What's on your mind, ${authUser?.firstName}?`}
                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500"
                            rows="3"
                            required
                        />
                        
                        {preview && (
                            <div className="mt-3 relative rounded-xl overflow-hidden bg-gray-100">
                                {media.type.startsWith('image/') ? (
                                    <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
                                ) : (
                                    <video src={preview} controls className="w-full max-h-64 object-cover" />
                                )}
                                <button
                                    type="button"
                                    onClick={clearMedia}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 cursor-pointer transition-colors duration-200">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm font-medium">Photo/Video</span>
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleMediaChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !content.trim()}
                                className="px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Posting...</span>
                                    </div>
                                ) : (
                                    'Post'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;



