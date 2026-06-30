import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const CreateReel = ({ onReelCreated }) => {
    const authUser = useSelector((store) => store?.auth);
    const [content, setContent] = useState("");
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        console.log("Video file selected:", file);
        if (file) {
            if (!file.type.startsWith('video/')) {
                toast.error("Please select a video file");
                return;
            }
            setVideo(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                console.log("Video file reader loaded, setting preview");
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearVideo = () => {
        setVideo(null);
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() || !video) return;

        console.log("Submitting reel with content:", content);
        console.log("Video file:", video);

        setLoading(true);
        const formData = new FormData();
        formData.append("content", content);
        formData.append("video", video);

        console.log("FormData created:", formData);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reel`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    // Don't set Content-Type for FormData - browser sets it automatically
                },
                body: formData,
            });

            console.log("Response status:", response.status);
            const json = await response.json();
            console.log("Response data:", json);

            if (json.data) {
                onReelCreated(json.data);
                setContent("");
                setVideo(null);
                setPreview(null);
                toast.success("Reel created!");
            } else {
                toast.error(json.message || "Error creating reel");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error creating reel");
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

                        {/* Video Upload */}
                        <div className="mt-3">
                            <label className="block">
                                <span className="sr-only">Choose video</span>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </label>
                        </div>

                        {preview && (
                            <div className="mt-3 relative rounded-xl overflow-hidden bg-gray-100">
                                <video
                                    src={preview}
                                    controls
                                    className="w-full max-h-64 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={clearVideo}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end mt-3">
                            <button
                                type="submit"
                                disabled={loading || !content.trim() || !video}
                                className="px-6 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating..." : "Create Reel"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateReel;