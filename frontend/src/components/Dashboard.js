import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
    }
  }, []);

  // Add welcome message for logged-in users
  const renderWelcomeMessage = () => {
    if (isLoggedIn && user) {
      return (
        <div style={{
          backgroundColor: '#e8f5e8',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          border: '1px solid #28a745'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>
            Welcome back, {user.name}!
          </h3>
          <p style={{ margin: 0, color: '#666' }}>
            You are logged in as: <strong>{user.role}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  const handleButtonClick = (buttonName) => {
    switch(buttonName) {
      case 'Login':
        navigate('/login');
        break;
      case 'Register':
        navigate('/register');
        break;
      case 'Admin':
        navigate('/admin');
        break;
      case 'Employer':
        navigate('/employer');
        break;
      case 'Job Seeker Dashboard':
        navigate('/jobseeker');
        break;
      case 'Logout':
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoggedIn(false);
        break;
      default:
        console.log(`${buttonName} button clicked - To be implemented`);
    }
  };

  const getButtons = () => {
    if (!isLoggedIn) {
      return [
        { name: 'About', color: 'blue' },
        { name: 'Login', color: 'green' },
        { name: 'Register', color: 'purple' },
        { name: 'Companies', color: 'orange' },
        { name: 'Jobs', color: 'indigo' }
      ];
    }

    // Role-specific buttons
    if (user?.role === 'admin') {
      return [
        { name: 'Admin', color: 'red' },
        { name: 'Logout', color: 'gray' }
      ];
    } else if (user?.role === 'employer') {
      return [
        { name: 'Employer', color: 'teal' },
        { name: 'Logout', color: 'gray' }
      ];
    } else if (user?.role === 'jobseeker') {
      return [
        { name: 'Job Seeker Dashboard', color: 'dodgerblue' },
        { name: 'Logout', color: 'gray' }
      ];
    }

    return [
      { name: 'Logout', color: 'gray' }
    ];
  };

  const buttons = getButtons();

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '20px',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 10px 0',
          color: '#333'
        }}>
          Job Portal Dashboard
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          color: '#666',
          margin: 0
        }}>
          Welcome to our job portal platform
        </p>
        {renderWelcomeMessage()}
      </div>

      {/* Buttons Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(button.name)}
            style={{
              padding: '20px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              backgroundColor: button.color,
              color: 'white',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            {button.name}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '20px',
        color: '#666'
      }}>
        <p>All features will be implemented in future development</p>
      </div>
    </div>
  );
};

export default Dashboard; 