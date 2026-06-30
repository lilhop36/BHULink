const Announcement = require("../models/Announcement");
const fs = require("fs");
const path = require("path");

// Helper: extract nested jobDetails from flat FormData fields (jobDetails.company, etc.)
const extractJobDetails = (body) => {
  const jobDetails = {};
  for (const key in body) {
    if (key.startsWith("jobDetails.")) {
      const field = key.split(".")[1];
      jobDetails[field] = body[key];
    }
  }
  return Object.keys(jobDetails).length ? jobDetails : null;
};

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      visibility,
      priority,
      expiresAt,
      targetAudience, // this is a JSON string from frontend
    } = req.body;

    // Parse targetAudience
    let parsedAudience = ["all"];
    if (targetAudience) {
      try {
        parsedAudience = JSON.parse(targetAudience);
      } catch (e) {
        parsedAudience = [targetAudience];
      }
    }

    // Build jobDetails if type === 'job'
    let jobDetailsObj = null;
    if (type === "job") {
      jobDetailsObj = extractJobDetails(req.body);
      // If no nested fields found, maybe they were sent as direct properties? (but frontend uses nested)
      if (!jobDetailsObj || Object.keys(jobDetailsObj).length === 0) {
        // fallback: check for direct fields (just in case)
        const { company, position, location, salary, requirements, applicationDeadline, applicationLink } = req.body;
        if (company || position || location || salary || requirements || applicationDeadline || applicationLink) {
          jobDetailsObj = { company, position, location, salary, requirements, applicationDeadline, applicationLink };
        }
      }
    }

    // Process uploaded files
    const attachments = (req.files || []).map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date(),
    }));

    const announcement = new Announcement({
      title,
      content,
      type: type || "general",
      visibility: visibility || "private",
      priority: priority || "medium",
      expiresAt: expiresAt || null,
      targetAudience: parsedAudience,
      jobDetails: jobDetailsObj,
      attachments,
      author: req.user.id, // assuming authorization middleware sets req.user
      isActive: true,
    });

    await announcement.save();

    // Populate author info before sending response
    const populatedAnnouncement = await Announcement.findById(announcement._id).populate("author", "name email");

    res.status(201).json({
      success: true,
      data: populatedAnnouncement,
      message: "Announcement created successfully",
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    // If files were uploaded but save fails, clean them to avoid orphan files
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Failed to delete file:", file.path, err);
        });
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create announcement",
    });
  }
};

// Get public announcements for landing page (no authorization required)
exports.getPublicAnnouncements = async (req, res) => {
  try {
    console.log('getPublicAnnouncements called');
    const { limit = 8 } = req.query; // Limit to 8 for landing page cards
    let filter = { 
      isActive: true,
      visibility: "public"
    };
    console.log('Filter:', JSON.stringify(filter));

    const announcements = await Announcement.find(filter)
      .sort({ priority: -1, createdAt: -1 }) // high priority first, then newest
      .limit(parseInt(limit))
      .populate("author", "firstName lastName email")
      .select("title content priority createdAt author");

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Get public announcements error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all announcements (with filters)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const { type, visibility, audience } = req.query;
    let filter = { isActive: true };

    if (type) filter.type = type;
    if (visibility) filter.visibility = visibility;
    if (audience) filter.targetAudience = { $in: [audience] };

    // Optional: only show public announcements to non-authenticated users,
    // but here we assume route is protected by authorization.
    // You can add role‑based filtering if needed.

    const announcements = await Announcement.find(filter)
      .sort({ priority: -1, createdAt: -1 }) // high priority first, then newest
      .populate("author", "name email");

    res.status(200).json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single announcement by ID
exports.getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate("author", "name email");
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    console.error("Get announcement error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update an announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    // Optionally check if req.user is author or admin (add your own logic)
    // if (announcement.author.toString() !== req.user.id && req.user.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: "Not authorized" });
    // }

    const updateData = { ...req.body };

    // Handle targetAudience if sent as JSON string
    if (updateData.targetAudience && typeof updateData.targetAudience === "string") {
      try {
        updateData.targetAudience = JSON.parse(updateData.targetAudience);
      } catch (e) {
        // keep as is
      }
    }

    // Handle jobDetails if type is job and nested fields exist
    if (updateData.type === "job") {
      const jobDetailsObj = extractJobDetails(req.body);
      if (jobDetailsObj && Object.keys(jobDetailsObj).length) {
        updateData.jobDetails = jobDetailsObj;
      }
    }

    // If new files are uploaded, add them to existing attachments
    if (req.files && req.files.length) {
      const newAttachments = req.files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
      }));
      updateData.$push = { attachments: { $each: newAttachments } };
      delete updateData.attachments; // avoid overwriting
    }

    const updated = await Announcement.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("author", "name email");

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Update announcement error:", error);
    // Clean up newly uploaded files if update fails
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => err && console.error("Failed to delete file:", file.path, err));
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete an announcement (soft delete or hard delete? Schema has isActive, we'll soft delete)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    // Optionally check authorization

    // Soft delete – set isActive to false
    announcement.isActive = false;
    await announcement.save();

    // (Optional) also delete physical files from disk? Usually keep for history.
    // For hard delete: await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
