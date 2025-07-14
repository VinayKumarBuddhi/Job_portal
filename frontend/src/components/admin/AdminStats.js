import React, { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../../config/api';

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    jobSeekers: 0,
    employers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalCompanies: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUserRoleStats = useCallback(async (token) => {
    try {
      // Fetch all users to get role breakdown
      const response = await fetch(`${BASE_URL}/admin/users?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const users = data.data || [];
        
        const jobSeekers = users.filter(user => user.role === 'jobseeker').length;
        const employers = users.filter(user => user.role === 'employer').length;
        
        setStats(prevStats => ({
          ...prevStats,
          jobSeekers,
          employers
        }));
      }
    } catch (error) {
      console.error('Error fetching user role stats:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update stats with real data from database
        setStats({
          totalUsers: data.data.stats.totalUsers || 0,
          jobSeekers: 0, // Will be calculated separately
          employers: 0,  // Will be calculated separately
          totalJobs: data.data.stats.totalJobs || 0,
          activeJobs: data.data.stats.activeJobs || 0,
          totalCompanies: data.data.stats.totalCompanies || 0,
          totalApplications: data.data.stats.totalApplications || 0,
          pendingApplications: data.data.stats.pendingApplications || 0
        });
        
        setRecentJobs(data.data.recentJobs || []);
        setRecentApplications(data.data.recentApplications || []);
        
        // Fetch user role breakdown
        await fetchUserRoleStats(token);
        
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [fetchUserRoleStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, color: '#007bff', icon: '👥' },
    { title: 'Job Seekers', value: stats.jobSeekers, color: '#28a745', icon: '👤' },
    { title: 'Employers', value: stats.employers, color: '#ffc107', icon: '🏢' },
    { title: 'Total Jobs', value: stats.totalJobs, color: '#17a2b8', icon: '💼' },
    { title: 'Active Jobs', value: stats.activeJobs, color: '#20c997', icon: '✅' },
    { title: 'Companies', value: stats.totalCompanies, color: '#6f42c1', icon: '🏭' },
    { title: 'Total Applications', value: stats.totalApplications, color: '#fd7e14', icon: '📝' },
    { title: 'Pending Applications', value: stats.pendingApplications, color: '#e83e8c', icon: '⏳' }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading statistics...</div>
        <div style={{ color: '#666' }}>Fetching data from database</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ color: '#dc3545', marginBottom: '20px' }}>Error: {error}</div>
        <button
          onClick={fetchStats}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
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
      <h2 style={{ marginBottom: '30px', color: '#333' }}>Dashboard Statistics</h2>
      
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {statCards.map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${stat.color}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '24px', marginRight: '10px' }}>{stat.icon}</span>
              <h3 style={{ margin: 0, color: '#333', fontSize: '16px' }}>{stat.title}</h3>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>
              {stat.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Recent Jobs */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Recent Job Postings</h3>
          {recentJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentJobs.map((job, index) => (
                <div key={index} style={{
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px',
                  borderLeft: '3px solid #007bff'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{job.title}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {job.company?.name || 'Unknown Company'} • {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              No recent job postings
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Recent Applications</h3>
          {recentApplications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentApplications.map((application, index) => (
                <div key={index} style={{
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px',
                  borderLeft: '3px solid #28a745'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    {application.applicant?.name || 'Unknown Applicant'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Applied for: {application.job?.title || 'Unknown Job'} • {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              No recent applications
            </div>
          )}
        </div>
      </div>

      {/* Data Source Info */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '5px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        📊 All statistics are fetched from the database in real-time
      </div>
    </div>
  );
};

export default AdminStats;