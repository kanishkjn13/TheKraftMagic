// Cart functionality
let selectedSizes = {}; // Track selected size for each product

// Authentication functions
function isLoggedIn() {
    if (typeof UserStorage !== 'undefined') {
        return UserStorage.isLoggedIn();
    }
    // Fallback to old method
    return localStorage.getItem('userLoggedIn') === 'true';
}

function getCurrentUser() {
    if (typeof UserStorage !== 'undefined') {
        return UserStorage.getCurrentUser();
    }
    // Fallback to old method
    return JSON.parse(localStorage.getItem('currentUser')) || null;
}

function checkCartAccess() {
    if (!isLoggedIn()) {
        alert('Please log in to access your cart');
        window.location.href = 'account.html';
        return false;
    }
    window.location.href = 'cart.html';
    return true;
}

function requireAuth() {
    if (!isLoggedIn()) {
        alert('Please log in to add items to cart');
        window.location.href = 'account.html';
        return false;
    }
    return true;
}

// Get cart from localStorage (user-specific)
function getCart() {
    if (typeof CartStorage !== 'undefined') {
        return CartStorage.getCurrentUserCart();
    }
    // Fallback to old method
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Save cart to localStorage (user-specific)
function saveCart(cart) {
    if (typeof CartStorage !== 'undefined') {
        CartStorage.saveCurrentUserCart(cart);
    } else {
        // Fallback to old method
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

function showPrice(size, cardIndex) {
    let price;
    switch(size) {
        case 'S':
            price = 80;
            break;
        case 'M':
            price = 120;
            break;
        case 'L':
            price = 150;
            break;
    }

    // Find the specific card and update its price display
    const cards = document.querySelectorAll('.card');
    const priceDisplay = cards[cardIndex].querySelector('.price-display');
    priceDisplay.textContent = `Price for size ${size}: ₹${price}`;
    
    // Store selected size for this product
    selectedSizes[cardIndex] = { size: size, price: price };
}

function addToCart(productName, productImage, cardIndex) {
    // Check if user is logged in first
    if (!requireAuth()) {
        return;
    }
    
    // Check if a size is selected
    if (!selectedSizes[cardIndex]) {
        alert('Please select a size first!');
        return;
    }
    
    const { size, price } = selectedSizes[cardIndex];
    let cart = getCart();
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => 
        item.name === productName && item.size === size
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            size: size,
            price: price,
            quantity: 1,
            image: productImage
        });
    }
    
    saveCart(cart);
    updateCartDisplay();
    alert(`${productName} (Size ${size}) added to cart!`);
}

// Function for cables and other products that don't require size selection
function addCableToCart(productName, productImage, price) {
    // Check if user is logged in first
    if (!requireAuth()) {
        return;
    }
    
    let cart = getCart();
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => 
        item.name === productName && item.size === 'Standard'
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            size: 'Standard',
            price: price,
            quantity: 1,
            image: productImage
        });
    }
    
    saveCart(cart);
    updateCartDisplay();
    alert(`${productName} added to cart!`);
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartDisplay();
}

function updateQuantity(index, change) {
    let cart = getCart();
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cart = getCart();
    const cartCount = document.getElementById('header-cart-count');
    const cartItems = document.getElementById('cart-items');
    const grandTotal = document.getElementById('grand-total');
    
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    if (cartItems) {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty</p>';
            if (grandTotal) grandTotal.textContent = '0';
            return;
        }
        
        let total = 0;
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" width="50">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size}</p>
                    <p>Price: ₹${item.price}</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <div class="item-total">₹${itemTotal}</div>
                <button onclick="removeFromCart(${index})">Remove</button>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    if (grandTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        grandTotal.textContent = total;
    }
}

function toggleCart() {
    const cartContent = document.getElementById('cart-content');
    cartContent.style.display = cartContent.style.display === 'none' ? 'block' : 'none';
}

function checkout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Redirect to cart page for full checkout flow
    window.location.href = 'cart.html';
}

function logout() {
    try {
        // Use UserStorage if available (preferred method)
        if (typeof UserStorage !== 'undefined') {
            UserStorage.logout();
        } else {
            // Fallback to manual cleanup
            localStorage.removeItem('userLoggedIn');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('cart');
        }
        
        // Clear any additional auth-related data
        localStorage.removeItem('USER_LOGGED_IN');
        localStorage.removeItem('CURRENT_USER');
        
        alert('You have been logged out successfully!');
        
        // Force page reload to reset UI state
        window.location.reload();
    } catch (error) {
        console.error('Error during logout:', error);
        alert('Logout completed');
        window.location.href = 'index.html';
    }
}

function updateHeaderUI() {
    try {
        const user = getCurrentUser();
        const signupBtn = document.querySelector('.account-right .acc:first-child button');
        const loginBtn = document.querySelector('.account-right .acc:last-child button');
        
        if (isLoggedIn() && user) {
            // Update UI to show user is logged in
            if (signupBtn) {
                signupBtn.textContent = `Hi, ${user.name}`;
                signupBtn.style.cursor = 'default';
                signupBtn.parentElement.onclick = null;
            }
            if (loginBtn) {
                loginBtn.textContent = '🚪 Logout';
                loginBtn.style.cursor = 'pointer';
                // Remove any existing event listeners and add new one
                loginBtn.parentElement.onclick = null;
                loginBtn.parentElement.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    logout();
                });
            }
        } else {
            // Show default login/signup buttons
            if (signupBtn) {
                signupBtn.textContent = '📝 Sign up';
                signupBtn.style.cursor = 'pointer';
                signupBtn.parentElement.onclick = function() { window.location.href = 'account.html'; };
            }
            if (loginBtn) {
                loginBtn.textContent = '🔑 Log in';
                loginBtn.style.cursor = 'pointer';
                loginBtn.parentElement.onclick = function() { window.location.href = 'account.html'; };
            }
        }
    } catch (error) {
        console.error('Error updating header UI:', error);
        // Fallback: ensure buttons are at least clickable
        const loginBtn = document.querySelector('.account-right .acc:last-child button');
        if (loginBtn && loginBtn.textContent.includes('Logout')) {
            loginBtn.parentElement.onclick = function() { logout(); };
        }
    }
}

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
    updateHeaderUI();
});