import React, { useState, useEffect, useCallback } from 'react';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/employer/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/employer/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, [fetchApplications, fetchJobs]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingStatus(applicationId);
      setSuccessMessage('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/employer/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setApplications(applications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));
        setSuccessMessage(`Application status updated to ${getStatusLabel(newStatus)} successfully!`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Network error. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const jobMatch = selectedJob === 'all' || app.job?._id === selectedJob;
    const statusMatch = statusFilter === 'all' || app.status === statusFilter;
    return jobMatch && statusMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'accepted': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'shortlisted': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'shortlisted': return 'Shortlisted';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading applications...</div>
        <div style={{ color: '#666' }}>Fetching applications for your company's jobs</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ color: '#dc3545', marginBottom: '20px' }}>Error: {error}</div>
        <button
          onClick={fetchApplications}
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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '10px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '25px',
        borderLeft: '4px solid #28a745'
      }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '24px' }}>Job Applications</h2>
        <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
          Manage applications for jobs posted by your company
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '15px 20px',
          borderRadius: '8px',
          marginBottom: '25px',
          border: '1px solid #c3e6cb',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <span style={{ fontWeight: '500' }}>{successMessage}</span>
        </div>
      )}

      {/* Filters Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '25px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px' }}>Filter Applications</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              Filter by Job
            </label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Jobs ({jobs.length})</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Status ({applications.length})</option>
              <option value="pending">Pending ({applications.filter(app => app.status === 'pending').length})</option>
              <option value="shortlisted">Shortlisted ({applications.filter(app => app.status === 'shortlisted').length})</option>
              <option value="accepted">Accepted ({applications.filter(app => app.status === 'accepted').length})</option>
              <option value="rejected">Rejected ({applications.filter(app => app.status === 'rejected').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 25px',
          borderBottom: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{ margin: 0, color: '#333', fontSize: '18px' }}>
            Applications ({filteredApplications.length})
          </h3>
        </div>
        
        {filteredApplications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
            <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>No applications found</div>
            <div style={{ fontSize: '14px', color: '#888' }}>
              {applications.length === 0 ? 'No applications received for your company\'s jobs yet' : 'No applications match your filters'}
            </div>
          </div>
        ) : (
          <div>
            {filteredApplications.map((application, index) => (
              <div
                key={application._id}
                style={{
                  background: '#fff',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginBottom: '30px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  border: '1px solid #e9ecef',
                }}
              >
                {/* Top: Applicant Info & Job Info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
                  {/* Applicant Info */}
                  <div style={{ minWidth: 220, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        backgroundColor: '#28a745',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 18,
                      }}>{application.applicant?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 18, color: '#222' }}>{application.applicant?.name || 'Unknown Applicant'}</div>
                        <div style={{ color: '#666', fontSize: 15, marginTop: 2 }}>{application.applicant?.email || 'No email'}{application.applicant?.phone ? ` | ${application.applicant.phone}` : ''}</div>
                      </div>
                    </div>
                  </div>
                  {/* Job Info */}
                  <div style={{ minWidth: 220, flex: 1 }}>
                    <div style={{ fontWeight: 500, color: '#333', marginBottom: 6 }}>Applied for: {application.job?.title || 'Unknown Job'}</div>
                    <div style={{ color: '#666', fontSize: 15, marginBottom: 2 }}>
                      <span style={{ marginRight: 12 }}>📍 {application.job?.location || 'No location'}</span>
                      <span style={{ marginRight: 12 }}>💼 {application.job?.type || 'No type'}</span>
                      <span>💰 {application.job?.salary ? `${application.job.salary.min} - ${application.job.salary.max} ${application.job.salary.currency}` : 'Salary not specified'}</span>
                    </div>
                  </div>
                  {/* Status & Actions */}
                  <div style={{ minWidth: 180, flex: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    <span style={{
                      padding: '8px 18px',
                      borderRadius: 20,
                      fontSize: 14,
                      fontWeight: 600,
                      backgroundColor: getStatusColor(application.status),
                      color: 'white',
                      marginBottom: 8,
                    }}>{getStatusLabel(application.status)}</span>
                    {application.status === 'pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <button
                          onClick={() => handleStatusUpdate(application._id, 'shortlisted')}
                          disabled={updatingStatus === application._id}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: updatingStatus === application._id ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            opacity: updatingStatus === application._id ? 0.6 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => !updatingStatus && (e.target.style.transform = 'translateY(-1px)', e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)')}
                          onMouseLeave={(e) => !updatingStatus && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)')}
                        >
                          {updatingStatus === application._id ? '⏳ Updating...' : '📋 Shortlist'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application._id, 'accepted')}
                          disabled={updatingStatus === application._id}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: updatingStatus === application._id ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            opacity: updatingStatus === application._id ? 0.6 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => !updatingStatus && (e.target.style.transform = 'translateY(-1px)', e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)')}
                          onMouseLeave={(e) => !updatingStatus && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)')}
                        >
                          {updatingStatus === application._id ? '⏳ Updating...' : '✅ Accept'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application._id, 'rejected')}
                          disabled={updatingStatus === application._id}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: updatingStatus === application._id ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            opacity: updatingStatus === application._id ? 0.6 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => !updatingStatus && (e.target.style.transform = 'translateY(-1px)', e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)')}
                          onMouseLeave={(e) => !updatingStatus && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)')}
                        >
                          {updatingStatus === application._id ? '⏳ Updating...' : '❌ Reject'}
                        </button>
                      </div>
                    )}

                    {application.status === 'shortlisted' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        <button
                          onClick={() => handleStatusUpdate(application._id, 'accepted')}
                          disabled={updatingStatus === application._id}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: updatingStatus === application._id ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            opacity: updatingStatus === application._id ? 0.6 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => !updatingStatus && (e.target.style.transform = 'translateY(-1px)', e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)')}
                          onMouseLeave={(e) => !updatingStatus && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)')}
                        >
                          {updatingStatus === application._id ? '⏳ Updating...' : '✅ Accept'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(application._id, 'rejected')}
                          disabled={updatingStatus === application._id}
                          style={{
                            padding: '10px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: updatingStatus === application._id ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            opacity: updatingStatus === application._id ? 0.6 : 1,
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => !updatingStatus && (e.target.style.transform = 'translateY(-1px)', e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)')}
                          onMouseLeave={(e) => !updatingStatus && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)')}
                        >
                          {updatingStatus === application._id ? '⏳ Updating...' : '❌ Reject'}
                        </button>
                      </div>
                    )}

                    {(application.status === 'accepted' || application.status === 'rejected') && (
                      <button
                        onClick={() => handleStatusUpdate(application._id, 'pending')}
                        disabled={updatingStatus === application._id}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: updatingStatus === application._id ? 'not-allowed' : 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          opacity: updatingStatus === application._id ? 0.6 : 1,
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          width: '100%'
                        }}
                        onMouseEnter={(e) => !updatingStatus && (e.target.style.transform = 'translateY(-1px)', e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)')}
                        onMouseLeave={(e) => !updatingStatus && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)')}
                      >
                        {updatingStatus === application._id ? '⏳ Updating...' : '🔄 Reset to Pending'}
                      </button>
                    )}
                  </div>
                </div>
                {/* Divider */}
                <div style={{ height: 1, background: '#e9ecef', margin: '0 -32px' }} />
                {/* Bottom: Cover Letter & Meta */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
                  {/* Cover Letter */}
                  <div style={{ flex: 2, minWidth: 220 }}>
                    <div style={{ fontWeight: 500, color: '#333', marginBottom: 8 }}>Cover Letter:</div>
                    <div style={{
                      background: '#f8f9fa',
                      borderRadius: 8,
                      border: '1px solid #e9ecef',
                      padding: 16,
                      fontSize: 15,
                      color: '#333',
                      maxHeight: 120,
                      overflowY: 'auto',
                      wordBreak: 'break-word',
                    }}>{application.coverLetter || 'No cover letter provided'}</div>
                    {application.resume && (
                      <div style={{ marginTop: 10 }}>
                        <a href={application.resume} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline', fontSize: 15 }}>📄 View Resume</a>
                      </div>
                    )}
                  </div>
                  {/* Meta Info */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontWeight: 500, color: '#333', marginBottom: 8 }}>Application Details:</div>
                    <div style={{ color: '#666', fontSize: 15, marginBottom: 4 }}>📅 Applied: {new Date(application.appliedAt).toLocaleDateString()} {new Date(application.appliedAt).toLocaleTimeString()}</div>
                    {application.expectedSalary && <div style={{ color: '#666', fontSize: 15, marginBottom: 4 }}>💰 Expected: ${application.expectedSalary?.toLocaleString()}</div>}
                    {application.availability && <div style={{ color: '#666', fontSize: 15 }}>⏰ Available: {application.availability}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {applications.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginTop: '25px',
          borderTop: '3px solid #28a745'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333', fontSize: '20px' }}>Application Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {applications.length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Applications</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                {applications.filter(app => app.status === 'pending').length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Pending Review</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                {applications.filter(app => app.status === 'shortlisted').length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Shortlisted</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {applications.filter(app => app.status === 'accepted').length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Accepted</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {applications.filter(app => app.status === 'rejected').length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Rejected</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications; 