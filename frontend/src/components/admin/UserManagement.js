import React, { useState, useEffect, useCallback } from 'react';
import { BASE_URL } from '../../config/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/admin/users?page=${pagination.currentPage}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
        
        // Update pagination
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(data.count / 20),
          hasNext: !!data.pagination?.next,
          hasPrev: !!data.pagination?.prev
        }));
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/admin/users/${userId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          isVerified: newStatus 
        })
      });

      if (response.ok) {
        // Update the user in the local state
        setUsers(users.map(user => 
          user._id === userId ? { ...user, isVerified: newStatus } : user
        ));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setUsers(users.filter(user => user._id !== userId));
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Network error. Please try again.');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading users...</div>
        <div style={{ color: '#666' }}>Fetching data from database</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ color: '#dc3545', marginBottom: '20px' }}>Error: {error}</div>
        <button
          onClick={fetchUsers}
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
      <h2 style={{ marginBottom: '30px', color: '#333' }}>User Management</h2>
      
      {/* Filters and Search */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Filter by Role:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Users</option>
            <option value="jobseeker">Job Seekers</option>
            <option value="employer">Employers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Search:
          </label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px',
              width: '250px'
            }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          fontWeight: 'bold',
          borderBottom: '1px solid #dee2e6'
        }}>
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Location</div>
          <div>Joined</div>
          <div>Actions</div>
        </div>

        {filteredUsers.map((user) => (
          <div
            key={user._id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr',
              padding: '15px',
              borderBottom: '1px solid #dee2e6',
              alignItems: 'center'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{user.name}</div>
            <div>{user.email}</div>
            <div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: user.role === 'employer' ? '#ffc107' : 
                               user.role === 'admin' ? '#dc3545' : '#28a745',
                color: 'white'
              }}>
                {user.role}
              </span>
            </div>
            <div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: user.isVerified ? '#28a745' : '#dc3545',
                color: 'white'
              }}>
                {user.isVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div>{user.location || 'N/A'}</div>
            <div>{new Date(user.createdAt).toLocaleDateString()}</div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={() => handleStatusChange(user._id, !user.isVerified)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: user.isVerified ? '#dc3545' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {user.isVerified ? 'Unverify' : 'Verify'}
              </button>
              <button
                onClick={() => handleDeleteUser(user._id)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          marginTop: '20px'
        }}>
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            style={{
              padding: '8px 12px',
              backgroundColor: pagination.hasPrev ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: pagination.hasPrev ? 'pointer' : 'not-allowed'
            }}
          >
            Previous
          </button>
          
          <span style={{ color: '#666' }}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            style={{
              padding: '8px 12px',
              backgroundColor: pagination.hasNext ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: pagination.hasNext ? 'pointer' : 'not-allowed'
            }}
          >
            Next
          </button>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '50px',
          color: '#666'
        }}>
          No users found matching your criteria.
        </div>
      )}

      {/* Data Source Info */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '5px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
        marginTop: '20px'
      }}>
        👥 Showing {filteredUsers.length} users from database • Page {pagination.currentPage} of {pagination.totalPages}
      </div>
    </div>
  );
};

export default UserManagement; 