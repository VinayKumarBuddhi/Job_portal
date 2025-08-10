const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { protect, authorize } = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

async function extractTextFromResume(resumePath) {
  const absolute = path.isAbsolute(resumePath)
    ? resumePath
    : path.join(process.cwd(), resumePath);
  if (!fs.existsSync(absolute)) {
    throw new Error('Resume file not found');
  }
  const ext = path.extname(absolute).toLowerCase();
  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(absolute);
    const parsed = await pdfParse(dataBuffer);
    return parsed.text || '';
  }
  if (ext === '.docx') {
    const buffer = fs.readFileSync(absolute);
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }
  if (ext === '.doc') {
    // Basic fallback: .doc not directly supported; return empty
    return '';
  }
  // Plain text fallback
  return fs.readFileSync(absolute, 'utf8');
}

function buildPrompt({ resumeText, jobTitle, jobDescription }) {
  const trimmedResume = (resumeText || '').replace(/\s+/g, ' ').slice(0, 8000);
  const trimmedJD = (jobDescription || '').replace(/\s+/g, ' ').slice(0, 4000);
  return `You are a helpful assistant that writes concise, tailored cover letters and resume highlights.
Job Title: ${jobTitle}
Job Description: ${trimmedJD}
Resume:
${trimmedResume}

Write a professional cover letter (180-300 words) that aligns the candidate's experience with the job. Use a friendly, confident tone, avoid fluff, and incorporate key skills and keywords from the job description. Return only the letter.`;
}

async function callOllama(prompt) {
  const baseUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3';
  const resp = await axios.post(
    `${baseUrl}/api/generate`,
    {
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 320
      }
    },
    { timeout: 300000 }
  );
  return resp.data?.response || '';
}

// @desc Generate AI cover letter from resume + job description
// @route POST /api/ai/generate-cover-letter
// @access Private (Job seekers only)
router.post('/generate-cover-letter', protect, authorize('jobseeker'), async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return next(new ErrorResponse('jobId is required', 400));
    }

    const [user, job] = await Promise.all([
      User.findById(req.user.id).select('resume'),
      Job.findById(jobId).select('title description')
    ]);

    if (!user || !user.resume) {
      return next(new ErrorResponse('Please upload your resume in your profile before using AI generation', 400));
    }
    if (!job) {
      return next(new ErrorResponse('Job not found', 404));
    }

    const resumeText = await extractTextFromResume(user.resume);
    if (!resumeText || resumeText.trim().length < 50) {
      return next(new ErrorResponse('Could not read meaningful text from your resume. Please upload a PDF or DOCX.', 400));
    }

    const prompt = buildPrompt({
      resumeText,
      jobTitle: job.title,
      jobDescription: job.description
    });

    const coverLetter = await callOllama(prompt);
    if (!coverLetter || coverLetter.trim().length < 50) {
      return next(new ErrorResponse('AI generation failed. Please try again.', 502));
    }

    res.status(200).json({ success: true, data: { coverLetter } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;



