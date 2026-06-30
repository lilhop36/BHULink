import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { MdOutlineClose, MdAttachFile, MdDelete } from "react-icons/md";

const AnnouncementCreate = ({ onClose, onAnnouncementCreated }) => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store?.auth);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general",
    visibility: "private",
    targetAudience: ["all"],
    priority: "medium",
    expiresAt: ""
  });

  const [jobDetails, setJobDetails] = useState({
    company: "",
    position: "",
    location: "",
    salary: "",
    requirements: "",
    applicationDeadline: "",
    applicationLink: ""
  });

  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleJobDetailsChange = (e) => {
    const { name, value } = e.target;
    setJobDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleTargetAudienceChange = (audience) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audience)
        ? prev.targetAudience.filter(a => a !== audience)
        : [...prev.targetAudience, audience]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      Object.keys(formData).forEach(key => {
        if (key !== 'targetAudience') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add target audience as JSON string
      formDataToSend.append('targetAudience', JSON.stringify(formData.targetAudience));

      // Add job details if type is job
      if (formData.type === 'job') {
        Object.keys(jobDetails).forEach(key => {
          if (jobDetails[key]) {
            formDataToSend.append(`jobDetails.${key}`, jobDetails[key]);
          }
        });
      }

      // Add attachments
      attachments.forEach(file => {
        formDataToSend.append('attachments', file);
      });

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/announcement`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Announcement created successfully!");
        setFormData({
          title: "",
          content: "",
          type: "general",
          visibility: "private",
          targetAudience: ["all"],
          priority: "medium",
          expiresAt: ""
        });
        setJobDetails({
          company: "",
          position: "",
          location: "",
          salary: "",
          requirements: "",
          applicationDeadline: "",
          applicationLink: ""
        });
        setAttachments([]);
        
        if (onAnnouncementCreated) {
          onAnnouncementCreated(result.data);
        }
        onClose();
      } else {
        toast.error(result.message || "Failed to create announcement");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Failed to create announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto m-4">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Create Announcement</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <MdOutlineClose size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter announcement content"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="job">Job Posting</option>
                    <option value="event">Event</option>
                    <option value="academic">Academic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="private">Private (Dashboard Only)</option>
                    <option value="public">Public (Landing Page)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expires At</label>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <div className="flex flex-wrap gap-3">
                  {['student', 'employee', 'faculty', 'all'].map(audience => (
                    <label key={audience} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.targetAudience.includes(audience)}
                        onChange={() => handleTargetAudienceChange(audience)}
                        className="mr-2"
                      />
                      <span className="capitalize">{audience}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Details (only show for job type) */}
            {formData.type === 'job' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Job Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={jobDetails.company}
                      onChange={handleJobDetailsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={jobDetails.position}
                      onChange={handleJobDetailsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Job position"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={jobDetails.location}
                      onChange={handleJobDetailsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Job location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salary</label>
                    <input
                      type="text"
                      name="salary"
                      value={jobDetails.salary}
                      onChange={handleJobDetailsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Salary range"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                  <textarea
                    name="requirements"
                    value={jobDetails.requirements}
                    onChange={handleJobDetailsChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Job requirements"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                    <input
                      type="datetime-local"
                      name="applicationDeadline"
                      value={jobDetails.applicationDeadline}
                      onChange={handleJobDetailsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Link</label>
                    <input
                      type="url"
                      name="applicationLink"
                      value={jobDetails.applicationLink}
                      onChange={handleJobDetailsChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* File Attachments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Attachments</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <label className="cursor-pointer flex items-center justify-center">
                  <MdAttachFile size={24} className="mr-2 text-gray-500" />
                  <span className="text-gray-600">Click to attach files (PDF, Word, Excel, Images)</span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2 mt-4">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <MdAttachFile size={16} className="mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Announcement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AnnouncementCreate;