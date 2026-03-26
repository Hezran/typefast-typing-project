const getHeaders = () => {
  const token = localStorage.getItem('typefast-token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
};

export const api = {
  // Auth
  register: async (username, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(res);
  },

  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateMe: async (data) => {
    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Scores
  submitScore: async (data) => {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getPersonalBests: async () => {
    const res = await fetch('/api/scores/personal-best', {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Leaderboard
  getLeaderboard: async ({ mode, duration, difficulty }) => {
    let url = `/api/leaderboard?mode=${mode}`;
    if (mode === 'time' && duration) url += `&duration=${duration}`;
    if (difficulty) url += `&difficulty=${difficulty}`;

    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAllLeaderboard: async (limit = 50) => {
    const res = await fetch(`/api/leaderboard/all?limit=${limit}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
