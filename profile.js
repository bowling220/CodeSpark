document.addEventListener('DOMContentLoaded', async function() {
    // Wait for Firebase to be initialized
    try {
        // Check if Firebase is available
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded');
        }

        const auth = firebase.auth();
        
        auth.onAuthStateChanged((user) => {
            if (user) {
                updateProfileUI(user);
                loadUserProgress();
                loadAchievements();
            } else {
                window.location.href = '../index.html';
            }
        });

        function updateProfileUI(user) {
            document.getElementById('profileName').textContent = user.displayName || 'User';
            document.getElementById('userEmail').textContent = user.email;
            
            const profilePic = document.getElementById('profilePicture');
            if (profilePic) {
                if (user.photoURL) {
                    profilePic.src = user.photoURL;
                } else {
                    profilePic.src = generateDefaultAvatar(user.displayName || user.email);
                }
                
                profilePic.onerror = function() {
                    this.src = generateDefaultAvatar(user.displayName || user.email);
                };
            }
        }

        function loadUserProgress() {
            const auth = firebase.auth();
            const user = auth.currentUser;
            
            if (user) {
                // First try to get progress from Firebase
                firebase.firestore().collection('users').doc(user.uid).get()
                    .then((doc) => {
                        let completedCoursesCount = 0;
                        let progressCardsHTML = '';

                        // Get HTML course progress
                        const htmlProgress = doc.exists ? doc.data().htmlProgress : null;
                        if (htmlProgress) {
                            const htmlTotalModules = 6;
                            const htmlCompletedCount = htmlProgress.completedModules.length;
                            const htmlProgressPercentage = Math.round((htmlCompletedCount / htmlTotalModules) * 100);

                            if (htmlProgressPercentage === 100) completedCoursesCount++;

                            progressCardsHTML += `
                                <div class="progress-card">
                                    <h4>HTML Fundamentals</h4>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: ${htmlProgressPercentage}%"></div>
                                    </div>
                                    <p>${htmlProgressPercentage}% Complete</p>
                                    <div class="modules-completed">
                                        <span>${htmlCompletedCount}/${htmlTotalModules} Modules Completed</span>
                                    </div>
                                    ${htmlProgressPercentage === 100 ? 
                                        '<div class="completion-badge"><i class="fas fa-check-circle"></i> Course Completed!</div>' 
                                        : 
                                        '<a href="html-course.html" class="continue-btn">Continue Course</a>'
                                    }
                                </div>
                            `;
                        } else {
                            // No progress yet
                            progressCardsHTML += `
                                <div class="progress-card">
                                    <h4>HTML Fundamentals</h4>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: 0%"></div>
                                    </div>
                                    <p>0% Complete</p>
                                    <div class="modules-completed">
                                        <span>0/6 Modules Completed</span>
                                    </div>
                                    <a href="html-course.html" class="start-btn">Start Course</a>
                                </div>
                            `;
                        }

                        // Get CSS course progress
                        const cssProgress = doc.exists ? doc.data().cssProgress : null;
                        if (cssProgress) {
                            const cssTotalModules = 6;
                            const cssCompletedCount = cssProgress.completedModules.length;
                            const cssProgressPercentage = Math.round((cssCompletedCount / cssTotalModules) * 100);

                            if (cssProgressPercentage === 100) completedCoursesCount++;

                            progressCardsHTML += `
                                <div class="progress-card">
                                    <h4>CSS Fundamentals</h4>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: ${cssProgressPercentage}%"></div>
                                    </div>
                                    <p>${cssProgressPercentage}% Complete</p>
                                    <div class="modules-completed">
                                        <span>${cssCompletedCount}/${cssTotalModules} Modules Completed</span>
                                    </div>
                                    ${cssProgressPercentage === 100 ? 
                                        '<div class="completion-badge"><i class="fas fa-check-circle"></i> Course Completed!</div>' 
                                        : 
                                        '<a href="css-course.html" class="continue-btn">Continue Course</a>'
                                    }
                                </div>
                            `;
                        } else {
                            // No progress yet
                            progressCardsHTML += `
                                <div class="progress-card">
                                    <h4>CSS Fundamentals</h4>
                                    <div class="progress-bar">
                                        <div class="progress" style="width: 0%"></div>
                                    </div>
                                    <p>0% Complete</p>
                                    <div class="modules-completed">
                                        <span>0/6 Modules Completed</span>
                                    </div>
                                    <a href="css-course.html" class="start-btn">Start Course</a>
                                </div>
                            `;
                        }

                        // Update courses completed count
                        document.getElementById('coursesCompleted').textContent = completedCoursesCount.toString();

                        // Display progress cards
                        const progressCards = document.querySelector('.course-progress-cards');
                        progressCards.innerHTML = progressCardsHTML;

                        // Initialize user document if it doesn't exist
                        if (!doc.exists) {
                            firebase.firestore().collection('users').doc(user.uid).set({
                                email: user.email,
                                displayName: user.displayName || 'User',
                                createdAt: new Date().toISOString(),
                                htmlProgress: null,
                                cssProgress: null,
                                htmlCompleted: false,
                                cssCompleted: false
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error loading user progress:', error);
                    });
            }
        }

        function loadAchievements() {
            const auth = firebase.auth();
            const user = auth.currentUser;
            
            if (user) {
                firebase.firestore().collection('users').doc(user.uid).get()
                    .then((doc) => {
                        const achievements = [];
                        
                        if (doc.exists) {
                            // HTML Achievements
                            const htmlProgress = doc.data().htmlProgress;
                            if (htmlProgress) {
                                const htmlCompletedCount = htmlProgress.completedModules.length;

                                if (htmlCompletedCount >= 1) {
                                    achievements.push({
                                        icon: 'fa-code',
                                        title: 'First Steps in HTML',
                                        description: 'Completed your first HTML module'
                                    });
                                }
                                if (htmlCompletedCount >= 3) {
                                    achievements.push({
                                        icon: 'fa-star',
                                        title: 'HTML Explorer',
                                        description: 'Completed 50% of HTML course'
                                    });
                                }
                                if (htmlCompletedCount === 6) {
                                    achievements.push({
                                        icon: 'fa-trophy',
                                        title: 'HTML Master',
                                        description: 'Completed the HTML Fundamentals course'
                                    });
                                }
                            }

                            // CSS Achievements
                            const cssProgress = doc.data().cssProgress;
                            if (cssProgress) {
                                const cssCompletedCount = cssProgress.completedModules.length;

                                if (cssCompletedCount >= 1) {
                                    achievements.push({
                                        icon: 'fa-palette',
                                        title: 'Style Beginner',
                                        description: 'Completed your first CSS module'
                                    });
                                }
                                if (cssCompletedCount >= 3) {
                                    achievements.push({
                                        icon: 'fa-star',
                                        title: 'Style Explorer',
                                        description: 'Completed 50% of CSS course'
                                    });
                                }
                                if (cssCompletedCount === 6) {
                                    achievements.push({
                                        icon: 'fa-award',
                                        title: 'CSS Master',
                                        description: 'Completed the CSS Fundamentals course'
                                    });
                                }
                            }
                        }

                        // Display achievements
                        const achievementsGrid = document.querySelector('.achievements-grid');
                        if (achievements.length > 0) {
                            achievementsGrid.innerHTML = achievements.map(achievement => `
                                <div class="achievement-card">
                                    <i class="fas ${achievement.icon}"></i>
                                    <h4>${achievement.title}</h4>
                                    <p>${achievement.description}</p>
                                </div>
                            `).join('');
                        } else {
                            achievementsGrid.innerHTML = `
                                <div class="no-achievements">
                                    <i class="fas fa-award"></i>
                                    <p>Complete course modules to earn achievements!</p>
                                </div>
                            `;
                        }
                    })
                    .catch(error => {
                        console.error('Error loading achievements:', error);
                    });
            }
        }

        // Handle logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                window.location.href = '../index.html';
            }).catch((error) => {
                console.error('Error signing out:', error);
            });
        });

        // Handle profile picture upload
        document.querySelector('.edit-avatar-btn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    // Upload to Firebase Storage and update profile
                    // Add your implementation here
                }
            };
            input.click();
        });
    } catch (error) {
        console.error("Firebase initialization error:", error);
        // Optionally redirect to an error page or show an error message
    }
});

// Add this function to generate a default avatar
function generateDefaultAvatar(username) {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const context = canvas.getContext('2d');
    
    // Background
    context.fillStyle = '#008fa2';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    context.fillStyle = 'white';
    context.font = '60px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    const initials = (username || 'U')
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    context.fillText(initials, canvas.width/2, canvas.height/2);
    
    return canvas.toDataURL('image/png');
} 