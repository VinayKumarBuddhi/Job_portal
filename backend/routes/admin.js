const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
router.use(authorize('admin'));

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalApplications = await Application.countDocuments();

    const activeJobs = await Job.countDocuments({ isActive: true });
    const pendingApplications = await Application.countDocuments({ status: 'pending' });

    // Get recent activities
    const recentJobs = await Job.find().sort('-createdAt').limit(5).populate('company', 'name');
    const recentApplications = await Application.find().sort('-appliedAt').limit(5)
      .populate('job', 'title')
      .populate('applicant', 'name');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalJobs,
          totalCompanies,
          totalApplications,
          activeJobs,
          pendingApplications
        },
        recentJobs,
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments();

    const users = await User.find()
      .select('-password')
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['jobseeker', 'employer', 'admin'].includes(role)) {
      return next(new ErrorResponse('Invalid role', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user verification status
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
router.put('/users/:id/verify', async (req, res, next) => {
  try {
    const { isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return next(new ErrorResponse('Admin cannot delete their own account', 400));
    }

    // Delete all applications by this user
    await Application.deleteMany({ applicant: req.params.id });

    // Delete all jobs posted by this user if they are an employer
    if (user.role === 'employer') {
      await Job.deleteMany({ postedBy: req.params.id });
      // Also delete applications for jobs posted by this user
      const jobsByUser = await Job.find({ postedBy: req.params.id });
      const jobIds = jobsByUser.map(job => job._id);
      await Application.deleteMany({ job: { $in: jobIds } });
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify company
// @route   PUT /api/admin/companies/:id/verify
// @access  Private (Admin only)
router.put('/companies/:id/verify', async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true, runValidators: true }
    );

    if (!company) {
      return next(new ErrorResponse(`Company not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all companies
// @route   GET /api/admin/companies
// @access  Private (Admin only)
router.get('/companies', async (req, res, next) => {
  try {
    const companies = await Company.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all jobs with pagination
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
router.get('/jobs', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Job.countDocuments();

    const jobs = await Job.find()
      .populate('company', 'name')
      .populate('postedBy', 'name email')
      .skip(startIndex)
      .limit(limit)
      .sort('-createdAt');

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: jobs.length,
      pagination,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Toggle job status
// @route   PUT /api/admin/jobs/:id/toggle
// @access  Private (Admin only)
router.put('/jobs/:id/toggle', async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    job.isActive = !job.isActive;
    await job.save();

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all applications with pagination
// @route   GET /api/admin/applications
// @access  Private (Admin only)
router.get('/applications', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Application.countDocuments();

    const applications = await Application.find()
      .populate('job', 'title')
      .populate('applicant', 'name email')
      .populate('company', 'name')
      .skip(startIndex)
      .limit(limit)
      .sort('-appliedAt');

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      pagination,
      data: applications
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 