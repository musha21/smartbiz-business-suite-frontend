/**
 * Auth Utility Functions
 * Handles JWT decoding, expiration checks, and role validation.
 * Pure JavaScript, no external dependencies.
 */

// Helper: Decode Base64 safely
const base64UrlDecode = (str) => {
    try {
        // Add padding if needed
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        const pad = str.length % 4;
        if (pad) {
            if (pad === 1) {
                throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
            }
            str += new Array(5 - pad).join('=');
        }
        return JSON.parse(decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')));
    } catch (e) {
        console.error('Failed to decode base64 string:', e);
        return null;
    }
};

/**
 * Decodes the JWT token payload.
 * @param {string} token 
 * @returns {object|null} The decoded payload or null if invalid.
 */
export const decodeToken = (token) => {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return base64UrlDecode(parts[1]);
};

/**
 * Checks if the token is expired.
 * @param {string} token 
 * @returns {boolean} True if expired or invalid, False if valid.
 */
export const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded) return true;
    if (!decoded.exp) return false; // If no exp claim, assume valid (for dev)

    // JWT exp is in seconds, Date.now() is in ms
    const currentTime = Math.floor(Date.now() / 1000);
    // Add a small buffer (e.g. 10s) to account for clock skew
    return decoded.exp < (currentTime + 10);
};

/**
 * Gets the user role from the token.
 * Payload example: { role: "ADMIN", ... }
 * @param {string} token 
 * @returns {string|null} The role string or null.
 */
export const getUserRole = (token) => {
    const decoded = decodeToken(token);
    return decoded?.role || null;
};

/**
 * Gets the business ID from the token.
 * Payload example: { businessId: 123, ... }
 * @param {string} token 
 * @returns {number|null} The business ID or null.
 */
export const getBusinessId = (token) => {
    const decoded = decodeToken(token);
    return decoded?.businessId || null;
};

/**
 * Checks if the user is authenticated and has a valid session.
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    return !isTokenExpired(token);
};

/**
 * Clears all auth data from storage.
 */
export const clearAuthStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('business');
};
