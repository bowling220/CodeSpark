document.addEventListener('DOMContentLoaded', function() {
    // Add this function at the top
    function handleDefaultAvatar() {
        const profilePics = document.querySelectorAll('img[src="default-avatar.png"]');
        profilePics.forEach(pic => {
            pic.onerror = function() {
                // Create canvas for default avatar
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = 120;
                canvas.height = 120;

                // Draw circle background
                context.fillStyle = '#008fa2';
                context.beginPath();
                context.arc(60, 60, 60, 0, Math.PI * 2);
                context.fill();

                // Draw text
                context.fillStyle = '#ffffff';
                context.font = '48px Arial';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText('U', 60, 60);

                // Set the canvas as image source
                this.src = canvas.toDataURL();
            };
        });
    }

    // Call handleDefaultAvatar after DOM loads
    handleDefaultAvatar();

    // Add initialization check
    let initializationAttempts = 0;
    const maxAttempts = 10;

    function checkFirebaseInitialization() {
        if (window.firebaseAuth && window.firebaseDb && window.firebaseStorage) {
            // Firebase is initialized, start the app
            initializeApp();
        } else if (initializationAttempts < maxAttempts) {
            initializationAttempts++;
            setTimeout(checkFirebaseInitialization, 100);
        } else {
            console.error('Failed to initialize Firebase after multiple attempts');
            showMessage('Failed to initialize application. Please refresh the page.', 'error');
        }
    }

    function initializeApp() {
        // Initialize auth listener
        window.firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                loadUserSettings(user);
                setupProfileDropdown();
            } else {
                window.location.href = 'index.html';
            }
        });

        // Initialize event listeners
        setupEventListeners();
    }

    // Start initialization check
    checkFirebaseInitialization();

    // Update loadUserSettings to use global Firebase instances
    function loadUserSettings(user) {
        // Update profile information
        document.getElementById('profileName').textContent = user.displayName || 'User';
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userDisplayName').textContent = user.displayName || 'Profile';
        
        // Populate form fields
        document.getElementById('displayName').value = user.displayName || '';
        document.getElementById('email').value = user.email || '';

        // Load profile picture with error handling
        const profilePic = document.getElementById('profilePicture');
        if (user.photoURL) {
            profilePic.src = user.photoURL;
        } else {
            handleDefaultAvatar();
        }

        // Load preferences from Firebase
        if (window.firebaseDb) {
            window.firebaseDb.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        document.getElementById('emailNotifications').checked = data.emailNotifications || false;
                        document.getElementById('darkMode').checked = data.darkMode || false;
                    }
                })
                .catch((error) => {
                    showMessage('Error loading preferences: ' + error.message, 'error');
                });
        }
    }

    // Update form handlers to use global Firebase instances
    document.getElementById('accountSettingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = window.firebaseAuth.currentUser;
        if (!user) return;

        const newDisplayName = document.getElementById('displayName').value;
        const newEmail = document.getElementById('email').value;

        try {
            if (user.displayName !== newDisplayName) {
                await user.updateProfile({
                    displayName: newDisplayName
                });
            }
            if (user.email !== newEmail) {
                await user.updateEmail(newEmail);
            }
            showMessage('Account settings updated successfully', 'success');
            loadUserSettings(user);
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Update password form handler
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = window.firebaseAuth.currentUser;
        if (!user) return;

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showMessage('New passwords do not match', 'error');
            return;
        }

        try {
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            await user.reauthenticateWithCredential(credential);
            await user.updatePassword(newPassword);
            showMessage('Password updated successfully', 'success');
            e.target.reset();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Handle preferences form
    document.getElementById('preferencesForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = window.firebaseAuth.currentUser;
        if (!user) return;

        const emailNotifications = e.target.emailNotifications.checked;
        const darkMode = e.target.darkMode.checked;

        try {
            if (window.firebaseDb) {
                await window.firebaseDb.collection('users').doc(user.uid).set({
                    emailNotifications,
                    darkMode
                }, { merge: true });
            }
            showMessage('Preferences saved successfully', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Handle profile picture upload
    document.getElementById('editAvatarBtn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const user = window.firebaseAuth.currentUser;
                    if (!user) return;

                    const storage = window.firebaseStorage;
                    const storageRef = storage.ref();
                    const profilePicRef = storageRef.child(`profile-pictures/${user.uid}`);
                    
                    await profilePicRef.put(file);
                    const photoURL = await profilePicRef.getDownloadURL();
                    
                    await user.updateProfile({
                        photoURL: photoURL
                    });
                    
                    document.getElementById('profilePicture').src = photoURL;
                    showMessage('Profile picture updated successfully', 'success');
                } catch (error) {
                    showMessage(error.message, 'error');
                }
            }
        };
        input.click();
    });

    // Setup profile dropdown
    function setupProfileDropdown() {
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');

        profileBtn.addEventListener('click', () => {
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    // Handle logout
    const logoutButtons = document.querySelectorAll('#logoutBtn, #sidebarLogoutBtn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.firebaseAuth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        });
    });

    // Utility function for showing messages
    function showMessage(message, type) {
        const messageElement = document.getElementById('settingsMessage');
        messageElement.textContent = message;
        messageElement.className = `settings-message ${type}`;
        messageElement.style.display = 'block';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }

    // Initialize event listeners
    function setupEventListeners() {
        // ... existing event listeners ...
    }
}); 