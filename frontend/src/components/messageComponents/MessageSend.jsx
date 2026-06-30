import React, { useEffect, useRef, useState } from "react";
import { FaFolderOpen, FaPaperPlane } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { setSendLoading, setTyping } from "../../redux/slices/conditionSlice";
import {
	addNewMessage,
	addNewMessageId,
} from "../../redux/slices/messageSlice";
import { LuLoader } from "react-icons/lu";
import { toast } from "react-toastify";
import socket from "../../socket/socket";

let lastTypingTime;
const MessageSend = ({ chatId }) => {
	const mediaFile = useRef();
	const [mediaBox, setMediaBox] = useState(false);
	const [mediaURL, setMediaURL] = useState("");
	const [newMessage, setMessage] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [showSendDialog, setShowSendDialog] = useState(false);
	const dispatch = useDispatch();
	const isSendLoading = useSelector(
		(store) => store?.condition?.isSendLoading
	);
	const isSocketConnected = useSelector(
		(store) => store?.condition?.isSocketConnected
	);
	const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
	const isTyping = useSelector((store) => store?.condition?.isTyping);

	useEffect(() => {
		socket.on("typing", () => dispatch(setTyping(true)));
		socket.on("stop typing", () => dispatch(setTyping(false)));
	}, []);

	// Media Box Control
	const handleMediaBox = () => {
		console.log('File input changed');
		const file = mediaFile.current?.files[0];
		console.log('Selected file:', file);
		if (file) {
			console.log('File details:', {
				name: file.name,
				size: file.size,
				type: file.type
			});
			const url = URL.createObjectURL(file);
			setMediaURL(url);
			setSelectedFile(file);
			setShowSendDialog(true); // Show confirmation dialog instead of media box
		} else {
			console.log('No file selected');
			setMediaBox(false);
		}
	};

	// Media Box Hidden && Input file remove
	const clearMediaFile = () => {
		mediaFile.current.value = "";
		setMediaURL("");
		setMediaBox(false);
		setSelectedFile(null);
		setShowSendDialog(false);
	};

	// Handle file send confirmation
	const handleSendFile = () => {
		setShowSendDialog(false);
		// Send the file directly instead of showing media box
		handleSendMessage();
	};

	// Handle file cancel
	const handleCancelFile = () => {
		clearMediaFile();
	};

	// Send Message Api call
	const handleSendMessage = async () => {
		console.log('Send button clicked');
		console.log('Message text:', newMessage);
		console.log('Selected file:', selectedFile);
		
		// Check if either message text or file is provided
		if (!newMessage?.trim() && !selectedFile) {
			console.log('No message or file provided');
			return;
		}

		console.log('Starting to send message...');
		socket.emit("stop typing", selectedChat._id);
		dispatch(setSendLoading(true));
		const token = localStorage.getItem("token");

		// If no file, send as regular text message using FormData for consistency
		if (!selectedFile) {
			console.log('Sending text message');
			const formData = new FormData();
			formData.append('message', newMessage.trim());
			formData.append('chatId', chatId);

			try {
				const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message`, {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				});

				const json = await response.json();
				console.log('Text message response:', response.status, json);
				
				if (response.ok) {
					dispatch(addNewMessageId(json?.data?._id));
					dispatch(addNewMessage(json?.data));
					socket.emit("new message", json.data);
					setMessage("");
				} else {
					console.error('Text message error:', json);
					toast.error(json?.message || "Message Sending Failed");
				}
			} catch (err) {
				console.error('Text message network error:', err);
				toast.error("Network error. Please try again.");
			} finally {
				dispatch(setSendLoading(false));
			}
			return;
		}

		// If file is selected, send as FormData
		console.log('Sending file message');
		const formData = new FormData();
		
		// Add message text if provided
		if (newMessage?.trim()) {
			formData.append('message', newMessage.trim());
		}
		
		// Add file
		formData.append('file', selectedFile);
		
		// Add chatId
		formData.append('chatId', chatId);

		console.log('FormData contents:');
		for (let [key, value] of formData.entries()) {
			console.log(key, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
		}

		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			const json = await response.json();
			console.log('File message response:', response.status, json);
			
			if (response.ok) {
				dispatch(addNewMessageId(json?.data?._id));
				dispatch(addNewMessage(json?.data));
				socket.emit("new message", json.data);
				setMessage("");
				clearMediaFile();
			} else {
				console.error('File message error:', json);
				toast.error(json?.message || "File Sending Failed");
			}
		} catch (err) {
			console.error('File message network error:', err);
			toast.error("Network error. Please try again.");
		} finally {
			dispatch(setSendLoading(false));
		}
	};

	const handleTyping = (e) => {
		setMessage(e.target?.value);
		if (!isSocketConnected) return;
		if (!isTyping) {
			socket.emit("typing", selectedChat._id);
		}
		lastTypingTime = new Date().getTime();
		let timerLength = 3000;
		let stopTyping = setTimeout(() => {
			let timeNow = new Date().getTime();
			let timeDiff = timeNow - lastTypingTime;
			if (timeDiff > timerLength) {
				socket.emit("stop typing", selectedChat._id);
			}
		}, timerLength);
		return () => clearTimeout(stopTyping);
	};

	// Format file size
	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	// Get file icon based on type
	const getFileIcon = (mimeType) => {
		if (mimeType.startsWith('image/')) return 'Image';
		if (mimeType.startsWith('video/')) return 'Video';
		if (mimeType.startsWith('audio/')) return 'Audio';
		if (mimeType.includes('pdf')) return 'PDF';
		if (mimeType.includes('word')) return 'Document';
		return 'File';
	};

	return (
		<>
			{/* Confirmation Dialog */}
			{showSendDialog && selectedFile && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-lg font-semibold text-gray-800 mb-4">Send File?</h3>
						
						{/* File Preview */}
						<div className="mb-4">
							{selectedFile?.mimeType.startsWith('image/') && (
								<img
									src={mediaURL}
									alt="preview"
									className="w-full h-32 object-contain rounded bg-gray-100"
								/>
							)}
							{selectedFile?.mimeType.startsWith('video/') && (
								<video
									src={mediaURL}
									className="w-full h-32 object-contain rounded bg-gray-100"
									controls
								/>
							)}
							{!selectedFile?.mimeType.startsWith('image/') && 
							 !selectedFile?.mimeType.startsWith('video/') && (
								<div className="bg-gray-100 rounded p-4 text-center">
									<div className="text-3xl mb-2">
										{selectedFile?.mimeType.includes('pdf') && 'PDF'}
										{selectedFile?.mimeType.includes('word') && 'DOC'}
										{selectedFile?.mimeType.includes('text') && 'TXT'}
										{!selectedFile?.mimeType.includes('pdf') && 
										 !selectedFile?.mimeType.includes('word') && 
										 !selectedFile?.mimeType.includes('text') && 'FILE'}
									</div>
									<div className="text-sm text-gray-600">{selectedFile?.originalName}</div>
								</div>
							)}
						</div>
						
						{/* File Details */}
						<div className="mb-4 text-sm text-gray-600">
							<div className="flex justify-between">
								<span>Name:</span>
								<span className="font-medium">{selectedFile?.originalName}</span>
							</div>
							<div className="flex justify-between">
								<span>Size:</span>
								<span className="font-medium">{formatFileSize(selectedFile?.size)}</span>
							</div>
							<div className="flex justify-between">
								<span>Type:</span>
								<span className="font-medium">{getFileIcon(selectedFile?.mimeType)}</span>
							</div>
						</div>
						
						{/* Action Buttons */}
						<div className="flex gap-3">
							<button
								onClick={handleCancelFile}
								className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
							>
								Cancel
							</button>
							<button
								onClick={handleSendFile}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
							>
								Send
							</button>
						</div>
					</div>
				</div>
			)}
			
			{mediaBox && (
				<div className="border-slate-500 border rounded-md absolute bottom-[7vh] mb-1 left-2 bg-slate-800 w-80 p-3">
					<div className="flex justify-between items-start mb-2">
						<div className="text-white text-sm">
							<div className="font-medium">{selectedFile?.originalName}</div>
							<div className="text-gray-400 text-xs">
								{getFileIcon(selectedFile?.mimeType)} - {formatFileSize(selectedFile?.size)}
							</div>
						</div>
						<MdOutlineClose
							title="Delete"
							size={20}
							className="cursor-pointer text-white bg-slate-600 rounded-full p-1 hover:bg-slate-500"
							onClick={clearMediaFile}
						/>
					</div>
					
					{/* Display image preview in chat area style */}
					{selectedFile?.mimeType.startsWith('image/') && (
						<div className="relative">
							<img
								src={mediaURL}
								alt="preview"
								className="w-full h-48 object-contain rounded bg-slate-700"
							/>
							<div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
								Image Preview
							</div>
						</div>
					)}
					
					{/* Display video preview in chat area style */}
					{selectedFile?.mimeType.startsWith('video/') && (
						<div className="relative">
							<video
								src={mediaURL}
								className="w-full h-48 object-contain rounded bg-slate-700"
								controls
								preload="metadata"
							/>
							<div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
								Video Preview
							</div>
						</div>
					)}
					
					{/* Display audio preview */}
					{selectedFile?.mimeType.startsWith('audio/') && (
						<div className="bg-slate-700 rounded p-3">
							<div className="text-white text-sm mb-2">Audio Preview</div>
							<audio
								src={mediaURL}
								controls
								className="w-full"
							/>
						</div>
					)}
					
					{/* Display document preview */}
					{!selectedFile?.mimeType.startsWith('image/') && 
					 !selectedFile?.mimeType.startsWith('video/') && 
					 !selectedFile?.mimeType.startsWith('audio/') && (
						<div className="bg-slate-700 rounded p-3">
							<div className="flex items-center gap-3">
								<div className="text-white text-2xl">
									{selectedFile?.mimeType.includes('pdf') && 'PDF'}
									{selectedFile?.mimeType.includes('word') && 'DOC'}
									{selectedFile?.mimeType.includes('text') && 'TXT'}
									{!selectedFile?.mimeType.includes('pdf') && 
									 !selectedFile?.mimeType.includes('word') && 
									 !selectedFile?.mimeType.includes('text') && 'FILE'}
								</div>
								<div className="text-white text-sm flex-1">
									<div className="font-medium">{selectedFile?.originalName}</div>
									<div className="text-gray-400 text-xs">{formatFileSize(selectedFile?.size)}</div>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
			<form
				className="w-full flex items-center gap-1 h-[7vh] p-3 bg-slate-800 text-white"
				onSubmit={(e) => {
					e.preventDefault();
					handleSendMessage();
				}}
			>
				<label htmlFor="media" className="cursor-pointer">
					<FaFolderOpen
						title="Open File"
						size={22}
						className="active:scale-75 hover:text-green-400"
					/>
				</label>
				<input
					ref={mediaFile}
					type="file"
					name="file"
					accept="*/*"
					id="media"
					className="hidden"
					onChange={handleMediaBox}
				/>
				<input
					type="text"
					className="outline-none p-2 w-full bg-transparent"
					placeholder="Type a message"
					value={newMessage}
					onChange={(e) => handleTyping(e)}
				/>
				<span className="flex justify-center items-center">
					{(newMessage?.trim() || selectedFile) && !isSendLoading && (
						<button
							type="submit"
							className="outline-none p-2 border-slate-500 border-l"
						>
							<FaPaperPlane
								title="Send"
								size={18}
								className="active:scale-75 hover:text-green-400"
							/>
						</button>
					)}
					{isSendLoading && (
						<button className="outline-none p-2 border-slate-500 border-l" type="button">
							<LuLoader
								title="loading..."
								fontSize={18}
								className="animate-spin"
							/>
						</button>
					)}
				</span>
			</form>
		</>
	);
};

export default MessageSend;
