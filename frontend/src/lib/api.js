const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchUserProfile = async (email) => {
  try {
    const url = email
      ? `${API_BASE_URL}/user/profile?email=${encodeURIComponent(email)}`
      : `${API_BASE_URL}/user/profile`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to fetch user profile:', err);
    throw err;
  }
};

export const updateUserProfile = async (profileData, email) => {
  try {
    const url = email
      ? `${API_BASE_URL}/user/profile?email=${encodeURIComponent(email)}`
      : `${API_BASE_URL}/user/profile`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profileData)
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to update user profile:', err);
    throw err;
  }
};

export const fetchDashboardSummary = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to fetch dashboard summary:', err);
    throw err;
  }
};

export const fetchRepositories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/repositories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to fetch repositories:', err);
    throw err;
  }
};
