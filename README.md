# Job Portal - MERN Stack Application

A full-featured job portal built with the MERN (MongoDB, Express.js, React.js, Node.js) stack. This application provides a comprehensive platform for job seekers and employers to connect, with features for job posting, application management, and company profiles.

## 🚀 Features

### For Job Seekers
- **User Registration & Authentication** - Secure signup and login
- **Job Search & Filtering** - Advanced search with multiple filters
- **Job Applications** - Easy application submission with resume upload
- **Application Tracking** - Monitor application status
- **Profile Management** - Complete profile with skills and experience
- **Job Alerts** - Get notified about new opportunities

### For Employers
- **Company Registration** - Create and manage company profiles
- **Job Posting** - Post and manage job listings
- **Application Management** - Review and manage applications
- **Candidate Search** - Find qualified candidates
- **Analytics Dashboard** - Track job performance

### For Administrators
- **User Management** - Manage all users and roles
- **Job Moderation** - Approve and manage job postings
- **Company Verification** - Verify company profiles
- **Analytics** - Comprehensive platform statistics
- **System Monitoring** - Monitor platform health

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **multer** - File upload handling
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Server state management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Heroicons** - Icons
- **Custom CSS** - Styling

## 📁 Project Structure

```
mernStack/
├── backend/                 # Backend API
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── config.env          # Environment variables
│   ├── package.json        # Backend dependencies
│   └── server.js           # Server entry point
├── frontend/               # Frontend application
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # State management
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── package.json        # Frontend dependencies
│   └── tsconfig.json       # TypeScript config
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mernStack
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Environment Setup**

Create `backend/config.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
# Local LLM (Ollama) configuration
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3
```

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. **Start the Application**

Start the backend server:
```bash
cd backend
npm run dev
```

Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🤖 AI Cover Letter Generation (via Ollama)

We added an AI-powered feature that auto-generates a tailored cover letter from the job seeker’s resume and the selected job description.

### What was implemented
- Backend route `POST /api/ai/generate-cover-letter` (protected, `jobseeker` role):
  - Reads the authenticated user’s resume file path (`User.resume`).
  - Extracts resume text (PDF via `pdf-parse`, DOCX via `mammoth`).
  - Loads the job’s title and description by `jobId`.
  - Calls the local Ollama server (`/api/generate`) with model `OLLAMA_MODEL` (default `llama3`).
  - Returns `{ coverLetter }` to the client.
- Frontend (`jobseeker/BrowseJobs.js`):
  - In the Apply modal, added a “Generate with AI” button that calls the above endpoint and pre-fills the Cover Letter textarea. Supports “Regenerate”.

### Dependencies added (backend)
- `axios` (HTTP client to call Ollama)
- `pdf-parse` (PDF text extraction)
- `mammoth` (DOCX text extraction)

### Resume format support
- Recommended: PDF or DOCX. Plain `.doc` is not parsed (falls back to empty). Ensure your resume is uploaded in Profile before using AI generation.

### Install and run Ollama (Windows)
1. Install Ollama
   - Winget: `winget install Ollama.Ollama -s winget`
   - Or download installer from `https://ollama.com`
2. Pull a model
   - `ollama pull llama3` (or `ollama pull llama3:8b-instruct`)
3. Ensure server is running
   - Typically runs automatically. Verify: `curl http://127.0.0.1:11434/api/version`
   - If needed, start manually: `ollama serve`
4. Configure backend (optional)
   - Set `OLLAMA_URL` and `OLLAMA_MODEL` in `backend/config.env` (defaults shown above) and restart the backend.

### Using the AI feature
1. Upload your resume (PDF/DOCX) in your profile.
2. Navigate to Job Seeker → Browse Jobs → click Apply on a job.
3. Click “Generate with AI” to auto-fill the cover letter. Edit if needed, then submit.

### Troubleshooting
- Port in use (11434): Ollama is already running. Don’t run `ollama serve` again. Verify via `curl http://127.0.0.1:11434/api/version`.
- Change port: `set OLLAMA_HOST=127.0.0.1:11500` then `ollama serve`. Update `OLLAMA_URL` accordingly.
- Model not found: run `ollama pull <modelTag>` and ensure `OLLAMA_MODEL` matches the pulled tag.
- Slow generation on CPU: consider a smaller/quantized variant, or keep requests short.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Job Endpoints
- `GET /api/jobs` - Get all jobs (with search/filter)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job (Employers only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Company Endpoints
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get single company
- `POST /api/companies` - Create company (Employers only)
- `PUT /api/companies/:id` - Update company

### Application Endpoints
- `GET /api/applications` - Get applications (Employers only)
- `POST /api/applications` - Submit application (Job seekers only)
- `PUT /api/applications/:id/status` - Update application status

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/companies/:id/verify` - Verify company

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers
- Role-based access control

## 🎨 UI/UX Features

- Responsive design (mobile-first)
- Modern and clean interface
- Smooth animations and transitions
- Intuitive navigation
- Form validation and error handling
- Loading states and feedback
- Toast notifications

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🗄️ Database Schema

### User Model
- Basic info (name, email, password)
- Role (jobseeker, employer, admin)
- Profile details (bio, skills, experience)
- Avatar and resume upload

### Job Model
- Job details (title, description, requirements)
- Company reference
- Salary range and benefits
- Location and type (remote/onsite)
- Application deadline

### Company Model
- Company information (name, description, industry)
- Contact details and social media
- Size and founding year
- Verification status

### Application Model
- Job and applicant references
- Cover letter and resume
- Application status tracking
- Expected salary and availability

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables
2. Build the application
3. Deploy to your preferred hosting service (Heroku, Vercel, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service

### Database
- Use MongoDB Atlas for cloud database
- Set up proper connection strings
- Configure network access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Future Enhancements

- Real-time notifications
- Advanced search algorithms
- AI-powered job matching
- Video interviews
- Skill assessments
- Mobile app development
- Multi-language support
- Advanced analytics
- Integration with LinkedIn
- Email marketing features

---

**Built with ❤️ using the MERN stack** 