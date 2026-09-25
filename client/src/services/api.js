const BASE_URL = (import.meta.env.VITE_API_URL || 'https://roleflow-backend.onrender.com/api').replace(/\/$/, '');

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('roleflow_token');
  
  const headers = {
    ...options.headers
  };

  // If body is not FormData, attach JSON header
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      // Token expired or invalid
      localStorage.removeItem('roleflow_token');
      localStorage.removeItem('roleflow_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export default {
  get: (url, options) => request(url, { ...options, method: 'GET' }),
  post: (url, body, options) => request(url, {
    ...options,
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body)
  }),
  patch: (url, body, options) => request(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body)
  }),
  put: (url, body, options) => request(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body)
  }),
  delete: (url, options) => request(url, { ...options, method: 'DELETE' })
};
