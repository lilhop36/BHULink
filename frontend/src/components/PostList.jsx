import React from "react";
import PostItem from "./PostItem";

const PostList = ({ posts, loading, onPostUpdate }) => {
    if (loading) {
        return <div className="text-center py-4">Loading posts...</div>;
    }

    if (posts.length === 0) {
        return <div className="text-center py-4">No posts yet. Be the first to post!</div>;
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <PostItem key={post._id} post={post} onUpdate={onPostUpdate} />
            ))}
        </div>
    );
};

export default PostList;
