// src/components/ResourcesView.js
import React, { useState, useEffect } from 'react';
import { MdShare, MdDelete, MdDescription, MdLink, MdLibraryBooks, MdAttachFile } from 'react-icons/md';
import { getResourcesByFaculty, addResource, deleteResource } from '../services/resourceService';

const CURRENT_FACULTY = {
  id: 'faculty_1',
  name: 'Prof. Sarah Johnson',
  department: 'Computer Science',
};

const ResourcesView = () => {
  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    fileData: null,
    fileName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadResources = () => {
    const facultyResources = getResourcesByFaculty(CURRENT_FACULTY.id);
    setResources(facultyResources);
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          fileData: reader.result,
          fileName: file.name,
          link: '',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please enter title and description.');
      return;
    }
    if (!formData.link.trim() && !formData.fileData) {
      alert('Please provide either a link or upload a file.');
      return;
    }
    setIsSubmitting(true);
    const newResource = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      link: formData.link.trim() || (formData.fileData ? 'file' : '#'),
      fileData: formData.fileData || null,
      fileName: formData.fileName || null,
      facultyId: CURRENT_FACULTY.id,
      facultyName: CURRENT_FACULTY.name,
    };
    addResource(newResource);
    setFormData({ title: '', description: '', link: '', fileData: null, fileName: '' });
    loadResources();
    setIsSubmitting(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      deleteResource(id);
      loadResources();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a1a2f] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <MdLibraryBooks className="text-blue-400" />
              Faculty Resources
            </h1>
            <p className="text-blue-200 mt-1">
              Welcome back, {CURRENT_FACULTY.name} • {CURRENT_FACULTY.department}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-full px-5 py-2 border border-white/20">
            <span className="text-white/80 text-sm">📚 {resources.length} resources shared</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Share Resource Form */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <MdShare className="text-blue-400" />
                Share a Resource
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-200 text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., Machine Learning Slides"
                  />
                </div>
                <div>
                  <label className="block text-gray-200 text-sm font-medium mb-1">Description *</label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Brief explanation..."
                  />
                </div>
                <div>
                  <label className="block text-gray-200 text-sm font-medium mb-1">Or Upload File</label>
                  <label className="flex items-center gap-3 w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30 cursor-pointer hover:bg-white/30 transition">
                    <MdAttachFile className="text-blue-400" />
                    <span className="text-white text-sm">
                      {formData.fileName ? formData.fileName : 'Choose file (PDF, image, etc.)'}
                    </span>
                    <input type="file" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.png,.docx,.txt" />
                  </label>
                  {formData.fileData && (
                    <p className="text-green-300 text-xs mt-1">✓ File ready to share</p>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white/10 px-2 text-gray-300">OR</span>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-200 text-sm font-medium mb-1">External Link</label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sharing...' : '📤 Share Resource'}
                </button>
              </form>
            </div>
          </div>

          {/* Resources List */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <MdDescription className="text-blue-400" />
                My Shared Resources
              </h2>
              {resources.length === 0 ? (
                <div className="text-center py-12 text-gray-300">
                  <MdLibraryBooks className="text-5xl mx-auto mb-3 opacity-50" />
                  <p>You haven't shared any resources yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resources.map((res) => (
                    <div key={res.id} className="bg-white/5 rounded-xl p-4 border border-white/20 hover:bg-white/10 transition-all group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <MdLink className="text-blue-400" />
                            {res.title}
                          </h3>
                          <p className="text-gray-200 mt-1">{res.description}</p>
                          {res.fileData ? (
                            <a
                              href={res.fileData}
                              download={res.fileName}
                              className="inline-block mt-2 text-blue-300 hover:text-blue-200 underline text-sm"
                            >
                              📎 Download {res.fileName}
                            </a>
                          ) : res.link && res.link !== '#' && (
                            <a href={res.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-blue-300 hover:text-blue-200 underline text-sm">
                              Open resource ↗
                            </a>
                          )}
                          <div className="text-xs text-gray-400 mt-2">
                            Shared on {new Date(res.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <button onClick={() => handleDelete(res.id)} className="text-red-400 hover:text-red-300 p-2 opacity-70 group-hover:opacity-100 transition">
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesView;