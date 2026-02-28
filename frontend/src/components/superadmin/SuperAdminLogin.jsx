import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './SuperAdminAuth.css';

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post('/api/superadmin/login', { email, password });
      localStorage.setItem('superadmin_token', res.data.token);
      setSuccess(res.data.message || 'Login successful!');
      setEmail('');
      setPassword('');
      setTimeout(() => {
        navigate('/superadmindashboard');
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-auth-bg">
      <div className="superadmin-login-container">
        <div className="superadmin-auth-header">Super Admin Login</div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div style={{color: 'red'}}>{error}</div>}
          {success && <div style={{color: 'green'}}>{success}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="superadmin-auth-divider" />
        <div className="superadmin-auth-link">
          Don't have an account? <Link to="/superadmin-register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin; 