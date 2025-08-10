import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../config/api';

const MyProfile = () => {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', location: '', bio: '', experience: '', skills: [], resume: '' });
  const [editForm, setEditForm] = useState(profile);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setMessage('');
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || user?._id;
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
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
      const userId = user?.id || user?._id;
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
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
        // Preserve id for later use
        const persisted = { ...(JSON.parse(localStorage.getItem('user')) || {}), id: data.data._id };
        localStorage.setItem('user', JSON.stringify(persisted));
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      setMessage('Please select a file to upload');
      return;
    }

    try {
      setUploadingResume(true);
      setMessage('');
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || user?._id;
      
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await fetch(`${BASE_URL}/users/${userId}/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, resume: data.data.resume }));
        setResumeFile(null);
        setMessage('Resume uploaded successfully!');
        // Refresh profile data
        fetchProfile();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to upload resume');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeDownload = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user.id || user._id;
      
      const response = await fetch(`${BASE_URL}/users/${userId}/resume`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download resume');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume');
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || user?._id;
      const response = await fetch(`${BASE_URL}/users/${userId}/resume`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProfile(prev => ({ ...prev, resume: '' }));
        setMessage('Resume deleted successfully!');
      } else {
        setMessage('Failed to delete resume');
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
          
          {/* Resume Upload Section */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Resume Upload</h4>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                style={{ ...inputStyle, padding: '8px' }}
              />
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
              </small>
            </div>
            {resumeFile && (
              <div style={{ marginBottom: '10px' }}>
                <span style={{ color: '#28a745' }}>Selected: {resumeFile.name}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleResumeUpload}
              disabled={!resumeFile || uploadingResume}
              style={{
                ...buttonStyle('#28a745'),
                opacity: (!resumeFile || uploadingResume) ? 0.6 : 1,
                cursor: (!resumeFile || uploadingResume) ? 'not-allowed' : 'pointer'
              }}
            >
              {uploadingResume ? 'Uploading...' : 'Upload Resume'}
            </button>
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
          
          {/* Resume Section */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Resume</h4>
            {profile.resume ? (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Resume uploaded</span>
                <button onClick={handleResumeDownload} style={buttonStyle('#17a2b8')}>Download</button>
                <button onClick={handleResumeDelete} style={buttonStyle('#dc3545')}>Delete</button>
              </div>
            ) : (
              <div style={{ color: '#6c757d' }}>No resume uploaded</div>
            )}
          </div>
          
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