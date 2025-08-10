const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Company = require('../models/Company');
const fs = require('fs');
const path = require('path');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
router.use(authorize('employer'));

// @desc    Get employer dashboard stats
// @route   GET /api/employer/dashboard
// @access  Private (Employer only)
router.get('/dashboard', async (req, res, next) => {
  try {
    const employerId = req.user.id;
    
    // Get employer's company
    const company = await Company.findOne({ owner: employerId });
    
    // Get stats for employer's jobs
    const totalJobs = await Job.countDocuments({ postedBy: employerId });
    const activeJobs = await Job.countDocuments({ postedBy: employerId, isActive: true });
    
    // Get applications for employer's jobs
    const jobIds = await Job.find({ postedBy: employerId }).select('_id');
    const jobIdArray = jobIds.map(job => job._id);
    
    const totalApplications = await Application.countDocuments({ job: { $in: jobIdArray } });
    const pendingApplications = await Application.countDocuments({ 
      job: { $in: jobIdArray }, 
      status: 'pending' 
    });

    // Get recent applications
    const recentApplications = await Application.find({ job: { $in: jobIdArray } })
      .sort('-appliedAt')
      .limit(5)
      .populate('job', 'title')
      .populate('applicant', 'name email');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalJobs,
          activeJobs,
          totalApplications,
          pendingApplications
        },
        company,
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get employer profile
// @route   GET /api/employer/profile
// @access  Private (Employer only)
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update employer profile
// @route   PUT /api/employer/profile
// @access  Private (Employer only)
router.put('/profile', async (req, res, next) => {
  try {
    const { name, email, phone, company, position, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, company, position, bio },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get employer's company details
// @route   GET /api/employer/company
// @access  Private (Employer only)
router.get('/company', async (req, res, next) => {
  try {
    const company = await Company.findOne({ owner: req.user.id });
    
    if (!company) {
      return res.status(200).json({
        success: true,
        data: {}
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

// @desc    Create or update employer's company
// @route   PUT /api/employer/company
// @access  Private (Employer only)
router.put('/company', async (req, res, next) => {
  try {
    const { name, description, industry, website, location, size, founded } = req.body;

    // Validate required fields
    if (!name) {
      return next(new ErrorResponse('Company name is required', 400));
    }
    if (!description) {
      return next(new ErrorResponse('Company description is required', 400));
    }
    if (!industry) {
      return next(new ErrorResponse('Industry is required', 400));
    }
    if (!size) {
      return next(new ErrorResponse('Company size is required', 400));
    }

    let company = await Company.findOne({ owner: req.user.id });

    if (company) {
      // Update existing company
      company = await Company.findByIdAndUpdate(
        company._id,
        { 
          name, 
          description, 
          industry, 
          website, 
          location, 
          size, 
          founded,
          owner: req.user.id,
          'contact.email': req.user.email // Use employer's email as contact email
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new company
      company = await Company.create({
        name,
        description,
        industry,
        website,
        location,
        size,
        founded,
        owner: req.user.id,
        'contact.email': req.user.email // Use employer's email as contact email
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

// @desc    Get employer's jobs
// @route   GET /api/employer/jobs
// @access  Private (Employer only)
router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .populate('company', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create a new job
// @route   POST /api/employer/jobs
// @access  Private (Employer only)
router.post('/jobs', async (req, res, next) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      type,
      experience,
      salary,
      salaryMin,
      salaryMax,
      category,
      applicationDeadline
    } = req.body;

    // Get employer's company
    const company = await Company.findOne({ owner: req.user.id });
    
    if (!company) {
      return next(new ErrorResponse('Please set up your company details first', 400));
    }

    const job = await Job.create({
      title,
      description,
      requirements,
      location,
      type,
      experience,
      salary: {
        min: salary?.min || salaryMin,
        max: salary?.max || salaryMax,
        currency: (salary && salary.currency) || 'USD'
      },
      category,
      applicationDeadline,
      company: company._id,
      postedBy: req.user.id
    });

    const populatedJob = await Job.findById(job._id).populate('company', 'name');

    res.status(201).json({
      success: true,
      data: populatedJob
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update a job
// @route   PUT /api/employer/jobs/:id
// @access  Private (Employer only)
router.put('/jobs/:id', async (req, res, next) => {
  try {
    const { title, description, requirements, location, type, salary, experience } = req.body;

    let job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the job
    if (job.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this job', 401));
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      { title, description, requirements, location, type, salary, experience },
      { new: true, runValidators: true }
    ).populate('company', 'name');

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a job
// @route   DELETE /api/employer/jobs/:id
// @access  Private (Employer only)
router.delete('/jobs/:id', async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the job
    if (job.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this job', 401));
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

// @desc    Toggle job status (active/inactive)
// @route   PUT /api/employer/jobs/:id/toggle
// @access  Private (Employer only)
router.put('/jobs/:id/toggle', async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the job
    if (job.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this job', 401));
    }

    job.isActive = !job.isActive;
    await job.save();

    const populatedJob = await Job.findById(job._id).populate('company', 'name');

    res.status(200).json({
      success: true,
      data: populatedJob
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get applications for employer's jobs
// @route   GET /api/employer/applications
// @access  Private (Employer only)
router.get('/applications', async (req, res, next) => {
  try {
    // Get employer's job IDs
    const jobIds = await Job.find({ postedBy: req.user.id }).select('_id');
    const jobIdArray = jobIds.map(job => job._id);

    const applications = await Application.find({ job: { $in: jobIdArray } })
      .populate('job', 'title location type salary')
      .populate('applicant', 'name email phone')
      .sort('-appliedAt');

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Download applicant resume for an application
// @route   GET /api/employer/applications/:id/resume
// @access  Private (Employer only)
router.get('/applications/:id/resume', async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id).populate('applicant', 'resume');

    if (!application) {
      return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
    }

    // Verify the job belongs to the employer
    const job = await Job.findById(application.job);
    if (!job || job.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this application\'s resume', 401));
    }

    const userResumePath = application.applicant?.resume;

    if (!userResumePath || userResumePath === '') {
      return next(new ErrorResponse('No resume found for this applicant', 404));
    }

    const resumeFilePath = path.join(__dirname, '..', '..', userResumePath);
    if (!fs.existsSync(resumeFilePath)) {
      return next(new ErrorResponse('Resume file not found on server', 404));
    }

    res.download(resumeFilePath, (err) => {
      if (err) {
        console.error('Error downloading resume:', err);
        return next(new ErrorResponse('Error downloading resume file', 500));
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update application status
// @route   PUT /api/employer/applications/:id/status
// @access  Private (Employer only)
router.put('/applications/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Invalid status', 400));
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return next(new ErrorResponse(`Application not found with id of ${req.params.id}`, 404));
    }

    // Verify the job belongs to the employer
    const job = await Job.findById(application.job);
    if (!job || job.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this application', 401));
    }

    application.status = status;
    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('job', 'title location type salary')
      .populate('applicant', 'name email phone');

    res.status(200).json({
      success: true,
      data: populatedApplication
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 