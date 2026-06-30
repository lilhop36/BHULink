const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['general', 'job', 'event', 'academic'],
    default: 'general'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetAudience: {
    type: [String],
    enum: ['student', 'employee', 'faculty', 'all'],
    default: ['all']
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  jobDetails: {
    company: String,
    position: String,
    location: String,
    salary: String,
    requirements: String,
    applicationDeadline: Date,
    applicationLink: String
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
announcementSchema.index({ visibility: 1, isActive: 1, createdAt: -1 });
announcementSchema.index({ type: 1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1 });

module.exports = mongoose.model("Announcement", announcementSchema);
