import React, { useState, useEffect, useCallback } from 'react';

const CompanyDetails = () => {
  const [company, setCompany] = useState({
    name: '',
    description: '',
    industry: '',
    website: '',
    location: '',
    size: '',
    founded: '',
    isVerified: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const fetchCompanyDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/employer/company', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompany(data.data || {});
        setEditForm(data.data || {});
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch company details');
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/employer/company', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        setCompany(data.data);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        if (errorData.message) {
          alert(errorData.message);
        } else {
          alert('Failed to update company details. Please check all required fields.');
        }
      }
    } catch (error) {
      console.error('Error updating company details:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditForm(company);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading company details...</div>
        <div style={{ color: '#666' }}>Fetching company information</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ color: '#dc3545', marginBottom: '20px' }}>Error: {error}</div>
        <button
          onClick={fetchCompanyDetails}
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
        <h2 style={{ color: '#333', margin: 0 }}>Company Details</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Edit Company Details
          </button>
        )}
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Company Name *
              </label>
              <input
                type="text"
                name="name"
                value={editForm.name || ''}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Company Description *
              </label>
              <textarea
                name="description"
                value={editForm.description || ''}
                onChange={handleInputChange}
                rows="4"
                required
                placeholder="Describe your company, mission, and values..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Industry *
                </label>
                <select
                  name="industry"
                  value={editForm.industry || ''}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="design">Design</option>
                  <option value="engineering">Engineering</option>
                  <option value="operations">Operations</option>
                  <option value="retail">Retail</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="consulting">Consulting</option>
                  <option value="non-profit">Non-Profit</option>
                  <option value="government">Government</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={editForm.website || ''}
                  onChange={handleInputChange}
                  placeholder="https://www.yourcompany.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location || ''}
                  onChange={handleInputChange}
                  placeholder="City, State, Country"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Company Size *
                </label>
                <select
                  name="size"
                  value={editForm.size || ''}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Founded Year
              </label>
              <input
                type="number"
                name="founded"
                value={editForm.founded || ''}
                onChange={handleInputChange}
                min="1800"
                max={new Date().getFullYear()}
                placeholder="e.g., 2020"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '12px 24px',
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
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '10px',
                backgroundColor: '#28a745',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                marginRight: '20px'
              }}>
                🏢
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <h3 style={{ margin: '0 10px 0 0', color: '#333', fontSize: '24px' }}>
                    {company.name || 'Company Name Not Set'}
                  </h3>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: company.isVerified ? '#28a745' : '#ffc107',
                    color: 'white'
                  }}>
                    {company.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
                <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                  {company.industry || 'Industry not specified'}
                </p>
                <p style={{ margin: 0, color: '#666' }}>
                  {company.location || 'Location not specified'}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
              <div>
                <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
                  Company Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Industry:</span>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      {company.industry || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Size:</span>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      {company.size || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Founded:</span>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      {company.founded || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
                  Contact Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Location:</span>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      {company.location || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Website:</span>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      {company.website ? (
                        <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
                          {company.website}
                        </a>
                      ) : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {company.description && (
              <div style={{ marginBottom: '30px' }}>
                <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
                  About Company
                </h4>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '5px',
                  lineHeight: '1.6',
                  color: '#333'
                }}>
                  {company.description}
                </div>
              </div>
            )}

            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h4 style={{ marginBottom: '10px', color: '#333' }}>Verification Status</h4>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <div>
                  Status: 
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: company.isVerified ? '#28a745' : '#ffc107',
                    color: 'white',
                    marginLeft: '10px'
                  }}>
                    {company.isVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>
                <div style={{ marginTop: '5px' }}>
                  {company.isVerified 
                    ? 'Your company has been verified by our team.'
                    : 'Your company is pending verification. This process usually takes 1-2 business days.'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails; 