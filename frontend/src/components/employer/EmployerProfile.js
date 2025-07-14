import React, { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../../config/api';

const EmployerProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/employer/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data || {});
        setEditForm(data.data || {});
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
      const response = await fetch(`${BASE_URL}/employer/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setIsEditing(false);
        // Update localStorage user data
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...userData, ...data.data }));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading profile...</div>
        <div style={{ color: '#666' }}>Fetching your information</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ color: '#dc3545', marginBottom: '20px' }}>Error: {error}</div>
        <button
          onClick={fetchProfile}
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
        <h2 style={{ color: '#333', margin: 0 }}>My Profile</h2>
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
            Edit Profile
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Full Name *
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

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email || ''}
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone || ''}
                  onChange={handleInputChange}
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
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={editForm.company || ''}
                  onChange={handleInputChange}
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Position/Title
              </label>
              <input
                type="text"
                name="position"
                value={editForm.position || ''}
                onChange={handleInputChange}
                placeholder="e.g., HR Manager, CEO, Recruiter"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                Bio/About Me
              </label>
              <textarea
                name="bio"
                value={editForm.bio || ''}
                onChange={handleInputChange}
                rows="4"
                placeholder="Tell us about yourself and your experience..."
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
                borderRadius: '50%',
                backgroundColor: '#28a745',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '32px',
                fontWeight: 'bold',
                marginRight: '20px'
              }}>
                {profile.name?.charAt(0)?.toUpperCase() || 'E'}
              </div>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '24px' }}>
                  {profile.name || 'Not Set'}
                </h3>
                <p style={{ margin: '0 0 5px 0', color: '#666' }}>
                  {profile.position || 'Position not specified'}
                </p>
                <p style={{ margin: 0, color: '#666' }}>
                  {profile.company || 'Company not specified'}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
                  Contact Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Email:</span>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      {profile.email || 'Not provided'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Phone:</span>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      {profile.phone || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
                  Professional Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Company:</span>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      {profile.company || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Position:</span>
                    <span style={{ marginLeft: '10px', color: '#666' }}>
                      {profile.position || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {profile.bio && (
              <div style={{ marginTop: '30px' }}>
                <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
                  About Me
                </h4>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '5px',
                  lineHeight: '1.6',
                  color: '#333'
                }}>
                  {profile.bio}
                </div>
              </div>
            )}

            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <h4 style={{ marginBottom: '10px', color: '#333' }}>Account Information</h4>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <div>Role: <span style={{ fontWeight: 'bold', color: '#28a745' }}>Employer</span></div>
                <div>Member since: {new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerProfile; 