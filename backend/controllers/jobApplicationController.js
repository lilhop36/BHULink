const fs = require('fs');
const path = require('path');

// Handle job application submission
exports.submitApplication = async (req, res) => {
  try {
    const { fullName, email, phone, additionalInfo, announcementId, announcementTitle } = req.body;
    
    // Handle file upload
    let cvPath = null;
    let cvFileName = null;
    
    if (req.files && req.files.cv) {
      const cvFile = req.files.cv;
      const uploadDir = path.join(__dirname, '../uploads/job-applications');
      
      // Ensure upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const originalName = cvFile.originalname;
      const fileExt = path.extname(originalName);
      const baseName = path.basename(originalName, fileExt);
      const uniqueFileName = `${baseName}_${timestamp}${fileExt}`;
      
      cvPath = path.join(uploadDir, uniqueFileName);
      cvFileName = uniqueFileName;
      
      // Move file to upload directory
      fs.renameSync(cvFile.path, cvPath);
    }

    // Create job application record (you'd need to create a JobApplication model)
    const jobApplication = {
      fullName,
      email,
      phone,
      additionalInfo,
      announcementId,
      announcementTitle,
      cvPath,
      cvFileName,
      submittedAt: new Date(),
      status: 'pending' // pending, reviewed, accepted, rejected
    };

    // For now, store in a simple JSON file (in production, use a database)
    const applicationsFile = path.join(__dirname, '../data/job-applications.json');
    
    let applications = [];
    if (fs.existsSync(applicationsFile)) {
      const data = fs.readFileSync(applicationsFile, 'utf8');
      applications = JSON.parse(data);
    }
    
    applications.push(jobApplication);
    fs.writeFileSync(applicationsFile, JSON.stringify(applications, null, 2));

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      data: jobApplication
    });

  } catch (error) {
    console.error('Job application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// Get all job applications (for admin dashboard)
exports.getAllApplications = async (req, res) => {
  try {
    const applicationsFile = path.join(__dirname, '../data/job-applications.json');
    
    if (fs.existsSync(applicationsFile)) {
      const data = fs.readFileSync(applicationsFile, 'utf8');
      const applications = JSON.parse(data);
      
      // Sort by submission date (newest first)
      applications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      
      res.status(200).json({
        success: true,
        data: applications
      });
    } else {
      res.status(200).json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
      error: error.message
    });
  }
};
