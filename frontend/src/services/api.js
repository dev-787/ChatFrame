const API_BASE_URL = 'http://localhost:5000/api';

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
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('cf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          throw new ApiError('Too many attempts, please wait', 429);
        }
        
        // Handle validation errors (400)
        if (response.status === 400 && data.errors) {
          const error = new ApiError(data.message || 'Validation failed', 400);
          error.validationErrors = data.errors;
          throw error;
        }
        
        // Handle other errors
        throw new ApiError(data.message || 'Request failed', response.status);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Company onboarding endpoints
  async companyOnboardingStep1(data) {
    return this.request('/onboard/company/step-1', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async companyOnboardingStep2(data) {
    return this.request('/onboard/company/step-2', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async companyOnboardingStep3(data) {
    return this.request('/onboard/company/step-3', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async companyOnboardingStep4(data) {
    return this.request('/onboard/company/step-4', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Agent onboarding endpoints
  async agentOnboardingStep1(data) {
    return this.request('/onboard/agent/step-1', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async agentOnboardingStep2(data) {
    return this.request('/onboard/agent/step-2', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiService();