import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './SuperAdminAuth.css';

const SuperAdminRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationKey, setRegistrationKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post('/api/superadmin/register', { name, email, password, registrationKey });
      setSuccess(res.data.message || 'Registration successful!');
      setName('');
      setEmail('');
      setPassword('');
      setRegistrationKey('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-auth-bg">
      <div className="superadmin-register-container">
        <div className="superadmin-auth-header">Super Admin Registration</div>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div>
            <label>Registration Key:</label>
            <input type="text" value={registrationKey} onChange={e => setRegistrationKey(e.target.value)} required />
          </div>
          {error && <div style={{color: 'red'}}>{error}</div>}
          {success && <div style={{color: 'green'}}>{success}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <div className="superadmin-auth-divider" />
        <div className="superadmin-auth-link">
          Already have an account? <Link to="/superadmin-login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminRegister; 