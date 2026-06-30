import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CreatePost from "../components/CreatePost";
import PostList from "../components/PostList";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const toUrl = (path) => {
	if (!path) return null;
	return path.startsWith("http") ? path : `${BASE_URL}/${path}`;
};

const Posts = () => {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const authUser = useSelector((store) => store?.auth);

	const fetchPosts = async () => {
		setLoading(true);
		try {
			const response = await fetch(`${BASE_URL}/api/post`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			const json = await response.json();

			if (json.data) {
				const updatedPosts = json.data.map((post) => ({
					...post,
					image: toUrl(post.image),
					media: post.media ? { ...post.media, url: toUrl(post.media.url) } : null,
				}));

				setPosts(updatedPosts);
			}
		} catch (error) {
			console.error("Error fetching posts:", error);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (authUser) {
			fetchPosts();
		}
	}, [authUser]);

	const addPost = (newPost) => {
		const updatedPost = {
			...newPost,
			image: toUrl(newPost.image),
			media: newPost.media ? { ...newPost.media, url: toUrl(newPost.media.url) } : null,
		};

		setPosts([updatedPost, ...posts]);
	};

	const updatePost = (updatedPost) => {
		const fixedPost = {
			...updatedPost,
			image: toUrl(updatedPost.image),
			media: updatedPost.media ? { ...updatedPost.media, url: toUrl(updatedPost.media.url) } : null,
		};

		setPosts(posts.map((post) =>
			post._id === fixedPost._id ? fixedPost : post
		));
	};

	if (!authUser) {
		return (
			<div className="max-w-2xl mx-auto p-4 text-center">
				<h2 className="text-2xl mb-4">Welcome to Posts</h2>
				<p className="mb-4">Please sign in to view and create posts.</p>
				<Link
					to="/signin"
					className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
				>
					Sign In
				</Link>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto p-4">
			<CreatePost onPostCreated={addPost} />
			<PostList
				posts={posts}
				loading={loading}
				onPostUpdate={updatePost}
			/>
		</div>
	);
};

export default Posts;