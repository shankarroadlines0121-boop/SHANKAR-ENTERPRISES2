/**
 * app.js - Main Application Logic
 * Handles Routing, Auth, Products, and Admin
 */

const app = {
    currentCategory: 'All',
    searchQuery: '',

    init() {
        this.renderAuthButtons();
        this.showHome();
        this.updateCartCount();
    },

    // --- VIEW ROUTING ---
    showHome() {
        const products = SE_STORAGE.getData(SE_STORAGE.KEYS.PRODUCTS);
        const filtered = products.filter(p =>
            (this.currentCategory === 'All' || p.category === this.currentCategory) &&
            p.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );

        let html = `<div class="product-grid">`;
        filtered.forEach(p => {
            html += `
                <div class="product-card">
                    <img src="${p.image}" alt="${p.name}">
                    <h3>${p.name}</h3>
                    <div class="price">₹${p.price.toLocaleString()}</div>
                    <div class="unit">${p.unit}</div>
                    <button class="buy-now-btn" onclick="app.handleBuyNow('${p.id}')">BUY NOW</button>
                </div>
            `;
        });
        html += `</div>`;

        document.getElementById('view-container').innerHTML = html;
    },

    showLogin() {
        document.getElementById('view-container').innerHTML = `
            <div class="form-card">
                <h2>Login</h2>
                <form onsubmit="app.handleLogin(event)">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="login-email" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="login-pass" required>
                    </div>
                    <button type="submit" class="btn-primary">Login</button>
                </form>
                <p style="margin-top: 20px; text-align: center;">New customer? <a href="#" onclick="app.showSignup()">Create an account</a></p>
            </div>
        `;
    },

    showSignup() {
        document.getElementById('view-container').innerHTML = `
            <div class="form-card" style="max-width: 600px;">
                <h2>Create Account</h2>
                <form onsubmit="app.handleSignup(event)">
                    <div class="form-group"><label>Full Name</label><input type="text" id="reg-name" required></div>
                    <div class="form-group"><label>Email</label><input type="email" id="reg-email" required></div>
                    <div class="form-group"><label>Phone Number (10 digits)</label><input type="text" id="reg-phone" pattern="[0-9]{10}" required></div>
                    <div class="form-group"><label>Password</label><input type="password" id="reg-pass" required></div>
                    <hr style="margin: 20px 0;">
                    <h3>Delivery Address</h3>
                    <div class="form-group"><label>House/Plot No</label><input type="text" id="addr-house" required></div>
                    <div class="form-group"><label>Street/Road</label><input type="text" id="addr-street" required></div>
                    <div class="form-group"><label>Landmark (Mandatory)</label><input type="text" id="addr-landmark" required></div>
                    <div style="display: flex; gap: 10px;">
                        <div class="form-group" style="flex: 1;"><label>City</label><input type="text" id="addr-city" required></div>
                        <div class="form-group" style="flex: 1;"><label>District</label><input type="text" id="addr-district" required></div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <div class="form-group" style="flex: 1;"><label>State</label><input type="text" id="addr-state" required></div>
                        <div class="form-group" style="flex: 1;"><label>Pincode (6 digits)</label><input type="text" id="addr-pincode" pattern="[0-9]{6}" required></div>
                    </div>
                    <button type="submit" class="btn-primary">Register</button>
                </form>
            </div>
        `;
    },

    showAdminDashboard() {
        const user = SE_STORAGE.getActiveUser();
        if (!user || user.role !== 'admin') return this.showHome();

        const users = SE_STORAGE.getData(SE_STORAGE.KEYS.USERS);
        const orders = SE_STORAGE.getData(SE_STORAGE.KEYS.ORDERS);
        const products = SE_STORAGE.getData(SE_STORAGE.KEYS.PRODUCTS);
        const pending = orders.filter(o => o.status === 'Pending').length;

        let html = `
            <h2>Admin Dashboard</h2>
            <div class="stats-bar">
                <div class="stat-card"><h4>Total Users</h4><div class="value">${users.length}</div></div>
                <div class="stat-card"><h4>Total Products</h4><div class="value">${products.length}</div></div>
                <div class="stat-card"><h4>Total Orders</h4><div class="value">${orders.length}</div></div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 4px; box-shadow: var(--shadow); margin-bottom: 30px;">
                <h3>Add New Product</h3>
                <form onsubmit="app.handleProductAdd(event)" style="display: flex; gap: 15px; flex-wrap: wrap; align-items: flex-end; margin-top:15px;">
                    <div class="form-group" style="flex: 1; min-width: 200px;"><label>Name</label><input type="text" id="p-name" required></div>
                    <div class="form-group" style="width: 150px;">
                        <label>Category</label>
                        <select id="p-cat">
                            <option>Rod</option><option>Cement</option><option>Wood</option><option>Chips</option><option>Sand</option><option>Brick</option>
                        </select>
                    </div>
                    <div class="form-group" style="width: 120px;"><label>Price</label><input type="number" id="p-price" required></div>
                    <div class="form-group" style="width: 120px;"><label>Unit</label><input type="text" id="p-unit" placeholder="e.g. per bag" required></div>
                    <div class="form-group" style="flex: 1; min-width: 200px;"><label>Product Image</label><input type="file" id="p-image" accept="image/*"></div>
                    <button type="submit" class="btn-primary" style="width: auto; padding: 10px 30px; margin-bottom: 16px;">Add Product</button>
                </form>
            </div>

            <h3 style="margin-top: 40px;">Product Management</h3>
            <table style="margin-top: 15px;">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        products.forEach(p => {
            html += `
                <tr>
                    <td><img src="${p.image}" style="height: 50px; width: 50px; object-fit: contain; border: 1px solid #eee;"></td>
                    <td>${p.name}</td>
                    <td>${p.category}</td>
                    <td>₹${p.price.toLocaleString()} / ${p.unit}</td>
                    <td>
                        <button onclick="app.handleProductPriceUpdate('${p.id}')" 
                                style="background:#2874f0; color:white; border:none; padding:8px 15px; border-radius:3px; cursor:pointer; font-weight:600; margin-right:5px;">
                            Edit Price
                        </button>
                        <button onclick="app.handleProductDelete('${p.id}')" 
                                style="background:#ff4d4f; color:white; border:none; padding:8px 15px; border-radius:3px; cursor:pointer; font-weight:600;">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>

            <h3 style="margin-top: 40px;">Orders Management</h3>
            <table style="margin-top: 15px;">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Landmark (Address)</th>
                        <th>Product (Qty)</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        const sortedOrders = [...orders].reverse();
        sortedOrders.forEach(o => {
            html += `
                <tr>
                    <td>#${o.id}</td>
                    <td>${o.userName}</td>
                    <td>${o.phone}</td>
                    <td><strong style="color:red">${o.address.landmark}</strong>, ${o.address.city}</td>
                    <td>${o.productName} (x${o.quantity || 1})</td>
                    <td>₹${(o.totalPrice || 0).toLocaleString()}</td>
                    <td><span class="status-badge status-${o.status.toLowerCase().replace(/ /g, '-')}">${o.status}</span></td>
                    <td>
                        <select onchange="app.updateOrderStatus('${o.id}', this.value)">
                            <option value="">Update Status</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                        </select>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        document.getElementById('view-container').innerHTML = html;
    },

    showMyOrders() {
        const user = SE_STORAGE.getActiveUser();
        if (!user) return this.showLogin();

        const orders = SE_STORAGE.getData(SE_STORAGE.KEYS.ORDERS).filter(o => o.userEmail === user.email);

        let html = `<h2>My Orders</h2><div style="margin-top: 20px;">`;

        if (orders.length === 0) {
            html += `<p>No orders found.</p>`;
        } else {
            [...orders].reverse().forEach(o => {
                html += `
                    <div class="product-card" style="display: flex; gap: 20px; align-items: center; margin-bottom: 15px; width: 100%;">
                        <div style="flex-grow: 1;">
                            <h3>${o.productName} (x${o.quantity || 1})</h3>
                            <p class="unit">Ordered on: ${o.date}</p>
                            <p class="price">Total Paid: ₹${(o.totalPrice || 0).toLocaleString()}</p>
                            <p><strong>Status: ${o.status}</strong></p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 12px; color: grey;">Delivery to: ${o.address.landmark}, ${o.address.pincode}</p>
                        </div>
                    </div>
                `;
            });
        }
        html += `</div>`;
        document.getElementById('view-container').innerHTML = html;
    },

    // --- AUTH LOGIC ---
    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-pass').value;

        // Check Admin
        if (email === SE_STORAGE.ADMIN.email && pass === SE_STORAGE.ADMIN.password) {
            SE_STORAGE.setActiveUser(SE_STORAGE.ADMIN);
            this.renderAuthButtons();
            this.showAdminDashboard();
            return;
        }

        // Check User
        const users = SE_STORAGE.getData(SE_STORAGE.KEYS.USERS);
        const user = users.find(u => u.email === email && u.password === pass);

        if (user) {
            SE_STORAGE.setActiveUser({ ...user, role: 'user' });
            this.renderAuthButtons();
            this.showHome();
        } else {
            alert('Invalid credentials!');
        }
    },

    handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const password = document.getElementById('reg-pass').value;

        const address = {
            house: document.getElementById('addr-house').value,
            street: document.getElementById('addr-street').value,
            landmark: document.getElementById('addr-landmark').value,
            city: document.getElementById('addr-city').value,
            district: document.getElementById('addr-district').value,
            state: document.getElementById('addr-state').value,
            pincode: document.getElementById('addr-pincode').value
        };

        const users = SE_STORAGE.getData(SE_STORAGE.KEYS.USERS);
        if (users.some(u => u.email === email)) {
            alert('Email already exists!');
            return;
        }

        users.push({ name, email, phone, password, address });
        SE_STORAGE.saveData(SE_STORAGE.KEYS.USERS, users);
        alert('Registration successful! Please login.');
        this.showLogin();
    },

    renderAuthButtons() {
        const user = SE_STORAGE.getActiveUser();
        const container = document.getElementById('auth-buttons');
        if (user) {
            container.innerHTML = `
                <span class="user-name" onclick="${user.role === 'admin' ? 'app.showAdminDashboard()' : 'app.showMyOrders()'}">
                    ${user.name} <i class="fas fa-caret-down"></i>
                </span>
                <button onclick="SE_STORAGE.logout()" style="padding: 5px 20px; margin-left:15px;">Logout</button>
            `;
        } else {
            container.innerHTML = `<button onclick="app.showLogin()">Login</button>`;
        }
    },

    // --- PRODUCT LOGIC ---
    filterCategory(cat) {
        this.currentCategory = cat;
        this.showHome();
    },

    handleSearch(val) {
        this.searchQuery = val;
        this.showHome();
    },

    handleBuyNow(prodId) {
        const user = SE_STORAGE.getActiveUser();
        if (!user) {
            alert('Please login to place an order.');
            this.showLogin();
            return;
        }

        const product = SE_STORAGE.getData(SE_STORAGE.KEYS.PRODUCTS).find(p => String(p.id) === String(prodId));
        const address = user.address || { landmark: 'NA', city: 'NA', pincode: '000000' };

        document.getElementById('order-modal').style.display = 'block';
        document.getElementById('modal-body').innerHTML = `
            <h2>Confirm Order</h2>
            <div style="margin: 20px 0; border: 1px solid #eee; padding: 15px; border-radius: 4px;">
                <p><strong>Product:</strong> ${product.name}</p>
                <p><strong>Price per unit:</strong> ₹${product.price} (${product.unit})</p>
                <div class="form-group" style="margin-top: 15px;">
                    <label>Quantity</label>
                    <input type="number" id="order-qty" value="1" min="1" oninput="app.updateModalTotal(${product.price})">
                </div>
                <p style="font-size: 18px; font-weight: 700; color: var(--primary); margin-top: 10px;">
                    Total: ₹<span id="modal-total-price">${product.price}</span>
                </p>
            </div>
            <h3>Delivery Address</h3>
            <p style="color: grey; margin-bottom: 10px;">You can modify the address for this order below:</p>
            <div class="form-group"><label>Landmark</label><input type="text" id="order-landmark" value="${address.landmark}"></div>
            <div class="form-group"><label>City</label><input type="text" id="order-city" value="${address.city}"></div>
            <div class="form-group"><label>Pincode</label><input type="text" id="order-pincode" value="${address.pincode}"></div>
            <button class="buy-now-btn" onclick="app.placeOrder('${product.id}')">PLACE ORDER</button>
        `;
    },

    updateModalTotal(unitPrice) {
        const qty = parseInt(document.getElementById('order-qty').value) || 1;
        document.getElementById('modal-total-price').innerText = (qty * unitPrice).toLocaleString();
    },

    placeOrder(prodId) {
        const user = SE_STORAGE.getActiveUser();
        const product = SE_STORAGE.getData(SE_STORAGE.KEYS.PRODUCTS).find(p => String(p.id) === String(prodId));

        const orderAddress = {
            landmark: document.getElementById('order-landmark').value,
            city: document.getElementById('order-city').value,
            pincode: document.getElementById('order-pincode').value
        };

        const qty = parseInt(document.getElementById('order-qty').value) || 1;
        const orders = SE_STORAGE.getData(SE_STORAGE.KEYS.ORDERS);
        const newOrder = {
            id: Math.floor(100000 + Math.random() * 900000),
            date: new Date().toLocaleString(),
            productId: product.id,
            productName: product.name,
            quantity: qty,
            totalPrice: product.price * qty,
            userEmail: user.email,
            userName: user.name,
            phone: user.phone || 'NA',
            address: orderAddress,
            status: 'Pending'
        };

        orders.push(newOrder);
        SE_STORAGE.saveData(SE_STORAGE.KEYS.ORDERS, orders);

        alert('Order placed successfully!');
        this.closeModal();
        this.showMyOrders();
    },

    // --- ADMIN LOGIC ---
    handleProductAdd(e) {
        e.preventDefault();
        const fileInput = document.getElementById('p-image');
        const file = fileInput.files[0];
        const category = document.getElementById('p-cat').value;

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.saveProduct(event.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            const placeholder = `https://placehold.co/200x200?text=${category}`;
            this.saveProduct(placeholder);
        }
    },

    saveProduct(imgData) {
        const products = SE_STORAGE.getData(SE_STORAGE.KEYS.PRODUCTS);
        const newP = {
            id: Date.now(),
            name: document.getElementById('p-name').value,
            category: document.getElementById('p-cat').value,
            price: parseInt(document.getElementById('p-price').value),
            unit: document.getElementById('p-unit').value,
            image: imgData
        };
        products.push(newP);
        SE_STORAGE.saveData(SE_STORAGE.KEYS.PRODUCTS, products);
        alert('Product added with image!');
        this.showAdminDashboard();
    },

    updateOrderStatus(orderId, newStatus) {
        if (!newStatus) return;
        const orders = SE_STORAGE.getData(SE_STORAGE.KEYS.ORDERS);
        const order = orders.find(o => String(o.id) === String(orderId));
        if (order) {
            order.status = newStatus;
            SE_STORAGE.saveData(SE_STORAGE.KEYS.ORDERS, orders);
            alert('Status updated!');
            app.showAdminDashboard();
        }
    },

    handleProductDelete(prodId) {
        const products = SE_STORAGE.getData(SE_STORAGE.KEYS.PRODUCTS);
        const product = products.find(p => String(p.id) === String(prodId));

        if (!product) return;

        document.getElementById('order-modal').style.display = 'block';
        document.getElementById('modal-body').innerHTML = `
            <h2>Confirm Delete</h2>
            <p style="margin: 20px 0;">Are you sure you want to delete <strong>${product.name}</strong>?</p>
            <div style="display: flex; gap: 10px;">
                <button class="btn-primary" style="background:#ff4d4f; flex: 1;" onclick="app.executeProductDelete('${prodId}')">YES, DELETE</button>
                <button class="btn-primary" style="background:#8c8c8c; flex: 1;" onclick="app.closeModal()">CANCEL</button>
            </div>
        `;
    },

    executeProductDelete(prodId) {
        let products = SE_STORAGE.getData(SE_STORAGE.KEYS.PRODUCTS);
        const initialCount = products.length;
        products = products.filter(p => String(p.id) !== String(prodId));

        if (products.length === initialCount) {
            alert('Error: Product cannot be deleted.');
            return;
        }

        SE_STORAGE.saveData(SE_STORAGE.KEYS.PRODUCTS, products);
        this.closeModal();
        app.showAdminDashboard();
    },

    handleProductPriceUpdate(prodId) {
        const products = SE_STORAGE.getData(SE_STORAGE.KEYS.PRODUCTS);
        const product = products.find(p => String(p.id) === String(prodId));

        if (!product) {
            console.error("Price update failed: ID not found", prodId);
            alert('Product not found!');
            return;
        }

        document.getElementById('order-modal').style.display = 'block';
        document.getElementById('modal-body').innerHTML = `
            <h2>Update Price</h2>
            <div style="margin: 20px 0;">
                <p>Editing price for: <strong>${product.name}</strong></p>
                <div class="form-group" style="margin-top: 15px;">
                    <label>New Price (₹)</label>
                    <input type="number" id="new-p-price" value="${product.price}">
                </div>
            </div>
            <button class="buy-now-btn" onclick="app.saveProductPrice('${prodId}')">UPDATE PRICE</button>
        `;
    },

    saveProductPrice(prodId) {
        const newPrice = document.getElementById('new-p-price').value;
        if (newPrice !== "" && !isNaN(newPrice)) {
            const products = SE_STORAGE.getData(SE_STORAGE.KEYS.PRODUCTS);
            const product = products.find(p => String(p.id) === String(prodId));
            if (product) {
                product.price = parseInt(newPrice);
                SE_STORAGE.saveData(SE_STORAGE.KEYS.PRODUCTS, products);
                this.closeModal();
                app.showAdminDashboard();
            }
        } else {
            alert('Please enter a valid price.');
        }
    },

    // --- UTILS ---
    closeModal() {
        document.getElementById('order-modal').style.display = 'none';
    },

    updateCartCount() {
        // Mock
    },

    showCart() {
        alert('Cart feature coming soon! Use Buy Now for immediate purchase.');
    }
};

app.init();
