// listings.js - Handle item listings

// Initial item data (will be expanded)
let items = [
    {
        id: 1,
        title: "Vintage Camera",
        description: "Excellent condition, looking to trade for photography equipment",
        imageUrl: "images/camera.jpg",
        category: "Electronics",
        condition: "Used-Good",
        userId: 1
    }
];

// Function to add a new item
function addItem(item) {
    // Generate a new ID
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    
    // Assign the current user's ID to the item
    const currentUser = window.auth.getCurrentUser();
    const userId = currentUser ? currentUser.id : null;
    
    // Create the new item with additional metadata
    const newItem = {
        id: newId,
        ...item,
        userId,
        timestamp: new Date().toISOString()
    };
    
    // Add to the items array
    items.push(newItem);
    
    // Save to local storage for persistence
    saveItems();
    
    return newItem;
}

// Get all items
function getAllItems() {
    return [...items];
}

// Get items by category
function getItemsByCategory(category) {
    if (category === 'All') {
        return getAllItems();
    }
    return items.filter(item => item.category === category);
}

// Get user's items
function getUserItems(userId) {
    return items.filter(item => item.userId === userId);
}

// Save items to local storage
function saveItems() {
    localStorage.setItem('barterlyItems', JSON.stringify(items));
}

// Load items from local storage
function loadItems() {
    const storedItems = localStorage.getItem('barterlyItems');
    if (storedItems) {
        items = JSON.parse(storedItems);
    }
}

// Initialize when the page loads
function initListings() {
    loadItems();
}

// Export functions
window.listings = {
    addItem,
    getAllItems,
    getItemsByCategory,
    getUserItems,
    initListings
};

// Initialize items when page loads
document.addEventListener('DOMContentLoaded', initListings);