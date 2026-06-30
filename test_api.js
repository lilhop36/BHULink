const mongoose = require('mongoose');
const Announcement = require('./backend/models/Announcement');

mongoose.connect('mongodb://localhost:27017/socialmediachat')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check if the announcement model is properly registered
    try {
      const announcements = await Announcement.find({ visibility: 'public', isActive: true })
        .sort({ priority: -1, createdAt: -1 })
        .limit(8)
        .populate('author', 'firstName lastName email')
        .select('title content priority createdAt author');
      
      console.log('Direct query result count:', announcements.length);
      
      if (announcements.length > 0) {
        console.log('✅ Found announcements:');
        announcements.forEach((ann, i) => {
          console.log(`  ${i+1}. ${ann.title} (Priority: ${ann.priority})`);
        });
      } else {
        console.log('❌ No public announcements found');
        
        // Create a test announcement
        const testAnnouncement = new Announcement({
          title: '🎓 Annual Tech Fest 2025',
          content: 'Register now for the biggest tech competition of the year! Join us for workshops, coding competitions, and networking opportunities.',
          type: 'general',
          visibility: 'public',
          priority: 'high',
          targetAudience: ['all'],
          isActive: true,
          author: '507f1f77bcf86cd7994390e' // Using existing user ID
        });

        await testAnnouncement.save();
        console.log('✅ Created test announcement');
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Query error:', error.message);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
