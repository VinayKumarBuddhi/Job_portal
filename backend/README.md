# Job Portal Backend

A comprehensive REST API for a job portal built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Job Seeker, Employer, Admin)
  - Password encryption with bcrypt

- **Job Management**
  - CRUD operations for job postings
  - Advanced search and filtering
  - Job categories and types
  - Salary ranges and benefits

- **Company Profiles**
  - Company registration and management
  - Industry categorization
  - Company verification system

- **Application System**
  - Job application submission
  - Application status tracking
  - Cover letter and resume upload

- **Admin Dashboard**
  - User management
  - Job moderation
  - Company verification
  - Analytics and statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Jobs
- `GET /api/jobs` - Get all jobs (with search/filter)
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create new job (Employers only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/my-jobs` - Get user's posted jobs

### Applications
- `GET /api/applications` - Get applications (Employers only)
- `GET /api/applications/:id` - Get single application
- `POST /api/applications` - Submit application (Job seekers only)
- `PUT /api/applications/:id/status` - Update application status
- `GET /api/applications/my-applications` - Get user's applications

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get single company
- `POST /api/companies` - Create company (Employers only)
- `PUT /api/companies/:id` - Update company
- `GET /api/companies/my-company` - Get user's company

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users with pagination
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/companies/:id/verify` - Verify company
- `GET /api/admin/jobs` - Get all jobs with pagination
- `PUT /api/admin/jobs/:id/toggle` - Toggle job status

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `config.env` file in the root directory:
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
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Database Models

### User
- Basic info (name, email, password)
- Role (jobseeker, employer, admin)
- Profile details (bio, skills, experience, education)
- Avatar and resume upload

### Job
- Job details (title, description, requirements)
- Company reference
- Salary range and benefits
- Location and type (remote/onsite)
- Application deadline

### Company
- Company information (name, description, industry)
- Contact details and social media
- Size and founding year
- Verification status

### Application
- Job and applicant references
- Cover letter and resume
- Application status tracking
- Expected salary and availability

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation with express-validator
- Rate limiting
- Helmet for security headers
- CORS configuration

## Error Handling

- Centralized error handling middleware
- Custom error response class
- Validation error handling
- MongoDB error handling

## Search & Filtering

- Text search across job titles and descriptions
- Filter by category, location, type, experience
- Pagination support
- Sorting options

## File Upload

- Resume upload functionality
- Avatar upload for users
- Company logo upload
- File validation and size limits 