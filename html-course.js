document.addEventListener('DOMContentLoaded', function() {
    const htmlInput = document.querySelector('.html-input');
    const runButton = document.querySelector('.run-code');
    const resultFrame = document.querySelector('.result-frame');
    const progressBar = document.querySelector('.progress');
    const progressText = document.querySelector('.progress-text');
    let progress = 0;

    // Run code functionality
    runButton.addEventListener('click', function() {
        const code = htmlInput.value;
        const iframe = resultFrame;
        iframe.srcdoc = code;
    });

    // Course navigation
    const moduleLinks = document.querySelectorAll('.course-modules a');
    moduleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Update active state
            moduleLinks.forEach(l => l.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            
            // Update progress
            progress += 20;
            if (progress > 100) progress = 100;
            progressBar.style.width = progress + '%';
            progressText.textContent = progress + '% Complete';
        });
    });

    // Next lesson button
    document.querySelector('.next-lesson').addEventListener('click', function() {
        const currentActive = document.querySelector('.course-modules li.active');
        const nextModule = currentActive.nextElementSibling;
        if (nextModule) {
            currentActive.classList.remove('active');
            nextModule.classList.add('active');
            nextModule.querySelector('a').click();
        }
    });
}); 