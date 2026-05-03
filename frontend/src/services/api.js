/**
 * ChatFrame API Service Layer
 * Production-grade API integration with proper error handling and auth management
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(message, status, validationErrors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getStoredToken();
  }

  // Token management
  getStoredToken() {
    return localStorage.getItem('cf_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('cf_token', token);
    } else {
      localStorage.removeItem('cf_token');
    }
  }

  clearAuth() {
    this.setToken(null);
  }

  isAuthenticated() {
    return !!this.token;
  }

  // Enhanced request wrapper with proper error handling
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth header if token exists
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle rate limiting
      if (response.status === 429) {
        throw new ApiError('Too many attempts, please wait', 429);
      }

      // Handle validation errors from express-validator
      if (!data.success) {
        if (data.errors && Array.isArray(data.errors)) {
          // Backend validation errors - convert to field-based format
          const fieldErrors = {};
          data.errors.forEach(error => {
            if (error.path) {
              fieldErrors[error.path] = error.msg;
            }
          });
          throw new ApiError(
            data.message || 'Validation failed',
            response.status,
            fieldErrors
          );
        } else {
          // General API errors
          throw new ApiError(
            data.message || 'Request failed',
            response.status
          );
        }
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      if (!navigator.onLine) {
        throw new ApiError('No internet connection', 0);
      }

      throw new ApiError(
        error.message || 'Network error occurred',
        0
      );
    }
  }

  // HTTP method helpers
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    if (response.success && response.data.tokens) {
      this.setToken(response.data.tokens.accessToken);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
    } finally {
      this.clearAuth();
    }
  }

  async getUserProfile() {
    return this.get('/auth/me');
  }

  // Company onboarding endpoints
  async companyOnboardingStep1(data) {
    return this.post('/onboard/company/step-1', data);
  }

  async companyOnboardingStep2(data) {
    return this.post('/onboard/company/step-2', data);
  }

  async companyOnboardingStep3(data) {
    return this.post('/onboard/company/step-3', data);
  }

  async companyOnboardingStep4(data) {
    const response = await this.post('/onboard/company/step-4', data);
    if (response.success && response.data.tokens) {
      this.setToken(response.data.tokens.accessToken);
    }
    return response;
  }

  // Agent onboarding endpoints
  async agentOnboardingStep1(data) {
    return this.post('/onboard/agent/step-1', data);
  }

  async agentOnboardingStep2(data) {
    const response = await this.post('/onboard/agent/step-2', data);
    if (response.success && response.data.tokens) {
      this.setToken(response.data.tokens.accessToken);
    }
    return response;
  }

  // Dashboard endpoints
  async getDashboardData() {
    return this.get('/dashboard');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { ApiError };