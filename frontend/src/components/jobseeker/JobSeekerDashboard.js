import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BrowseJobs from './BrowseJobs';
import MyApplications from './MyApplications';
import MyProfile from './MyProfile';
import { BASE_URL } from '../../config/api';

const JobSeekerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ total: 0, accepted: 0, rejected: 0, pending: 0 });
  const [loadingStats, setLoadingStats] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Add welcome message for the user
  const renderWelcomeMessage = () => {
    if (user) {
      return (
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          border: '1px solid #2196f3'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2196f3' }}>
            Welcome, {user.name}!
          </h3>
          <p style={{ margin: 0, color: '#666' }}>
            Manage your job applications and profile
          </p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    // Check if user is logged in and is jobseeker
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const userObj = JSON.parse(userData);
      if (userObj.role === 'jobseeker') {
        setIsAuthenticated(true);
        setUser(userObj);
      } else {
        // Redirect non-jobseeker users
        navigate('/');
      }
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/applications/my-applications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const apps = data.data || [];
        const total = apps.length;
        const accepted = apps.filter(a => a.status === 'accepted').length;
        const rejected = apps.filter(a => a.status === 'rejected').length;
        const pending = apps.filter(a => a.status === 'pending').length;
        setStats({ total, accepted, rejected, pending });
      } else {
        setStats({ total: 0, accepted: 0, rejected: 0, pending: 0 });
      }
    } catch (e) {
      setStats({ total: 0, accepted: 0, rejected: 0, pending: 0 });
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab, fetchStats]);

  // Pass this to children so they can trigger a stats refresh
  const refreshStats = fetchStats;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: '#007bff', color: 'white', padding: '30px 0', textAlign: 'center', position: 'relative' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Job Seeker Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>
      <div style={{ maxWidth: '1100px', margin: '30px auto', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: '30px' }}>
        {renderWelcomeMessage()}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <button onClick={() => setActiveTab('dashboard')} style={tabStyle(activeTab === 'dashboard')}>Dashboard</button>
          <button onClick={() => setActiveTab('browse')} style={tabStyle(activeTab === 'browse')}>Browse Jobs</button>
          <button onClick={() => setActiveTab('applications')} style={tabStyle(activeTab === 'applications')}>My Applications</button>
          <button onClick={() => setActiveTab('profile')} style={tabStyle(activeTab === 'profile')}>My Profile</button>
        </div>
        <div>
          {activeTab === 'dashboard' && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#333' }}>
              <h2>Welcome to your Job Seeker Dashboard!</h2>
              <p>Use the tabs above to browse jobs, manage your applications, and update your profile.</p>
              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '40px' }}>
                {loadingStats ? (
                  <div>Loading stats...</div>
                ) : (
                  <>
                    <StatCard label="Total Applications" value={stats.total} color="#007bff" />
                    <StatCard label="Accepted" value={stats.accepted} color="#28a745" />
                    <StatCard label="Rejected" value={stats.rejected} color="#dc3545" />
                    <StatCard label="Pending" value={stats.pending} color="#ffc107" />
                  </>
                )}
              </div>
            </div>
          )}
          {activeTab === 'browse' && <BrowseJobs refreshStats={refreshStats} />}
          {activeTab === 'applications' && <MyApplications refreshStats={refreshStats} />}
          {activeTab === 'profile' && <MyProfile />}
        </div>
      </div>
    </div>
  );
};

function tabStyle(active) {
  return {
    padding: '12px 28px',
    border: 'none',
    borderRadius: '5px',
    background: active ? '#007bff' : '#e9ecef',
    color: active ? 'white' : '#333',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: active ? '0 2px 8px rgba(0,123,255,0.08)' : 'none',
    transition: 'background 0.2s, color 0.2s'
  };
}

const StatCard = ({ label, value, color }) => (
  <div style={{ background: color, color: 'white', borderRadius: '10px', padding: '30px 40px', minWidth: '160px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
    <div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{value}</div>
    <div style={{ fontSize: '1.1rem', marginTop: '10px' }}>{label}</div>
  </div>
);

export default JobSeekerDashboard; 