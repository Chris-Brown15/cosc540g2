// auth.js - Handle user authentication

// Mock user data for demonstration
let currentUser = null;
const users = [
    {
        id: 1,
        email: 'demo@example.com',
        password: 'password123'
    }
];

// Check if user is logged in
function isLoggedIn() {
    return currentUser !== null;
}

// Login user
function login(email, password) {
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        currentUser = user;
        // Store in session
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

// Register new user
function register(email, password) {
    // Check if user already exists
    if (users.find(user => user.email === email)) {
        return false;
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1,
        email,
        password
    };
    
    users.push(newUser);
    currentUser = newUser;
    
    // Store in session
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
}

// Logout user
function logout() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
}

// Initialize auth from session storage
function initAuth() {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
}

// Export functions
window.auth = {
    isLoggedIn,
    login,
    register,
    logout,
    initAuth,
    getCurrentUser: () => currentUser
};

// Initialize auth when page loads
document.addEventListener('DOMContentLoaded', initAuth);