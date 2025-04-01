// app.js - Main application logic

// Create a product card for the item listing
function createProductCard(product) {
    return `
        <div class="item-card">
            <img src="${product.imageUrl || 'images/placeholder.jpg'}" alt="${product.title}" class="item-image">
            <div class="item-details">
                <div class="item-title">${product.title}</div>
                <div class="item-description">${product.description}</div>
                <div class="item-meta">
                    <span class="item-condition">${product.condition || 'Not specified'}</span>
                    <span class="item-category">${product.category}</span>
                </div>
            </div>
        </div>
    `;
}

// Display products in the main container
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p class="no-items">No items found. Be the first to add an item!</p>';
        return;
    }
    
    container.innerHTML = products.map(product => createProductCard(product)).join('');
}

// Filter products by category
function filterByCategory(category) {
    const products = window.listings.getItemsByCategory(category);
    displayProducts(products);
    
    // Update active category in the UI
    document.querySelectorAll('.categories a').forEach(a => {
        a.classList.remove('active');
        if (a.textContent === category || (category === 'All' && a.textContent === 'All')) {
            a.classList.add('active');
        }
    });
}

// Handle upload button click
function handleUploadClick() {
    if (!window.auth.isLoggedIn()) {
        // Show login/signup modal
        showAuthModal();
    } else {
        // Show create listing modal
        showListingModal();
    }
}

// Show authentication modal
function showAuthModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('authModal')) {
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <div class="auth-tabs">
                    <button class="tab-button active" data-tab="login">Login</button>
                    <button class="tab-button" data-tab="signup">Sign Up</button>
                </div>
                <div class="tab-content" id="login">
                    <h2>Login to Your Account</h2>
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" id="loginEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        <button type="submit" class="submit-button">Login</button>
                    </form>
                    <div class="social-login">
                        <button class="google-button">
                            <span class="google-icon">G</span>
                            Sign in with Google
                        </button>
                    </div>
                </div>
                <div class="tab-content" id="signup" style="display: none;">
                    <h2>Create an Account</h2>
                    <form id="signupForm">
                        <div class="form-group">
                            <label for="signupEmail">Email</label>
                            <input type="email" id="signupEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="signupPassword">Password</label>
                            <input type="password" id="signupPassword" required>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" required>
                        </div>
                        <button type="submit" class="submit-button">Sign Up</button>
                    </form>
                    <div class="terms">
                        By signing up, you agree to our Terms and Conditions and Privacy Policy.
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Tab switching
        const tabButtons = modal.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Hide all tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.style.display = 'none';
                });
                
                // Show selected tab content
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).style.display = 'block';
                
                // Update active tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
        
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (window.auth.login(email, password)) {
                modal.style.display = 'none';
                updateAuthUI();
                // Show the listing form after successful login
                showListingModal();
            } else {
                alert('Invalid email or password.');
            }
        });
        
        // Signup form submission
        const signupForm = document.getElementById('signupForm');
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }
            
            if (window.auth.register(email, password)) {
                modal.style.display = 'none';
                updateAuthUI();
                // Show the listing form after successful signup
                showListingModal();
            } else {
                alert('Email already in use.');
            }
        });
        
        // Google login
        const googleButton = modal.querySelector('.google-button');
        googleButton.addEventListener('click', () => {
            // Mock Google authentication for demonstration
            window.auth.login('demo@example.com', 'password123');
            modal.style.display = 'none';
            updateAuthUI();
            // Show the listing form after successful login
            showListingModal();
        });
    }
    
    // Show the modal
    document.getElementById('authModal').style.display = 'block';
}

// Show listing creation modal
function showListingModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('listingModal')) {
        const modal = document.createElement('div');
        modal.id = 'listingModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h2>Create New Listing</h2>
                <form id="listingForm">
                    <div class="form-group">
                        <label for="itemTitle">Title</label>
                        <input type="text" id="itemTitle" required>
                    </div>
                    <div class="form-group">
                        <label for="itemDescription">Description</label>
                        <textarea id="itemDescription" rows="4" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="itemCategory">Category</label>
                        <select id="itemCategory" required>
                            <option value="">Select a category</option>
                            <option value="Home & Kitchen">Home & Kitchen</option>
                            <option value="Automotive">Automotive</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="itemCondition">Condition</label>
                        <select id="itemCondition" required>
                            <option value="">Select condition</option>
                            <option value="NEW">NEW</option>
                            <option value="Used-Like New">Used-Like New</option>
                            <option value="Used-Good">Used-Good</option>
                            <option value="Used-Fair">Used-Fair</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="itemImage">Upload Image</label>
                        <input type="file" id="itemImage" accept="image/*">
                    </div>
                    <button type="submit" class="submit-button">Publish Listing</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeButton = modal.querySelector('.close-button');
        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Listing form submission
        const listingForm = document.getElementById('listingForm');
        listingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const title = document.getElementById('itemTitle').value;
            const description = document.getElementById('itemDescription').value;
            const category = document.getElementById('itemCategory').value;
            const condition = document.getElementById('itemCondition').value;
            
            // Handle image upload (simplified for demo)
            const imageInput = document.getElementById('itemImage');
            let imageUrl = 'images/placeholder.jpg';
            
            if (imageInput.files && imageInput.files[0]) {
                // In a real application, you would upload the file to a server
                // For demo, we're using a placeholder or sample image
                imageUrl = 'images/camera.jpg'; // Use sample image for demo
            }
            
            // Create new listing
            const newItem = {
                title,
                description,
                category,
                condition,
                imageUrl
            };
            
            window.listings.addItem(newItem);
            
            // Close modal and refresh display
            modal.style.display = 'none';
            
            // Refresh the item display with the current category
            const activeCategory = document.querySelector('.categories a.active').textContent;
            filterByCategory(activeCategory);
        });
    }
    
    // Show the modal
    document.getElementById('listingModal').style.display = 'block';
}

// Update UI based on authentication state
function updateAuthUI() {
    const isLoggedIn = window.auth.isLoggedIn();
    const navLinks = document.querySelector('.nav-links');
    
    // Add My Inventory link for logged-in users
    if (navLinks) {
        if (isLoggedIn) {
            // Check if My Inventory link exists
            if (!document.querySelector('.nav-links a[href="#my-inventory"]')) {
                navLinks.innerHTML += `<a href="#my-inventory" style="font-family: 'Playfair Display', serif;">My Inventory</a>`;
            }
        }
    }
}

// Initialize the page
function initApp() {
    // Display all products initially
    const allProducts = window.listings.getAllItems();
    displayProducts(allProducts);
    
    // Add event listeners to category links
    document.querySelectorAll('.categories a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            filterByCategory(a.textContent);
        });
    });
    
    // Add event listener to upload button
    const uploadButton = document.querySelector('.upload-button');
    if (uploadButton) {
        uploadButton.addEventListener('click', handleUploadClick);
    }
    
    // Update UI based on authentication state
    updateAuthUI();
}

// Handle file upload button click
function handleFileUpload() {
    handleUploadClick();
}

// Initialize app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);