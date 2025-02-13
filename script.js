const products = [
    {
        id: 1,
        title: "Vintage Camera",
        description: "Excellent condition, looking to trade for photography equipment",
        imageUrl: "images/camera.jpg"
    },
    // More products...
];

// Function to create a product card
function createProductCard(product) {
    return `
        <div class="item-card">
            <img src="${product.imageUrl}" alt="${product.title}" class="item-image">
            <div class="item-details">
                <div class="item-title">${product.title}</div>
                <div class="item-description">${product.description}</div>
            </div>
        </div>
    `;
}

// Function to display products
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    container.innerHTML = products.map(product => createProductCard(product)).join('');
}


// Initialize the display when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
});