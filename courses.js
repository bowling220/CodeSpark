// Add this function at the start of your courses.js file
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Add this check at the start of the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a mobile device
    function isMobileDevice() {
        return (window.innerWidth <= 768);
    }

    // Show/hide mobile restriction
    function handleMobileRestriction() {
        const mobileRestriction = document.querySelector('.mobile-restriction');
        const contentWrapper = document.querySelector('.content-wrapper');
        
        if (isMobileDevice()) {
            mobileRestriction.style.display = 'flex';
            contentWrapper.style.display = 'none';
        } else {
            mobileRestriction.style.display = 'none';
            contentWrapper.style.display = 'block';
        }
    }

    // Handle window resize
    window.addEventListener('resize', handleMobileRestriction);
    handleMobileRestriction();

    // Add initialization check
    let initializationAttempts = 0;
    const maxAttempts = 10;

    function checkFirebaseInitialization() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return;
    }

        if (window.firebaseAuth && window.firebaseDb) {
            initializeApp();
        } else if (initializationAttempts < maxAttempts) {
            initializationAttempts++;
            setTimeout(checkFirebaseInitialization, 100);
        } else {
            console.error('Failed to initialize Firebase after multiple attempts');
            showError('Failed to initialize application. Please refresh the page.');
        }
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        // Remove the error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    function initializeApp() {
        // Set up authentication state observer
        window.firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                handleAuthenticatedUser(user);
                setupEventListeners();
            } else {
                handleUnauthenticatedUser();
            }
        });
    }

    function handleAuthenticatedUser(user) {
        try {
            // Hide auth container and show course content
        const authContainer = document.getElementById('authContainer');
        const courseContent = document.getElementById('courseContent');
            
            if (authContainer) authContainer.style.display = 'none';
            if (courseContent) courseContent.style.display = 'block';

            // Update navigation elements
            const profileContainer = document.getElementById('profileContainer');
            const loginBtn = document.getElementById('loginBtn');
            const signupBtn = document.getElementById('signupBtn');
            const profileBtn = document.getElementById('profileBtn');
            const userDisplayName = profileBtn ? profileBtn.querySelector('span') : null;

            // Only update elements if they exist
            if (profileContainer) profileContainer.style.display = 'block';
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            
            // Update display name if the element exists
            if (userDisplayName) {
                userDisplayName.textContent = user.displayName || 'Profile';
            }

            // Set up event listeners after updating the UI
            setupEventListeners();

            // Load user's course progress
            loadUserProgress(user);

            console.log('User authenticated successfully:', user.email);
        } catch (error) {
            console.error('Error in handleAuthenticatedUser:', error);
            showError('Error updating UI after authentication');
        }
    }

    function handleUnauthenticatedUser() {
        // Show auth container and hide course content
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('courseContent').style.display = 'none';

        // Show login/signup buttons and hide profile
        const profileContainer = document.getElementById('profileContainer');
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');

        profileContainer.style.display = 'none';
        loginBtn.style.display = 'inline-block';
        signupBtn.style.display = 'inline-block';
    }

    function loadUserProgress(user) {
        if (user) {
            // Get progress from Firebase
            firebase.firestore().collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        // Clear any local storage to prevent stale data
                        localStorage.removeItem('htmlCourseProgress');
                        localStorage.removeItem('cssCourseProgress');

                        // Load HTML progress from Firebase
                        const htmlProgress = doc.data().htmlProgress;
                        if (htmlProgress) {
                            updateCourseCard('HTML Fundamentals', htmlProgress.completedModules.length, 6);
                            // Store the latest progress in localStorage as backup
                            localStorage.setItem('htmlCourseProgress', JSON.stringify(htmlProgress));
                        } else {
                            updateCourseCard('HTML Fundamentals', 0, 6);
                        }

                        // Load CSS progress from Firebase
                        const cssProgress = doc.data().cssProgress;
                        if (cssProgress) {
                            updateCourseCard('CSS Mastery', cssProgress.completedModules.length, 6);
                            // Store the latest progress in localStorage as backup
                            localStorage.setItem('cssCourseProgress', JSON.stringify(cssProgress));
                        } else {
                            updateCourseCard('CSS Mastery', 0, 6);
                        }

                        // Update JavaScript course to show Coming Soon
                        updateComingSoonCourse('JavaScript Essentials');
                    } else {
                        // For new users, initialize with 0 progress
                        clearAllProgress();
                        updateCourseCard('HTML Fundamentals', 0, 6);
                        updateCourseCard('CSS Mastery', 0, 6);
                        updateComingSoonCourse('JavaScript Essentials');
                    }
                })
                .catch(error => {
                    console.error('Error loading progress:', error);
                    // On error, try to load from localStorage as fallback
                    loadProgressFromLocalStorage();
                });
        } else {
            // Not logged in, use localStorage only
            loadProgressFromLocalStorage();
        }
    }

    function loadProgressFromLocalStorage() {
        // Load HTML progress from localStorage
        const savedHtmlProgress = localStorage.getItem('htmlCourseProgress');
        if (savedHtmlProgress) {
            const progressData = JSON.parse(savedHtmlProgress);
            updateCourseCard('HTML Fundamentals', progressData.completedModules.length, 6);
        } else {
            updateCourseCard('HTML Fundamentals', 0, 6);
        }

        // Load CSS progress from localStorage
        const savedCssProgress = localStorage.getItem('cssCourseProgress');
        if (savedCssProgress) {
            const progressData = JSON.parse(savedCssProgress);
            updateCourseCard('CSS Mastery', progressData.completedModules.length, 6);
        } else {
            updateCourseCard('CSS Mastery', 0, 6);
        }
    }

    function updateCourseCard(courseName, completedModules, totalModules) {
        const courseCards = document.querySelectorAll('.course-card');
        courseCards.forEach(card => {
            const cardTitle = card.querySelector('h3');
            if (cardTitle && cardTitle.textContent === courseName) {
                const progressPercentage = Math.round((completedModules / totalModules) * 100);
                
                // Remove existing progress bar if it exists
                const existingProgressBar = card.querySelector('.progress-bar');
                if (existingProgressBar) {
                    existingProgressBar.remove();
                }
                
                // Add new progress bar
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.innerHTML = `
                    <div class="progress" style="width: ${progressPercentage}%"></div>
                    <div class="progress-info">
                        <span>${progressPercentage}% Complete</span>
                        <span>${completedModules}/${totalModules} Modules</span>
                    </div>
                `;

                // Insert progress bar before the button/link
                const actionButton = card.querySelector('button') || card.querySelector('a');
                if (actionButton) {
                    card.insertBefore(progressBar, actionButton);
                }

                // Update button text based on progress
                if (actionButton) {
                    if (completedModules === 0) {
                        actionButton.textContent = 'Start Learning';
                        actionButton.className = 'start-course-btn';
                    } else if (completedModules === totalModules) {
                        actionButton.textContent = 'Review Course';
                        actionButton.className = 'review-course-btn';
                    } else {
                        actionButton.textContent = 'Continue Learning';
                        actionButton.className = 'continue-course-btn';
                    }
                }
            }
        });
    }

    function setupEventListeners() {
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');

        if (profileBtn && profileDropdown) {
            // Toggle dropdown on button click
            profileBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle show class
                if (profileDropdown.classList.contains('show')) {
                    profileDropdown.classList.remove('show');
            } else {
                    profileDropdown.classList.add('show');
                }
                
                console.log('Profile button clicked, dropdown toggled');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                    profileDropdown.classList.remove('show');
                }
            });

            // Handle dropdown item clicks
            const dropdownItems = profileDropdown.querySelectorAll('.dropdown-item');
            dropdownItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (this.id === 'logoutBtn') {
                        window.firebaseAuth.signOut().then(() => {
                            window.location.href = 'index.html';
                        });
                    } else {
                        window.location.href = this.getAttribute('href');
                    }
                    
                    profileDropdown.classList.remove('show');
                });
            });
        }
    }

    // Update the authentication functions in courses.js
    window.showLoginForm = async function() {
        try {
            // First check if Firebase Auth is initialized
            if (!window.firebaseAuth) {
                showError('Authentication system is not ready. Please try again in a moment.');
                return;
            }

            // Create login form elements
            const loginForm = document.createElement('div');
            loginForm.className = 'auth-form-overlay';
            loginForm.innerHTML = `
                <div class="auth-form">
                    <h3>Login to CodeSpark</h3>
                    <form id="loginFormElement">
                        <div class="form-group">
                            <input type="email" id="loginEmail" placeholder="Email" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="loginPassword" placeholder="Password" required>
                        </div>
                        <div id="loginError" class="form-error"></div>
                        <div class="form-buttons">
                            <button type="submit" class="submit-btn" id="loginSubmitBtn">Login</button>
                            <button type="button" class="cancel-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(loginForm);

            // Add event listeners
            const form = document.getElementById('loginFormElement');
            const cancelBtn = loginForm.querySelector('.cancel-btn');
            const submitBtn = document.getElementById('loginSubmitBtn');
            const loginError = document.getElementById('loginError');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Disable submit button and show loading state
                submitBtn.disabled = true;
                submitBtn.textContent = 'Logging in...';
                loginError.textContent = '';

                const email = document.getElementById('loginEmail').value.trim();
                const password = document.getElementById('loginPassword').value;

                try {
                    // Additional validation
                    if (!email || !password) {
                        throw new Error('Please fill in all fields');
                    }

                    // Attempt login
                    const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
                    
                    if (userCredential && userCredential.user) {
                        handleAuthenticatedUser(userCredential.user);
                        loginForm.remove();
                    } else {
                        throw new Error('Login failed. Please try again.');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    
                    // Handle specific Firebase auth errors
                    let errorMessage = 'Login failed: ';
                    switch (error.code) {
                        case 'auth/user-not-found':
                            errorMessage += 'No account found with this email';
                            break;
                        case 'auth/wrong-password':
                            errorMessage += 'Invalid password';
                            break;
                        case 'auth/invalid-email':
                            errorMessage += 'Invalid email format';
                            break;
                        case 'auth/user-disabled':
                            errorMessage += 'This account has been disabled';
                            break;
                        case 'auth/too-many-requests':
                            errorMessage += 'Too many failed attempts. Please try again later';
                            break;
                        default:
                            errorMessage += error.message || 'Unknown error occurred';
                    }
                    
                    loginError.textContent = errorMessage;
                    loginError.style.display = 'block';
                } finally {
                    // Re-enable submit button
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Login';
                }
            });

            cancelBtn.addEventListener('click', () => {
                loginForm.remove();
            });

        } catch (error) {
            showError('Error showing login form: ' + error.message);
        }
    };

    window.showSignupForm = async function() {
        try {
            // Create signup form elements
            const signupForm = document.createElement('div');
            signupForm.className = 'auth-form-overlay';
            signupForm.innerHTML = `
                <div class="auth-form">
                    <h3>Create Account</h3>
                    <form id="signupFormElement">
                        <div class="form-group">
                            <input type="text" id="signupName" placeholder="Display Name" required>
                        </div>
                        <div class="form-group">
                            <input type="email" id="signupEmail" placeholder="Email" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="signupPassword" placeholder="Password" required>
                        </div>
                        <div class="form-group">
                            <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
                        </div>
                        <div class="form-buttons">
                            <button type="submit" class="submit-btn">Sign Up</button>
                            <button type="button" class="cancel-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(signupForm);

            // Add event listeners
            const form = document.getElementById('signupFormElement');
            const cancelBtn = signupForm.querySelector('.cancel-btn');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                const confirmPass = document.getElementById('confirmPassword').value;
                const displayName = document.getElementById('signupName').value;

                if (password !== confirmPass) {
                    showError('Passwords do not match');
                    return;
                }

                try {
                    const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
                    
                    // Clear any existing localStorage progress
                    localStorage.removeItem('htmlCourseProgress');
                    localStorage.removeItem('cssCourseProgress');
                    
                    // Initialize the new user document with empty progress
                    await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                        email: email,
                        displayName: displayName,
                        createdAt: new Date().toISOString(),
                        htmlProgress: null,
                        cssProgress: null,
                        htmlCompleted: false,
                        cssCompleted: false
                    });

                    await userCredential.user.updateProfile({
                        displayName: displayName
                    });
                    
                    handleAuthenticatedUser(userCredential.user);
                    signupForm.remove();
                } catch (error) {
                    showError('Signup failed: ' + error.message);
                }
            });

            cancelBtn.addEventListener('click', () => {
                signupForm.remove();
            });
        } catch (error) {
            showError('Error showing signup form: ' + error.message);
        }
    };

    // Add these styles to the page dynamically
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            margin: 10px;
            border-radius: 5px;
            text-align: center;
            display: none;
        }
        
        .auth-container {
            background: rgba(255, 255, 255, 0.9);
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            margin: 40px auto;
            max-width: 400px;
            text-align: center;
        }

        .auth-buttons {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin-top: 20px;
        }

        .auth-buttons button {
            padding: 10px 20px;
            font-size: 16px;
            background-color: #008fa2;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .auth-buttons button:hover {
            background-color: #007a8c;
        }

        .auth-form-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }

        .auth-form {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
            width: 100%;
            max-width: 400px;
        }

        .auth-form h3 {
            margin: 0 0 20px;
            text-align: center;
            color: #333;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
        }

        .form-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .form-buttons button {
            flex: 1;
            padding: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s;
        }

        .submit-btn {
            background-color: #008fa2;
            color: white;
        }

        .submit-btn:hover {
            background-color: #007a8c;
        }

        .cancel-btn {
            background-color: #6c757d;
            color: white;
        }

        .cancel-btn:hover {
            background-color: #5a6268;
        }

        .form-error {
            color: #dc3545;
            font-size: 14px;
            margin: 10px 0;
            text-align: center;
            min-height: 20px;
        }

        .submit-btn:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }

        .form-group input:focus {
            outline: none;
            border-color: #008fa2;
            box-shadow: 0 0 0 2px rgba(0, 143, 162, 0.2);
        }

        .auth-form {
            position: relative;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .progress-bar {
            background: #eef2f5;
            border-radius: 10px;
            height: 10px;
            margin: 15px 0;
            position: relative;
            overflow: hidden;
        }

        .progress {
            background: linear-gradient(90deg, #008fa2, #00b4d8);
            height: 100%;
            border-radius: 10px;
            transition: width 0.5s ease;
        }

        .progress-info {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            color: #666;
            font-size: 14px;
        }

        .start-course-btn,
        .continue-course-btn,
        .review-course-btn,
        .coming-soon-btn {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 25px;
            text-decoration: none;
            text-align: center;
            transition: all 0.3s ease;
            width: 100%;
            border: none;
            cursor: pointer;
            font-weight: bold;
            box-sizing: border-box;
            margin: 10px 0;
            height: 42px;
            line-height: 22px;
            font-size: 15px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .start-course-btn {
            background-color: #008fa2;
            color: white;
        }

        .continue-course-btn {
            background-color: #4caf50;
            color: white;
        }

        .review-course-btn {
            background-color: #ffc107;
            color: #333;
            cursor: pointer;
            opacity: 1;
        }

        .coming-soon-btn {
            background-color: #6c757d;
            color: white;
            cursor: not-allowed;
            opacity: 0.8;
        }

        .start-course-btn:hover,
        .continue-course-btn:hover,
        .review-course-btn:hover {
            filter: brightness(90%);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .coming-soon-btn:hover {
            filter: none;
        }

        .coming-soon-badge {
            background: linear-gradient(45deg, #ff6b6b, #ffd93d);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            margin: 10px 0;
            text-align: center;
            font-weight: bold;
            animation: pulse 2s infinite;
        }

        .coming-soon-badge i {
            margin-right: 8px;
        }

        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(1);
            }
        }

        .course-card:has(.coming-soon-badge) {
            position: relative;
            opacity: 0.9;
        }

        .course-card:has(.coming-soon-badge)::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(255,107,107,0.1), rgba(255,217,61,0.1));
            border-radius: inherit;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    // Start initialization check
    checkFirebaseInitialization();
});

// Add new function to handle Coming Soon courses
function updateComingSoonCourse(courseName) {
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        const cardTitle = card.querySelector('h3');
        if (cardTitle && cardTitle.textContent === courseName) {
            // Remove any existing progress bar
            const existingProgressBar = card.querySelector('.progress-bar');
            if (existingProgressBar) {
                existingProgressBar.remove();
            }

            // Update the button
            const actionButton = card.querySelector('button') || card.querySelector('a');
            if (actionButton) {
                actionButton.textContent = 'Coming Soon';
                actionButton.className = 'coming-soon-btn';
                actionButton.disabled = true;
                if (actionButton.tagName === 'A') {
                    actionButton.href = '#';
                    actionButton.onclick = (e) => e.preventDefault();
                }
            }

            // Add coming soon badge
            const existingBadge = card.querySelector('.coming-soon-badge');
            if (!existingBadge) {
                const badge = document.createElement('div');
                badge.className = 'coming-soon-badge';
                badge.innerHTML = '<i class="fas fa-clock"></i> Available Soon!';
                card.insertBefore(badge, actionButton);
            }
        }
    });
}

// Add this new helper function to clear all progress
function clearAllProgress() {
    localStorage.removeItem('htmlCourseProgress');
    localStorage.removeItem('cssCourseProgress');
    
    // Also clear any DOM elements showing progress
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const progressElement = bar.querySelector('.progress');
        if (progressElement) {
            progressElement.style.width = '0%';
        }
    });
} 