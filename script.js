document.getElementById('getStarted').addEventListener('click', function() {
    window.location.href = 'screens/courses.html';
});

// Mobile navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Toggle menu when hamburger is clicked
    mobileNavToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        // Update icon
        const isOpen = navLinks.classList.contains('active');
        this.innerHTML = isOpen ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
    });

    // Close menu when clicking anywhere else on the page
    document.addEventListener('click', function(e) {
        if (!navLinks.contains(e.target) && !mobileNavToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Close menu when clicking a nav link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
});
