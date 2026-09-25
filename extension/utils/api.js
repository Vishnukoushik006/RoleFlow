/**
 * Extension API Client
 */

const getApiConfig = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['apiUrl', 'token', 'user'], (data) => {
      resolve({
        apiUrl: data.apiUrl || 'https://roleflow-backend.onrender.com/api',
        token: data.token || '',
        user: data.user || null
      });
    });
  });
};

const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const { apiUrl, token } = await getApiConfig();

  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${apiUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
};

// Export to window for popup script
if (typeof window !== 'undefined') {
  window.ExtensionApi = {
    getApiConfig,
    apiRequest,
    getMe: () => apiRequest('/auth/me'),
    login: (email, password) => apiRequest('/auth/login', 'POST', { email, password }),
    getResumes: () => apiRequest('/resumes'),
    createApplication: (appData) => apiRequest('/applications', 'POST', appData)
  };
}
