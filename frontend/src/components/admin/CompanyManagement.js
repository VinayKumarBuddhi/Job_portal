import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config/api';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/admin/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Mock data for now
      setCompanies([
        {
          _id: '1',
          name: 'Tech Corp',
          industry: 'Technology',
          size: '100-500',
          location: 'San Francisco',
          website: 'https://techcorp.com',
          description: 'Leading technology company',
          jobsPosted: 12,
          isVerified: true,
          createdAt: '2024-01-10',
          employer: {
            name: 'Jane Smith',
            email: 'jane@techcorp.com'
          }
        },
        {
          _id: '2',
          name: 'Digital Solutions',
          industry: 'Software',
          size: '50-100',
          location: 'New York',
          website: 'https://digitalsolutions.com',
          description: 'Digital transformation experts',
          jobsPosted: 8,
          isVerified: true,
          createdAt: '2024-01-08',
          employer: {
            name: 'John Doe',
            email: 'john@digitalsolutions.com'
          }
        },
        {
          _id: '3',
          name: 'Creative Agency',
          industry: 'Marketing',
          size: '10-50',
          location: 'Los Angeles',
          website: 'https://creativeagency.com',
          description: 'Creative marketing solutions',
          jobsPosted: 5,
          isVerified: false,
          createdAt: '2024-01-15',
          employer: {
            name: 'Bob Johnson',
            email: 'bob@creativeagency.com'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationChange = async (companyId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/admin/companies/${companyId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerified: newStatus })
      });

      if (response.ok) {
        setCompanies(companies.map(company => 
          company._id === companyId ? { ...company, isVerified: newStatus } : company
        ));
      }
    } catch (error) {
      console.error('Error updating company verification:', error);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/admin/companies/${companyId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setCompanies(companies.filter(company => company._id !== companyId));
        }
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Loading companies...
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#333' }}>Company Management</h2>
      
      {/* Search */}
      <div style={{
        marginBottom: '30px'
      }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Search Companies:
        </label>
        <input
          type="text"
          placeholder="Search by name, industry, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '14px',
            width: '400px'
          }}
        />
      </div>

      {/* Companies Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {filteredCompanies.map((company) => (
          <div
            key={company._id}
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: company.isVerified ? '2px solid #28a745' : '2px solid #ffc107'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '15px'
            }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{company.name}</h3>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                  {company.industry} • {company.size} employees
                </p>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  📍 {company.location}
                </p>
              </div>
              <div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: company.isVerified ? '#28a745' : '#ffc107',
                  color: 'white'
                }}>
                  {company.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <p style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>
                {company.description}
              </p>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#007bff',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                🌐 Visit Website
              </a>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px'
            }}>
              <div>
                <span style={{ fontWeight: 'bold', color: '#333' }}>
                  {company.jobsPosted}
                </span> jobs posted
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Joined: {new Date(company.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '5px'
            }}>
              <strong>Contact:</strong> {company.employer?.name} ({company.employer?.email})
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleVerificationChange(company._id, !company.isVerified)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: company.isVerified ? '#dc3545' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  flex: 1
                }}
              >
                {company.isVerified ? 'Unverify' : 'Verify'}
              </button>
              <button
                onClick={() => handleDeleteCompany(company._id)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  flex: 1
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '50px',
          color: '#666'
        }}>
          No companies found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default CompanyManagement; 