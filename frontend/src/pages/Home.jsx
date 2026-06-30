import React, { useEffect, useState, useRef } from "react";
import { MdChat, MdPeople, MdAttachFile } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import UserSearch from "../components/chatComponents/UserSearch";
import MyChat from "../components/chatComponents/MyChat";
import MessageBox from "../components/messageComponents/MessageBox";
import ChatNotSelected from "../components/chatComponents/ChatNotSelected";
import UserSuggestions from "../components/UserSuggestions";
import FileUploadTest from "../components/FileUploadTest";
import {
  setChatDetailsBox,
  setSocketConnected,
  setUserSearchBox,
  setUserSuggestionsBox,
} from "../redux/slices/conditionSlice";
import socket from "../socket/socket";
import { addAllMessages, addNewMessage } from "../redux/slices/messageSlice";
import {
  addNewChat,
  addNewMessageRecieved,
  deleteSelectedChat,
} from "../redux/slices/myChatSlice";
import { toast } from "react-toastify";
import { receivedSound } from "../utils/notificationSound";

let selectedChatCompare;

const Home = () => {
  const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
  const user = useSelector((store) => store?.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isUserSearchBox = useSelector((store) => store?.condition?.isUserSearchBox);
  const isUserSuggestionsBox = useSelector((store) => store?.condition?.isUserSuggestionsBox);
  const authUserId = useSelector((store) => store?.auth?._id);

  // File send states - FIXED
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePopup, setShowFilePopup] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Socket connection
  useEffect(() => {
    if (!authUserId) return;
    socket.emit("setup", authUserId);
    socket.on("connected", () => dispatch(setSocketConnected(true)));
  }, [authUserId]);

  // Socket message received
  useEffect(() => {
    selectedChatCompare = selectedChat;
    const messageHandler = (newMessageReceived) => {
      if (selectedChatCompare && selectedChatCompare._id === newMessageReceived.chat._id) {
        dispatch(addNewMessage(newMessageReceived));
      } else {
        receivedSound();
        dispatch(addNewMessageRecieved(newMessageReceived));
      }
    };
    socket.on("message received", messageHandler);
    return () => socket.off("message received", messageHandler);
  });

  // Socket clear chat
  useEffect(() => {
    const clearChatHandler = (chatId) => {
      if (chatId === selectedChat?._id) {
        dispatch(addAllMessages([]));
        toast.success("Cleared all messages");
      }
    };
    socket.on("clear chat", clearChatHandler);
    return () => socket.off("clear chat", clearChatHandler);
  });

  // Socket delete chat
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
    return () => socket.off("delete chat", deleteChatHandler);
  });

  // Socket chat created
  useEffect(() => {
    const chatCreatedHandler = (chat) => {
      dispatch(addNewChat(chat));
      toast.success("Created & Selected chat");
    };
    socket.on("chat created", chatCreatedHandler);
    return () => socket.off("chat created", chatCreatedHandler);
  });

  // ----- File handlers (only one handleFileSelect) -----
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setFilePreviewUrl(null);
    }
    setShowFilePopup(true);
    event.target.value = null; // allow re-selecting same file
  };

  const handleSendFile = async () => {
    console.log('handleSendFile called');
    console.log('selectedFile:', selectedFile);
    console.log('selectedChat:', selectedChat);
    
    if (!selectedFile || !selectedChat) {
      toast.error("No file or chat selected");
      return;
    }
    
    console.log('Starting file upload...');
    setIsSendingFile(true);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("chatId", selectedChat._id);
      
      console.log('Making fetch request...');
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Success response:', data);
      
      console.log('Sending socket message...');
      // Emit the *actual saved message* object so backend can route it to chat users
      socket.emit("new message", data.messageData);
      
      console.log('Socket message sent');
      
      toast.success("File sent!");
      setShowFilePopup(false);
      setSelectedFile(null);
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(null);
      }
      
    } catch (error) {
      console.error("Send file error:", error);
      toast.error(error.message || "Failed to send file");
    } finally {
      setIsSendingFile(false);
    }
  };

  const handleCancelFile = () => {
    setShowFilePopup(false);
    setSelectedFile(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
  };

  return (
    <div className="w-full">
      {authUserId ? (
        <>
          <div className="flex w-full border-slate-500 border rounded-sm shadow-md shadow-black relative">
            {/* Left sidebar */}
            <div
              className={`${
                selectedChat && "hidden"
              } sm:block sm:w-[40%] w-full h-[80vh] bg-black/40 border-r border-slate-500 relative`}
            >
              <div className="absolute bottom-3 right-6 cursor-pointer text-white flex space-x-2">
                <MdPeople
                  title="Friend Suggestions"
                  fontSize={32}
                  onClick={() => dispatch(setUserSuggestionsBox())}
                />
                <MdChat
                  title="New Chat"
                  fontSize={32}
                  onClick={() => dispatch(setUserSearchBox())}
                />
              </div>
              {isUserSearchBox ? <UserSearch /> : isUserSuggestionsBox ? <UserSuggestions /> : <MyChat />}
            </div>

            {/* Right chat area */}
            <div
              className={`${
                !selectedChat && "hidden"
              } sm:block sm:w-[60%] w-full h-[80vh] bg-black/40 relative overflow-hidden`}
            >
              {selectedChat ? (
                <>
                  <MessageBox chatId={selectedChat?._id} />
                  {/* Floating file attach button */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition"
                      title="Attach file"
                    >
                      <MdAttachFile size={24} />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </>
              ) : (
                <ChatNotSelected />
              )}
            </div>
          </div>

          {/* File confirmation popup */}
          {showFilePopup && selectedFile && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-5">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <MdAttachFile className="text-blue-500" />
                  Send file
                </h3>
                <div className="mb-4">
                  <p className="text-gray-700 break-all">
                    <strong>Name:</strong> {selectedFile.name}
                  </p>
                  <p className="text-gray-700">
                    <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  {filePreviewUrl && (
                    <div className="mt-3">
                      <img src={filePreviewUrl} alt="Preview" className="max-h-40 rounded border" />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCancelFile}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                    disabled={isSendingFile}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendFile}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1"
                    disabled={isSendingFile}
                  >
                    {isSendingFile ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-[80vh] bg-black/40 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl mb-4">Welcome to BHULink</h2>
            <p className="mb-4">Please sign in to start chatting and posting.</p>
            <Link to="/signin" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Sign In
            </Link>
            <Link to="/signup" className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;