// app.js - Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    loadListings();

    // Set up event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Handle profile dropdown
    const profileButton = document.getElementById('profileButton');
    if (profileButton) {
        profileButton.addEventListener('click', (e) => {
            if (currentUser) {
                toggleProfileDropdown();
            } else {
                showAuthModal();
            }
        });
    }

    // Handle upload button
    const uploadButton = document.querySelector('.upload-button');
    if (uploadButton) {
        uploadButton.addEventListener('click', handleFileUpload);
    }

    // closing dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#profileDropdown') && !e.target.closest('#profileButton')) {
            const dropdown = document.getElementById('profileDropdown');
            if (dropdown) dropdown.style.display = 'none';
        }
    });
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown') || createProfileDropdown();
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function createProfileDropdown() {
    const dropdown = document.createElement('div');
    dropdown.id = 'profileDropdown';
    dropdown.style.position = 'absolute';
    dropdown.style.right = '20px';
    dropdown.style.top = '60px';
    dropdown.style.backgroundColor = 'white';
    dropdown.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    dropdown.style.borderRadius = '8px';
    dropdown.style.padding = '10px';
    dropdown.style.display = 'none';
    dropdown.style.zIndex = '100';

    dropdown.innerHTML = `
        <div class="dropdown-item">Account Info</div>
        <div class="dropdown-item">My Listings</div>
        <div class="dropdown-item" id="logoutButton">Logout</div>
    `;

    document.body.appendChild(dropdown);

    // Add logout functionality
    document.getElementById('logoutButton').addEventListener('click', () => {
        currentUser = null;
        dropdown.remove();
        document.getElementById('profileButton').textContent = '👤';
    });

    return dropdown;
}