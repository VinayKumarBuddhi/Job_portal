const express = require('express');
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    let query = Company.find({ isActive: true });

    // Search functionality
    if (req.query.search) {
      query = query.find({
        $text: { $search: req.query.search }
      });
    }

    // Filter by industry
    if (req.query.industry) {
      query = query.find({ industry: req.query.industry });
    }

    // Filter by size
    if (req.query.size) {
      query = query.find({ size: req.query.size });
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
    const total = await Company.countDocuments({ isActive: true });

    query = query.skip(startIndex).limit(limit);

    const companies = await query;

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
      count: companies.length,
      pagination,
      data: companies
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('owner', 'name email')
      .populate({
        path: 'jobs',
        match: { isActive: true },
        options: { sort: { createdAt: -1 } }
      });

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

// @desc    Create new company
// @route   POST /api/companies
// @access  Private (Employers only)
router.post('/', protect, authorize('employer'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters'),
  body('industry').isIn(['technology', 'healthcare', 'finance', 'education', 'marketing', 'sales', 'design', 'engineering', 'operations', 'retail', 'manufacturing', 'consulting', 'non-profit', 'government', 'other']).withMessage('Invalid industry'),
  body('size').isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).withMessage('Invalid company size'),
  body('contact.email').isEmail().normalizeEmail().withMessage('Please provide a valid contact email'),
  body('website').optional().isURL().withMessage('Please provide a valid website URL'),
  body('founded').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Invalid founded year')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if user already has a company
    const existingCompany = await Company.findOne({ owner: req.user.id });
    if (existingCompany) {
      return next(new ErrorResponse('You already have a company profile', 400));
    }

    req.body.owner = req.user.id;

    const company = await Company.create(req.body);

    res.status(201).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private (Company owner or admin)
router.put('/:id', protect, authorize('employer', 'admin'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be between 2 and 100 characters'),
  body('description').optional().trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be between 20 and 1000 characters'),
  body('industry').optional().isIn(['technology', 'healthcare', 'finance', 'education', 'marketing', 'sales', 'design', 'engineering', 'operations', 'retail', 'manufacturing', 'consulting', 'non-profit', 'government', 'other']).withMessage('Invalid industry'),
  body('size').optional().isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).withMessage('Invalid company size'),
  body('contact.email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid contact email'),
  body('website').optional().isURL().withMessage('Please provide a valid website URL'),
  body('founded').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Invalid founded year')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let company = await Company.findById(req.params.id);

    if (!company) {
      return next(new ErrorResponse(`Company not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is company owner or admin
    if (company.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this company`, 401));
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private (Company owner or admin)
router.delete('/:id', protect, authorize('employer', 'admin'), async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new ErrorResponse(`Company not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is company owner or admin
    if (company.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this company`, 401));
    }

    await company.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's company
// @route   GET /api/companies/my-company
// @access  Private (Employers only)
router.get('/my-company', protect, authorize('employer'), async (req, res, next) => {
  try {
    const company = await Company.findOne({ owner: req.user.id })
      .populate('owner', 'name email')
      .populate({
        path: 'jobs',
        options: { sort: { createdAt: -1 } }
      });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'No company profile found'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 