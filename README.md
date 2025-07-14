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