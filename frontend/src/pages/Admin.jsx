// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  MdDashboard, 
  MdPeople, 
  MdSchool, 
  MdLibraryBooks, 
  MdDelete, 
  MdRefresh,
  MdArticle,
  MdVideoLibrary,
  MdMessage,
  MdLogout,
  MdReport,
  MdTrendingUp,
  MdNotifications,
  MdVisibility,
  MdAnnouncement,
  MdAdd,
  MdClose,
  MdSave,
  MdEdit
} from 'react-icons/md';
import { getResources, deleteResource } from '../services/resourceService';
import { useDispatch, useSelector } from 'react-redux';
import { removeAuth } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AnnouncementCreate from '../components/AnnouncementCreate';
import { getChatImage } from "../utils/getChatImage";

// Helper function to get user initials
const getUserInitials = (user) => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  } else if (user?.firstName) {
    return user.firstName.charAt(0).toUpperCase();
  } else if (user?.email) {
    return user.email.charAt(0).toUpperCase();
  }
  return 'U';
};

// Helper function to get user display name
const getDisplayName = (user) => {
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user?.firstName) {
    return user.firstName;
  } else if (user?.email) {
    return user.email.split('@')[0];
  }
  return 'Unknown User';
};

const Admin = () => {
  const [resources, setResources] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showReelModal, setShowReelModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editingReel, setEditingReel] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    department: '',
    isActive: true
  });
  const [postFormData, setPostFormData] = useState({
    content: '',
    image: ''
  });
  const [reelFormData, setReelFormData] = useState({
    content: '',
    video: ''
  });
  const [resourceFormData, setResourceFormData] = useState({
    title: '',
    description: '',
    department: '',
    file: ''
  });
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    visibility: 'public',
    targetAudience: []
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [stats, setStats] = useState({
    totalResources: 0,
    totalFaculty: 0,
    totalStudents: 0,
    totalPosts: 0,
    totalReels: 0,
    totalChats: 0,
    reportedPosts: 0,
    reportedReels: 0,
    activeUsers: 0
  });
  const [reports, setReports] = useState({
    posts: [],
    reels: []
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store?.auth);

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(removeAuth());
    navigate("/signin");
    toast.success("Logged out successfully");
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch real statistics from backend
      const statsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const statsData = await statsResponse.json();
      
      if (statsResponse.ok) {
        // Fetch reported content
        const reportsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/reports`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const reportsData = await reportsResponse.json();
        
        if (reportsResponse.ok) {
          setStats(statsData.data);
          setReports({
            posts: reportsData.data.posts.map(post => ({
              id: post._id,
              title: post.content.substring(0, 50) + '...',
              author: post.user?.firstName + ' ' + post.user?.lastName || 'Unknown',
              reports: post.reports
            })),
            reels: reportsData.data.reels.map(reel => ({
              id: reel._id,
              title: reel.content.substring(0, 50) + '...',
              author: reel.user?.firstName + ' ' + reel.user?.lastName || 'Unknown',
              reports: reel.reports
            }))
          });
        }
      } else {
        throw new Error(statsData.message);
      }
      
      // Load resources (existing logic)
      const allResources = getResources();
      setResources(allResources);
      
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load statistics');
      
      // Fallback to mock data if API fails
      const allResources = getResources();
      const uniqueFaculty = new Set(allResources.map((r) => r.facultyId));
      
      setStats({
        totalResources: allResources.length,
        totalFaculty: uniqueFaculty.size,
        totalStudents: 12580,
        totalPosts: 2,
        totalReels: 2,
        totalChats: 3420,
        reportedPosts: 1,
        reportedReels: 1,
        activeUsers: 8920
      });
      
      setResources(allResources);
    }
  };

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

  
  const loadPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Loading posts from:', `${import.meta.env.VITE_BACKEND_URL}/api/admin/posts`);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Posts response status:', response.status);
      const result = await response.json();
      console.log('Posts response data:', result);
      
      if (response.ok) {
        setPosts(result.data);
        console.log('Posts loaded successfully:', result.data?.length || 0);
      } else {
        console.error('Posts API error:', result.message);
        toast.error(result.message || 'Failed to load posts');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    }
  };

  const loadReels = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Loading reels from:', `${import.meta.env.VITE_BACKEND_URL}/api/admin/reels`);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/reels`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Reels response status:', response.status);
      const result = await response.json();
      console.log('Reels response data:', result);
      
      if (response.ok) {
        setReels(result.data);
        console.log('Reels loaded successfully:', result.data?.length || 0);
      } else {
        console.error('Reels API error:', result.message);
        toast.error(result.message || 'Failed to load reels');
      }
    } catch (error) {
      console.error('Error loading reels:', error);
      toast.error('Failed to load reels');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Post deleted successfully');
        loadPosts();
      } else {
        toast.error(result.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteReel = async (reelId) => {
    if (!window.confirm('Are you sure you want to delete this reel? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/reels/${reelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Reel deleted successfully');
        loadReels();
      } else {
        toast.error(result.message || 'Failed to delete reel');
      }
    } catch (error) {
      console.error('Error deleting reel:', error);
      toast.error('Failed to delete reel');
    }
  };

  const handleViewContent = (content, type) => {
    setSelectedContent({ ...content, type });
    setShowContentModal(true);
  };

  // User management functions
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Authentication required');
        return;
      }

      console.log('Loading users from admin API...');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('Users loaded successfully:', result.data?.length || 0);
        setUsers(result.data || []);
      } else {
        console.error('API Error:', result.message);
        toast.error(result.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleCreateUser = async (e) => {
    console.log('🔥🔥🔥 FORM SUBMISSION STARTED 🔥🔥🔥');
    e.preventDefault();
    
    console.log('📝 Current form data:', userFormData);
    console.log('📤 Form data JSON:', JSON.stringify(userFormData, null, 2));
    
    if (!userFormData.firstName || !userFormData.lastName || !userFormData.email) {
      console.log('❌ FORM VALIDATION FAILED - Missing required fields');
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      console.log('📡 Making API call to:', `${import.meta.env.VITE_BACKEND_URL}/api/auth2/register`);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth2/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userFormData)
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      const result = await response.json();
      console.log('📥 Response data:', result);
      console.log('📥 Response data JSON:', JSON.stringify(result, null, 2));
      
      if (response.ok) {
        console.log('✅ SUCCESS - User created, updating UI');
        toast.success('User created successfully');
        setShowUserModal(false);
        resetUserForm();
        loadUsers();
      } else {
        console.log('❌ FAILED - Backend returned error:', result.message);
        toast.error(result.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('❌ CATCH - Frontend error:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const updateData = { ...userFormData };
      delete updateData.password; // Don't send password in update
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('User updated successfully');
        setShowUserModal(false);
        setEditingUser(null);
        resetUserForm();
        loadUsers();
      } else {
        toast.error(result.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('User deleted successfully');
        loadUsers();
      } else {
        toast.error(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        role: user.role,
        department: user.department || '',
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      resetUserForm();
    }
    setShowUserModal(true);
  };

  const resetUserForm = () => {
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: '',
      department: '',
      isActive: true
    });
  };

  const resetPostForm = () => {
    setPostFormData({
      content: '',
      image: ''
    });
  };

  const resetReelForm = () => {
    setReelFormData({
      content: '',
      video: ''
    });
  };

  const resetResourceForm = () => {
    setResourceFormData({
      title: '',
      description: '',
      department: '',
      file: ''
    });
  };

  const resetAnnouncementForm = () => {
    setAnnouncementFormData({
      title: '',
      content: '',
      type: 'general',
      priority: 'medium',
      visibility: 'public',
      targetAudience: []
    });
  };

  const openAnnouncementModal = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setAnnouncementFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type || 'general',
        priority: announcement.priority || 'medium',
        visibility: announcement.visibility || 'public',
        targetAudience: announcement.targetAudience || []
      });
    } else {
      setEditingAnnouncement(null);
      resetAnnouncementForm();
    }
    setShowAnnouncementModal(true);
  };

  const openPostModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setPostFormData({
        content: post.content,
        image: post.image || ''
      });
    } else {
      setEditingPost(null);
      resetPostForm();
    }
    setShowPostModal(true);
  };

  const openReelModal = (reel = null) => {
    if (reel) {
      setEditingReel(reel);
      setReelFormData({
        content: reel.content,
        video: reel.video || ''
      });
    } else {
      setEditingReel(null);
      resetReelForm();
    }
    setShowReelModal(true);
  };

  const openResourceModal = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setResourceFormData({
        title: resource.title,
        description: resource.description,
        department: resource.department || '',
        file: resource.file || ''
      });
    } else {
      setEditingResource(null);
      resetResourceForm();
    }
    setShowResourceModal(true);
  };

  const handleUserInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePostInputChange = (e) => {
    const { name, value } = e.target;
    setPostFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReelInputChange = (e) => {
    const { name, value } = e.target;
    setReelFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResourceInputChange = (e) => {
    const { name, value } = e.target;
    setResourceFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAnnouncementInputChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const loadData = () => {
    loadStats();
    loadAnnouncements();
    loadUsers();
    loadPosts();
    loadReels();
    loadResources();
    loadChats();
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Delete this resource? This action cannot be undone.')) {
      deleteResource(id);
      loadData();
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleDismissReport = async (type, id) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/dismiss/${type}/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message);
        loadData(); // Refresh the data
      } else {
        toast.error(result.message || 'Failed to dismiss report');
      }
    } catch (error) {
      console.error('Error dismissing report:', error);
      toast.error('Error dismissing report');
    }
  };

  const loadResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/resources`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setResources(result.data);
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources');
    }
  };

  const loadChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setChats(result.data);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Resource deleted successfully');
        loadResources();
      } else {
        toast.error(result.message || 'Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Chat deleted successfully');
        loadChats();
      } else {
        toast.error(result.message || 'Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/posts/${editingPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postFormData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Post updated successfully');
        setShowPostModal(false);
        setEditingPost(null);
        resetPostForm();
        loadPosts();
      } else {
        toast.error(result.message || 'Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleUpdateReel = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/reels/${editingReel._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reelFormData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Reel updated successfully');
        setShowReelModal(false);
        setEditingReel(null);
        resetReelForm();
        loadReels();
      } else {
        toast.error(result.message || 'Failed to update reel');
      }
    } catch (error) {
      console.error('Error updating reel:', error);
      toast.error('Failed to update reel');
    }
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/resources/${editingResource._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resourceFormData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Resource updated successfully');
        setShowResourceModal(false);
        setEditingResource(null);
        resetResourceForm();
        loadResources();
      } else {
        toast.error(result.message || 'Failed to update resource');
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      toast.error('Failed to update resource');
    }
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/announcement/${editingAnnouncement._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(announcementFormData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Announcement updated successfully');
        setShowAnnouncementModal(false);
        setEditingAnnouncement(null);
        resetAnnouncementForm();
        loadAnnouncements();
      } else {
        toast.error(result.message || 'Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/announcement/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Announcement deleted successfully');
        loadAnnouncements();
      } else {
        toast.error(result.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <MdDashboard className="text-blue-400" />
              Admin Dashboard
            </h1>
            <p className="text-indigo-200 mt-1">Platform overview & content management</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/30 hover:bg-white/20 transition"
            >
              <MdRefresh className="text-white" />
              <span className="text-white">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-md rounded-xl border border-red-500/30 hover:bg-red-500/30 transition"
            >
              <MdLogout className="text-red-300" />
              <span className="text-red-300">Logout</span>
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm text-gray-300">Logged in as</p>
              <p className="font-semibold">{user?.firstName} {user?.lastName} (Admin)</p>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">Active</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: MdDashboard },
              { id: 'users', label: 'Users', icon: MdPeople },
              { id: 'posts', label: 'Posts', icon: MdArticle },
              { id: 'reels', label: 'Reels', icon: MdVideoLibrary },
              { id: 'reports', label: 'Reports', icon: MdReport },
              { id: 'announcements', label: 'Announcements', icon: MdAnnouncement },
              { id: 'resources', label: 'Resources', icon: MdLibraryBooks },
              { id: 'chats', label: 'Chats', icon: MdMessage },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white shadow-lg border border-white/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="text-lg" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections based on active tab */}
        {activeTab === 'overview' && (
          <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Users</p>
                <p className="text-4xl font-bold text-white">{(stats.totalStudents + stats.totalFaculty).toLocaleString()}</p>
              </div>
              <MdPeople className="text-4xl text-blue-400 opacity-80" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Posts</p>
                <p className="text-4xl font-bold text-white">{stats.totalPosts.toLocaleString()}</p>
              </div>
              <MdArticle className="text-4xl text-purple-400 opacity-80" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Reels</p>
                <p className="text-4xl font-bold text-white">{stats.totalReels.toLocaleString()}</p>
              </div>
              <MdVideoLibrary className="text-4xl text-amber-400 opacity-80" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Chats</p>
                <p className="text-4xl font-bold text-white">{stats.totalChats.toLocaleString()}</p>
              </div>
              <MdMessage className="text-4xl text-green-400 opacity-80" />
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <MdReport className="text-red-400" />
              Reported Posts ({stats.reportedPosts})
            </h2>
            {reports.posts.length === 0 ? (
              <div className="text-center py-8 text-gray-300">
                <p>No reported posts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.posts.map((post) => (
                  <div key={post.id} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{post.title}</p>
                      <p className="text-gray-300 text-sm">by {post.author}</p>
                      <p className="text-red-400 text-sm">{post.reports} reports</p>
                    </div>
                    <button
                      onClick={() => handleDismissReport('post', post.id)}
                      className="px-3 py-1 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <MdReport className="text-red-400" />
              Reported Reels ({stats.reportedReels})
            </h2>
            {reports.reels.length === 0 ? (
              <div className="text-center py-8 text-gray-300">
                <p>No reported reels</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.reels.map((reel) => (
                  <div key={reel.id} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{reel.title}</p>
                      <p className="text-gray-300 text-sm">by {reel.author}</p>
                      <p className="text-red-400 text-sm">{reel.reports} reports</p>
                    </div>
                    <button
                      onClick={() => handleDismissReport('reel', reel.id)}
                      className="px-3 py-1 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MdPeople className="text-blue-400" />
                User Management ({users.length})
              </h2>
              <button
                onClick={() => openUserModal()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-500/30 hover:bg-blue-500/30 transition"
              >
                <MdAdd className="text-blue-300" />
                <span className="text-blue-300">Create User</span>
              </button>
            </div>
            
            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-300">
                <MdPeople className="text-5xl mx-auto mb-3 opacity-50" />
                <p>No users have been created yet.</p>
                <p className="text-sm mt-2">Click "Create User" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative">
                            {user.image ? (
                              <img
                                src={user.image.startsWith('http') ? user.image : `${import.meta.env.VITE_BACKEND_URL}/${user.image}`}
                                alt={getDisplayName(user)}
                                className="w-10 h-10 rounded-full border border-white/20 object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            {/* Fallback with initials */}
                            <div 
                              className={`w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-500 to-purple-600 ${user.image ? 'hidden' : 'flex'}`}
                              style={{ display: user.image ? 'none' : 'flex' }}
                            >
                              {getUserInitials(user)}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-500/20 text-red-300' :
                            user.role === 'faculty' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {user.role?.toUpperCase() || 'USER'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                          }`}>
                            {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                          {user.lastLogin && (
                            <span>Last Login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openUserModal(user)}
                          className="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition flex items-center gap-2"
                        >
                          <MdEdit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="px-3 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition flex items-center gap-2"
                        >
                          <MdDelete size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MdArticle className="text-purple-400" />
                Post Management ({posts.length})
              </h2>
            </div>
            
            {posts.length === 0 ? (
              <div className="text-center py-12 text-gray-300">
                <MdArticle className="text-5xl mx-auto mb-3 opacity-50" />
                <p>No posts found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative">
                            {post.user?.image ? (
                              <img
                                src={post.user.image.startsWith('http') ? post.user.image : `${import.meta.env.VITE_BACKEND_URL}/${post.user.image}`}
                                alt={getDisplayName(post.user)}
                                className="w-10 h-10 rounded-full border border-white/20 object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            {/* Fallback with initials */}
                            <div 
                              className={`w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-500 to-purple-600 ${post.user?.image ? 'hidden' : 'flex'}`}
                              style={{ display: post.user?.image ? 'none' : 'flex' }}
                            >
                              {getUserInitials(post.user)}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {post.user?.firstName} {post.user?.lastName}
                            </h3>
                            <p className="text-gray-400 text-sm">{post.user?.email}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-3">{post.content}</p>
                        
                        {post.image && (
                          <>
                            {console.log('Post image URL:', post.image, 'Full URL:', post.image.startsWith('http') ? post.image : `${import.meta.env.VITE_BACKEND_URL}/${post.image}`)}
                            <img 
                              src={post.image.startsWith('http') ? post.image : `${import.meta.env.VITE_BACKEND_URL}/${post.image}`} 
                              alt="Post image" 
                              className="w-full max-w-md rounded-lg mb-3 border border-white/20 object-cover"
                              onError={(e) => {
                                console.log('Image failed to load:', e.target.src);
                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23666' width='400' height='300'/%3E%3Ctext fill='white' font-size='20' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage not available%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <span>Likes: {post.likes?.length || 0}</span>
                          <span>Comments: {post.comments?.length || 0}</span>
                          <span>Reports: {post.reports || 0}</span>
                          <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        {post.reports > 0 && (
                          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 mb-3">
                            <p className="text-red-300 text-sm font-medium">Reported Content</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openPostModal(post)}
                          className="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition flex items-center gap-2"
                        >
                          <MdEdit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewContent(post, 'post')}
                          className="px-3 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition flex items-center gap-2"
                        >
                          <MdVisibility size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="px-3 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition flex items-center gap-2"
                        >
                          <MdDelete size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reels' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MdVideoLibrary className="text-amber-400" />
                Reel Management ({reels.length})
              </h2>
            </div>
            
            {reels.length === 0 ? (
              <div className="text-center py-12 text-gray-300">
                <MdVideoLibrary className="text-5xl mx-auto mb-3 opacity-50" />
                <p>No reels found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reels.map((reel) => (
                  <div key={reel._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="relative">
                            {reel.user?.image ? (
                              <img
                                src={reel.user.image.startsWith('http') ? reel.user.image : `${import.meta.env.VITE_BACKEND_URL}/${reel.user.image}`}
                                alt={getDisplayName(reel.user)}
                                className="w-10 h-10 rounded-full border border-white/20 object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            {/* Fallback with initials */}
                            <div 
                              className={`w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-500 to-purple-600 ${reel.user?.image ? 'hidden' : 'flex'}`}
                              style={{ display: reel.user?.image ? 'none' : 'flex' }}
                            >
                              {getUserInitials(reel.user)}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {reel.user?.firstName} {reel.user?.lastName}
                            </h3>
                            <p className="text-gray-400 text-sm">{reel.user?.email}</p>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-3">{reel.content}</p>
                        
                        {reel.video && reel.video.url && (
                          <>
                            {console.log('Reel video URL:', reel.video.url, 'Full URL:', reel.video.url.startsWith('http') ? reel.video.url : `${import.meta.env.VITE_BACKEND_URL}/${reel.video.url}`)}
                            <video 
                              src={reel.video.url.startsWith('http') ? reel.video.url : `${import.meta.env.VITE_BACKEND_URL}/${reel.video.url}`} 
                              controls 
                              className="w-full max-w-md rounded-lg mb-3 border border-white/20"
                              onError={(e) => {
                                console.log('Video failed to load:', e.target.src);
                              }}
                            />
                          </>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                          <span>Likes: {reel.likes?.length || 0}</span>
                          <span>Reports: {reel.reports || 0}</span>
                          <span>Created: {new Date(reel.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        {reel.reports > 0 && (
                          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 mb-3">
                            <p className="text-red-300 text-sm font-medium">Reported Content</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openReelModal(reel)}
                          className="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition flex items-center gap-2"
                        >
                          <MdEdit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewContent(reel, 'reel')}
                          className="px-3 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition flex items-center gap-2"
                        >
                          <MdVisibility size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteReel(reel._id)}
                          className="px-3 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition flex items-center gap-2"
                        >
                          <MdDelete size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MdLibraryBooks className="text-green-400" />
                Resource Management ({resources.length})
              </h2>
            </div>
            
            {resources.length === 0 ? (
              <div className="text-center py-12 text-gray-300">
                <MdLibraryBooks className="text-5xl mx-auto mb-3 opacity-50" />
                <p>No resources found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{resource.title}</h3>
                        <p className="text-gray-300 text-sm mb-2">{resource.description}</p>
                        
                        <div className="flex items-center gap-3 mb-2">
                          {resource.facultyId && (
                            <div className="flex items-center gap-3 mb-2">
                              <div className="relative">
                                {resource.facultyId?.image ? (
                                  <img
                                    src={resource.facultyId.image}
                                    alt={getDisplayName(resource.facultyId)}
                                    className="w-10 h-10 rounded-full border border-white/20 object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                {/* Fallback with initials */}
                                <div 
                                  className={`w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-500 to-purple-600 ${resource.facultyId?.image ? 'hidden' : 'flex'}`}
                                  style={{ display: resource.facultyId?.image ? 'none' : 'flex' }}
                                >
                                  {getUserInitials(resource.facultyId)}
                                </div>
                              </div>
                              <span className="text-gray-400 text-sm">
                                {resource.facultyId?.firstName} {resource.facultyId?.lastName}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {resource.file && (
                          <div className="mb-3">
                            <a 
                              href={resource.file} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-sm underline"
                            >
                              View File
                            </a>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Department: {resource.department || 'N/A'}</span>
                          <span>Created: {new Date(resource.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openResourceModal(resource)}
                          className="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition flex items-center gap-2"
                        >
                          <MdEdit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewContent(resource, 'resource')}
                          className="px-3 py-2 bg-green-600/20 text-green-300 rounded-lg hover:bg-green-600/30 transition flex items-center gap-2"
                        >
                          <MdVisibility size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource._id)}
                          className="px-3 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition flex items-center gap-2"
                        >
                          <MdDelete size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MdMessage className="text-green-400" />
                Chat Management ({chats.length})
              </h2>
            </div>
            
            {chats.length === 0 ? (
              <div className="text-center py-12 text-gray-300">
                <MdMessage className="text-5xl mx-auto mb-3 opacity-50" />
                <p>No chats found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chats.map((chat) => (
                  <div key={chat._id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex -space-x-2">
                            {chat.users?.slice(0, 3).map((user, index) => (
                              <div key={index} className="relative">
                                {user.image ? (
                                  <img
                                    src={user.image}
                                    alt={getDisplayName(user)}
                                    className="w-8 h-8 rounded-full border border-white/20 object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                {/* Fallback with initials */}
                                <div 
                                  className={`w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white font-semibold text-xs bg-gradient-to-br from-blue-500 to-purple-600 ${user.image ? 'hidden' : 'flex'}`}
                                  style={{ display: user.image ? 'none' : 'flex' }}
                                >
                                  {getUserInitials(user)}
                                </div>
                              </div>
                            ))}
                            {chat.users?.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-600 border border-white/20 flex items-center justify-center">
                                <span className="text-xs text-white">+{chat.users.length - 3}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {chat.isGroupChat ? chat.chatName : chat.users?.map(u => `${u.firstName} ${u.lastName}`).join(', ')}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {chat.isGroupChat ? 'Group Chat' : 'Private Chat'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                          <span>Messages: {chat.messageCount || 0}</span>
                          <span>Created: {new Date(chat.createdAt).toLocaleDateString()}</span>
                          <span>Updated: {new Date(chat.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        {chat.latestMessage && (
                          <div className="text-gray-300 text-sm mb-2">
                            <span className="font-medium">Latest:</span> {chat.latestMessage.content?.substring(0, 50)}...
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewContent(chat, 'chat')}
                          className="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition flex items-center gap-2"
                        >
                          <MdVisibility size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteChat(chat._id)}
                          className="px-3 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition flex items-center gap-2"
                        >
                          <MdDelete size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Announcements Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <MdAnnouncement className="text-amber-400" />
              Announcements ({announcements.length})
            </h2>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-md rounded-xl border border-amber-500/30 hover:bg-amber-500/30 transition"
            >
              <MdAdd className="text-amber-300" />
              <span className="text-amber-300">Create Announcement</span>
            </button>
          </div>
          
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
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
                        <span>Target: {announcement.targetAudience?.join(', ') || 'All'}</span>
                        <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAnnouncementModal(announcement)}
                        className="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition flex items-center gap-2"
                      >
                        <MdEdit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                        className="px-3 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition flex items-center gap-2"
                      >
                        <MdDelete size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resources Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <MdLibraryBooks />
            All Shared Resources ({stats.totalResources})
          </h2>
          {resources.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
              <MdLibraryBooks className="text-5xl mx-auto mb-3 opacity-50" />
              <p>No resources have been shared yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-200">
                <thead className="border-b border-white/20">
                  <tr>
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Faculty</th>
                    <th className="pb-3 font-semibold">Description</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((res) => (
                    <tr key={res.id} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="py-3 pr-4">
                        <a
                          href={res.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-300 hover:text-amber-200 underline"
                        >
                          {res.title}
                        </a>
                       </td>
                      <td className="py-3 pr-4">{res.facultyName}</td>
                      <td className="py-3 pr-4 max-w-xs truncate">{res.description}</td>
                      <td className="py-3 pr-4 text-sm">
                        {new Date(res.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleDelete(res.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded-full transition"
                          title="Delete resource"
                        >
                          <MdDelete size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Content View Modal */}
        {showContentModal && selectedContent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedContent.type === 'post' ? 'Post Details' : 
                   selectedContent.type === 'reel' ? 'Reel Details' :
                   selectedContent.type === 'resource' ? 'Resource Details' :
                   selectedContent.type === 'chat' ? 'Chat Details' : 'Content Details'}
                </h3>
                <button
                  onClick={() => setShowContentModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <div className="p-6">
                {/* Post/Reel Content */}
                {(selectedContent.type === 'post' || selectedContent.type === 'reel') && (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative">
                        {selectedContent.user?.image ? (
                          <img
                            src={selectedContent.user.image.startsWith('http') ? selectedContent.user.image : `${import.meta.env.VITE_BACKEND_URL}/${selectedContent.user.image}`}
                            alt={getDisplayName(selectedContent.user)}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {/* Fallback with initials */}
                        <div 
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg bg-gradient-to-br from-blue-500 to-purple-600 ${selectedContent.user?.image ? 'hidden' : 'flex'}`}
                          style={{ display: selectedContent.user?.image ? 'none' : 'flex' }}
                        >
                          {getUserInitials(selectedContent.user)}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-gray-800 font-medium">
                          {selectedContent.user?.firstName} {selectedContent.user?.lastName}
                        </h4>
                        <p className="text-gray-500 text-sm">{selectedContent.user?.email}</p>
                        <p className="text-gray-500 text-sm">{new Date(selectedContent.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{selectedContent.content}</p>
                    {selectedContent.image && (
                      <img 
                        src={selectedContent.image.startsWith('http') ? selectedContent.image : `${import.meta.env.VITE_BACKEND_URL}/${selectedContent.image}`} 
                        alt="Content image" 
                        className="rounded-lg max-w-full mb-4"
                      />
                    )}
                    {selectedContent.video && selectedContent.video.url && (
                      <video 
                        src={selectedContent.video.url.startsWith('http') ? selectedContent.video.url : `${import.meta.env.VITE_BACKEND_URL}/${selectedContent.video.url}`} 
                        controls 
                        className="rounded-lg max-w-full mb-4"
                      />
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Likes: {selectedContent.likes?.length || 0}</span>
                      <span>Comments: {selectedContent.comments?.length || 0}</span>
                      <span>Reports: {selectedContent.reports || 0}</span>
                    </div>
                  </>
                )}
                
                {/* Resource Content */}
                {selectedContent.type === 'resource' && (
                  <>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">{selectedContent.title}</h4>
                    <p className="text-gray-600 mb-4">{selectedContent.description}</p>
                    
                    {selectedContent.facultyId && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          {selectedContent.facultyId?.image ? (
                            <img
                              src={selectedContent.facultyId.image}
                              alt={getDisplayName(selectedContent.facultyId)}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextElementSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {/* Fallback with initials */}
                          <div 
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-500 to-purple-600 ${selectedContent.facultyId?.image ? 'hidden' : 'flex'}`}
                            style={{ display: selectedContent.facultyId?.image ? 'none' : 'flex' }}
                          >
                            {getUserInitials(selectedContent.facultyId)}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium">
                            {selectedContent.facultyId?.firstName} {selectedContent.facultyId?.lastName}
                          </p>
                          <p className="text-gray-500 text-sm">{selectedContent.facultyId?.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {selectedContent.file && (
                      <div className="mb-4">
                        <a 
                          href={selectedContent.file} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          View/Download File
                        </a>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      <p>Department: {selectedContent.department || 'N/A'}</p>
                      <p>Created: {new Date(selectedContent.createdAt).toLocaleDateString()}</p>
                    </div>
                  </>
                )}
                
                {/* Chat Content */}
                {selectedContent.type === 'chat' && (
                  <>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {selectedContent.isGroupChat ? selectedContent.chatName : 'Private Chat'}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {selectedContent.isGroupChat ? 'Group Chat' : 'Private Chat'}
                    </p>
                    
                    <div className="mb-4">
                      <p className="font-medium text-gray-700 mb-2">Participants:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedContent.users?.map((user, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                            <div className="relative">
                              {user.image ? (
                                <img
                                  src={user.image}
                                  alt={getDisplayName(user)}
                                  className="w-6 h-6 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              {/* Fallback with initials */}
                              <div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs bg-gradient-to-br from-blue-500 to-purple-600 ${user.image ? 'hidden' : 'flex'}`}
                                style={{ display: user.image ? 'none' : 'flex' }}
                              >
                                {getUserInitials(user)}
                              </div>
                            </div>
                            <span className="text-sm text-gray-700">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>Messages: {selectedContent.messageCount || 0}</p>
                      <p>Created: {new Date(selectedContent.createdAt).toLocaleDateString()}</p>
                      <p>Updated: {new Date(selectedContent.updatedAt).toLocaleDateString()}</p>
                    </div>
                    
                    {selectedContent.latestMessage && (
                      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                        <p className="font-medium text-gray-700 mb-1">Latest Message:</p>
                        <p className="text-gray-600">{selectedContent.latestMessage.content}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Management Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={userFormData.firstName}
                      onChange={handleUserInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={userFormData.lastName}
                      onChange={handleUserInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userFormData.email}
                    onChange={handleUserInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={userFormData.password}
                      onChange={handleUserInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={userFormData.role}
                    onChange={handleUserInputChange}
                    placeholder="e.g., student, faculty, admin"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={userFormData.department}
                    onChange={handleUserInputChange}
                    placeholder="e.g., Computer Science, Engineering"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={userFormData.isActive}
                    onChange={handleUserInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active User
                  </label>
                </div>
                </form>
              <div className="flex gap-3 p-6 border-t flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <MdSave size={16} />
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Edit Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingPost ? 'Edit Post' : 'Create Post'}
                </h3>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <form onSubmit={handleUpdatePost} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    name="content"
                    value={postFormData.content}
                    onChange={handlePostInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={postFormData.image}
                    onChange={handlePostInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPostModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <MdSave size={16} />
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reel Edit Modal */}
        {showReelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingReel ? 'Edit Reel' : 'Create Reel'}
                </h3>
                <button
                  onClick={() => setShowReelModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <form onSubmit={handleUpdateReel} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    name="content"
                    value={reelFormData.content}
                    onChange={handleReelInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                  <input
                    type="text"
                    name="video"
                    value={reelFormData.video}
                    onChange={handleReelInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReelModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <MdSave size={16} />
                    {editingReel ? 'Update Reel' : 'Create Reel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resource Edit Modal */}
        {showResourceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingResource ? 'Edit Resource' : 'Create Resource'}
                </h3>
                <button
                  onClick={() => setShowResourceModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <form onSubmit={handleUpdateResource} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={resourceFormData.title}
                    onChange={handleResourceInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={resourceFormData.description}
                    onChange={handleResourceInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={resourceFormData.department}
                    onChange={handleResourceInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">File URL</label>
                  <input
                    type="text"
                    name="file"
                    value={resourceFormData.file}
                    onChange={handleResourceInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowResourceModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <MdSave size={16} />
                    {editingResource ? 'Update Resource' : 'Create Resource'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Announcement Edit Modal */}
        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </h3>
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
              <form onSubmit={handleUpdateAnnouncement} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={announcementFormData.title}
                    onChange={handleAnnouncementInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    name="content"
                    value={announcementFormData.content}
                    onChange={handleAnnouncementInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    name="type"
                    value={announcementFormData.type}
                    onChange={handleAnnouncementInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="event">Event</option>
                    <option value="job">Job</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    name="priority"
                    value={announcementFormData.priority}
                    onChange={handleAnnouncementInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                  <select
                    name="visibility"
                    value={announcementFormData.visibility}
                    onChange={handleAnnouncementInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAnnouncementModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <MdSave size={16} />
                    {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
