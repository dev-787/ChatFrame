# Session Persistence Optimization Plan

## 🚨 The Problem

When a user closes/stops the backend server, the client-side frontend app forgets the logged-in user. The user is forced to log in again once the server restarts.

### Root Cause Analysis

1. **Blind Catch-Block Clearing in `AuthContext.jsx`**:
   During application startup/refresh, `initializeAuth()` verifies the token by calling `apiService.getUserProfile()` (`/api/auth/me`). 
   If the backend server is stopped/offline, the fetch request throws a network connection error (e.g., `TypeError: Failed to fetch`).
   In [AuthContext.jsx](file:///c:/Users/Dev/Desktop/chatFrame/frontend/src/contexts/AuthContext.jsx#L43-L47), the catch block handles the error as follows:
   ```javascript
   } catch (error) {
     // Token is invalid or network error, clear auth
     apiService.clearAuth();
     console.warn('Auth initialization failed:', error.message);
   }
   ```
   This immediately deletes the `cf_token` from `localStorage`, meaning the session is wiped even though the token is still cryptographically valid!

2. **Unused Refresh Token System**:
   The backend successfully generates an `accessToken` (valid for `7d`) and a `refreshToken` (valid for `30d`). However, [apiService.js](file:///c:/Users/Dev/Desktop/chatFrame/frontend/src/services/api.js) only extracts and stores the `accessToken`.

---

## 🛠️ Proposed Optimizations

### 1. Graceful Network Error Handling in Frontend
We must prevent the frontend from clearing the token when the API is simply unreachable. The token should only be cleared on **explicit HTTP 401 Unauthorized** errors.

#### Modify `initializeAuth` in [AuthContext.jsx](file:///c:/Users/Dev/Desktop/chatFrame/frontend/src/contexts/AuthContext.jsx)
Distinguish between token validation failure (401) and server-offline errors:
```javascript
  const initializeAuth = async () => {
    try {
      const token = apiService.getStoredToken();
      
      if (token) {
        // Verify token is still valid by fetching user profile
        const response = await apiService.getUserProfile();
        if (response.success) {
          setUser(response.data.user);
        } else {
          // Token is invalid (explicit error response), clear it
          apiService.clearAuth();
        }
      }
    } catch (error) {
      // ONLY clear auth if it is an explicit 401 Unauthorized error.
      // Do not clear it for connection/network/server-offline issues (status 0).
      if (error.status === 401) {
        apiService.clearAuth();
        console.warn('Session expired or invalid. Cleared auth.');
      } else {
        console.warn('Server offline or network error. Retaining local session:', error.message);
        // Optional: set an offline flag in state to notify the user
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };
```

### 2. Implement Token Refresh Logic (For Long-Term Persistence)
To reliably remember the user for 1 week and beyond, we should implement token refreshing.

- **Step A**: Store both `accessToken` and `refreshToken` in `localStorage` upon login:
  ```javascript
  // In apiService.js
  setTokens(tokens) {
    if (tokens) {
      localStorage.setItem('cf_token', tokens.accessToken);
      localStorage.setItem('cf_refresh_token', tokens.refreshToken);
    } else {
      localStorage.removeItem('cf_token');
      localStorage.removeItem('cf_refresh_token');
    }
  }
  ```
- **Step B**: Configure an interceptor or check in `apiService.request` to transparently refresh the access token using `/api/auth/refresh` when a request returns a 401.

### 3. Verify JWT Configuration on Backend
Ensure the backend's environment configuration in `.env` is set correctly:
- `JWT_EXPIRES_IN=7d` (1 week access token duration)
- `JWT_REFRESH_EXPIRES_IN=30d` (30 days refresh token duration)
These values are already configured in [backend/.env](file:///c:/Users/Dev/Desktop/chatFrame/backend/.env), so no backend changes are required for the 1-week expiry itself.

---

## 🧪 Verification Plan

1. **Verify Offline Token Retention**:
   - Log in to the application.
   - Stop the backend server using the terminal.
   - Refresh the page on the frontend.
   - Verify that you are **not** redirected to the login screen, and the token is still present in browser Local Storage.
   - Restart the backend server.
   - Refresh the page and verify you are still logged in seamlessly.
2. **Verify Expiration**:
   - Verify the token payload signature and exp time contains a 7-day duration.
