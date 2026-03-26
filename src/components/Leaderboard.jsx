import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const modeLabel = (score) => {
  if (score.mode === 'time') return `Time ${score.duration}s`;
  if (score.mode === 'words') return `Words`;
  return 'Quote';
};

const Leaderboard = ({ isOpen, onClose }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) loadLeaderboard();
  }, [isOpen]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.getAllLeaderboard(50);
      setScores(data.leaderboard);
      setError('');
    } catch (err) {
      setError('Failed to load leaderboard. Server might be offline.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content leaderboard-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Global Leaderboard</h2>

        {loading ? (
          <div className="leaderboard-loading">Loading scores...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="table-container">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>WPM</th>
                  <th>Accuracy</th>
                  <th>Mode</th>
                  <th>Difficulty</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {scores.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">No scores yet. Be the first!</td>
                  </tr>
                ) : (
                  scores.map((score) => (
                    <tr key={score.id} className={user?.id === score.user.id ? 'current-user-row' : ''}>
                      <td>{score.rank}</td>
                      <td className="username-cell">{score.user.username}</td>
                      <td className="wpm-cell">{score.wpm}</td>
                      <td>{score.accuracy}%</td>
                      <td className="mode-cell">{modeLabel(score)}</td>
                      <td className="diff-cell">{score.difficulty}</td>
                      <td className="date-cell">{new Date(score.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
