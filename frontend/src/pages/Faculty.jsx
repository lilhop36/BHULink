import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import {
  MdChat,
  MdPeople,
  MdLibraryBooks,
  MdHome,
  MdVideoLibrary,
  MdArticle,
  MdNotificationsActive,
  MdKeyboardArrowUp,
  MdKeyboardArrowDown,
  MdAddBox,
  MdMessage,
  MdAnnouncement,
  MdAdd,
  MdEdit,
  MdDelete
} from "react-icons/md";
import { PiUserCircleLight } from "react-icons/pi";
import { IoLogOutOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import UserSearch from "../components/chatComponents/UserSearch";
import MyChat from "../components/chatComponents/MyChat";
import MessageBox from "../components/messageComponents/MessageBox";
import ChatNotSelected from "../components/chatComponents/ChatNotSelected";
import UserSuggestions from "../components/UserSuggestions";
import ResourcesView from "../components/ResourcesView";
import Posts from "./Posts";
import Reels from "./Reels";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import AnnouncementCreate from "../components/AnnouncementCreate";
import {
  setChatDetailsBox,
  setSocketConnected,
  setUserSearchBox,
  setUserSuggestionsBox,
  setHeaderMenu,
  setProfileDetail,
  setNotificationBox,
} from "../redux/slices/conditionSlice";
import socket from "../socket/socket";
import { addAllMessages, addNewMessage } from "../redux/slices/messageSlice";
import {
  addNewChat,
  addNewMessageRecieved,
  deleteSelectedChat,
} from "../redux/slices/myChatSlice";
import { removeAuth } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
import { receivedSound } from "../utils/notificationSound";

let selectedChatCompare;

const Faculty = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const user = useSelector((store) => store?.auth);
  const newMessageRecieved = useSelector(
    (store) => store?.myChat?.newMessageRecieved
  );
  const isHeaderMenu = useSelector((store) => store?.condition?.isHeaderMenu);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isUserSearchBox = useSelector(
    (store) => store?.condition?.isUserSearchBox
  );
  const isUserSuggestionsBox = useSelector(
    (store) => store?.condition?.isUserSuggestionsBox
  );
  const authUserId = useSelector((store) => store?.auth?._id);
  const myChats = useSelector((store) => store?.myChat?.chats);

  const headerUserBox = useRef(null);
  const headerMenuBox = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        headerMenuBox.current &&
        !headerMenuBox.current.contains(event.target) &&
        headerUserBox.current &&
        !headerUserBox.current.contains(event.target)
      ) {
        dispatch(setHeaderMenu(false));
      }
    };

    if (isHeaderMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHeaderMenu, dispatch]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(removeAuth());
    dispatch(setHeaderMenu(false));
    navigate("/signin");
  };

  useEffect(() => {
    if (!authUserId) return;
    socket.emit("setup", authUserId);
    socket.on("connected", () => dispatch(setSocketConnected(true)));
  }, [authUserId, dispatch]);

  useEffect(() => {
    selectedChatCompare = selectedChat;
    const messageHandler = (newMessageReceived) => {
      if (
        selectedChatCompare &&
        selectedChatCompare._id === newMessageReceived.chat._id
      ) {
        dispatch(addNewMessage(newMessageReceived));
      } else {
        receivedSound();
        dispatch(addNewMessageRecieved(newMessageReceived));
      }
    };
    socket.on("message received", messageHandler);

    return () => {
      socket.off("message received", messageHandler);
    };
  });

  useEffect(() => {
    const clearChatHandler = (chatId) => {
      if (chatId === selectedChat?._id) {
        dispatch(addAllMessages([]));
        toast.success("Cleared all messages");
      }
    };
    socket.on("clear chat", clearChatHandler);
    return () => {
      socket.off("clear chat", clearChatHandler);
    };
  });

  useEffect(() => {
    const deleteChatHandler = (chatId) => {
      dispatch(setChatDetailsBox(false));
      if (selectedChat && chatId === selectedChat._id) {
        dispatch(addAllMessages([]));
      }
      dispatch(deleteSelectedChat(chatId));
      toast.success("Chat deleted successfully");
    };
    socket.on("delete chat", deleteChatHandler);
    return () => {
      socket.off("delete chat", deleteChatHandler);
    };
  });

  useEffect(() => {
    const chatCreatedHandler = (chat) => {
      dispatch(addNewChat(chat));
      toast.success("Created & Selected chat");
    };
    socket.on("chat created", chatCreatedHandler);
    return () => {
      socket.off("chat created", chatCreatedHandler);
    };
  });

  const loadAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/announcement`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setAnnouncements(result.data);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    // Implement your edit functionality here
    console.log("Editing announcement:", announcement);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a1a2f]">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-medium"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-fast"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-pulse-slow"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/10 rounded-full animate-particle"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 8 + 5}s`,
            }}
          />
        ))}
      </div>

      {/* FACULTY HEADER */}
      <div className="w-full h-16 fixed top-0 z-50 md:h-20 backdrop-blur-md bg-white/5 border-b border-white/10 shadow-lg flex justify-between items-center px-4 md:px-6 font-semibold text-white">
        <div className="flex items-center gap-3">
          <Link to={"/"} className="transition-transform hover:scale-105">
            <img
              src="/logo.jpeg"
              alt="BHULink"
              className="h-12 w-12 rounded-full shadow-md ring-2 ring-blue-400/50"
            />
          </Link>
          <Link to={"/"}>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              BHULink - Faculty
            </span>
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <button
              className={`relative p-2 rounded-full transition-all duration-300 hover:bg-white/10 ${
                newMessageRecieved.length > 0 ? "animate-pulse" : ""
              }`}
              title={`You have ${newMessageRecieved.length} new notifications`}
              onClick={() => dispatch(setNotificationBox(true))}
            >
              <MdNotificationsActive className="text-2xl text-blue-300" />
              {newMessageRecieved.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {newMessageRecieved.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm text-white/60">Welcome back,</p>
                <p className="font-semibold">{user.firstName} {user.lastName}</p>
              </div>

              <div className="relative">
                <div
                  onClick={() => setShowProfileUpload(true)}
                  className="w-12 h-12 rounded-full border-2 border-blue-400/50 cursor-pointer overflow-hidden hover:border-blue-400 transition-all"
                  title="Click to change profile picture"
                >
                  <img
                    src={
                      user?.image
                        ? (user.image.startsWith('http')
                            ? user.image
                            : `${import.meta.env.VITE_BACKEND_URL}/${user.image}`)
                        : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                    }
                    alt="profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
                    }}
                  />
                </div>

                <div
                  ref={headerMenuBox}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch(setHeaderMenu(!isHeaderMenu));
                  }}
                  className="ml-3 w-8 h-8 rounded-full bg-blue-500/70 hover:bg-blue-500 cursor-pointer flex items-center justify-center transition-all"
                  title="Menu"
                >
                  <MdKeyboardArrowDown 
                    fontSize={16} 
                    className="text-white transition-transform duration-200"
                    style={{
                      transform: isHeaderMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </div>

                {isHeaderMenu && (
                  <div className="absolute top-14 right-0 w-56 bg-[#112240]/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 overflow-hidden z-50">
                    <div
                      onClick={() => {
                        dispatch(setHeaderMenu(false));
                        setShowProfileUpload(true);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-gray-200 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <img
                        src={
                          user?.image
                            ? (user.image.startsWith('http')
                                ? user.image
                                : `${import.meta.env.VITE_BACKEND_URL}/${user.image}`)
                            : "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
                        }
                        alt="profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium">Update Profile Picture</span>
                    </div>

                    <div
                      onClick={() => {
                        dispatch(setHeaderMenu(false));
                        dispatch(setProfileDetail());
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-gray-200 hover:bg-white/10 transition-colors cursor-pointer border-t border-white/10"
                    >
                      <PiUserCircleLight className="text-xl" />
                      <span className="font-medium">View Profile</span>
                    </div>

                    <div
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-gray-200 hover:bg-white/10 transition-colors cursor-pointer border-t border-white/10"
                    >
                      <IoLogOutOutline className="text-xl" />
                      <span className="font-medium">Logout</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-16 md:h-20"></div>

      {/* TAB BAR */}
      <div className="flex flex-wrap justify-center gap-1 md:gap-2 px-4 border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-16 md:top-20 z-40">
        {[
          { id: "home", label: "Home", icon: MdHome },
          { id: "announcements", label: "Announcements", icon: MdAnnouncement },
          { id: "posts", label: "Posts", icon: MdArticle },
          { id: "chat", label: "Chat", icon: MdChat },
          { id: "reels", label: "Reels", icon: MdVideoLibrary },
          { id: "resources", label: "Resources", icon: MdLibraryBooks },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm md:text-base font-medium transition-all duration-300 rounded-t-lg ${
              activeTab === tab.id
                ? "text-blue-300 bg-white/5 shadow-inner border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="text-lg" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 py-6 max-w-7xl relative z-10">
        {/* HOME TAB */}
        {activeTab === "home" && (
          <div className="space-y-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a192f]/80 via-[#112240]/80 to-[#0a1a2f]/80 backdrop-blur-sm border border-white/10 p-6 md:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
              <div className="relative z-10">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                  Welcome back, {user?.firstName || "Faculty"}!
                </h1>
                <p className="text-white/70 text-lg max-w-2xl">
                  Stay connected with students, manage resources, and keep up with the latest posts and reels.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl transition-all hover:scale-105 hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Total Chats</p>
                    <p className="text-3xl font-bold text-white">{myChats?.length || 0}</p>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-full">
                    <MdChat className="text-2xl text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl transition-all hover:scale-105 hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Unread Messages</p>
                    <p className="text-3xl font-bold text-white">{newMessageRecieved?.length || 0}</p>
                  </div>
                  <div className="bg-red-500/20 p-3 rounded-full">
                    <MdMessage className="text-2xl text-red-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl transition-all hover:scale-105 hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Resources Shared</p>
                    <p className="text-3xl font-bold text-white">24</p>
                  </div>
                  <div className="bg-emerald-500/20 p-3 rounded-full">
                    <MdLibraryBooks className="text-2xl text-emerald-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl transition-all hover:scale-105 hover:bg-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Active Now</p>
                    <p className="text-3xl font-bold text-white">12</p>
                  </div>
                  <div className="bg-cyan-500/20 p-3 rounded-full">
                    <MdPeople className="text-2xl text-cyan-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#112240]/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MdAddBox className="text-blue-400" /> Quick Actions
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab("announcements")}
                    className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition"
                  >
                    <MdAnnouncement className="inline mr-2" />
                    Create Announcement
                  </button>
                  <button
                    onClick={() => setActiveTab("posts")}
                    className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg hover:bg-amber-500/30 transition"
                  >
                    <MdArticle className="inline mr-2" />
                    Create Post
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition"
                  >
                    <MdChat className="inline mr-2" />
                    Start Chat
                  </button>
                  <button
                    onClick={() => setActiveTab("resources")}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition"
                  >
                    <MdLibraryBooks className="inline mr-2" />
                    Add Resource
                  </button>
                  <button
                    onClick={() => setActiveTab("reels")}
                    className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition"
                  >
                    <MdVideoLibrary className="inline mr-2" />
                    Upload Reel
                  </button>
                </div>
              </div>

              <div className="bg-[#112240]/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MdNotificationsActive className="text-blue-400" /> Recent Activity
                </h2>
                <div className="space-y-3 text-white/70">
                  <p className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    New comment on your post
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Student requested resource access
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    Upcoming webinar tomorrow
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center py-6 text-white/40 text-sm italic">
              "Empowering education through seamless collaboration."
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MdAnnouncement className="text-blue-400" />
                  Announcements ({announcements.length})
                </h2>
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-500/30 hover:bg-blue-500/30 transition"
                >
                  <MdAdd className="text-blue-300" />
                  <span className="text-blue-300">Create Announcement</span>
                </button>
              </div>
              
              {announcements.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MdAnnouncement className="text-5xl mx-auto mb-3 opacity-50" />
                  <p>No announcements have been created yet.</p>
                  <p className="text-sm mt-2">Click "Create Announcement" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{announcement.title}</h3>
                          <p className="text-gray-300 text-sm mb-2 line-clamp-2">{announcement.content}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              announcement.visibility === 'public' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {announcement.visibility.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              announcement.type === 'job' ? 'bg-purple-500/20 text-purple-300' :
                              announcement.type === 'event' ? 'bg-indigo-500/20 text-indigo-300' :
                              announcement.type === 'academic' ? 'bg-cyan-500/20 text-cyan-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                              {announcement.type.toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              announcement.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                              announcement.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>
                              {announcement.priority.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>By {announcement.author?.firstName} {announcement.author?.lastName}</span>
                            <span>Target: {announcement.targetAudience?.join(", ") || "All"}</span>
                            <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleEditAnnouncement(announcement)}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <MdEdit size={16} />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this announcement?")) {
                                  const deleteAnnouncement = async () => {
                                    try {
                                      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/announcement/${announcement._id}`, {
                                        method: "DELETE",
                                        headers: {
                                          "Authorization": `Bearer ${localStorage.getItem("token")}`
                                        }
                                      });

                                      const result = await response.json();
                                      
                                      if (result.success) {
                                        toast.success("Announcement deleted successfully!");
                                        setAnnouncements(prev => prev.filter(ann => ann._id !== announcement._id));
                                      } else {
                                        toast.error(result.message || "Failed to delete announcement");
                                      }
                                    } catch (error) {
                                      console.error("Error deleting announcement:", error);
                                      toast.error("Failed to delete announcement");
                                    }
                                  };

                                  deleteAnnouncement();
                                }
                              }}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <MdDelete size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* POSTS TAB */}
        {activeTab === "posts" && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <Posts />
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === "chat" && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="flex flex-wrap w-full min-h-[80vh]">
              {authUserId ? (
                <>
                  <div
                    className={`${
                      selectedChat ? "hidden sm:block" : "block"
                    } w-full sm:w-[40%] lg:w-[35%] border-r border-white/10 bg-black/20`}
                  >
                    <div className="relative h-full">
                      <div className="absolute bottom-4 right-4 flex gap-3 z-10">
                        <button
                          title="Friend Suggestions"
                          onClick={() => dispatch(setUserSuggestionsBox())}
                          className="p-2 bg-blue-500/80 rounded-full shadow-lg hover:scale-110 transition text-white"
                        >
                          <MdPeople size={24} />
                        </button>
                        <button
                          title="New Chat"
                          onClick={() => dispatch(setUserSearchBox())}
                          className="p-2 bg-cyan-500/80 rounded-full shadow-lg hover:scale-110 transition text-white"
                        >
                          <MdChat size={24} />
                        </button>
                      </div>
                      {isUserSearchBox ? (
                        <UserSearch />
                      ) : isUserSuggestionsBox ? (
                        <UserSuggestions />
                      ) : (
                        <MyChat />
                      )}
                    </div>
                  </div>
                  <div
                    className={`${
                      !selectedChat ? "hidden sm:block" : "block"
                    } w-full sm:w-[60%] lg:w-[65%] bg-black/20`}
                  >
                    {selectedChat ? (
                      <MessageBox chatId={selectedChat?._id} />
                    ) : (
                      <ChatNotSelected />
                    )}
                  </div>
                </>
              ) : (
                <div className="w-full h-[80vh] flex items-center justify-center">
                  <div className="text-center text-white bg-white/10 backdrop-blur-sm p-8 rounded-2xl">
                    <h2 className="text-3xl mb-4 font-bold">Welcome to BHULink</h2>
                    <p className="mb-6">Please sign in to start chatting and posting.</p>
                    <div className="flex gap-4 justify-center">
                      <Link
                        to="/signin"
                        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="px-6 py-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 transition shadow-lg"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REELS TAB */}
        {activeTab === "reels" && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <Reels />
          </div>
        )}

        {/* RESOURCES TAB */}
        {activeTab === "resources" && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
            <ResourcesView />
          </div>
        )}

        {showProfileUpload && (
          <ProfilePictureUpload onClose={() => setShowProfileUpload(false)} />
        )}

        {/* Announcement modal rendered via PORTAL */}
        {showAnnouncementModal && ReactDOM.createPortal(
          <AnnouncementCreate
            onClose={() => setShowAnnouncementModal(false)}
            onAnnouncementCreated={(newAnnouncement) => {
              setAnnouncements(prev => [newAnnouncement, ...prev]);
              toast.success("Announcement created successfully!");
            }}
          />,
          document.body
        )}
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.05); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 20px) scale(1.1); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 15px) scale(1.08); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.05); }
        }
        @keyframes particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 8s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 6s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-particle {
          animation: particle linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Faculty;