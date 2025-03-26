// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBtfvkNfFOiFTq0Q5vF7niqeuvDMo9Cx2c",
    authDomain: "login-6de8e.firebaseapp.com",
    projectId: "login-6de8e",
    storageBucket: "login-6de8e.firebasestorage.app",
    messagingSenderId: "320079173662",
    appId: "1:320079173662:web:35b88f950179b0b632f60f",
    measurementId: "G-YR31H1QC2M"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const authContainer = document.getElementById('authContainer');
const courseContent = document.getElementById('courseContent');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        showCourseContent();
        updateNavigation(true);
    } else {
        // User is signed out
        showAuthContainer();
        updateNavigation(false);
    }
});

// Show/Hide content based on auth state
function showCourseContent() {
    authContainer.style.display = 'none';
    courseContent.style.display = 'block';
}

function showAuthContainer() {
    authContainer.style.display = 'block';
    courseContent.style.display = 'none';
}

// Update navigation based on auth state
function updateNavigation(isLoggedIn) {
    loginBtn.style.display = isLoggedIn ? 'none' : 'block';
    signupBtn.style.display = isLoggedIn ? 'none' : 'block';
    logoutBtn.style.display = isLoggedIn ? 'block' : 'none';
}

// Auth functions
function showLoginForm() {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Logged in successfully');
        })
        .catch((error) => {
            alert('Error: ' + error.message);
        });
}

function showSignupForm() {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('Signed up successfully');
        })
        .catch((error) => {
            alert('Error: ' + error.message);
        });
}

// Logout function
logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut()
        .then(() => {
            console.log('Logged out successfully');
        })
        .catch((error) => {
            console.error('Error logging out:', error);
        });
}); 