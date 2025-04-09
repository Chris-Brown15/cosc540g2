// listings.js - Handle item listings
async function loadListings() {
    try {
        // later, this would fetch from server. adding mock data for now
        const mockListings = [{
                id: 1,
                title: "Vintage Camera",
                description: "Great condition vintage camera from the 1970s",
                image: "images/vintage-camera.jpg",
                category: "Electronics",
                city: "Arlington",
                state: "VA"
            },
            {
                id: 2,
                title: "Coffee Maker",
                description: "Barely used coffee maker, makes great coffee",
                image: "images/coffee-maker.jpg",
                category: "Home & Kitchen",
                city: "Baltimore",
                state: "MD"
            }
        ];

        renderListings(mockListings);

        /* Uncomment when backend is ready
        const response = await fetch('/api/listings');
        const listings = await response.json();
        renderListings(listings);
        */
    } catch (error) {
        console.error('Failed to load listings:', error);
    }
}

function renderListings(listings) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    if (listings.length === 0) {
        container.innerHTML = '<p>No listings found. Be the first to add one!</p>';
        return;
    }

    listings.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <div class="item-image-container">
                <img src="${item.image || 'https://via.placeholder.com/300x200'}" class="item-image" alt="${item.title || 'Item image'}">
            </div>
            <div class="item-details">
                <h3 class="item-title">${item.title || 'Untitled Item'}</h3>
                <p class="item-description">${item.description || 'No description provided'}</p>
                <div class="item-location">${item.city || 'Local'}, ${item.state || ''}</div>
            </div>
        `;
        container.appendChild(itemCard);
    });
}

function handleFileUpload() {
    if (!currentUser) {
        showAuthModal();
        return;
    }

    // Show the listing creation form
    const modal = document.getElementById('createListingModal') || createListingModal();
    modal.style.display = 'block';
}

function createListingModal() {
    const modal = document.createElement('div');
    modal.id = 'createListingModal';
    modal.className = 'modal';

    // US States Array
    const states = [{
            name: 'Alabama',
            abbr: 'AL'
        }, {
            name: 'Alaska',
            abbr: 'AK'
        }, {
            name: 'Arizona',
            abbr: 'AZ'
        },
        {
            name: 'Arkansas',
            abbr: 'AR'
        }, {
            name: 'California',
            abbr: 'CA'
        }, {
            name: 'Colorado',
            abbr: 'CO'
        },
        {
            name: 'Connecticut',
            abbr: 'CT'
        }, {
            name: 'Delaware',
            abbr: 'DE'
        }, {
            name: 'Florida',
            abbr: 'FL'
        },
        {
            name: 'Georgia',
            abbr: 'GA'
        }, {
            name: 'Hawaii',
            abbr: 'HI'
        }, {
            name: 'Idaho',
            abbr: 'ID'
        },
        {
            name: 'Illinois',
            abbr: 'IL'
        }, {
            name: 'Indiana',
            abbr: 'IN'
        }, {
            name: 'Iowa',
            abbr: 'IA'
        },
        {
            name: 'Kansas',
            abbr: 'KS'
        }, {
            name: 'Kentucky',
            abbr: 'KY'
        }, {
            name: 'Louisiana',
            abbr: 'LA'
        },
        {
            name: 'Maine',
            abbr: 'ME'
        }, {
            name: 'Maryland',
            abbr: 'MD'
        }, {
            name: 'Massachusetts',
            abbr: 'MA'
        },
        {
            name: 'Michigan',
            abbr: 'MI'
        }, {
            name: 'Minnesota',
            abbr: 'MN'
        }, {
            name: 'Mississippi',
            abbr: 'MS'
        },
        {
            name: 'Missouri',
            abbr: 'MO'
        }, {
            name: 'Montana',
            abbr: 'MT'
        }, {
            name: 'Nebraska',
            abbr: 'NE'
        },
        {
            name: 'Nevada',
            abbr: 'NV'
        }, {
            name: 'New Hampshire',
            abbr: 'NH'
        }, {
            name: 'New Jersey',
            abbr: 'NJ'
        },
        {
            name: 'New Mexico',
            abbr: 'NM'
        }, {
            name: 'New York',
            abbr: 'NY'
        }, {
            name: 'North Carolina',
            abbr: 'NC'
        },
        {
            name: 'North Dakota',
            abbr: 'ND'
        }, {
            name: 'Ohio',
            abbr: 'OH'
        }, {
            name: 'Oklahoma',
            abbr: 'OK'
        },
        {
            name: 'Oregon',
            abbr: 'OR'
        }, {
            name: 'Pennsylvania',
            abbr: 'PA'
        }, {
            name: 'Rhode Island',
            abbr: 'RI'
        },
        {
            name: 'South Carolina',
            abbr: 'SC'
        }, {
            name: 'South Dakota',
            abbr: 'SD'
        }, {
            name: 'Tennessee',
            abbr: 'TN'
        },
        {
            name: 'Texas',
            abbr: 'TX'
        }, {
            name: 'Utah',
            abbr: 'UT'
        }, {
            name: 'Vermont',
            abbr: 'VT'
        },
        {
            name: 'Virginia',
            abbr: 'VA'
        }, {
            name: 'Washington',
            abbr: 'WA'
        }, {
            name: 'West Virginia',
            abbr: 'WV'
        },
        {
            name: 'Wisconsin',
            abbr: 'WI'
        }, {
            name: 'Wyoming',
            abbr: 'WY'
        }
    ];

    // Creating state options HTML
    const stateOptions = states.map(state =>
        `<option value="${state.abbr}">${state.name} (${state.abbr})</option>`
    ).join('');

    modal.innerHTML = `
        <div class="modal-content listing-modal-content">
            <span class="close-btn" onclick="this.parentElement.parentElement.style.display='none'">&times;</span>
            
            <div class="modal-scrollable-content">
                <div class="auth-header">
                    <h2>Create New Listing</h2>
                    <p>Fill out the details below to create your listing</p>
                </div>
                
                <form id="listingForm">
                    <div class="form-group">
                        <label for="listing-title">Title</label>
                        <input type="text" id="listing-title" placeholder="Title" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="listing-description">Description</label>
                        <textarea id="listing-description" placeholder="Description" required></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="listing-category">Category</label>
                            <select id="listing-category" required>
                                <option value="">Select a category</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Home & Kitchen">Home & Kitchen</option>
                                <option value="Automotive">Automotive</option>
                                <option value="Fashion">Fashion</option>
                                <option value="Sports">Sports</option>
                                <option value="Toys">Toys</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="listing-condition">Condition</label>
                            <select id="listing-condition" required>
                                <option value="">Select condition</option>
                                <option value="New">New</option>
                                <option value="Like New">Like New</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="listing-city">City</label>
                            <input type="text" id="listing-city" placeholder="Your city" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="listing-state">State</label>
                            <select id="listing-state" required>
                                <option value="">Select state</option>
                                ${stateOptions}
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="listing-image">Upload Image</label>
                        <input type="file" id="listing-image" accept="image/*" onchange="previewImage(event)">
                        <div id="image-preview-container" style="margin-top: 10px; display: none;">
                            <img id="image-preview" style="max-width: 100%; max-height: 200px; border-radius: 8px;" />
                        </div>
                    </div>
                    
                    <button type="submit" class="submit-btn">Publish Listing</button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listener for the form
    document.getElementById('listingForm').addEventListener('submit', submitListing);

    return modal;
}

// Function to preview the selected image
function previewImage(event) {
    const container = document.getElementById('image-preview-container');
    const preview = document.getElementById('image-preview');
    const file = event.target.files[0];

    if (file) {
        // Show the preview container
        container.style.display = 'block';

        // Create FileReader to read the image
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
        }
        reader.readAsDataURL(file);
    } else {
        // preview hidden if no file is selected
        container.style.display = 'none';
    }
}

// previewImage function global so it can be accessed from the inline event
window.previewImage = previewImage;

async function submitListing(e) {
    e.preventDefault();

    const title = document.getElementById('listing-title').value;
    const description = document.getElementById('listing-description').value;
    const category = document.getElementById('listing-category').value;
    const condition = document.getElementById('listing-condition').value;
    const city = document.getElementById('listing-city').value;
    const state = document.getElementById('listing-state').value;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('condition', condition);
    formData.append('city', city);
    formData.append('state', state);

    let imageDataUrl = null;
    const fileInput = document.getElementById('listing-image');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        formData.append('image', file);

        // Get the image data URL for preview
        imageDataUrl = document.getElementById('image-preview').src;
    }

    if (currentUser && currentUser.id) {
        formData.append('userId', currentUser.id);
    }

    try {
        /* BACKEND INTEGRATION - Uncomment when backend is ready
        const response = await fetch('/api/listings', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('createListingModal').style.display = 'none';
            
            // Option 1: Refresh all listings from the server
            loadListings();
            
            // Option 2: Add the new listing with the returned data
            // const newListing = {
            //     id: data.id,
            //     title: title,
            //     description: description,
            //     category: category,
            //     condition: condition,
            //     city: city,
            //     state: state,
            //     image: data.image_url // This should be the URL returned from the server
            // };
            // addListingToDisplay(newListing);
        }
        */

        // Mock successful submission for now
        console.log('Listing submitted:', Object.fromEntries(formData));
        document.getElementById('createListingModal').style.display = 'none';

        // Add the new listing to the displayed listings (mock)
        const mockListing = {
            id: Date.now(), // Generate a fake ID
            title: title,
            description: description,
            category: category,
            condition: condition,
            city: city,
            state: state,
            image: imageDataUrl // Use the data URL for the image
        };

        addListingToDisplay(mockListing);

        // Show success message
        alert('Listing created successfully!');

    } catch (error) {
        console.error('Failed to create listing:', error);
        alert('Failed to create listing: ' + error.message);
    }
}

// Helper function to add a listing to the display
function addListingToDisplay(listing) {
    const container = document.getElementById('productsContainer');
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card';

    itemCard.innerHTML = `
        <div class="item-image-container">
            <img src="${listing.image || 'https://via.placeholder.com/300x200'}" class="item-image" alt="${listing.title || 'Item image'}">
        </div>
        <div class="item-details">
            <h3 class="item-title">${listing.title || 'Untitled Item'}</h3>
            <p class="item-description">${listing.description || 'No description provided'}</p>
            <div class="item-location">${listing.city || 'Local'}, ${listing.state || ''}</div>
        </div>
    `;

    // Add to the beginning of the container
    if (container.firstChild) {
        container.insertBefore(itemCard, container.firstChild);
    } else {
        container.appendChild(itemCard);
    }
}

// CSS for the listing form and modal
document.addEventListener('DOMContentLoaded', function () {
    const style = document.createElement('style');
    style.textContent = `
        textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            min-height: 100px;
            resize: vertical;
            font-family: inherit;
            font-size: 16px;
        }
        
        #image-preview-container {
            border: 1px dashed #ddd;
            padding: 10px;
            text-align: center;
            background-color: #f9f9f9;
            border-radius: 6px;
        }
        
        .item-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.2s;
            cursor: pointer;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
        }
        
        .item-card:hover {
            transform: translateY(-5px);
        }
        
        .item-image-container {
            position: relative;
            width: 100%;
            height: 200px;
            overflow: hidden;
        }
        
        .item-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .item-details {
            padding: 15px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }
        
        .item-title {
            font-weight: bold;
            margin-top: 0;
            margin-bottom: 10px;
            font-size: 18px;
            color: #333;
        }
        
        .item-description {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
            flex-grow: 1;
        }
        
        .item-location {
            color: #888;
            font-size: 14px;
            margin-top: auto;
        }
        
        /* Make the modal scrollable */
        .listing-modal-content {
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            padding: 20px;
        }
        
        .modal-scrollable-content {
            overflow-y: auto;
            max-height: calc(90vh - 40px);
        }
    `;
    document.head.appendChild(style);
});