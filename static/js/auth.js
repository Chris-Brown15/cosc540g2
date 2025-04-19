// auth.js
let currentUser = null;

// Test user for demo purposes
const testUser = {
    id: 'test123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com'
};

function showAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'block';

    // Default to login tab
    switchTab('login');
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function switchTab(tab) {
    // tab buttons
    document.getElementById('loginTab').classList.toggle('active', tab === 'login');
    document.getElementById('signupTab').classList.toggle('active', tab === 'signup');

    // form visibility
    document.getElementById('loginForm').classList.toggle('active', tab === 'login');
    document.getElementById('signupForm').classList.toggle('active', tab === 'signup');

    //  modal title
    document.getElementById('auth-title').textContent = tab === 'login' ? 'Login Form' : 'Signup Form';
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // demo purposes- allowing login with any credentials
    // after implementation, we would validate with our backend
    currentUser = testUser;
    closeAuthModal();
    updateUIForLoggedInUser();

    alert('Successfully logged in as ' + email);
}

async function handleSignup(e) {
    e.preventDefault();
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // demo purposes, allowing signup without backend
    currentUser = {
        id: 'user_' + Date.now(),
        firstName: firstName,
        lastName: lastName,
        email: email
    };

    closeAuthModal();
    updateUIForLoggedInUser();

    alert('Successfully signed up as ' + firstName + ' ' + lastName);
}

function updateUIForLoggedInUser() {
    // Update profile button to show user is logged in
    const profileButton = document.getElementById('profileButton');
    profileButton.textContent = currentUser.firstName.charAt(0) + currentUser.lastName.charAt(0);
    profileButton.style.backgroundColor = '#0055a4';
    profileButton.style.color = 'white';
    profileButton.style.borderRadius = '50%';
    profileButton.style.width = '30px';
    profileButton.style.height = '30px';
    profileButton.style.display = 'flex';
    profileButton.style.alignItems = 'center';
    profileButton.style.justifyContent = 'center';
    profileButton.style.fontWeight = 'bold';
    profileButton.style.fontSize = '14px';
}