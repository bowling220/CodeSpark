document.addEventListener('DOMContentLoaded', function() {
    try {
        const auth = firebase.auth();

        // DOM Elements
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const profileContainer = document.getElementById('profileContainer');
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');

        // Auth state observer
        auth.onAuthStateChanged((user) => {
            if (user) {
                updateNavigation(true);
                handleAuthenticatedState(user);
            } else {
                updateNavigation(false);
                handleUnauthenticatedState();
            }
        });

        function updateNavigation(isLoggedIn) {
            if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'block';
            if (signupBtn) signupBtn.style.display = isLoggedIn ? 'none' : 'block';
            if (profileContainer) profileContainer.style.display = isLoggedIn ? 'block' : 'none';
        }

        function handleAuthenticatedState(user) {
            // Handle page-specific authenticated state
            const currentPage = window.location.pathname.split('/').pop();
            
            switch(currentPage) {
                case 'profile.html':
                case 'settings.html':
                    // These pages require auth, redirect if not authenticated
                    break;
                case 'courses.html':
                    const authContainer = document.getElementById('authContainer');
                    const courseContent = document.getElementById('courseContent');
                    if (authContainer && courseContent) {
                        authContainer.style.display = 'none';
                        courseContent.style.display = 'block';
                    }
                    break;
                // Add other page-specific handling
            }
        }

        function handleUnauthenticatedState() {
            const currentPage = window.location.pathname.split('/').pop();
            
            // Redirect to home if trying to access protected pages
            if (['profile.html', 'settings.html'].includes(currentPage)) {
                window.location.href = '../index.html';
            }
        }

        // Profile dropdown toggle
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle('show');
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-container')) {
                profileDropdown?.classList.remove('show');
            }
        });

        // Logout handler
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                profileDropdown?.classList.remove('show');
                handleLogout();
            });
        }

    } catch (error) {
        console.error("Error in auth.js:", error);
    }
});

// Update any navigation redirects
function handleLogout() {
    firebase.auth().signOut().then(() => {
        window.location.href = '../index.html';
    });
}

function redirectToLogin() {
    window.location.href = '../index.html';
} 