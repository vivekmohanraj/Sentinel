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

export const fetchAllUsers = async (adminEmail) => {
  try {
    const url = adminEmail
      ? `${API_BASE_URL}/user/all?email=${encodeURIComponent(adminEmail)}`
      : `${API_BASE_URL}/user/all`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to fetch all users:', err);
    throw err;
  }
};

export const updateUserRoleApi = async (userId, role, adminEmail) => {
  try {
    const url = adminEmail
      ? `${API_BASE_URL}/user/role?email=${encodeURIComponent(adminEmail)}`
      : `${API_BASE_URL}/user/role`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, role, adminEmail })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to update user role:', err);
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

export const addRepositoryApi = async (name, gitUrl) => {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/repositories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, gitUrl })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to add repository:', err);
    throw err;
  }
};

export const deleteRepositoryApi = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/repositories/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result;
  } catch (err) {
    console.error('Failed to delete repository:', err);
    throw err;
  }
};

export const fetchSystemTelemetry = async (adminEmail) => {
  try {
    const url = adminEmail
      ? `${API_BASE_URL}/dashboard/telemetry?email=${encodeURIComponent(adminEmail)}`
      : `${API_BASE_URL}/dashboard/telemetry`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to fetch system telemetry:', err);
    throw err;
  }
};

export const getExportReportUrl = (format = 'csv') => {
  return `${API_BASE_URL}/dashboard/export?format=${format}`;
};

export const fetchOrganizations = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/org/orgs`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to fetch organizations:', err);
    throw err;
  }
};

export const createOrganizationApi = async (name) => {
  try {
    const res = await fetch(`${API_BASE_URL}/org/orgs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to create organization:', err);
    throw err;
  }
};

export const fetchProjects = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/org/projects`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to fetch projects:', err);
    throw err;
  }
};

export const createProjectApi = async (orgId, name, description) => {
  try {
    const res = await fetch(`${API_BASE_URL}/org/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ orgId, name, description })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to create project:', err);
    throw err;
  }
};
