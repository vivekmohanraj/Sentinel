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

export const fetchUserDetailsApi = async (userId, requesterEmail) => {
  try {
    const url = requesterEmail
      ? `${API_BASE_URL}/user/details/${userId}?email=${encodeURIComponent(requesterEmail)}`
      : `${API_BASE_URL}/user/details/${userId}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) {
      const errRes = await res.json();
      throw new Error(errRes.error || `HTTP error! status: ${res.status}`);
    }
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to fetch user details:', err);
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

export const createUserByAdminApi = async (userData, adminEmail) => {
  try {
    const url = adminEmail
      ? `${API_BASE_URL}/user/create?email=${encodeURIComponent(adminEmail)}`
      : `${API_BASE_URL}/user/create`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...userData, adminEmail })
    });
    if (!res.ok) {
      const errRes = await res.json();
      throw new Error(errRes.error || `HTTP error! status: ${res.status}`);
    }
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to create user:', err);
    throw err;
  }
};

export const toggleUserDisableApi = async (userId, isDisabled, adminEmail) => {
  try {
    const url = adminEmail
      ? `${API_BASE_URL}/user/disable?email=${encodeURIComponent(adminEmail)}`
      : `${API_BASE_URL}/user/disable`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, isDisabled, adminEmail })
    });
    if (!res.ok) {
      const errRes = await res.json();
      throw new Error(errRes.error || `HTTP error! status: ${res.status}`);
    }
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to toggle user status:', err);
    throw err;
  }
};

export const deleteUserApi = async (userId, adminEmail) => {
  try {
    const url = adminEmail
      ? `${API_BASE_URL}/user/${userId}?email=${encodeURIComponent(adminEmail)}`
      : `${API_BASE_URL}/user/${userId}`;

    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) {
      const errRes = await res.json();
      throw new Error(errRes.error || `HTTP error! status: ${res.status}`);
    }
    const result = await res.json();
    return result;
  } catch (err) {
    console.error('Failed to delete user:', err);
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

export const fetchNotificationsApi = async (email) => {
  try {
    const url = email
      ? `${API_BASE_URL}/notifications?email=${encodeURIComponent(email)}`
      : `${API_BASE_URL}/notifications`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    throw err;
  }
};

export const markNotificationReadApi = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
    throw err;
  }
};

export const markAllNotificationsReadApi = async (email) => {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result;
  } catch (err) {
    console.error('Failed to mark all notifications as read:', err);
    throw err;
  }
};

export const fetchCommitsApi = async (search = '') => {
  try {
    const url = search
      ? `${API_BASE_URL}/commits?search=${encodeURIComponent(search)}`
      : `${API_BASE_URL}/commits`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to fetch commits:', err);
    throw err;
  }
};

export const addCommitRecordApi = async (commitData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/commits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(commitData)
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to add commit record:', err);
    throw err;
  }
};

export const fetchHotspotsApi = async (repoId = '') => {
  try {
    const url = repoId
      ? `${API_BASE_URL}/metrics/hotspots?repoId=${encodeURIComponent(repoId)}`
      : `${API_BASE_URL}/metrics/hotspots`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Failed to fetch hotspots:', err);
    throw err;
  }
};

export const rescanCodebaseApi = async (repoId = '') => {
  try {
    const res = await fetch(`${API_BASE_URL}/metrics/rescan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ repoId })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result = await res.json();
    return result;
  } catch (err) {
    console.error('Failed to rescan codebase:', err);
    throw err;
  }
};
