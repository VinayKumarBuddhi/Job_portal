const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/');
  },
  filename: function (req, file, cb) {
    // Get user ID from URL params or request body
    const userId = req.params.id || req.body.userId;
    if (!userId) {
      return cb(new Error('User ID is required for resume upload'), null);
    }

    // Create filename with user ID and original extension
    const ext = path.extname(file.originalname);
    cb(null, `user_${userId}_resume${ext}`);
  }
});

// File filter to only allow PDF and DOC files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
