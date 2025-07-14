const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  coverLetter: {
    type: String,
    required: [true, 'Please provide a cover letter'],
    maxlength: [2000, 'Cover letter cannot be more than 2000 characters']
  },
  resume: {
    type: String,
    required: [true, 'Please upload your resume']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  expectedSalary: {
    type: Number,
    required: [true, 'Please provide your expected salary']
  },
  availability: {
    type: String,
    enum: ['immediately', '2-weeks', '1-month', '3-months', 'negotiable'],
    required: [true, 'Please specify your availability']
  },
  questions: [{
    question: String,
    answer: String
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  isViewed: {
    type: Boolean,
    default: false
  },
  viewedAt: Date,
  appliedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure one application per job per applicant
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema); 