document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const htmlInput = document.querySelector('.html-input');
    const runButton = document.querySelector('.run-code');
    const resetButton = document.querySelector('.reset-code');
    const resultFrame = document.querySelector('.result-frame');
    const progressBar = document.querySelector('.progress');
    const progressText = document.querySelector('.progress-text');
    const nextButton = document.querySelector('.next-lesson');
    const prevButton = document.querySelector('.prev-lesson');
    const skillNodes = document.querySelectorAll('.skill-node');
    const theoryText = document.querySelector('.theory-text');
    const exampleCode = document.querySelector('.example-code');
    const instructions = document.querySelector('.instructions');

    // Course state
    let currentProgress = 35;
    let currentNodeIndex = 1;
    let userXP = 250;
    let completedLessons = new Set();

    // Lesson content
    const lessons = {
        0: {
            title: "Introduction to HTML",
            theory: "HTML is the standard markup language for creating web pages. It defines the structure and content of your web pages.",
            example: "<!-- This is an HTML comment -->",
            exercise: "Write your first HTML comment",
            solution: "<!--",
            hint: "HTML comments start with <!-- and end with -->"
        },
        1: {
            title: "HTML Tags and Elements",
            theory: "HTML tags are the building blocks of web pages. They tell the browser how to structure content.",
            example: "<p>This is a paragraph</p>",
            exercise: "Create a paragraph tag with 'Hello World!'",
            solution: "<p>hello world</p>",
            hint: "Use <p> tags to create a paragraph"
        },
        2: {
            title: "HTML Elements",
            theory: "Learn about different types of HTML elements and how they structure content.",
            example: "<h1>Heading</h1>\n<p>Paragraph</p>",
            exercise: "Create a heading (h1) and a paragraph",
            solution: "<h1>",
            hint: "Start with <h1> for the main heading"
        },
        3: {
            title: "HTML Attributes",
            theory: "Attributes provide additional information about HTML elements.",
            example: '<img src="image.jpg" alt="description">',
            exercise: "Add an src attribute to an image tag",
            solution: 'src="',
            hint: "Image tags need a src attribute to display an image"
        }
    };

    // Initialize code editor
    function initializeLesson() {
        const lesson = lessons[currentNodeIndex];
        htmlInput.value = '<!-- Type your HTML here -->';
        theoryText.textContent = lesson.theory;
        exampleCode.textContent = lesson.example;
        instructions.textContent = lesson.exercise;
        resultFrame.innerHTML = '';
        updateNavigationButtons();
    }

    // Run code functionality
    runButton.addEventListener('click', function() {
        const code = htmlInput.value;
        try {
            resultFrame.innerHTML = code;
            if (isCorrectSolution(code)) {
                showSuccess();
                if (!completedLessons.has(currentNodeIndex)) {
                    updateProgress(10);
                    updateXP(50);
                    completedLessons.add(currentNodeIndex);
                }
            }
        } catch (error) {
            showError(error);
        }
    });

    // Reset code
    resetButton.addEventListener('click', function() {
        htmlInput.value = '<!-- Type your HTML here -->';
        resultFrame.innerHTML = '';
    });

    // Check solution with improved validation
    function isCorrectSolution(code) {
        const lesson = lessons[currentNodeIndex];
        const lowerCode = code.toLowerCase();
        
        switch(currentNodeIndex) {
            case 0: // HTML Comments
                return lowerCode.includes('<!--') && lowerCode.includes('-->');
            case 1: // Paragraph
                return lowerCode.includes('<p>') && 
                       lowerCode.includes('</p>') && 
                       lowerCode.includes('hello world');
            case 2: // Heading and Paragraph
                return lowerCode.includes('<h1>') && 
                       lowerCode.includes('</h1>') &&
                       lowerCode.includes('<p>') && 
                       lowerCode.includes('</p>');
            case 3: // Image with attributes
                return lowerCode.includes('<img') && 
                       lowerCode.includes('src="') && 
                       lowerCode.includes('alt="');
            default:
                return false;
        }
    }

    // Show hint
    function showHint() {
        const hint = lessons[currentNodeIndex].hint;
        alert(hint);
    }

    // Success message with animation
    function showSuccess() {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `
            <div style="background: #4caf50; color: white; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <i class="fas fa-check-circle"></i> Great job! You've completed this exercise!
                <button class="next-exercise">Continue to Next Exercise</button>
            </div>
        `;
        resultFrame.parentNode.appendChild(successMsg);
        
        const nextExerciseBtn = successMsg.querySelector('.next-exercise');
        nextExerciseBtn.addEventListener('click', () => {
            if (currentNodeIndex < skillNodes.length - 1) {
                updateActiveNode(currentNodeIndex + 1);
            }
            successMsg.remove();
        });

        setTimeout(() => successMsg.remove(), 5000);
    }

    // Show error message
    function showError(error) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.innerHTML = `
            <div style="background: #f44336; color: white; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <i class="fas fa-exclamation-circle"></i> Oops! Something went wrong. Try again!
            </div>
        `;
        resultFrame.parentNode.appendChild(errorMsg);
        setTimeout(() => errorMsg.remove(), 3000);
    }

    // Update progress with animation
    function updateProgress(increment) {
        currentProgress = Math.min(currentProgress + increment, 100);
        progressBar.style.width = currentProgress + '%';
        progressText.textContent = currentProgress + '% Complete';
        
        // Animate progress bar
        progressBar.style.transition = 'width 0.5s ease-in-out';
    }

    // Update XP with animation
    function updateXP(increment) {
        const xpDisplay = document.querySelector('.xp-points span');
        const oldXP = userXP;
        userXP += increment;
        
        // Animate XP increase
        let current = oldXP;
        const timer = setInterval(() => {
            if (current < userXP) {
                current++;
                xpDisplay.textContent = current + ' XP';
            } else {
                clearInterval(timer);
            }
        }, 20);
    }

    // Navigation between lessons
    nextButton.addEventListener('click', () => {
        if (currentNodeIndex < skillNodes.length - 1) {
            updateActiveNode(currentNodeIndex + 1);
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentNodeIndex > 0) {
            updateActiveNode(currentNodeIndex - 1);
        }
    });

    function updateNavigationButtons() {
        prevButton.style.visibility = currentNodeIndex === 0 ? 'hidden' : 'visible';
        nextButton.style.visibility = currentNodeIndex === skillNodes.length - 1 ? 'hidden' : 'visible';
    }

    // Update active node with animation
    function updateActiveNode(newIndex) {
        skillNodes[currentNodeIndex].classList.remove('active');
        skillNodes[newIndex].classList.add('active');
        currentNodeIndex = newIndex;
        updateNavigationButtons();
        updateLessonContent(currentNodeIndex);
    }

    // Update lesson content
    function updateLessonContent(index) {
        const lesson = lessons[index];
        document.querySelector('.lesson-header h2').textContent = lesson.title;
        document.querySelector('.theory-section p').textContent = lesson.theory;
        document.querySelector('.instructions').textContent = lesson.exercise;
        htmlInput.value = '<!-- Type your HTML here -->';
        resultFrame.innerHTML = '';
    }

    // Mobile navigation
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    mobileNavToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.innerHTML = navLinks.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : 
            '<i class="fas fa-bars"></i>';
    });

    // Initialize the page
    initializeLesson();
}); 