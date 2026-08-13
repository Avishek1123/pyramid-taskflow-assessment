import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request(path: string, options: RequestInit = {}) {
  const token = Cookies.get('jwt');
  
  const headers = new Headers(options.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // A stale session (e.g. after the demo data was reset) should send the user back to login
    if (response.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('jwt');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (_) {
    return null;
  }
}

export const apiClient = {
  get: (path: string, options?: RequestInit) => request(path, { ...options, method: 'GET' }),
  post: (path: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request(path, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  patch: (path: string, body?: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request(path, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body),
    });
  },
  delete: (path: string, options?: RequestInit) => request(path, { ...options, method: 'DELETE' }),
};
