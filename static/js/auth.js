let currentUser = null;

function showAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'block';
    switchTab('login');
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function switchTab(tab) {
    document.getElementById('loginTab').classList.toggle('active', tab === 'login');
    document.getElementById('signupTab').classList.toggle('active', tab === 'signup');
    document.getElementById('loginForm').classList.toggle('active', tab === 'login');
    document.getElementById('signupForm').classList.toggle('active', tab === 'signup');
    document.getElementById('auth-title').textContent = tab === 'login' ? 'Login Form' : 'Signup Form';
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const username = email.split('@')[0]; // Temporary username assumption

    try {
        // Later: Actually POST login credentials here for real auth
        // For now, lookup user by username
        const lookupResponse = await fetch(`/api/users/lookup?username=${username}`);
        const lookupResult = await lookupResponse.json();

        if (lookupResponse.ok) {
            currentUser = {
                id: lookupResult.user_id,
                firstName: username,  // temporary
                lastName: '',
                email: email
            };
            closeAuthModal();
            updateUIForLoggedInUser();
            alert('Login successful!');
        } else {
            console.error('Login failed:', lookupResult.error);
            alert('Login failed: ' + lookupResult.error);
        }
    } catch (error) {
        console.error('Login request failed:', error);
        alert('Login request failed!');
    }
}

async function handleSignup(e) {
    e.preventDefault();

    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const email = document.getElementById('signup-email').value;
    const username = email.split('@')[0]; // temporary simple username
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const phone = "555-555-5555"; // placeholder for now
    const postalCode = "00000";    // placeholder for now

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        username: username,
        password: password,
        phone: phone,
        postal_code: postalCode,
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();
        if (response.ok) {
            console.log('User registered!', result);

            // Immediately lookup real user _id
            const lookupResponse = await fetch(`/api/users/lookup?username=${username}`);
            const lookupResult = await lookupResponse.json();
            if (lookupResponse.ok) {
                currentUser = {
                    id: lookupResult.user_id,
                    firstName: firstName,
                    lastName: lastName,
                    email: email
                };
            }

            alert('Signup successful!');
            closeAuthModal();
            updateUIForLoggedInUser();
        } else {
            console.error('Signup error:', result.error);
            alert('Signup failed: ' + result.error);
        }
    } catch (error) {
        console.error('Signup request failed:', error);
        alert('Signup request failed!');
    }
}

function updateUIForLoggedInUser() {
    const profileButton = document.getElementById('profileButton');
    profileButton.textContent = currentUser.firstName.charAt(0).toUpperCase() + currentUser.lastName.charAt(0).toUpperCase();
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