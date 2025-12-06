import axios from 'axios';

// Configure Axios base URL (optional but recommended)
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

/**
 * Logs in a user and stores the JWT token.
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} The user object if successful
 */
export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/login', {
            email,
            password
        });

        const { token, user } = response.data;

        // Store token in localStorage
        localStorage.setItem('token', token);

        // Optional: Store user info
        localStorage.setItem('user', JSON.stringify(user));

        return user;
    } catch (error) {
        console.error('Login failed:', error.response?.data?.message || error.message);
        throw error;
    }
};

/**
 * Registers a new user.
 * 
 * @param {string} name
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} The user object if successful
 */
export const registerUser = async (name, email, password) => {
    try {
        const response = await api.post('/register', {
            name,
            email,
            password
        });

        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        return user;
    } catch (error) {
        console.error('Registration failed:', error.response?.data?.message || error.message);
        throw error;
    }
};
