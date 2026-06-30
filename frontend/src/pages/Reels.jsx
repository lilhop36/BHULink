import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ReelItem from "../components/ReelItem";
import CreateReel from "../components/CreateReel";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const toUrl = (path) => {
	if (!path) return null;
	return path.startsWith("http") ? path : `${BASE_URL}/${path}`;
};

const Reels = () => {
	const [reels, setReels] = useState([]);
	const [loading, setLoading] = useState(false);
	const authUser = useSelector((store) => store?.auth);

	const fetchReels = async () => {
		setLoading(true);
		try {
			const response = await fetch(`${BASE_URL}/api/reel`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			const json = await response.json();

			if (json.data) {
				const updatedReels = json.data.map((reel) => ({
					...reel,
					video: { ...reel.video, url: toUrl(reel.video.url) },
				}));

				setReels(updatedReels);
			}
		} catch (error) {
			console.error("Error fetching reels:", error);
		}
		setLoading(false);
	};

	useEffect(() => {
		if (authUser) {
			fetchReels();
		}
	}, [authUser]);

	const handleReelUpdate = (updatedReel) => {
		setReels((prevReels) =>
			prevReels.map((reel) =>
				reel._id === updatedReel._id ? updatedReel : reel
			)
		);
	};

	const handleReelCreated = (newReel) => {
		const updatedReel = {
			...newReel,
			video: { ...newReel.video, url: toUrl(newReel.video.url) },
		};
		setReels((prevReels) => [updatedReel, ...prevReels]);
	};

	return (
		<div className="min-h-screen bg-black">
			<div className="flex flex-col items-center py-4">
				<div className="w-full max-w-md">
					<CreateReel onReelCreated={handleReelCreated} />
					{loading ? (
						<div className="flex justify-center items-center h-64">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
						</div>
					) : reels.length > 0 ? (
						<div className="space-y-4">
							{reels.map((reel) => (
								<ReelItem
									key={reel._id}
									reel={reel}
									onUpdate={handleReelUpdate}
								/>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center h-64 text-white">
							<p className="text-xl mb-4">No reels yet</p>
							<p className="text-gray-400">Be the first to create a reel!</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Reels;