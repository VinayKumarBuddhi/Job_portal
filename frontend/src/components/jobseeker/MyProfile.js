import React, { useEffect, useState } from 'react';

const MyProfile = () => {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', location: '', bio: '', experience: '', skills: [] });
  const [editForm, setEditForm] = useState(profile);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setMessage('');
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setEditForm(data.data);
      } else {
        setMessage('Failed to fetch profile');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setMessage('');
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
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
        setEditForm(data.data);
        setIsEditing(false);
        setMessage('Profile updated successfully!');
        localStorage.setItem('user', JSON.stringify(data.data));
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '25px', color: '#333' }}>My Profile</h2>
      {message && <div style={{ marginBottom: '15px', color: message.includes('success') ? 'green' : 'red' }}>{message}</div>}
      {isEditing ? (
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '15px' }}>
            <label>Name</label>
            <input type="text" name="name" value={editForm.name || ''} onChange={handleInputChange} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Email</label>
            <input type="email" name="email" value={editForm.email || ''} onChange={handleInputChange} required style={inputStyle} disabled />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Phone</label>
            <input type="text" name="phone" value={editForm.phone || ''} onChange={handleInputChange} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Location</label>
            <input type="text" name="location" value={editForm.location || ''} onChange={handleInputChange} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Bio</label>
            <textarea name="bio" value={editForm.bio || ''} onChange={handleInputChange} rows="3" style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => { setIsEditing(false); setEditForm(profile); }} style={buttonStyle('#6c757d')}>Cancel</button>
            <button type="submit" style={buttonStyle('#28a745')}>Save Changes</button>
          </div>
        </form>
      ) : (
        <div>
          <div style={{ marginBottom: '15px' }}><strong>Name:</strong> {profile.name}</div>
          <div style={{ marginBottom: '15px' }}><strong>Email:</strong> {profile.email}</div>
          <div style={{ marginBottom: '15px' }}><strong>Phone:</strong> {profile.phone || '-'}</div>
          <div style={{ marginBottom: '15px' }}><strong>Location:</strong> {profile.location || '-'}</div>
          <div style={{ marginBottom: '15px' }}><strong>Bio:</strong> {profile.bio || '-'}</div>
          <button onClick={() => setIsEditing(true)} style={buttonStyle('#007bff')}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  fontSize: '15px',
  marginTop: '5px'
};

const buttonStyle = (bg) => ({
  padding: '10px 20px',
  backgroundColor: bg,
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: 'bold'
});

export default MyProfile; 