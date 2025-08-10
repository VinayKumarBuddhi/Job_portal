import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config/api';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/admin/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || data); // Handle both response structures
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Mock data for now
      setJobs([
        {
          _id: '1',
          title: 'Senior Developer',
          company: { name: 'Tech Corp' },
          location: 'San Francisco',
          type: 'full-time',
          isActive: true,
          applications: 15,
          createdAt: '2024-01-15',
          postedBy: {
            name: 'Jane Smith',
            email: 'jane@techcorp.com'
          }
        },
        {
          _id: '2',
          title: 'Marketing Manager',
          company: { name: 'Digital Solutions' },
          location: 'New York',
          type: 'full-time',
          isActive: true,
          applications: 8,
          createdAt: '2024-01-12',
          postedBy: {
            name: 'John Doe',
            email: 'john@digitalsolutions.com'
          }
        },
        {
          _id: '3',
          title: 'UI/UX Designer',
          company: { name: 'Creative Agency' },
          location: 'Remote',
          type: 'contract',
          isActive: false,
          applications: 3,
          createdAt: '2024-01-10',
          postedBy: {
            name: 'Bob Johnson',
            email: 'bob@creativeagency.com'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/admin/jobs/${jobId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setJobs((Array.isArray(jobs) ? jobs : []).map(job => 
          job._id === jobId ? { ...job, isActive: newStatus } : job
        ));
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/admin/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setJobs((Array.isArray(jobs) ? jobs : []).filter(job => job._id !== jobId));
        }
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(job => {
    const matchesFilter = filter === 'all' || job.isActive === (filter === 'true');
    const companyName = typeof job.company === 'object' ? job.company.name : job.company;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Loading jobs...
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#333' }}>Job Management</h2>
      
      {/* Filters and Search */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Filter by Status:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          >
                    <option value="all">All Jobs</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Search:
          </label>
          <input
            type="text"
            placeholder="Search by title, company, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px',
              width: '300px'
            }}
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          fontWeight: 'bold',
          borderBottom: '1px solid #dee2e6'
        }}>
          <div>Job Title</div>
          <div>Company</div>
          <div>Location</div>
          <div>Type</div>
          <div>Status</div>
          <div>Applications</div>
          <div>Actions</div>
        </div>

        {filteredJobs.map((job) => (
          <div
            key={job._id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
              padding: '15px',
              borderBottom: '1px solid #dee2e6',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{job.title}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Posted by: {job.postedBy?.name}
              </div>
            </div>
            <div>{typeof job.company === 'object' ? job.company.name : job.company}</div>
            <div>{job.location}</div>
            <div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: job.type === 'full-time' ? '#28a745' : 
                               job.type === 'part-time' ? '#17a2b8' :
                               job.type === 'contract' ? '#ffc107' :
                               job.type === 'internship' ? '#6f42c1' : '#fd7e14',
                color: 'white'
              }}>
                {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
              </span>
            </div>
            <div>
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
            <div style={{ textAlign: 'center' }}>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: '#007bff',
                color: 'white'
              }}>
                {job.applications.length}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={() => handleStatusChange(job._id, !job.isActive)}
                style={{
                  padding: '4px 8px',
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
                onClick={() => handleDeleteJob(job._id)}
                style={{
                  padding: '4px 8px',
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

      {filteredJobs.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '50px',
          color: '#666'
        }}>
          No jobs found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default JobManagement; 