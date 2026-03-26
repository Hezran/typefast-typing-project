import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Profile = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bests, setBests] = useState(null);
  const [loadingBests, setLoadingBests] = useState(false);
  
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.username);
      setEmail(user.email);
      loadBests();
      setError('');
      setSuccess('');
    }
  }, [isOpen, user]);

  const loadBests = async () => {
    try {
      setLoadingBests(true);
      const data = await api.getPersonalBests();
      setBests(data.personalBests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBests(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      await updateProfile({ username, email });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Your Profile</h2>

        <div className="profile-layout">
          <div className="profile-edit-section">
            <h3>Account Details</h3>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleUpdate} className="auth-form">
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                  minLength={3}
                  maxLength={20}
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="primary-btn sm" disabled={updating}>
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="profile-stats-section">
            <h3>Personal Records</h3>
            {loadingBests ? (
              <p className="text-dim">Loading records...</p>
            ) : bests && Object.keys(bests).length > 0 ? (
              <div className="pb-grid">
                {Object.entries(bests).map(([key, record]) => (
                  <div key={key} className="pb-card">
                    <div className="pb-header">{key.replace('time-', 'Time ').replace('quote', 'Quote Mode')}</div>
                    <div className="pb-wpm">{record.wpm} <span className="text-dim text-sm">WPM</span></div>
                    <div className="pb-accuracy">Accuracy: {record.accuracy}%</div>
                    <div className="pb-difficulty">Difficulty: {record.difficulty}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No personal records found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
