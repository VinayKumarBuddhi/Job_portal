import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Admin from './components/Admin';
import EmployerDashboard from './components/employer/EmployerDashboard';
import JobSeekerDashboard from './components/jobseeker/JobSeekerDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/employer" element={<EmployerDashboard />} />
          <Route path="/jobseeker" element={<JobSeekerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
