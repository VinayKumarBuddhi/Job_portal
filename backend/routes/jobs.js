const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Company = require('../models/Company');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Job.find(JSON.parse(queryStr)).populate('company', 'name logo industry');

    // Search functionality
    if (req.query.search) {
      query = query.find({
        $text: { $search: req.query.search }
      });
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Job.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const jobs = await query;

    // Pagination result
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

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name logo industry description website')
      .populate('postedBy', 'name email');

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Employers only)
router.post('/', protect, authorize('employer', 'admin'), [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 50, max: 2000 }).withMessage('Description must be between 50 and 2000 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('type').isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']).withMessage('Invalid job type'),
  body('experience').isIn(['entry', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),
  body('category').isIn(['technology', 'healthcare', 'finance', 'education', 'marketing', 'sales', 'design', 'engineering', 'operations', 'other']).withMessage('Invalid category'),
  body('salary.min').isNumeric().withMessage('Minimum salary must be a number'),
  body('salary.max').isNumeric().withMessage('Maximum salary must be a number'),
  body('applicationDeadline').isISO8601().withMessage('Invalid deadline date')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if user has a company
    const company = await Company.findOne({ owner: req.user.id });
    if (!company) {
      return next(new ErrorResponse('You must create a company profile first', 400));
    }

    req.body.company = company._id;
    req.body.postedBy = req.user.id;

    const job = await Job.create(req.body);

    // Add job to company's jobs array
    company.jobs.push(job._id);
    await company.save();

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Job owner or admin)
router.put('/:id', protect, authorize('employer', 'admin'), [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 50, max: 2000 }).withMessage('Description must be between 50 and 2000 characters'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance']).withMessage('Invalid job type'),
  body('experience').optional().isIn(['entry', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),
  body('category').optional().isIn(['technology', 'healthcare', 'finance', 'education', 'marketing', 'sales', 'design', 'engineering', 'operations', 'other']).withMessage('Invalid category'),
  body('salary.min').optional().isNumeric().withMessage('Minimum salary must be a number'),
  body('salary.max').optional().isNumeric().withMessage('Maximum salary must be a number'),
  body('applicationDeadline').optional().isISO8601().withMessage('Invalid deadline date')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is job owner or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this job`, 401));
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Job owner or admin)
router.delete('/:id', protect, authorize('employer', 'admin'), async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is job owner or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this job`, 401));
    }

    await job.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get jobs by company
// @route   GET /api/jobs/company/:companyId
// @access  Public
router.get('/company/:companyId', async (req, res, next) => {
  try {
    const jobs = await Job.find({ company: req.params.companyId, isActive: true })
      .populate('company', 'name logo industry')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get jobs posted by user
// @route   GET /api/jobs/my-jobs
// @access  Private (Employers only)
router.get('/my-jobs', protect, authorize('employer', 'admin'), async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .populate('company', 'name logo')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 