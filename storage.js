/**
 * storage.js - The Data Engine for Shankar Enterprises
 * Handles localStorage for Users, Products, and Orders.
 */

const SE_KEYS = {
    USERS: 'SE_USERS',
    PRODUCTS: 'SE_PRODUCTS',
    ORDERS: 'SE_ORDERS',
    ACTIVE_USER: 'SE_SESSION' // Used in sessionStorage
};

// Hardcoded Admin Account
const ADMIN_CREDENTIALS = {
    email: 'sutradharbishnu61@gmail.com',
    password: '226302012',
    name: 'Master Admin',
    role: 'admin'
};

/**
 * Initialize data if it doesn't exist
 */
function initData() {
    // Initialize Users
    if (!localStorage.getItem(SE_KEYS.USERS)) {
        localStorage.setItem(SE_KEYS.USERS, JSON.stringify([]));
    }

    // Initialize Products
    if (!localStorage.getItem(SE_KEYS.PRODUCTS)) {
        const dummyProducts = [
            { id: 1, name: 'TMT Rod', category: 'Rod', price: 65000, unit: 'per ton', image: 'https://placehold.co/200x200?text=Rod' },
            { id: 2, name: 'OPC Cement', category: 'Cement', price: 450, unit: 'per bag', image: 'https://placehold.co/200x200?text=Cement' },
            { id: 3, name: 'Teak Wood', category: 'Wood', price: 2500, unit: 'per cu.ft', image: 'https://placehold.co/200x200?text=Wood' },
            { id: 4, name: 'Stone Chips', category: 'Chips', price: 1200, unit: 'per ton', image: 'https://placehold.co/200x200?text=Chips' },
            { id: 5, name: 'River Sand', category: 'Sand', price: 800, unit: 'per ton', image: 'https://placehold.co/200x200?text=Sand' },
            { id: 6, name: 'Red Bricks', category: 'Brick', price: 12, unit: 'per piece', image: 'https://placehold.co/200x200?text=Brick' }
        ];
        localStorage.setItem(SE_KEYS.PRODUCTS, JSON.stringify(dummyProducts));
    }

    // Initialize Orders
    if (!localStorage.getItem(SE_KEYS.ORDERS)) {
        localStorage.setItem(SE_KEYS.ORDERS, JSON.stringify([]));
    }
}

/**
 * Session Management
 */
function getActiveUser() {
    const session = sessionStorage.getItem(SE_KEYS.ACTIVE_USER);
    return session ? JSON.parse(session) : null;
}

function setActiveUser(user) {
    sessionStorage.setItem(SE_KEYS.ACTIVE_USER, JSON.stringify(user));
}

function logout() {
    sessionStorage.removeItem(SE_KEYS.ACTIVE_USER);
    window.location.reload();
}

/**
 * Data Helpers
 */
function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Export for use in app.js (using global scope for simplicity in vanilla JS)
window.SE_STORAGE = {
    KEYS: SE_KEYS,
    ADMIN: ADMIN_CREDENTIALS,
    initData,
    getActiveUser,
    setActiveUser,
    logout,
    getData,
    saveData
};

// Auto-init
initData();
