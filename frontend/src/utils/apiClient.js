const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Standardized API client for all fetch requests.
 * Handles base URL, credentials, and common error parsing.
 */
const apiFetch = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;

  // Don't set Content-Type for FormData — browser adds it with multipart boundary automatically
  const isFormData = options.body instanceof FormData;

  const defaultOptions = {
    credentials: 'include',
    ...options,
    headers: isFormData
      ? { ...options.headers }
      : { 'Content-Type': 'application/json', ...options.headers },
  };

  try {
    const response = await fetch(url, defaultOptions);

    // For non-JSON responses (like blobs/downloads), return raw response
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      return response;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

export const apiClient = {
  get: (url, options) => apiFetch(url, { ...options, method: 'GET' }),
  post: (url, body, options) => apiFetch(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (url, body, options) => {
    const isFormData = body instanceof FormData;
    return apiFetch(url, { ...options, method: 'PUT', body: isFormData ? body : JSON.stringify(body) });
  },
  delete: (url, options) => apiFetch(url, { ...options, method: 'DELETE' }),

  // specialized for FormData (e.g. file uploads)
  postFormData: (url, formData, options) => apiFetch(url, {
    ...options,
    method: 'POST',
    body: formData,
    headers: { ...options?.headers }, // let the browser set the content-type for multipart
  }),
};
