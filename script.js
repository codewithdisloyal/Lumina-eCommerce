/**
 * Lumina E-commerce Logic
 * Handles product rendering, cart management, and checkout flow.
 */

// --- Mock Data ---
const products = [
    {
        id: 1,
        name: "Lumina X1 Headphones",
        price: 299.00,
        category: "audio",
        rating: 5,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D",
        description: "Experience pure sound with the Lumina X1. Featuring industry-leading noise cancellation and 40-hour battery life."
    },
    {
        id: 2,
        name: "Echo Smart Speaker",
        price: 129.00,
        category: "home",
        rating: 4,
        image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjBzcGVha2VyfGVufDB8fDB8fHww",
        description: "The center of your smart home. Voice control your lights, music, and more with crystal clear audio."
    },
    {
        id: 3,
        name: "Zenith Watch Pro",
        price: 349.00,
        category: "wearables",
        rating: 5,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNtYXJ0JTIwd2F0Y2h8ZW58MHx8MHx8fDA%3D",
        description: "Track your health, fitness, and sleep with the Zenith Watch Pro. Elegant design meets advanced biometrics."
    },
    {
        id: 4,
        name: "Vision 4K Monitor",
        price: 599.00,
        category: "home",
        rating: 5,
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9uaXRvcnxlbnwwfHwwfHx8MA%3D%3D",
        description: "Stunning color accuracy and ultra-sharp 4K resolution. Perfect for creators and professionals."
    },
    {
        id: 5,
        name: "Sonic Earbuds",
        price: 149.00,
        category: "audio",
        rating: 4,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWFyYnVkc3xlbnwwfHwwfHx8MA%3D%3D",
        description: "True wireless freedom. Water-resistant, deep bass, and all-day comfort."
    },
    {
        id: 6,
        name: "Lumina Pad Air",
        price: 499.00,
        category: "wearables",
        rating: 5,
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dGFibGV0fGVufDB8fDB8fHww",
        description: "Power in your hands. The thinnest, lightest tablet we've ever made."
    },
    {
        id: 7,
        name: "Smart Bulb Kit",
        price: 89.00,
        category: "home",
        rating: 4,
        image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjBidWxifGVufDB8fDB8fHww",
        description: "Set the mood with millions of colors. App-controlled LED lighting for every room."
    },
    {
        id: 8,
        name: "Pulse Fitness Band",
        price: 79.00,
        category: "wearables",
        rating: 3,
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zml0bmVzcyUyMHRyYWNrZXJ8ZW58MHx8MHx8fDA%3D",
        description: "Simple, effective fitness tracking. Steps, heart rate, and sleep monitoring."
    }
];

// --- State Management ---
let cart = JSON.parse(localStorage.getItem('lumina_cart')) || [];
let currentCategory = 'all';
let maxPrice = 1000;
let searchQuery = '';

// --- DOM Elements ---
const productGrid = document.getElementById('product-grid');
const cartCount = document.getElementById('cart-count');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartTotalEl = document.getElementById('cart-total');
const productModal = document.getElementById('product-modal');
const checkoutModal = document.getElementById('checkout-modal');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
    setupEventListeners();
});

// --- Event Listeners ---
function setupEventListeners() {
    // Filter Pills
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update active state
            document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Update state and render
            currentCategory = e.target.dataset.category;
            renderProducts();
        });
    });

    // Price Range
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    priceRange.addEventListener('input', (e) => {
        maxPrice = parseInt(e.target.value);
        priceValue.textContent = maxPrice;
        renderProducts();
    });

    // Search
    const searchInput = document.getElementById('product-search');
    document.getElementById('product-search').addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderProducts();
    });

    // Search Toggle (Header)
    document.getElementById('search-toggle').addEventListener('click', () => {
        // Scroll to products
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
        // Focus search input after a small delay to allow scroll
        setTimeout(() => {
            searchInput.focus();
            // Highlight the search bar
            searchInput.parentElement.style.borderColor = 'var(--accent-primary)';
            setTimeout(() => {
                searchInput.parentElement.style.borderColor = '';
            }, 2000);
        }, 500);
    });

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    // Check saved theme
    if (localStorage.getItem('lumina_theme') === 'dark') {
        document.body.classList.add('dark-mode');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');

        if (isDark) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
            localStorage.setItem('lumina_theme', 'dark');
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
            localStorage.setItem('lumina_theme', 'light');
        }
    });

    // Cart Toggles
    document.getElementById('cart-toggle').addEventListener('click', toggleCart);
    document.getElementById('close-cart').addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', () => {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('active');
    });

    // Modal Close Buttons
    document.querySelectorAll('.close-modal-btn, #close-checkout').forEach(btn => {
        btn.addEventListener('click', () => {
            productModal.classList.remove('active');
            checkoutModal.classList.remove('active');
            cartOverlay.classList.remove('active');
        });
    });

    // Product Modal Quantity
    const modalQty = document.getElementById('modal-qty');
    document.getElementById('modal-qty-minus').addEventListener('click', () => {
        if (modalQty.value > 1) modalQty.value--;
    });
    document.getElementById('modal-qty-plus').addEventListener('click', () => {
        modalQty.value++;
    });

    // Add to Cart from Modal
    document.getElementById('modal-add-to-cart').addEventListener('click', () => {
        const productId = parseInt(document.getElementById('modal-add-to-cart').dataset.id);
        const qty = parseInt(modalQty.value);
        addToCart(productId, qty);
        productModal.classList.remove('active');
        cartOverlay.classList.remove('active'); // Close overlay if open
        toggleCart(); // Open cart to show item
    });

    // Checkout Button
    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) return;
        toggleCart(); // Close cart
        openCheckout();
    });

    // Checkout Form
    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Order placed successfully! Thank you for shopping with Lumina.');
        cart = [];
        saveCart();
        updateCartUI();
        checkoutModal.classList.remove('active');
        cartOverlay.classList.remove('active');
    });
}

// --- Rendering ---
function renderProducts() {
    productGrid.innerHTML = '';

    const filtered = products.filter(p => {
        const matchCategory = currentCategory === 'all' || p.category === currentCategory;
        const matchPrice = p.price <= maxPrice;
        const matchSearch = p.name.toLowerCase().includes(searchQuery);
        return matchCategory && matchPrice && matchSearch;
    });

    if (filtered.length === 0) {
        productGrid.innerHTML = '<p class="no-results">No products found.</p>';
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        // Mock badge logic for demo
        const isNew = product.id % 3 === 0;
        const badgeHtml = isNew ? '<div class="badge-new">New</div>' : '';

        card.innerHTML = `
            ${badgeHtml}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    ${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}
                    <span class="rating-count">(${Math.floor(Math.random() * 50) + 10})</span>
                </div>
                <div class="product-footer">
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="add-btn" onclick="addToCart(${product.id}); event.stopPropagation();" aria-label="Add to Cart">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        // Make whole card clickable to open modal
        card.addEventListener('click', (e) => {
            // Prevent if clicked directly on add button (handled by onclick above)
            if (!e.target.closest('.add-btn')) {
                openProductModal(product.id);
            }
        });
        productGrid.appendChild(card);
    });
}

// --- Cart Logic ---
function addToCart(productId, qty = 1) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ ...product, qty });
    }

    saveCart();
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQty(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function saveCart() {
    localStorage.setItem('lumina_cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update Badge
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCount.textContent = totalQty;

    // Update Cart Items
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty. Start shopping!</div>';
    } else {
        cart.forEach(item => {
            subtotal += item.price * item.qty;
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <img src="${item.image}" class="cart-item-img" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-controls">
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(el);
        });
    }

    cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    cartTotalEl.textContent = `$${subtotal.toFixed(2)}`;
}

function toggleCart() {
    cartDrawer.classList.toggle('open');
    cartOverlay.classList.toggle('active');
}

// --- Modal Logic ---
window.openProductModal = function (id, event) {
    if (event) event.stopPropagation(); // Stop bubbling if triggered from button

    const product = products.find(p => p.id === id);
    if (!product) return;

    // Populate Modal
    const imgContainer = document.getElementById('modal-image-container');
    imgContainer.innerHTML = `<img src="${product.image}" alt="${product.name}">`;

    // Zoom Logic
    const img = imgContainer.querySelector('img');

    imgContainer.onmousemove = function (e) {
        const rect = imgContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentage position
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        img.style.transform = 'scale(2)';
    };

    imgContainer.onmouseleave = function () {
        img.style.transform = 'scale(1)';
        setTimeout(() => {
            img.style.transformOrigin = 'center center';
        }, 100); // Delay reset of origin for smooth transition out
    };

    document.getElementById('modal-category').textContent = product.category;
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modal-rating').textContent = '★'.repeat(product.rating) + '☆'.repeat(5 - product.rating);
    document.getElementById('modal-description').textContent = product.description;

    // Reset Qty
    document.getElementById('modal-qty').value = 1;
    document.getElementById('modal-add-to-cart').dataset.id = product.id;

    productModal.classList.add('active');
    cartOverlay.classList.add('active');
};

// --- Checkout Logic ---
function openCheckout() {
    checkoutModal.classList.add('active');
    cartOverlay.classList.add('active');

    // Reset steps
    showStep(1);

    // Populate Summary
    const summaryList = document.getElementById('checkout-summary');
    summaryList.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.qty;
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.marginBottom = '10px';
        row.innerHTML = `
            <span>${item.qty}x ${item.name}</span>
            <span>$${(item.price * item.qty).toFixed(2)}</span>
        `;
        summaryList.appendChild(row);
    });

    document.getElementById('checkout-final-total').textContent = `$${total.toFixed(2)}`;
}

window.nextStep = function (step) {
    // Basic validation
    const currentStepEl = document.querySelector('.form-step.active');
    const inputs = currentStepEl.querySelectorAll('input[required]');
    let valid = true;
    inputs.forEach(input => {
        if (!input.value) {
            valid = false;
            input.style.borderColor = 'red';
        } else {
            input.style.borderColor = '#d2d2d7';
        }
    });

    if (valid) {
        showStep(step);
    }
};

window.prevStep = function (step) {
    showStep(step);
};

function showStep(step) {
    // Update Header
    document.querySelectorAll('.step').forEach(el => {
        el.classList.remove('active');
        if (parseInt(el.dataset.step) === step) el.classList.add('active');
    });

    // Update Form
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
}

// --- Auth Logic ---
const authModal = document.getElementById('auth-modal');
const authBtn = document.getElementById('auth-btn');
const closeAuthBtn = document.getElementById('close-auth');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');

// Open/Close Modal
if (authBtn) {
    authBtn.addEventListener('click', () => {
        if (localStorage.getItem('token')) {
            // Logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            updateAuthUI();
        } else {
            // Open Login
            authModal.classList.add('active');
            cartOverlay.classList.add('active');
        }
    });
}

if (closeAuthBtn) {
    closeAuthBtn.addEventListener('click', () => {
        authModal.classList.remove('active');
        cartOverlay.classList.remove('active');
    });
}

// Switch Tabs
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Update Tabs
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update Forms
        const target = tab.dataset.tab;
        authForms.forEach(f => f.classList.remove('active'));
        if (target === 'login') {
            loginForm.classList.add('active');
        } else {
            signupForm.classList.add('active');
        }
    });
});

// Login Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Login successful!');
            authModal.classList.remove('active');
            cartOverlay.classList.remove('active');
            updateAuthUI();
            // Redirect admins to admin page
            if (data.user && data.user.role === 'admin') {
                window.location.href = '/admin';
            }
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Server error. Please ensure backend is running.');
    }
});

// Signup Handler
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const adminCode = document.getElementById('signup-admin-code') ? document.getElementById('signup-admin-code').value : '';

    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, adminCode })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Registration successful!');
            authModal.classList.remove('active');
            cartOverlay.classList.remove('active');
            updateAuthUI();
            // Redirect admins to admin page
            if (data.user && data.user.role === 'admin') {
                window.location.href = '/admin';
            }
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (err) {
        console.error(err);
        alert('Server error. Please ensure backend is running.');
    }
});

function updateAuthUI() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        authBtn.textContent = `Logout (${user.name})`;
        authBtn.classList.replace('btn-primary', 'btn-secondary');
    } else {
        authBtn.textContent = 'Login';
        authBtn.classList.replace('btn-secondary', 'btn-primary');
    }
}

// Check auth on load
document.addEventListener('DOMContentLoaded', updateAuthUI);
