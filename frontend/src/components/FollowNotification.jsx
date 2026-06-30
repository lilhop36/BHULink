import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { addFollowing } from "../redux/slices/authSlice";
import { MdPersonAdd, MdPersonRemove, MdClose } from "react-icons/md";

const FollowNotification = ({ notification, onDismiss }) => {
  const authUser = useSelector((store) => store?.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleFollowBack = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/follow/${notification.sender._id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      const json = await response.json();
      if (json.message) {
        toast.success(`You are now following ${notification.sender.firstName}!`);
        dispatch(addFollowing(notification.sender._id));
        onDismiss(notification._id); // Remove notification after follow back
      }
    } catch (error) {
      console.error("Error following back:", error);
      toast.error("Error following back");
    }
    setLoading(false);
  };

  const getUserInitials = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    } else if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    }
    return 'Someone';
  };

  // Check if already following this user
  const isAlreadyFollowing = authUser?.following?.includes(notification.sender._id);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center flex-1">
          <div className="relative">
            {notification.sender.image ? (
              <img
                src={notification.sender.image}
                alt={getDisplayName(notification.sender)}
                className="w-10 h-10 rounded-full mr-3 border-2 border-white/30 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            {/* Fallback with initials */}
            <div 
              className={`w-10 h-10 rounded-full mr-3 border-2 border-white/30 flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-500 to-purple-600 ${notification.sender.image ? 'hidden' : 'flex'}`}
              style={{ display: notification.sender.image ? 'none' : 'flex' }}
            >
              {getUserInitials(notification.sender)}
            </div>
            {/* Follow indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <MdPersonAdd size={10} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm">
              <span className="font-semibold">{getDisplayName(notification.sender)}</span>
              <span className="text-gray-300"> started following you</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-3">
          {!isAlreadyFollowing ? (
            <button
              onClick={handleFollowBack}
              disabled={loading}
              className="px-3 py-1 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600/80 text-xs font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Follow back"
            >
              {loading ? (
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <MdPersonAdd size={12} />
                  Follow Back
                </>
              )}
            </button>
          ) : (
            <span className="text-xs text-green-400 font-medium">Following</span>
          )}
          
          <button
            onClick={() => onDismiss(notification._id)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Dismiss notification"
          >
            <MdClose size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FollowNotification;
