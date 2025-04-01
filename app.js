// DOM Elements
const registrationScreen = document.getElementById('registration-screen');
const loginScreen = document.getElementById('login-screen');
const trackerScreen = document.getElementById('tracker-screen');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const showLoginLink = document.getElementById('show-login');
const showRegisterLink = document.getElementById('show-register');
const userNameSpan = document.getElementById('user-name');
const currentDateSpan = document.getElementById('current-date');
const trackingStatusSpan = document.getElementById('tracking-status');
const trackTodayBtn = document.getElementById('track-today');
const trackingHistoryList = document.getElementById('tracking-history');
const logoutBtn = document.getElementById('logout-btn');

// Helper functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function getDayKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function showScreen(screen) {
    registrationScreen.classList.add('hidden');
    loginScreen.classList.add('hidden');
    trackerScreen.classList.add('hidden');
    screen.classList.remove('hidden');
}

// App initialization
function initApp() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // User is logged in
        userNameSpan.textContent = currentUser.username;
        loadTrackerData();
        showScreen(trackerScreen);
    } else {
        // No user logged in
        showScreen(registrationScreen);
    }

    // Display current date
    currentDateSpan.textContent = formatDate(new Date());
}

// Login and Registration
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Check if username already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.username === username)) {
        alert('Username already exists');
        return;
    }
    
    // Add new user
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    const currentUser = { username };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Initialize tracking data for the user
    const trackingData = JSON.parse(localStorage.getItem('trackingData')) || {};
    trackingData[username] = { days: {} };
    localStorage.setItem('trackingData', JSON.stringify(trackingData));
    
    userNameSpan.textContent = username;
    loadTrackerData();
    showScreen(trackerScreen);
});

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Verify login
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username && user.password === password);
    
    if (user) {
        const currentUser = { username };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        userNameSpan.textContent = username;
        loadTrackerData();
        showScreen(trackerScreen);
    } else {
        alert('Invalid username or password');
    }
});

// Logout
logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    showScreen(loginScreen);
});

// Screen Navigation
showLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    showScreen(loginScreen);
});

showRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    showScreen(registrationScreen);
});

// Tracking Functionality
function loadTrackerData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const trackingData = JSON.parse(localStorage.getItem('trackingData')) || {};
    const userData = trackingData[currentUser.username] || { days: {} };
    
    // Check if today is tracked
    const today = new Date();
    const todayKey = getDayKey(today);
    
    if (userData.days[todayKey]) {
        trackingStatusSpan.textContent = 'Tracked';
        trackingStatusSpan.className = 'tracked';
        trackTodayBtn.disabled = true;
        trackTodayBtn.classList.add('disabled');
        trackTodayBtn.textContent = 'Already Logged';
    } else {
        trackingStatusSpan.textContent = 'Not Tracked';
        trackingStatusSpan.className = 'not-tracked';
        trackTodayBtn.disabled = false;
        trackTodayBtn.classList.remove('disabled');
        trackTodayBtn.textContent = "Log Today's Activity";
    }
    
    // Show tracking history
    displayTrackingHistory(userData.days);
}

function displayTrackingHistory(days) {
    trackingHistoryList.innerHTML = '';
    
    // Get the last 7 days
    const daysToShow = 7;
    const today = new Date();
    
    for (let i = 0; i < daysToShow; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayKey = getDayKey(date);
        
        const tracked = days[dayKey] || false;
        
        const li = document.createElement('li');
        li.className = tracked ? 'tracked-day' : 'missed-day';
        li.textContent = `${formatDate(date)}: ${tracked ? 'Tracked' : 'Not tracked'}`;
        
        trackingHistoryList.appendChild(li);
    }
}

trackTodayBtn.addEventListener('click', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const trackingData = JSON.parse(localStorage.getItem('trackingData')) || {};
    const userData = trackingData[currentUser.username] || { days: {} };
    
    const today = new Date();
    const todayKey = getDayKey(today);
    
    userData.days[todayKey] = true;
    trackingData[currentUser.username] = userData;
    
    localStorage.setItem('trackingData', JSON.stringify(trackingData));
    
    // Update UI
    loadTrackerData();
});

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);