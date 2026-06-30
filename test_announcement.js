const mongoose = require('mongoose');
const Announcement = require('./backend/models/Announcement');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/socialmediachat', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to MongoDB');
    
    // Create a sample public announcement
    const sampleAnnouncement = new Announcement({
        title: "🎓 Annual Tech Fest 2025",
        content: "Register now for the biggest tech competition of the year! Prizes worth ₹1,00,000.",
        type: "general",
        visibility: "public",
        priority: "high",
        author: "507f1f77bcf86cd7994390e", // Sample user ID
        targetAudience: ["all"],
        isActive: true
    });

    await sampleAnnouncement.save();
    console.log('Sample announcement created successfully');
    
    // Test the public API
    const response = await fetch('http://localhost:9000/api/announcement/public');
    const data = await response.json();
    console.log('API Response:', data);
    
    process.exit(0);
}).catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
});
