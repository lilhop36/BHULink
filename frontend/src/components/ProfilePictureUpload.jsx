import React, { useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setProfileDetail } from "../redux/slices/conditionSlice";
import { toast } from "react-toastify";
import { updateUser } from "../redux/slices/authSlice";
import { removeAuth } from "../redux/slices/authSlice";

const ProfileDetail = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((store) => store.auth);
	const [selectedImage, setSelectedImage] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);
	const [uploading, setUploading] = useState(false);

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (!file.type.startsWith('image/')) {
				toast.error("Please select an image file");
				return;
			}
			setSelectedImage(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewImage(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleImageUpload = async () => {
		if (!selectedImage) return;

		setUploading(true);
		const formData = new FormData();
		formData.append("image", selectedImage);

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/update-profile-picture`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: formData,
			});

			const json = await response.json();
			if (json.data) {
				dispatch(updateUser(json.data));
				setSelectedImage(null);
				setPreviewImage(null);
				toast.success("Profile picture updated successfully!");
			} else {
				toast.error(json.message || "Error updating profile picture");
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Error updating profile picture");
		}
		setUploading(false);
	};

	const handleUpdate = () => {
		toast.warn("Coming soon");
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		dispatch(removeAuth());
		dispatch(setProfileDetail());
		navigate("/signin");
	};
	return (
		<div className="flex -m-2 sm:-m-4 flex-col items-center my-6 text-slate-300 min-h-screen w-full fixed top-0 justify-center z-50">
			<div className="p-3 pt-4 w-[80%] sm:w-[60%] md:w-[50%] lg:w-[40%] min-w-72 max-w-[1000px] border border-slate-400 bg-slate-800 rounded-lg h-fit mt-5 transition-all relative">
				<h2 className="text-2xl underline underline-offset-8 font-semibold text-slate-100 w-full text-center mb-2">
					Profile
				</h2>
				<div className="w-full py-4 justify-evenly flex flex-wrap items-center gap-3">
					<div className="self-end">
						<h3 className="text-xl font-semibold p-1">
							Name : {user.firstName} {user.lastName}
						</h3>
						<h3 className="text-xl font-semibold p-1">
							Email : {user.email}
						</h3>
						<button
							onClick={handleLogout}
							className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded mt-3 hidden sm:block"
						>
							Logout
						</button>
					</div>
					<div className="self-end flex w-full sm:w-fit items-center justify-center sm:flex-col gap-4">
						<div className="flex flex-col items-center">
							<img
								src={previewImage || (user.image ? `${import.meta.env.VITE_BACKEND_URL}/${user.image}` : '/boy.png')}
								alt="user/image"
								className="w-24 h-24 rounded-full border-2 border-slate-400"
							/>
							<div className="mt-3 flex flex-col gap-2">
								<label className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-3 rounded cursor-pointer text-sm text-center">
									Choose Image
									<input
										type="file"
										accept="image/*"
										onChange={handleImageChange}
										className="hidden"
									/>
								</label>
								{selectedImage && (
									<button
										onClick={handleImageUpload}
										disabled={uploading}
										className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded text-sm disabled:opacity-50"
									>
										{uploading ? "Uploading..." : "Upload"}
									</button>
								)}
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<button
								onClick={handleUpdate}
								className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-1.5 px-4 rounded"
							>
								Update Profile
							</button>
							<button
								onClick={handleLogout}
								className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
				<div
					title="Close"
					onClick={() => dispatch(setProfileDetail())}
					className="bg-black/15 hover:bg-black/50 h-7 w-7 rounded-md flex items-center justify-center absolute top-2 right-3 cursor-pointer"
				>
					<MdOutlineClose size={22} />
				</div>
			</div>
		</div>
	);
};

export default ProfileDetail;
