// listings.js - Handle item listings with multiple images, video and carousel functionality

let slideshows = {}; // Global variable to store the current slide index for each listing
let selectedFiles = []; // Global variable To store all selected files

async function loadListings() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        const url = searchQuery ? `/api/inventory?search=${encodeURIComponent(searchQuery)}` : '/api/inventory';
        
        const response = await fetch(url);
        const listings = await response.json();
        renderListings(listings.data || listings);
    } catch (error) {
        console.error('Failed to load listings:', error);
        // Fallback to empty array if the API fails
        renderListings([]);
    }
}

function renderListings(listings) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';

    if (!listings || listings.length === 0) {
        container.innerHTML = '<p>No listings found. Be the first to add one!</p>';
        return;
    }

    listings.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.dataset.itemId = item._id || item.id || '';

        // Create image/video slideshow container
        let mediaHtml = '';
        if (item.media && item.media.length > 0) {
            mediaHtml = `
                <div class="slideshow-container">
                    <div class="slideshow-wrapper">
            `;

            // Add each media item (image or video)
            item.media.forEach((media, index) => {
                if (media.type === 'video') {
                    mediaHtml += `
                        <div class="slide">
                            <video class="item-media" controls>
                                <source src="${media.url}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    `;
                } else {
                    // Assume it's an image
                    mediaHtml += `
                        <div class="slide">
                            <img class="item-media" src="${media.url}" alt="${item.title || 'Item image'}">
                        </div>
                    `;
                }
            });

            mediaHtml += `
                    </div>
                    <button class="prev-btn" onclick="moveSlide('${item._id || item.id}', -1)">❮</button>
                    <button class="next-btn" onclick="moveSlide('${item._id || item.id}', 1)">❯</button>
                    <div class="dots-container">
            `;

            // Add dots for each slide
            item.media.forEach((_, index) => {
                mediaHtml += `<span class="dot" onclick="currentSlide('${item._id || item.id}', ${index})"></span>`;
            });

            mediaHtml += `
                    </div>
                </div>
            `;
        } else {
            // Fallback if no media or single image
            const imgSrc = item.image || 'https://via.placeholder.com/300x200';
            mediaHtml = `
                <div class="item-image-container">
                    <img src="${imgSrc}" class="item-media" alt="${item.title || 'Item image'}">
                </div>
            `;
        }

        itemCard.innerHTML = `
            ${mediaHtml}
            <div class="item-details">
                <h3 class="item-title">${item.title || 'Untitled Item'}</h3>
                <p class="item-description">${item.description || 'No description provided'}</p>
                <div class="item-location">${item.city || 'Local'}, ${item.state || ''}</div>
            </div>
        `;

        container.appendChild(itemCard);

        // Initialize slideshow for this listing if it has media
        if (item.media && item.media.length > 0) {
            slideshows[item._id || item.id] = 0;
            showSlide(item._id || item.id, 0);
        }
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
                        <textarea id="listing-description" placeholder="Description" required style="min-height: 120px; width: 100%; resize: vertical;"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="listing-category">Category</label>
                            <select id="listing-category" required>
                                <option value="">Select category</option>
                                <option value="Home & Living">Home & Living</option>
                                <option value="Clothing & Accessories">Clothing & Accessories</option>
                                <option value="Kids & Baby">Kids & Baby</option>
                                <option value="Books/Movies/Music">Books/Movies/Music</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Arts & Crafts">Arts & Crafts</option>
                                <option value="Tools & DIY">Tools & DIY</option>
                                <option value="Garden & Outdoors">Garden & Outdoors</option>
                                <option value="Sports & Recreation">Sports & Recreation</option>
                                <option value="Pets">Pets</option>
                                <option value="Transportation">Transportation</option>
                                <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                                <option value="Misc">Misc</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="listing-condition">Condition</label>
                            <select id="listing-condition" required>
                                <option value="">Select condition</option>
                                <option value="BRAND_NEW">Brand New</option>
                                <option value="USED">Used</option>
                                <option value="REFURBISHED">Refurbished</option>
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
                        <label for="listing-value">Estimated Value</label>
                        <input type="number" id="listing-value" placeholder="e.g. 10" required>
                    </div>

                    <div class="form-group">
                        <label>Upload Images (Max 5)</label>
                        <div class="media-upload-container">
                            <div class="media-upload-box" onclick="document.getElementById('listing-images').click()">
                                <div class="upload-icon">+</div>
                                <span>Add Images</span>
                            </div>
                            <input type="file" id="listing-images" accept="image/*" multiple onchange="previewImages(event)" style="display: none;">
                        </div>
                        <div id="image-preview-container" class="media-preview-grid"></div>
                        <p class="input-helper">You can select up to 5 images</p>
                    </div>
                    
                    <div class="form-group">
                        <label>Upload Video (Optional)</label>
                        <div class="media-upload-container">
                            <div class="media-upload-box" onclick="document.getElementById('listing-video').click()">
                                <div class="upload-icon">+</div>
                                <span>Add Video</span>
                            </div>
                            <input type="file" id="listing-video" accept="video/*" onchange="previewVideo(event)" style="display: none;">
                        </div>
                        <div id="video-preview-container"></div>
                        <p class="input-helper">Maximum video size: 50MB</p>
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

// Function to preview multiple images
function previewImages(event) {
    const container = document.getElementById('image-preview-container');
    const newFiles = event.target.files;

    // Add new files to our collection (up to max of 5 total)
    const maxFiles = 5;
    for (let i = 0; i < newFiles.length && selectedFiles.length < maxFiles; i++) {
        selectedFiles.push(newFiles[i]);
    }

    if (selectedFiles.length > maxFiles) {
        selectedFiles = selectedFiles.slice(0, maxFiles);
        alert(`You can only upload up to ${maxFiles} images. Only the first ${maxFiles} will be used.`);
    }

    // Clear previous previews
    container.innerHTML = '';

    // Create previews for each selected image
    selectedFiles.forEach((file, index) => {
        const previewBox = document.createElement('div');
        previewBox.className = 'media-preview-box';
        previewBox.dataset.index = index;

        // Create preview image
        const img = document.createElement('img');
        img.className = 'media-preview';

        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-media-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = function () {
            removeImage(index);
        };

        // Read the file and set the image source
        const reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Append elements to container
        previewBox.appendChild(img);
        previewBox.appendChild(removeBtn);
        container.appendChild(previewBox);
    });

    // Show the container if there are files
    container.style.display = selectedFiles.length > 0 ? 'grid' : 'none';
}

// Function for backwards compatibility with original single image preview
function previewImage(event) {
    previewImages(event);
}


// Function to remove an image from the preview
function removeImage(index) {
    // Remove the file from our collection
    selectedFiles.splice(index, 1);

    // Update the preview to reflect the change
    const container = document.getElementById('image-preview-container');

    // Clear previous previews
    container.innerHTML = '';

    // Create previews for each selected image
    selectedFiles.forEach((file, idx) => {
        const previewBox = document.createElement('div');
        previewBox.className = 'media-preview-box';
        previewBox.dataset.index = idx;

        // Create preview image
        const img = document.createElement('img');
        img.className = 'media-preview';

        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-media-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = function () {
            removeImage(idx);
        };

        // Read the file and set the image source
        const reader = new FileReader();
        reader.onload = function (e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Append elements to container
        previewBox.appendChild(img);
        previewBox.appendChild(removeBtn);
        container.appendChild(previewBox);
    });

    // Show the container if there are files
    container.style.display = selectedFiles.length > 0 ? 'grid' : 'none';
}

// Function to preview video
function previewVideo(event) {
    const container = document.getElementById('video-preview-container');
    const file = event.target.files[0];

    // Clear previous preview
    container.innerHTML = '';

    if (file) {
        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (file.size > maxSize) {
            alert('Video size exceeds the 50MB limit. Please choose a smaller file.');
            event.target.value = ''; // Clear the input
            return;
        }

        const previewBox = document.createElement('div');
        previewBox.className = 'video-preview-box';

        // Create video element
        const video = document.createElement('video');
        video.className = 'video-preview';
        video.controls = true;

        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-media-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = function () {
            document.getElementById('listing-video').value = '';
            container.innerHTML = '';
            container.style.display = 'none';
        };

        // Read the file and set the video source
        const reader = new FileReader();
        reader.onload = function (e) {
            video.src = e.target.result;
        };
        reader.readAsDataURL(file);

        // Append elements to container
        previewBox.appendChild(video);
        previewBox.appendChild(removeBtn);
        container.appendChild(previewBox);

        // Show the container
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

async function submitListing(e) {
    e.preventDefault();

    // Get form values
    const title = document.getElementById('listing-title').value;
    const description = document.getElementById('listing-description').value;
    const category = document.getElementById('listing-category').value;
    const condition = document.getElementById('listing-condition').value;
    const city = document.getElementById('listing-city').value;
    const state = document.getElementById('listing-state').value;
    const value = document.getElementById('listing-value').value;

    // Create FormData object
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('condition', condition);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('value', value);
    formData.append('currency', 'USD');
    formData.append('status', 'ACTIVE');

    // Get image and video files
    const imageFiles = selectedFiles;

    // Process media for display
    let mediaItems = [];

    // Process images
    for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        formData.append('images', file); // For the actual backend request

        // For the local preview (read the image as data URL)
        const reader = new FileReader();
        const dataUrl = await new Promise(resolve => {
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });

        mediaItems.push({
            type: 'image',
            url: dataUrl
        });
    }

    // Process video if present
    // Process video if present
    const videoInput = document.getElementById('listing-video');
    if (videoInput && videoInput.files[0]) {
        const videoFile = videoInput.files[0];
        formData.append('video', videoFile); // For the actual backend request

        // For the local preview
        const reader = new FileReader();
        const dataUrl = await new Promise(resolve => {
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(videoFile);
        });

        mediaItems.push({
            type: 'video',
            url: dataUrl
        });
    }

    // Add user ID if available
    if (currentUser && currentUser.id) {
        formData.append('user_id', currentUser.id);
    }

    try {
        /* BACKEND INTEGRATION - Uncomment when backend is ready */
        const token = localStorage.getItem("authToken");
        console.log("SUBMIT LISTING CALLED - TOKEN FROM LOCALSTORAGE:", localStorage.getItem("authToken"));

        if (!token) {
            alert("You must be logged in to create a listing.");
            return;
        }
        
        const response = await fetch('/api/inventory', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });        
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('createListingModal').style.display = 'none';
            
            // Option 1: Refresh all listings
            loadListings();
        }

        // Mock successful submission for now
        //console.log('Listing submitted:', Object.fromEntries(formData));
        //document.getElementById('createListingModal').style.display = 'none';

        // Add the new listing to the displayed listings (mock)
        //const mockListing = {
        //    id: Date.now(), // Generate a fake ID
        //    title: title,
        //    description: description,
        //    category: category,
        //    condition: condition,
        //    city: city,
        //    state: state,
        //    media: mediaItems.length > 0 ? mediaItems : null,
            // For backwards compatibility
        //    image: mediaItems.length > 0 && mediaItems[0].type === 'image' ? mediaItems[0].url : null
        //};

        //addListingToDisplay(mockListing);

        // Show success message
        //alert('Listing created successfully!');

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
    itemCard.dataset.itemId = listing.id || listing._id;

    // Create media HTML
    let mediaHtml = '';

    if (listing.media && listing.media.length > 0) {
        // Use slideshow for multiple media
        mediaHtml = `
            <div class="slideshow-container">
                <div class="slideshow-wrapper">
        `;

        // Add each media item
        listing.media.forEach((media, index) => {
            if (media.type === 'video') {
                mediaHtml += `
                    <div class="slide">
                        <video class="item-media" controls>
                            <source src="${media.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
            } else {
                mediaHtml += `
                    <div class="slide">
                        <img class="item-media" src="${media.url}" alt="${listing.title || 'Item image'}">
                    </div>
                `;
            }
        });

        mediaHtml += `
                </div>
                <button class="prev-btn" onclick="moveSlide('${listing.id || listing._id}', -1)">❮</button>
                <button class="next-btn" onclick="moveSlide('${listing.id || listing._id}', 1)">❯</button>
                <div class="dots-container">
        `;

        // Add dots for each slide
        listing.media.forEach((_, index) => {
            mediaHtml += `<span class="dot" onclick="currentSlide('${listing.id || listing._id}', ${index})"></span>`;
        });

        mediaHtml += `
                </div>
            </div>
        `;
    } else if (listing.image) {
        // Fallback to single image if no media array but has image property (for backward compatibility)
        mediaHtml = `
            <div class="item-image-container">
                <img src="${listing.image}" class="item-media" alt="${listing.title || 'Item image'}">
            </div>
        `;
    } else {
        // Default placeholder if no media at all
        mediaHtml = `
            <div class="item-image-container">
                <img src="https://via.placeholder.com/300x200" class="item-media" alt="${listing.title || 'Item image'}">
            </div>
        `;
    }

    itemCard.innerHTML = `
        ${mediaHtml}
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

    // Initialize slideshow for this listing if applicable
    if (listing.media && listing.media.length > 0) {
        slideshows[listing.id || listing._id] = 0;
        showSlide(listing.id || listing._id, 0);
    }
}

// Function to move to a specific slide
function currentSlide(itemId, slideIndex) {
    showSlide(itemId, slideIndex);
}

// Function to move the slide (prev/next)
function moveSlide(itemId, step) {
    showSlide(itemId, slideshows[itemId] + step);
}

// Function to show a specific slide
function showSlide(itemId, slideIndex) {
    const slides = document.querySelectorAll(`.item-card[data-item-id="${itemId}"] .slide`);
    const dots = document.querySelectorAll(`.item-card[data-item-id="${itemId}"] .dot`);

    if (!slides.length) return;

    // Handle wrapping around
    if (slideIndex >= slides.length) slideIndex = 0;
    if (slideIndex < 0) slideIndex = slides.length - 1;

    // Hide all slides
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        if (dots[i]) dots[i].classList.remove("active");
    }

    // Show the current slide
    slides[slideIndex].style.display = "block";
    if (dots[slideIndex]) dots[slideIndex].classList.add("active");

    // Update the current slide index
    slideshows[itemId] = slideIndex;
}

// Make functions globally accessible
window.previewImages = previewImages;
window.previewImage = previewImage; // For backward compatibility
window.previewVideo = previewVideo;
window.removeImage = removeImage;
window.moveSlide = moveSlide;
window.currentSlide = currentSlide;
window.showSlide = showSlide;
window.handleFileUpload = handleFileUpload;

// Add CSS for the listing media functionality
document.addEventListener('DOMContentLoaded', function () {
    const style = document.createElement('style');
    style.textContent = `
        /* Slideshow container */
        .slideshow-container {
            position: relative;
            width: 100%;
            height: 200px;
            overflow: hidden;
        }
        
        .slideshow-wrapper {
            width: 100%;
            height: 100%;
        }
        
        .slide {
            display: none;
            width: 100%;
            height: 100%;
        }
        
        .item-media {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        /* Next & previous buttons */
        .prev-btn, .next-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.5);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            z-index: 10;
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .prev-btn {
            left: 10px;
        }
        
        .next-btn {
            right: 10px;
        }
        
        .slideshow-container:hover .prev-btn,
        .slideshow-container:hover .next-btn {
            opacity: 1;
        }
        
        /* Dots container */
        .dots-container {
            position: absolute;
            bottom: 10px;
            left: 0;
            right: 0;
            text-align: center;
            z-index: 10;
        }
        
        /* Dots */
        .dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            margin: 0 4px;
            background-color: #bbb;
            border-radius: 50%;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .dot.active {
            background-color: #fff;
        }
        
        /* Media upload styling */
        .media-upload-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 10px;
        }
        
        .media-upload-box {
            width: 100px;
            height: 100px;
            border: 2px dashed #0055a4;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background-color: #f0f7ff;
            transition: background-color 0.2s, transform 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin: 10px 0;
        }
        
        .media-upload-box:hover {
            background-color: #e0f0ff;
            transform: translateY(-2px);
        }
        
        .upload-icon {
            font-size: 32px;
            color: #0055a4;
            margin-bottom: 5px;
        }
        
        .media-preview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 10px;
            margin-top: 10px;
            max-height: 250px;
            overflow-y: auto;
            padding: 10px;
            border-radius: 8px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
        }
        
        .media-preview-box {
            position: relative;
            width: 100%;
            height: 100px;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #ddd;
        }

        .video-preview-box {
            position: relative;
            max-height: 200px;
            border-radius: 8px;
            overflow: auto;
            border: 1px solid #ddd;
            margin-top: 10px;
        }

        .video-preview {
            max-width: 100%;
            max-height: 200px;
        }
        
        .media-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .remove-media-btn {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 24px;
            height: 24px;
            background-color: rgba(0, 0, 0, 0.6);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }
        
        .input-helper {
            color: #888;
            font-size: 12px;
            margin-top: 5px;
        }
        
        /* Improved responsiveness for item cards */
        .item-card {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
            cursor: pointer;
            height: auto;
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
        }
        
        .item-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        .item-image-container {
            position: relative;
            width: 100%;
            height: 200px;
            overflow: hidden;
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
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        
        .item-location {
            color: #888;
            font-size: 14px;
            margin-top: auto;
        }
        
        /* Styling for the modal with scrollable content */
        .listing-modal-content {
            max-height: 90vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            padding: 20px;
            border-radius: 12px;
        }
        
        .modal-scrollable-content {
            overflow-y: auto;
            max-height: calc(90vh - 60px);
            padding-right: 10px;
        }
        
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
    `;
    document.head.appendChild(style);
});