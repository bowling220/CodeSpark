// Firebase configuration - Replace this with your NEW config from Firebase Console
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
function initializeFirebase() {
    try {
        // Check if Firebase is already initialized
        if (!firebase.apps || !firebase.apps.length) {
            const app = firebase.initializeApp(firebaseConfig);
            
            // Initialize services
            const auth = firebase.auth();
            const firestore = firebase.firestore();
            const storage = firebase.storage();

            // Make services globally available
            window.firebaseApp = app;
            window.firebaseAuth = auth;
            window.firebaseDb = firestore;
            window.firebaseStorage = storage;

            console.log('Firebase initialized successfully');
            return true;
        } else {
            console.log('Firebase already initialized');
            return true;
        }
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

// Initialize immediately when the script loads
if (typeof firebase !== 'undefined') {
    initializeFirebase();
} else {
    console.error('Firebase SDK not loaded');
}

// Export for use in other files
window.initializeFirebase = initializeFirebase; 