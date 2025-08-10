import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../config/api';

const BrowseJobs = ({ refreshStats }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [availability, setAvailability] = useState('immediately');
  const [message, setMessage] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchUserProfile();
    // eslint-disable-next-line
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${BASE_URL}/jobs`);
      const data = await response.json();
      setJobs(data.data || []);
    } catch (error) {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/applications/my-applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAppliedJobIds((data.data || []).map(app => app.job?._id || app.job));
      }
    } catch (error) {
      setAppliedJobIds([]);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || user?._id;
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleApplyClick = (job) => {
    // Check if user has uploaded a resume
    if (!userProfile?.resume) {
      setMessage('Please upload your resume in your profile before applying for jobs.');
      return;
    }

    setSelectedJob(job);
    setCoverLetter('');
    setExpectedSalary('');
    setAvailability('immediately');
    setMessage('');
    setShowModal(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setMessage('');
    if (coverLetter.length < 50) {
      setMessage('Cover letter must be at least 50 characters.');
      return;
    }
    if (!expectedSalary || isNaN(expectedSalary)) {
      setMessage('Expected salary is required and must be a number.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job: selectedJob._id,
          coverLetter,
          expectedSalary,
          availability
        })
      });
      if (response.ok) {
        setMessage('Application submitted successfully!');
        setTimeout(() => {
          setShowModal(false);
          fetchApplications();
          if (refreshStats) refreshStats();
        }, 1200);
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to apply');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading jobs...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '25px', color: '#333' }}>Browse Jobs</h2>
      {message && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da', 
          color: message.includes('success') ? '#155724' : '#721c24', 
          borderRadius: '5px', 
          border: `1px solid ${message.includes('success') ? '#c3e6cb' : '#f5c6cb'}` 
        }}>
          {message}
        </div>
      )}
      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888' }}>No jobs found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {jobs.map(job => {
            const alreadyApplied = appliedJobIds.includes(job._id);
            return (
              <div key={job._id} style={{ background: '#f9f9f9', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{job.title}</h3>
                <div style={{ color: '#555', marginBottom: '8px' }}>{job.company?.name || 'Unknown Company'}</div>
                <div style={{ color: '#666', marginBottom: '8px' }}>📍 {job.location} • 💼 {job.type} • 💰 {job.salary ? `${job.salary.min} - ${job.salary.max} ${job.salary.currency}` : 'Not specified'}</div>
                <div style={{ color: '#888', fontSize: '14px', marginBottom: '12px' }}>{job.description?.slice(0, 100)}...</div>
                <button
                  style={{ padding: '8px 18px', background: alreadyApplied ? '#6c757d' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: alreadyApplied ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                  onClick={() => !alreadyApplied && handleApplyClick(job)}
                  disabled={alreadyApplied}
                >
                  {alreadyApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
            );
          })}
        </div>
      )}
      {showModal && selectedJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '30px', minWidth: '350px', maxWidth: '90vw', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            <h3 style={{ marginTop: 0, color: '#007bff' }}>Apply for {selectedJob.title}</h3>
            {userProfile?.resume && (
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px', border: '1px solid #c3e6cb' }}>
                <span style={{ color: '#155724', fontSize: '14px' }}>
                  ✓ Your resume will be automatically included with this application
                </span>
              </div>
            )}
            <form onSubmit={handleSubmitApplication}>
              <div style={{ marginBottom: '15px' }}>
                <label>Cover Letter (min 50 chars):</label>
                <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={4} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '15px', marginTop: '5px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Expected Salary:</label>
                <input type="number" value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '15px', marginTop: '5px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label>Availability:</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '15px', marginTop: '5px' }}>
                  <option value="immediately">Immediately</option>
                  <option value="2-weeks">2 weeks</option>
                  <option value="1-month">1 month</option>
                  <option value="3-months">3 months</option>
                  <option value="negotiable">Negotiable</option>
                </select>
              </div>

              {message && <div style={{ marginBottom: '10px', color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowModal(false); setMessage(''); }} style={{ padding: '8px 18px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseJobs; 