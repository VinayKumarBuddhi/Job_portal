const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @desc    Get all applications (for employers)
// @route   GET /api/applications
// @access  Private (Employers only)
router.get('/', protect, authorize('employer', 'admin'), async (req, res, next) => {
  try {
    let query = Application.find({ company: req.user.company })
      .populate('job', 'title company')
      .populate('applicant', 'name email avatar')
      .sort('-appliedAt');

    // Filter by status
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    // Filter by job
    if (req.query.job) {
      query = query.find({ job: req.query.job });
    }

    const applications = await query;

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's applications
// @route   GET /api/applications/my-applications
// @access  Private (Job seekers only)
router.get('/my-applications', protect, authorize('jobseeker'), async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location type experience')
      .populate('company', 'name logo')
      .sort('-appliedAt');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company description')
      .populate('applicant', 'name email avatar phone location bio skills experience')
      .populate('company', 'name logo');

    if (!application) {
      return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
    }

    // Check if user is authorized to view this application
    if (application.applicant.toString() !== req.user.id && 
        application.company.owner.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to view this application`, 401));
    }

    // Mark as viewed if employer is viewing
    if (application.company.owner.toString() === req.user.id && !application.isViewed) {
      application.isViewed = true;
      application.viewedAt = Date.now();
      await application.save();
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new application
// @route   POST /api/applications
// @access  Private (Job seekers only)
router.post('/', protect, authorize('jobseeker'), [
  body('job').isMongoId().withMessage('Valid job ID is required'),
  body('coverLetter').trim().isLength({ min: 50, max: 2000 }).withMessage('Cover letter must be between 50 and 2000 characters'),
  body('resume').notEmpty().withMessage('Resume is required'),
  body('expectedSalary').isNumeric().withMessage('Expected salary must be a number'),
  body('availability').isIn(['immediately', '2-weeks', '1-month', '3-months', 'negotiable']).withMessage('Invalid availability')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { job: jobId, coverLetter, resume, expectedSalary, availability } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return next(new ErrorResponse('Job not found', 404));
    }

    if (!job.isActive) {
      return next(new ErrorResponse('This job is no longer accepting applications', 400));
    }

    // Check if application deadline has passed
    if (new Date() > new Date(job.applicationDeadline)) {
      return next(new ErrorResponse('Application deadline has passed', 400));
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (existingApplication) {
      return next(new ErrorResponse('You have already applied for this job', 400));
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user.id,
      company: job.company,
      coverLetter,
      resume,
      expectedSalary,
      availability
    });

    // Add application to job's applications array
    job.applications.push(application._id);
    await job.save();

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer or admin)
router.put('/:id/status', protect, authorize('employer', 'admin'), [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot be more than 500 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
    }

    // Check if user is authorized to update this application
    if (application.company.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this application`, 401));
    }

    application.status = req.body.status;
    if (req.body.notes) {
      application.notes = req.body.notes;
    }

    await application.save();

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private (Application owner only)
router.delete('/:id', protect, authorize('jobseeker'), async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is application owner
    if (application.applicant.toString() !== req.user.id) {
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this application`, 401));
    }

    // Only allow deletion if status is pending
    if (application.status !== 'pending') {
      return next(new ErrorResponse('Cannot delete application that has been processed', 400));
    }

    await application.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 