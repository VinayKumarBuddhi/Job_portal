import React, { useState, useEffect, useCallback } from 'react';

const EmployerStats = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    companyName: '',
    companyVerified: false
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEmployerStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/employer/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalJobs: data.data.stats.totalJobs || 0,
          activeJobs: data.data.stats.activeJobs || 0,
          totalApplications: data.data.stats.totalApplications || 0,
          pendingApplications: data.data.stats.pendingApplications || 0,
          companyName: data.data.company?.name || 'Not Set',
          companyVerified: data.data.company?.isVerified || false
        });
        setRecentApplications(data.data.recentApplications || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching employer stats:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployerStats();
  }, [fetchEmployerStats]);

  const statCards = [
    { title: 'Total Jobs Posted', value: stats.totalJobs, color: '#007bff', icon: '💼' },
    { title: 'Active Jobs', value: stats.activeJobs, color: '#28a745', icon: '✅' },
    { title: 'Total Applications', value: stats.totalApplications, color: '#17a2b8', icon: '📝' },
    { title: 'Pending Applications', value: stats.pendingApplications, color: '#ffc107', icon: '⏳' }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading your dashboard...</div>
        <div style={{ color: '#666' }}>Fetching your statistics</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ color: '#dc3545', marginBottom: '20px' }}>Error: {error}</div>
        <button
          onClick={fetchEmployerStats}
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
      <h2 style={{ marginBottom: '30px', color: '#333' }}>Your Dashboard</h2>
      
      {/* Company Info */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        borderLeft: `4px solid ${stats.companyVerified ? '#28a745' : '#ffc107'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
              {stats.companyName}
            </h3>
            <p style={{ margin: 0, color: '#666' }}>
              Company Status: 
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: stats.companyVerified ? '#28a745' : '#ffc107',
                color: 'white',
                marginLeft: '10px'
              }}>
                {stats.companyVerified ? 'Verified' : 'Pending Verification'}
              </span>
            </p>
          </div>
          <div style={{ fontSize: '24px' }}>🏢</div>
        </div>
      </div>

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
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '5px',
                borderLeft: '3px solid #28a745'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                      {application.applicant?.name || 'Unknown Applicant'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Applied for: {application.job?.title || 'Unknown Job'} • {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: application.status === 'pending' ? '#ffc107' : 
                                   application.status === 'accepted' ? '#28a745' : '#dc3545',
                    color: 'white'
                  }}>
                    {application.status}
                  </span>
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
  );
};

export default EmployerStats; 