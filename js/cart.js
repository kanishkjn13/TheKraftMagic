// Cart page specific functionality
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartDiv = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartItemsContainer) return; // Not on cart page
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        emptyCartDiv.style.display = 'block';
        cartSummary.style.display = 'none';
        cartItemsContainer.innerHTML = '';
        return;
    }
    
    emptyCartDiv.style.display = 'none';
    cartSummary.style.display = 'block';
    
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-size">Size: ${item.size}</div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity(${index}, -1)">-</button>
                    <span>Qty: ${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div class="item-price">₹${itemTotal}</div>
            <button class="remove-btn" onclick="removeCartItem(${index})">Remove</button>
        `;
        cartItemsContainer.appendChild(cartItemDiv);
    });
    
    // Calculate totals
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const grandTotal = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('shipping').textContent = `₹${shipping}`;
    document.getElementById('tax').textContent = `₹${tax}`;
    document.getElementById('grand-total').textContent = `₹${grandTotal}`;
    
    // Store totals for checkout
    localStorage.setItem('orderTotals', JSON.stringify({
        subtotal,
        shipping,
        tax,
        grandTotal
    }));
}

function updateCartQuantity(index, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
        updateHeaderCartCount();
    }
}

function removeCartItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateHeaderCartCount();
}

function updateHeaderCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('header-cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

function proceedToAddress() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    window.location.href = 'address.html';
}

// Initialize cart display when page loads
document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
    updateHeaderCartCount();
});
