import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MdChat,
  MdPeople,
  MdPhotoCamera,
  MdShare,
  MdGroup,
  MdAnnouncement,
  MdEvent,
  MdCampaign,
  MdCalendarToday,
  MdTrendingUp,
  MdSchool,
  MdLaptop,
  MdLocationOn,
  MdGroups,
  MdEmojiEvents,
  MdLibraryBooks,
  MdCelebration,
  MdStar,
  MdFormatQuote
} from "react-icons/md";

const Landing = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cvFile: null,
    additionalInfo: ''
  });

  // Handle job application submission
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('fullName', applicationForm.fullName);
      formData.append('email', applicationForm.email);
      formData.append('phone', applicationForm.phone);
      formData.append('additionalInfo', applicationForm.additionalInfo);
      formData.append('announcementId', selectedAnnouncement._id);
      formData.append('announcementTitle', selectedAnnouncement.title);
      
      if (applicationForm.cvFile) {
        formData.append('cv', applicationForm.cvFile);
      }
      
      // Submit application (you'd need to create this API endpoint)
      const response = await fetch('http://localhost:9000/api/job-application', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Application submitted successfully! We will contact you soon.');
        // Reset form
        setApplicationForm({
          fullName: '',
          email: '',
          phone: '',
          cvFile: null,
          additionalInfo: ''
        });
        setShowModal(false);
      } else {
        alert('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Application submission error:', error);
      alert('An error occurred while submitting your application.');
    }
  };

  // Fetch announcements from database
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('http://localhost:9000/api/announcement/public');
        const result = await response.json();
        if (result.success) {
          // Transform database data to match card format
          const transformedAnnouncements = result.data.map((announcement, index) => {
            const priorityColors = {
              high: { color: "from-red-400 to-orange-500", badge: "Urgent", badgeColor: "bg-red-500/20 text-red-300" },
              medium: { color: "from-blue-400 to-cyan-500", badge: "Important", badgeColor: "bg-blue-500/20 text-blue-300" },
              low: { color: "from-green-400 to-emerald-500", badge: "Info", badgeColor: "bg-green-500/20 text-green-300" }
            };
            
            const priorityConfig = priorityColors[announcement.priority] || priorityColors.medium;
            
            return {
              id: announcement._id,
              title: announcement.title,
              date: new Date(announcement.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              description: announcement.content,
              icon: <MdCampaign className="text-2xl" />,
              color: priorityConfig.color,
              badge: priorityConfig.badge,
              badgeColor: priorityConfig.badgeColor
            };
          });
          setAnnouncements(transformedAnnouncements);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Community images data for gallery
  const communityImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
      title: "Collaborative Learning",
      description: "Students working together on innovative projects",
      icon: <MdGroups className="text-amber-400" />,
      location: "Innovation Hub"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
      title: "Annual Cultural Fest",
      description: "Celebrating diversity and talent across campus",
      icon: <MdCelebration className="text-purple-400" />,
      location: "Main Auditorium"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
      title: "Smart Library Sessions",
      description: "24/7 access to digital and physical resources",
      icon: <MdLibraryBooks className="text-blue-400" />,
      location: "Central Library"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
      title: "Campus Life",
      description: "Modern facilities and vibrant student community",
      icon: <MdLocationOn className="text-emerald-400" />,
      location: "University Campus"
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Computer Science, 3rd Year",
      quote: "BHULink has completely transformed how I connect with my classmates and professors. The real-time chat and event updates keep me in the loop always!",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      rating: 5
    },
    {
      id: 2,
      name: "Rahul Verma",
      role: "MBA, 2nd Year",
      quote: "From group projects to club activities, this platform makes everything seamless. The media sharing feature is a game-changer for our presentations.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      rating: 5
    },
    {
      id: 3,
      name: "Dr. Anjali Mehta",
      role: "Professor, Mathematics",
      quote: "As a faculty member, I love how easy it is to share resources and communicate with students. BHULink bridges the gap between academia and community.",
      avatar: "https://randomuser.me/api/portraits/women/89.jpg",
      rating: 5
    }
  ];

  // Campus stats
  const campusStats = [
    { value: "12K+", label: "Active Students", icon: <MdPeople />, color: "from-blue-400 to-blue-600" },
    { value: "250+", label: "Student Clubs", icon: <MdGroup />, color: "from-purple-400 to-purple-600" },
    { value: "50+", label: "Events Yearly", icon: <MdEmojiEvents />, color: "from-amber-400 to-amber-600" },
    { value: "98%", label: "Placement Rate", icon: <MdTrendingUp />, color: "from-emerald-400 to-emerald-600" }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#2e1065] relative overflow-x-hidden">
      {/* Custom Animations Style Block */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes floatReverse {
          0% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes glowPulse {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        @keyframes borderGlow {
          0% { border-color: rgba(255,255,255,0.1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
          50% { border-color: rgba(255,215,0,0.5); box-shadow: 0 0 20px 5px rgba(255,215,0,0.3); }
          100% { border-color: rgba(255,255,255,0.1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
        @keyframes imageReveal {
          0% { opacity: 0; transform: scale(1.05); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInFromBottom {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out forwards;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-floatReverse {
          animation: floatReverse 7s ease-in-out infinite;
        }
        .animate-glowPulse {
          animation: glowPulse 4s ease-in-out infinite;
        }
        .animate-borderGlow {
          animation: borderGlow 3s ease-in-out infinite;
        }
        .animate-imageReveal {
          animation: imageReveal 0.6s ease-out forwards;
        }
        .animate-slideInFromBottom {
          animation: slideInFromBottom 0.8s ease-out forwards;
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
        .image-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .image-card:hover {
          transform: translateY(-8px) scale(1.02);
        }
        .image-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
        }
      `}</style>

      <div className="absolute inset-0 bg-black/20 z-0"></div>

      {/* Enhanced Animated Background Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400/20 rounded-full animate-float blur-3xl"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/20 rounded-full animate-floatReverse delay-100 blur-3xl"></div>
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-emerald-400/20 rounded-full animate-float delay-200 blur-3xl"></div>
      <div className="absolute bottom-40 right-1/3 w-64 h-64 bg-amber-400/20 rounded-full animate-floatReverse delay-300 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full animate-glowPulse blur-3xl"></div>

      {/* More Floating Particles */}
      <div className="absolute top-20 left-[15%] w-2 h-2 bg-white/40 rounded-full animate-float"></div>
      <div className="absolute bottom-32 right-[20%] w-3 h-3 bg-amber-300/40 rounded-full animate-floatReverse delay-100"></div>
      <div className="absolute top-1/3 right-[10%] w-1.5 h-1.5 bg-blue-300/40 rounded-full animate-float delay-200"></div>
      <div className="absolute bottom-1/4 left-[30%] w-2.5 h-2.5 bg-purple-300/40 rounded-full animate-floatReverse delay-300"></div>
      <div className="absolute top-1/2 left-[5%] w-1 h-1 bg-white/30 rounded-full animate-float delay-400"></div>
      <div className="absolute bottom-[15%] right-[12%] w-2 h-2 bg-emerald-300/40 rounded-full animate-floatReverse delay-500"></div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern%20id=%22grid%22%20width=%2260%22%20height=%2260%22%20patternUnits=%22userSpaceOnUse%22%3E%3Cpath%20d=%22M%2060%200%20L%200%200%200%2060%22%20fill=%22none%22%20stroke=%22rgba(255,255,255,0.03)%22%20stroke-width=%221%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20fill=%22url(%23grid)%22/%3E%3C/svg%3E')] opacity-30"></div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        <div className="text-center text-white max-w-6xl mx-auto">
          {/* Logo/Title with enhanced entrance animations */}
          <div className="mb-12 animate-fadeInUp">
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-amber-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
                <img
                  src="/logo.jpeg"
                  alt="BHULink Logo"
                  className="relative h-36 w-36 rounded-full border-4 border-white/40 shadow-2xl object-cover transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-3"
                />
              </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-blue-300 via-purple-300 to-amber-300 bg-clip-text text-transparent drop-shadow-2xl">
              BHULink
            </h1>
            <p className="text-2xl md:text-3xl font-light mb-2 tracking-wide bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent">
              The Digital Campus Hub
            </p>
            <p className="text-xl md:text-2xl text-gray-200 mb-6 max-w-3xl mx-auto">
              Connect, share, and chat with classmates, professors, and all in one place.
            </p>
            <div className="flex justify-center gap-6 text-sm font-mono text-blue-200/70">
              <span className="flex items-center gap-1"><MdTrendingUp className="text-emerald-400" /> 5,000+ students online</span>
              <span className="flex items-center gap-1"><MdGroup className="text-purple-400" /> 200+ clubs & societies</span>
              <span className="flex items-center gap-1"><MdChat className="text-blue-400" /> 24/7 campus chat</span>
            </div>
          </div>

          {/* Feature Cards with staggered entrance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:bg-white/10 relative overflow-hidden animate-fadeInLeft">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-blue-500/30">
                  <MdChat className="text-3xl text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Real‑time Chat</h3>
              <p className="text-gray-200 leading-relaxed">Instant messaging with friends, study groups, and faculty — everywhere.</p>
            </div>
            <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:bg-white/10 relative overflow-hidden animate-fadeInUp delay-100">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-purple-500/30">
                  <MdPhotoCamera className="text-3xl text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Media Sharing</h3>
              <p className="text-gray-200 leading-relaxed">Share photos, videos, and campus moments with your network seamlessly.</p>
            </div>
            <div className="group bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:bg-white/10 relative overflow-hidden animate-fadeInRight delay-200">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/10 transition-all duration-500"></div>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:shadow-emerald-500/30">
                  <MdGroup className="text-3xl text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Social Network</h3>
              <p className="text-gray-200 leading-relaxed">Discover clubs, join events, and build your academic community.</p>
            </div>
          </div>

          {/* Campus Stats Section with animations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 animate-fadeInUp delay-150">
            {campusStats.map((stat, index) => (
              <div
                key={stat.label}
                className="group bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white text-xl">{stat.icon}</div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Main CTA Buttons with enhanced hover effects */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fadeInUp delay-300">
            <Link
              to="/signup"
              className="group relative px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 font-bold text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Sign Up – Join the Community</span>
              <svg className="relative w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5H9" />
              </svg>
            </Link>
            <Link
              to="/signin"
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-bold text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Sign In – Welcome Back</span>
              <svg className="relative w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>

          {/* NEW: University Community Image Gallery Section with animations */}
          <div className="mb-16 relative">
            <div className="text-center mb-10 animate-fadeInUp">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mb-4">
                <MdPeople className="text-purple-400 text-xl animate-pulse" />
                <span className="text-purple-300 font-semibold tracking-wide">Campus Life</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-amber-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
                Our Vibrant Community
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Experience the energy, diversity, and spirit of our university through these moments
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {communityImages.map((image, index) => (
                <div
                  key={image.id}
                  className="group image-card cursor-pointer rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-500 animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 image-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 text-white text-sm">
                        {image.icon}
                        <span>{image.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                      {image.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {image.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-400/80">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <span>Discover more</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 px-6 py-2 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 hover:scale-105 transform">
                <span>Explore Campus Gallery</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* NEW: Testimonials Section */}
          <div className="mb-16 relative">
            <div className="text-center mb-10 animate-fadeInUp">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mb-4">
                <MdStar className="text-yellow-400 text-xl animate-pulse" />
                <span className="text-yellow-300 font-semibold tracking-wide">Student Voices</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-amber-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
                What Our Community Says
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Real stories from students and faculty who use BHULink every day
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className="group bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <MdFormatQuote className="text-4xl text-amber-400/30 mb-4 group-hover:text-amber-400/50 transition-colors" />
                  <p className="text-gray-200 leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/50"
                    />
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-xs text-amber-300">{testimonial.role}</div>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <MdStar key={i} className="text-yellow-400 text-xs" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcement Board Section with enhanced animations */}
          <div className="mb-16 relative">
            <div className="text-center mb-10 animate-fadeInUp">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 mb-4">
                <MdAnnouncement className="text-amber-400 text-xl animate-pulse" />
                <span className="text-amber-300 font-semibold tracking-wide">Stay Updated</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-amber-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
                Announcement Board
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Latest news, events, and important updates from campus
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                // Loading skeleton cards
                [...Array(4)].map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden animate-pulse"
                  >
                    <div className="h-1.5 bg-gray-600"></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-gray-600 rounded-xl"></div>
                        <div className="w-16 h-6 bg-gray-600 rounded-full"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-600 rounded"></div>
                        <div className="h-3 bg-gray-600 rounded"></div>
                        <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                announcements.map((announcement, index) => (
                  <div
                    key={announcement.id}
                    className="group bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 cursor-pointer animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${announcement.color} group-hover:h-2 transition-all duration-300`}></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${announcement.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 group-hover:rotate-3`}>
                          {announcement.icon}
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${announcement.badgeColor} backdrop-blur-sm group-hover:scale-105 transition-transform`}>
                          {announcement.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                        {announcement.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                        <MdCalendarToday className="text-amber-400" />
                        <span>{announcement.date}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {announcement.description}
                      </p>
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedAnnouncement(announcement);
                              setShowModal(true);
                            }}
                            className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 group/btn"
                          >
                            Read more
                            <svg className="w-3 h-3 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          
                          {/* Apply button for job announcements */}
                          {announcement.type === 'job' && (
                            <button 
                              onClick={() => {
                                setSelectedAnnouncement(announcement);
                                setShowModal(true);
                                // Auto-focus on form when opened
                                setTimeout(() => {
                                  const formElement = document.querySelector('form');
                                  if (formElement) {
                                    formElement.scrollIntoView({ behavior: 'smooth' });
                                    const firstInput = formElement.querySelector('input');
                                    if (firstInput) firstInput.focus();
                                  }
                                }, 100);
                              }}
                              className="text-xs font-medium bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                              Apply Now
                              <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-4H4m8 0v16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-center mt-8">
              <button className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 px-6 py-2 rounded-full bg-white/5 border border-white/20 hover:bg-white/10 hover:scale-105 transform">
                <span>View All Announcements</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              </div>
            </div>
          </div>

          {/* Additional Features with hover scale effect */}
          <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base text-gray-200 mb-12 animate-fadeInUp delay-500">
            <div className="flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer">
              <MdShare className="text-xl text-blue-300" />
              <span>Easy Sharing</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer">
              <MdGroup className="text-xl text-purple-300" />
              <span>Group Chats</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-5 py-2 rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer">
              <MdPhotoCamera className="text-xl text-emerald-300" />
              <span>Photo Posts</span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/20 pt-8 mt-4 text-gray-300 text-sm flex flex-col md:flex-row justify-between items-center gap-4 animate-fadeInUp delay-600">
            <p>© {new Date().getFullYear()} BHULink – The University Social Network</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors hover:translate-y-[-2px] inline-block">About</a>
              <a href="#" className="hover:text-white transition-colors hover:translate-y-[-2px] inline-block">Privacy</a>
              <a href="#" className="hover:text-white transition-colors hover:translate-y-[-2px] inline-block">Support</a>
            </div>
          </div>
        </div>

      {/* Announcement Modal */}
      {showModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100">
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white/90 rounded-full p-2 hover:bg-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Header */}
              <div className={`p-6 bg-gradient-to-r ${selectedAnnouncement.color} rounded-t-2xl`}>
                <div className="flex items-center gap-3 text-white">
                  <div className="text-2xl">{selectedAnnouncement.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedAnnouncement.title}</h3>
                    <div className="flex items-center gap-2 text-sm opacity-90">
                      <MdCalendarToday className="text-white" />
                      <span>{selectedAnnouncement.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.description}
                  </p>
                </div>

                {/* Job Application Form for job announcements */}
                {selectedAnnouncement.type === 'job' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4">Apply for this Position</h4>
                    <form onSubmit={handleApplicationSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={applicationForm.fullName}
                          onChange={(e) => setApplicationForm({...applicationForm, fullName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={applicationForm.email}
                          onChange={(e) => setApplicationForm({...applicationForm, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={applicationForm.phone}
                          onChange={(e) => setApplicationForm({...applicationForm, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter / CV</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            onChange={(e) => setApplicationForm({...applicationForm, cvFile: e.target.files[0]})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            accept=".pdf,.doc,.docx"
                          />
                          <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Upload CV
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                        <textarea
                          value={applicationForm.additionalInfo}
                          onChange={(e) => setApplicationForm({...applicationForm, additionalInfo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          placeholder="Tell us why you're interested in this position..."
                        ></textarea>
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Submit Application
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Edit/Delete buttons for faculty/admin users only */}
                {(userRole === 'faculty' || userRole === 'admin') && (
                  <div className="mt-6 flex gap-4 justify-end">
                    <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                      Edit Announcement
                    </button>
                    <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                      Delete Announcement
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;