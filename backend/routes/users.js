const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (Admin only) 
router.get('/', protect, authorize('admin'),async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Check if user is authorized to view this profile
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to view this profile`, 401));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().trim(),
  body('location').optional().trim(),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot be more than 500 characters'),
  body('skills').optional().isArray().withMessage('Skills must be an array'),
  body('experience').optional().isIn(['entry', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),
  body('education.degree').optional().trim(),
  body('education.field').optional().trim(),
  body('education.institution').optional().trim(),
  body('education.year').optional().isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Invalid education year')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if user is authorized to update this profile
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this profile`, 401));
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (User owner or admin)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is user owner or admin
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this user`, 401));
    }

    await user.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload resume
// @route   POST /api/users/:id/resume
// @access  Private (User owner only)
router.post('/:id/resume', protect, upload.single('resume'), async (req, res, next) => {
  try {
    // Check if user is authorized to upload resume
    if (req.params.id !== req.user.id) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to upload resume for this user`, 401));
    }

    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Delete old resume file if exists
    if (user.resume && user.resume !== '') {
      const oldResumePath = path.join(__dirname, '..', user.resume);
      if (fs.existsSync(oldResumePath)) {
        fs.unlinkSync(oldResumePath);
      }
    }

    // Update user with new resume path
    const resumePath = req.file.path.replace(/\\/g, '/'); // Normalize path for cross-platform
    user.resume = resumePath;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        resume: resumePath,
        filename: req.file.originalname
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Download resume
// @route   GET /api/users/:id/resume
// @access  Private (User owner or admin)
router.get('/:id/resume', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Check if user is authorized to download resume
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to download this resume`, 401));
    }

    if (!user.resume || user.resume === '') {
      return next(new ErrorResponse('No resume found for this user', 404));
    }

    const resumePath = path.join(__dirname, '..', user.resume);
    if (!fs.existsSync(resumePath)) {
      return next(new ErrorResponse('Resume file not found', 404));
    }

    res.download(resumePath);
  } catch (error) {
    next(error);
  }
});

// @desc    Delete resume
// @route   DELETE /api/users/:id/resume
// @access  Private (User owner only)
router.delete('/:id/resume', protect, async (req, res, next) => {
  try {
    // Check if user is authorized to delete resume
    if (req.params.id !== req.user.id) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete resume for this user`, 401));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    if (!user.resume || user.resume === '') {
      return next(new ErrorResponse('No resume found for this user', 404));
    }

    // Delete resume file
    const resumePath = path.join(__dirname, '..', user.resume);
    if (fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
    }

    // Update user to remove resume reference
    user.resume = '';
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 