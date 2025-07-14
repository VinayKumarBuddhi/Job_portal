import React, { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../../config/api';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    type: 'full-time',
    experience: 'entry',
    salaryMin: '',
    salaryMax: '',
    category: '',
    applicationDeadline: ''
  });
  const [companySetup, setCompanySetup] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/employer/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkCompanySetup = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/employer/company`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanySetup(data.data && data.data.name);
      }
    } catch (error) {
      console.error('Error checking company setup:', error);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    checkCompanySetup();
  }, [fetchJobs, checkCompanySetup]);

  const handleInputChange = (e) => {
    setJobForm({
      ...jobForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingJob ? `${BASE_URL}/employer/jobs/${editingJob._id}` : `${BASE_URL}/employer/jobs`;
      const jobPayload = {
        title: jobForm.title,
        description: jobForm.description,
        requirements: jobForm.requirements ? jobForm.requirements.split(',').map(r => r.trim()) : [],
        location: jobForm.location,
        type: jobForm.type,
        experience: jobForm.experience,
        salary: {
          min: Number(jobForm.salaryMin),
          max: Number(jobForm.salaryMax),
          currency: 'USD'
        },
        category: jobForm.category,
        applicationDeadline: jobForm.applicationDeadline
      };
      const response = await fetch(url, {
        method: editingJob ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobPayload)
      });
      if (response.ok) {
        const data = await response.json();
        if (editingJob) {
          setJobs(jobs.map(job => job._id === editingJob._id ? data.data : job));
        } else {
          setJobs([data.data, ...jobs]);
        }
        setShowJobForm(false);
        setEditingJob(null);
        setJobForm({
          title: '',
          description: '',
          requirements: '',
          location: '',
          type: 'full-time',
          experience: 'entry',
          salaryMin: '',
          salaryMax: '',
          category: '',
          applicationDeadline: ''
        });
      } else {
        const errorData = await response.json();
        if (errorData.message && errorData.message.includes('company details first')) {
          alert('Please set up your company details first. Go to the "Company Details" tab to add your company information.');
        } else {
          alert(errorData.message || 'Failed to save job');
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      type: job.type,
      experience: job.experience,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      category: job.category,
      applicationDeadline: job.applicationDeadline
    });
    setShowJobForm(true);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/employer/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setJobs(jobs.filter(job => job._id !== jobId));
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete job');
        }
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Network error. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/employer/jobs/${jobId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setJobs(jobs.map(job => 
          job._id === jobId ? { ...job, isActive: !currentStatus } : job
        ));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading your jobs...</div>
        <div style={{ color: '#666' }}>Fetching job listings</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ color: '#dc3545', marginBottom: '20px' }}>Error: {error}</div>
        <button
          onClick={fetchJobs}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#333', margin: 0 }}>Job Management</h2>
        <button
          onClick={() => setShowJobForm(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          + Post New Job
        </button>
      </div>

      {!companySetup && (
        <div style={{
          padding: '15px',
          marginBottom: '20px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '5px',
          color: '#856404'
        }}>
          <strong>Setup Required:</strong> Please set up your company details first before posting jobs. 
          Go to the "Company Details" tab to add your company information.
        </div>
      )}

      {/* Job Form Modal */}
      {showJobForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>
                {editingJob ? 'Edit Job' : 'Post New Job'}
              </h3>
              <button
                onClick={() => {
                  setShowJobForm(false);
                  setEditingJob(null);
                  setJobForm({
                    title: '',
                    description: '',
                    requirements: '',
                    location: '',
                    type: 'full-time',
                    experience: 'entry',
                    salaryMin: '',
                    salaryMax: '',
                    category: '',
                    applicationDeadline: ''
                  });
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={jobForm.title}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={jobForm.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', resize: 'vertical' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  value={jobForm.requirements}
                  onChange={handleInputChange}
                  rows="3"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px', resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={jobForm.location}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Job Type *
                  </label>
                  <select
                    name="type"
                    value={jobForm.type}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
                  >
                    <option value="">Select type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Minimum Salary *
                  </label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={jobForm.salaryMin}
                    onChange={handleInputChange}
                    required
                    min="0"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Maximum Salary *
                  </label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={jobForm.salaryMax}
                    onChange={handleInputChange}
                    required
                    min="0"
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Category *
                </label>
                <select
                  name="category"
                  value={jobForm.category}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
                >
                  <option value="">Select category</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="design">Design</option>
                  <option value="engineering">Engineering</option>
                  <option value="operations">Operations</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Application Deadline *
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={jobForm.applicationDeadline}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowJobForm(false);
                    setEditingJob(null);
                    setJobForm({
                      title: '',
                      description: '',
                      requirements: '',
                      location: '',
                      type: 'full-time',
                      experience: 'entry',
                      salaryMin: '',
                      salaryMax: '',
                      category: '',
                      applicationDeadline: ''
                    });
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  {editingJob ? 'Update Job' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📝</div>
            <div>No jobs posted yet</div>
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              Click "Post New Job" to create your first job listing
            </div>
          </div>
        ) : (
          <div>
            {jobs.map((job) => (
              <div
                key={job._id}
                style={{
                  padding: '20px',
                  borderBottom: '1px solid #dee2e6',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto',
                  gap: '20px',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: '0 10px 0 0', color: '#333' }}>{job.title}</h3>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: job.isActive ? '#28a745' : '#6c757d',
                      color: 'white'
                    }}>
                      {job.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                    📍 {job.location} • 💼 {job.type} • 💰 {job.salary ? `${job.salary.min} - ${job.salary.max} ${job.salary.currency}` : 'Not specified'}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    📅 Posted: {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => handleEdit(job)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job._id, job.isActive)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: job.isActive ? '#6c757d' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {job.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobManagement; 