import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	addSelectedChat,
	removeNewMessageRecieved,
} from "../redux/slices/myChatSlice";
import { setNotificationBox } from "../redux/slices/conditionSlice";
import { MdOutlineClose, MdMessage, MdPersonAdd } from "react-icons/md";
import { SimpleDateAndTime } from "../utils/formateDateTime";
import getChatName from "../utils/getChatName";
import FollowNotification from "./FollowNotification";
import socket from "../socket/socket";

const EnhancedNotificationBox = () => {
	const authUserId = useSelector((store) => store?.auth?._id);
	const dispatch = useDispatch();
	const newMessageRecieved = useSelector((store) => store?.myChat?.newMessageRecieved);
	const [followNotifications, setFollowNotifications] = useState([]);
	const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'follows'

	// Listen for follow notifications
	useEffect(() => {
		const handleNewNotification = (notification) => {
			console.log('🔔 New notification received:', notification);
			if (notification.type === 'follow') {
				console.log('✅ Follow notification added:', notification);
				setFollowNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep max 10
			}
		};

		// Listen for socket events
		const socket = window.socket;
		console.log('🔌 Socket available:', !!socket);
		if (socket) {
			socket.on('newNotification', handleNewNotification);
			console.log('✅ Socket listener attached for newNotification');
		}

		return () => {
			if (socket) {
				socket.off('newNotification', handleNewNotification);
			}
		};
	}, []);

	const handleDismissFollowNotification = (notificationId) => {
		setFollowNotifications(prev => prev.filter(n => n._id !== notificationId));
	};

	const messageCount = newMessageRecieved.length;
	const followCount = followNotifications.length;
	const totalNotifications = messageCount + followCount;

	return (
		<div className="flex -m-2 sm:-m-4 flex-col items-center my-6 text-slate-300 min-h-screen w-full fixed top-0 justify-center z-50">
			<div className="p-3 pt-4 w-[80%] sm:w-[60%] md:w-[50%] lg:w-[40%] min-w-72 max-w-[1000px] border border-slate-400 bg-slate-800 rounded-lg h-fit mt-5 transition-all relative">
				<h2 className="text-2xl underline underline-offset-8 font-semibold text-slate-100 w-full text-center mb-2">
					Notifications
				</h2>
				
				{totalNotifications > 0 && (
					<p className="px-4 pt-2 text-center">
						You have {totalNotifications} new notifications
					</p>
				)}

				{/* Tab Navigation */}
				<div className="flex border-b border-slate-600 mx-4 mb-4">
					<button
						onClick={() => setActiveTab('messages')}
						className={`flex-1 py-2 px-4 text-sm font-medium transition-colors relative ${
							activeTab === 'messages' 
								? 'text-blue-400 border-b-2 border-blue-400' 
								: 'text-gray-400 hover:text-white'
						}`}
					>
						<div className="flex items-center justify-center gap-2">
							<MdMessage size={16} />
							Messages
							{messageCount > 0 && (
								<span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
									{messageCount}
								</span>
							)}
						</div>
					</button>
					<button
						onClick={() => setActiveTab('follows')}
						className={`flex-1 py-2 px-4 text-sm font-medium transition-colors relative ${
							activeTab === 'follows' 
								? 'text-blue-400 border-b-2 border-blue-400' 
								: 'text-gray-400 hover:text-white'
						}`}
					>
						<div className="flex items-center justify-center gap-2">
							<MdPersonAdd size={16} />
							Follows
							{followCount > 0 && (
								<span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
									{followCount}
								</span>
							)}
						</div>
					</button>
				</div>

				<div className="w-full py-4 justify-evenly flex flex-wrap items-center gap-3">
					<div className="flex flex-col w-full px-4 gap-3 py-2 overflow-y-auto overflow-hidden scroll-style h-[50vh]">
						{activeTab === 'messages' ? (
							<>
								{newMessageRecieved?.length === 0 ? (
									<div className="w-full h-full flex justify-center items-center text-white">
										<h1 className="text-base font-semibold">
											No new messages
										</h1>
									</div>
								) : (
									newMessageRecieved?.map((message) => (
										<div
											key={message?._id}
											className="w-full h-16 border-slate-500 border rounded-lg flex justify-start items-center p-2 font-normal gap-2 hover:bg-black/50 transition-all cursor-pointer text-white"
											onClick={() => {
												dispatch(removeNewMessageRecieved(message));
												dispatch(addSelectedChat(message?.chat));
												dispatch(setNotificationBox(false));
											}}
										>
											<div className="w-full">
												<span className="line-clamp-1 capitalize">
													New message{" "}
													{message?.chat?.isGroupChat &&
														"in " + getChatName(message?.chat, authUserId)}{" "}
													from{" "}
													{message?.sender?.firstName}{" "}
													:{" "}
													<span className="text-green-400">
														{message?.message}
													</span>
												</span>
												<span className="text-xs font-light">
													{SimpleDateAndTime(message?.createdAt)}
												</span>
											</div>
										</div>
									))
								)}
							</>
						) : (
							<>
								{followNotifications?.length === 0 ? (
									<div className="w-full h-full flex justify-center items-center text-white">
										<h1 className="text-base font-semibold">
											No new follow notifications
										</h1>
									</div>
								) : (
									followNotifications?.map((notification) => (
										<FollowNotification
											key={notification._id}
											notification={notification}
											onDismiss={handleDismissFollowNotification}
										/>
									))
								)}
							</>
						)}
					</div>
				</div>
				
				<div
					title="Close"
					onClick={() => dispatch(setNotificationBox(false))}
					className="bg-black/15 hover:bg-black/50 h-7 w-7 rounded-md flex items-center justify-center absolute top-2 right-3 cursor-pointer"
				>
					<MdOutlineClose size={22} />
				</div>
			</div>
		</div>
	);
};

export default EnhancedNotificationBox;
