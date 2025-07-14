import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../config/api';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/applications/my-applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || []);
      } else {
        setApplications([]);
        setMessage('Failed to fetch applications');
      }
    } catch (error) {
      setApplications([]);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/applications/${appId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setApplications(applications.filter(app => app._id !== appId));
        setMessage('Application withdrawn.');
      } else {
        setMessage('Failed to withdraw application');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading applications...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '25px', color: '#333' }}>My Applications</h2>
      {message && <div style={{ marginBottom: '15px', color: message.includes('withdrawn') ? 'green' : 'red' }}>{message}</div>}
      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888' }}>You have not applied to any jobs yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '18px' }}>
          {applications.map(app => (
            <div key={app._id} style={{ background: '#f9f9f9', borderRadius: '8px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#007bff', fontSize: '1.1rem' }}>{app.job?.title || 'Job'}</div>
                  <div style={{ color: '#555', marginBottom: '4px' }}>{app.job?.company?.name || 'Unknown Company'}</div>
                  <div style={{ color: '#888', fontSize: '14px' }}>Status: <span style={{ fontWeight: 'bold', color: statusColor(app.status) }}>{app.status}</span></div>
                  <div style={{ color: '#888', fontSize: '13px', marginTop: '2px' }}>Applied: {formatDate(app.appliedAt)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <button onClick={() => toggleExpand(app._id)} style={{ padding: '6px 14px', background: '#e9ecef', color: '#007bff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '4px' }}>{expanded === app._id ? 'Hide Details' : 'View Details'}</button>
                  {app.status === 'pending' && (
                    <button onClick={() => handleWithdraw(app._id)} style={{ padding: '7px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Withdraw</button>
                  )}
                </div>
              </div>
              {expanded === app._id && (
                <div style={{ marginTop: '15px', background: '#fff', borderRadius: '6px', padding: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ marginBottom: '8px' }}><strong>Cover Letter:</strong><br />{app.coverLetter || '-'}</div>
                  <div style={{ marginBottom: '8px' }}><strong>Resume:</strong> {app.resume ? (<a href={app.resume} target="_blank" rel="noopener noreferrer">{app.resume}</a>) : '-'}</div>
                  <div style={{ marginBottom: '8px' }}><strong>Expected Salary:</strong> {app.expectedSalary || '-'}</div>
                  <div style={{ marginBottom: '8px' }}><strong>Availability:</strong> {app.availability || '-'}</div>
                  {app.status === 'rejected' && app.notes && (
                    <div style={{ color: '#dc3545', fontWeight: 'bold' }}>Reason: {app.notes}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function statusColor(status) {
  if (status === 'accepted') return '#28a745';
  if (status === 'rejected') return '#dc3545';
  if (status === 'pending') return '#ffc107';
  return '#333';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

export default MyApplications; 