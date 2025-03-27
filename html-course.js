// Add this at the top of the file, outside DOMContentLoaded
window.downloadCertificateAsPDF = function() {
    const certificate = document.querySelector('.certificate');
    if (!certificate) return;
    
    // Create a clone of the certificate without the buttons
    const certificateClone = certificate.cloneNode(true);
    
    // Remove the buttons and edit sections
    const buttonsContainer = certificateClone.querySelector('.certificate-buttons');
    if (buttonsContainer) buttonsContainer.remove();
    
    const editSection = certificateClone.querySelector('.edit-name-btn')?.parentElement;
    if (editSection) editSection.remove();
    
    // Make sure we keep the certificate content
    const certificateContent = certificateClone.querySelector('.certificate-content');
    if (!certificateContent) return;
    
    // Create a temporary container for the clone
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 750px;
        background: url('images/background.png') center center/cover no-repeat, white;
        padding: 30px;
        z-index: -9999;
    `;
    
    // Style the certificate clone for PDF
    certificateClone.style.cssText = `
        background: url('images/background.png') center center/cover no-repeat, white;
        padding: 40px;
        text-align: center;
        width: 100%;
        position: relative;
        box-shadow: none;
        margin: 0;
        display: block;
    `;
    
    // Add the clone to the container
    container.appendChild(certificateClone);
    document.body.appendChild(container);
    
    // Wait for fonts and images to load
    setTimeout(() => {
        html2canvas(certificateClone, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: true,
            onclone: function(clonedDoc) {
                const clonedCert = clonedDoc.querySelector('.certificate');
                if (clonedCert) {
                    clonedCert.style.transform = 'none';
                    clonedCert.style.boxShadow = 'none';
                    clonedCert.style.margin = '0';
                    clonedCert.style.padding = '40px';
                    clonedCert.style.background = `url('images/background.png') center center/cover no-repeat, white`;
                }
            }
        }).then(canvas => {
            try {
                const imgData = canvas.toDataURL('image/png', 1.0);
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });
                
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('HTML_Course_Certificate.pdf');
            } catch (error) {
                console.error('PDF generation error:', error);
            }
            
            // Clean up
            container.remove();
        }).catch(error => {
            console.error('Canvas generation failed:', error);
            alert('Failed to generate certificate. Please try again.');
            container.remove();
        });
    }, 500); // Give time for everything to render
};

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
    let currentModule = 0;
    let completedModules = new Set();

    // Lesson content
    const lessons = {
        0: {
            title: "What is HTML?",
            theory: "HTML (HyperText Markup Language) is the standard language used to create and structure content on the web. Every webpage you see is built using HTML as its foundation. HTML uses tags to define different types of content.",
            example: "<!-- Basic HTML document structure -->\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Webpage</title>\n  </head>\n  <body>\n    <h1>Hello World!</h1>\n  </body>\n</html>",
            exercise: "Create an HTML comment that says 'My first HTML comment'",
            solution: "<!-- My first HTML comment -->",
            hint: "HTML comments start with <!-- and end with -->"
        },
        1: {
            title: "HTML Basics",
            theory: "Every HTML document needs a basic structure including DOCTYPE, html, head, and body tags. These are the fundamental building blocks of any webpage.",
            example: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>Page Title</title>\n  </head>\n  <body>\n    Content goes here\n  </body>\n</html>",
            exercise: "Create a basic HTML structure with a title that says 'My Page'",
            solution: "<!DOCTYPE html><html><head><title>My Page</title></head><body></body></html>",
            hint: "Start with <!DOCTYPE html> and include all necessary tags"
        },
        2: {
            title: "Working with Text",
            theory: "HTML provides various tags for text content. The most common are <h1> through <h6> for headings, and <p> for paragraphs.",
            example: "<h1>Main Heading</h1>\n<p>This is a <strong>bold</strong> and <em>italic</em> text.</p>",
            exercise: "Create an h1 heading that says 'Welcome' and a paragraph below it with some bold text",
            solution: "<h1>Welcome</h1><p>This is <strong>bold</strong> text</p>",
            hint: "Use <h1> tags for the heading and <strong> for bold text"
        },
        3: {
            title: "Lists & Links",
            theory: "HTML offers two main types of lists: ordered (<ol>) and unordered (<ul>). Links are created using the <a> tag.",
            example: "<ul>\n  <li>First item</li>\n  <li>Second item</li>\n</ul>\n<a href='https://example.com'>Visit Example</a>",
            exercise: "Create an unordered list with two items, and make one of them a link",
            solution: "<ul><li><a href='#'>First item</a></li><li>Second item</li></ul>",
            hint: "Start with <ul> and use <li> for each item"
        },
        4: {
            title: "Images & Media",
            theory: "Images are added using the <img> tag. The src attribute specifies the image source, and alt provides alternative text.",
            example: "<img src='image.jpg' alt='Description of image'>\n<figure>\n  <img src='pic.jpg' alt='A picture'>\n  <figcaption>Caption for the image</figcaption>\n</figure>",
            exercise: "Create an image tag with a source and alt text",
            solution: "<img src='image.jpg' alt='My image'>",
            hint: "Use the <img> tag with both src and alt attributes"
        },
        5: {
            title: "Tables & Forms",
            theory: "Tables are used to display data in rows and columns. Forms allow users to input data and submit it.",
            example: "<table>\n  <tr>\n    <td>Cell 1</td>\n    <td>Cell 2</td>\n  </tr>\n</table>",
            exercise: "Create a simple table with 2 rows and 2 columns",
            solution: "<table><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td></tr></table>",
            hint: "Use <table>, <tr>, and <td> tags"
        }
    };

    // Add this at the top of your JavaScript file, after the DOM elements
    let notificationStack = [];
    let notificationCount = 0;

    // Function to save progress to localStorage
    function saveProgress() {
        const progressData = {
            currentModule: currentModule,
            completedModules: Array.from(completedModules)
        };
        localStorage.setItem('htmlCourseProgress', JSON.stringify(progressData));
    }

    // Function to load progress from localStorage
    function loadProgress() {
        const savedProgress = localStorage.getItem('htmlCourseProgress');
        if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            currentModule = progressData.currentModule;
            completedModules = new Set(progressData.completedModules);
            return true;
        }
        return false;
    }

    // Initialize code editor
    function initializeLesson() {
        const lesson = lessons[currentModule];
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
        const lesson = lessons[currentModule];
        const lowerCode = code.toLowerCase().replace(/\s+/g, '');
        
        switch(currentModule) {
            case 0: // HTML Comments
                return lowerCode.includes('<!--') && 
                       lowerCode.includes('-->') && 
                       lowerCode.includes('myfirsthtmlcomment');
            case 1: // Document Structure
                return lowerCode.includes('<!doctypehtml') && 
                       lowerCode.includes('<html') && 
                       lowerCode.includes('<head') && 
                       lowerCode.includes('<title>mypage</title>') && 
                       lowerCode.includes('</head>') && 
                       lowerCode.includes('<body');
            case 2: // Text Formatting
                return lowerCode.includes('<h1>welcome</h1>') && 
                       lowerCode.includes('<p') && 
                       lowerCode.includes('<strong>') && 
                       lowerCode.includes('</strong>');
            case 3: // Lists and Links
                return lowerCode.includes('<ul>') && 
                       lowerCode.includes('<li>') && 
                       lowerCode.includes('<a') && 
                       lowerCode.includes('href=');
            case 4: // Images and Media
                return lowerCode.includes('<img') && 
                       lowerCode.includes('src=') && 
                       lowerCode.includes('alt=');
            case 5: // Tables and Forms
                return lowerCode.includes('<table>') && 
                       lowerCode.includes('<tr>') && 
                       lowerCode.includes('<td>');
            default:
                return false;
        }
    }

    // Show hint
    function showHint() {
        const hint = lessons[currentModule].hint;
        alert(hint);
    }

    // Success message with animation
    function showSuccess() {
        const notificationId = `notification-${notificationCount++}`;
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.id = notificationId;
        successMsg.style.bottom = `${(notificationStack.length * 90) + 30}px`;
        
        // Check if this is the last module
        const isLastModule = currentModule === Object.keys(lessons).length - 1;
        
        successMsg.innerHTML = `
            <div style="background: #4caf50; color: white; padding: 20px; border-radius: 8px; margin-top: 10px; text-align: center; position: relative;">
                <button class="close-success" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 5px;
                "><i class="fas fa-times"></i></button>
                <i class="fas fa-check-circle" style="font-size: 24px; margin-bottom: 10px;"></i>
                <h3 style="margin: 10px 0;">Great job! You've completed this module!</h3>
                ${!isLastModule ? `
                    <button class="next-exercise" style="
                        background: white;
                        color: #4caf50;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        font-weight: bold;
                        cursor: pointer;
                        margin-top: 10px;
                        transition: all 0.3s ease;
                    ">Continue to Next Module</button>
                ` : `
                    <button class="view-certificate" style="
                        background: white;
                        color: #4caf50;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        font-weight: bold;
                        cursor: pointer;
                        margin-top: 10px;
                        transition: all 0.3s ease;
                    ">View Your Certificate</button>
                `}
            </div>
        `;
        
        document.body.appendChild(successMsg);
        notificationStack.push(notificationId);

        // Mark current module as completed and update UI
        completedModules.add(currentModule);
        updateProgress();
        updateModuleStatus();
        
        // Update the current module's icon to checkmark
        const currentNode = skillNodes[currentModule];
        currentNode.classList.add('completed');
        currentNode.querySelector('i').className = 'fas fa-check-circle';
        currentNode.querySelector('i').style.color = '#4caf50';

        // Unlock and update icon for next module
        if (currentModule < skillNodes.length - 1) {
            const nextNode = skillNodes[currentModule + 1];
            nextNode.classList.remove('locked');
            nextNode.querySelector('i').className = 'fas fa-circle';
        }
        
        // Add close button functionality
        const closeBtn = successMsg.querySelector('.close-success');
        closeBtn.addEventListener('click', () => {
            removeNotification(notificationId);
        });
        
        if (isLastModule) {
            // Add certificate button functionality
            const certificateBtn = successMsg.querySelector('.view-certificate');
            certificateBtn.addEventListener('click', () => {
                removeNotification(notificationId);
                generateCertificate();
            });
        } else {
            // Add next module button functionality
            const nextExerciseBtn = successMsg.querySelector('.next-exercise');
            nextExerciseBtn.addEventListener('click', () => {
                removeNotification(notificationId);
                if (currentModule < Object.keys(lessons).length - 1) {
                    loadModule(currentModule + 1);
                }
            });
        }

        // If this completes all modules, show the congratulations message
        if (completedModules.size === Object.keys(lessons).length) {
            setTimeout(() => {
                showCongratulations();
            }, 1000);
        }
    }

    // Add this function to handle notification removal
    function removeNotification(notificationId) {
        const index = notificationStack.indexOf(notificationId);
        if (index > -1) {
            notificationStack.splice(index, 1);
            const element = document.getElementById(notificationId);
            element.style.opacity = '0';
            element.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                element.remove();
                // Reposition remaining notifications
                notificationStack.forEach((id, idx) => {
                    const notification = document.getElementById(id);
                    if (notification) {
                        notification.style.bottom = `${(idx * 90) + 30}px`;
                    }
                });
            }, 300);
        }
    }

    // Add this function to show the congratulations message
    function showCongratulations() {
        const notificationId = `notification-${notificationCount++}`;
        const congratsMsg = document.createElement('div');
        congratsMsg.className = 'success-message';
        congratsMsg.id = notificationId;
        congratsMsg.style.bottom = `${(notificationStack.length * 90) + 30}px`;
        
        congratsMsg.innerHTML = `
            <div style="background: #4caf50; color: white; padding: 20px; border-radius: 8px; margin-top: 10px; text-align: center; position: relative;">
                <button class="close-success" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 5px;
                "><i class="fas fa-times"></i></button>
                <i class="fas fa-trophy" style="font-size: 32px; margin-bottom: 15px;"></i>
                <h3 style="margin: 10px 0;">Congratulations! You've completed the HTML course!</h3>
                <button class="view-certificate" style="
                    background: white;
                    color: #4caf50;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 15px;
                    transition: all 0.3s ease;
                ">View Your Certificate</button>
            </div>
        `;
        
        document.body.appendChild(congratsMsg);
        notificationStack.push(notificationId);

        // Add close button functionality
        const closeBtn = congratsMsg.querySelector('.close-success');
        closeBtn.addEventListener('click', () => {
            removeNotification(notificationId);
        });

        // Add certificate button functionality
        const certificateBtn = congratsMsg.querySelector('.view-certificate');
        certificateBtn.addEventListener('click', () => {
            removeNotification(notificationId);
            generateCertificate();
        });
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

    // Navigation between lessons
    nextButton.addEventListener('click', () => {
        if (currentModule < skillNodes.length - 1) {
            const nextNode = skillNodes[currentModule + 1];
            
            // Only proceed if the next module is not locked
            if (!nextNode.classList.contains('locked')) {
                // Don't mark as completed, just move to next module
                loadModule(currentModule + 1);
                
                // Update UI without adding checkmark
                updateModuleStatus();
            }
        }
    });

    prevButton.addEventListener('click', () => {
        if (currentModule > 0) {
            updateActiveNode(currentModule - 1);
        }
    });

    function updateNavigationButtons() {
        prevButton.style.visibility = currentModule === 0 ? 'hidden' : 'visible';
        nextButton.style.visibility = currentModule === Object.keys(lessons).length - 1 ? 'hidden' : 'visible';
    }

    // Update active node with animation
    function updateActiveNode(newIndex) {
        skillNodes[currentModule].classList.remove('active');
        skillNodes[newIndex].classList.add('active');
        currentModule = newIndex;
        updateNavigationButtons();
        updateLessonContent(currentModule);
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

    // Update the progression system
    function updateModuleStatus() {
        const nodes = document.querySelectorAll('.skill-node');
        nodes.forEach((node, index) => {
            // Reset all nodes first
            node.classList.remove('completed', 'active');
            node.classList.add('locked');
            node.querySelector('i').className = 'fas fa-lock';

            if (completedModules.has(index)) {
                // Mark completed modules with green checkmark
                node.classList.remove('locked');
                node.classList.add('completed');
                node.querySelector('i').className = 'fas fa-check-circle';
                node.querySelector('i').style.color = '#4caf50'; // Make checkmark green
                
                // Unlock next module
                if (nodes[index + 1]) {
                    nodes[index + 1].classList.remove('locked');
                    nodes[index + 1].querySelector('i').className = 'fas fa-circle';
                }
            } else if (index === 0 || completedModules.has(index - 1)) {
                // Unlock current module if it's first or previous is completed
                node.classList.remove('locked');
                node.querySelector('i').className = 'fas fa-circle';
            }

            // Mark current module as active
            if (index === currentModule) {
                node.classList.add('active');
            }
        });
    }

    function loadModule(moduleIndex) {
        if (moduleIndex < 0 || moduleIndex >= Object.keys(lessons).length) return;
        
        const nodes = document.querySelectorAll('.skill-node');
        const targetNode = nodes[moduleIndex];
        
        // Only allow loading unlocked modules
        if (!targetNode.classList.contains('locked')) {
            // Remove active class from all nodes
            nodes.forEach(node => node.classList.remove('active'));
            
            // Add active class to current module
            targetNode.classList.add('active');
            currentModule = moduleIndex;
            
            // Update content
            const lesson = lessons[moduleIndex];
            document.querySelector('.lesson-header h2').textContent = lesson.title;
            document.querySelector('.theory-text').textContent = lesson.theory;
            document.querySelector('.example-code').textContent = lesson.example;
            document.querySelector('.instructions').textContent = lesson.exercise;
            htmlInput.value = '<!-- Type your HTML here -->';
            resultFrame.innerHTML = '';
            
            updateNavigationButtons();
            saveProgress();
        }
    }

    // Add click handlers for modules
    document.querySelectorAll('.skill-node').forEach(node => {
        node.addEventListener('click', () => {
            const moduleIndex = parseInt(node.dataset.module);
            if (!node.classList.contains('locked')) {
                loadModule(moduleIndex);
            }
        });
    });

    // Initialize modules
    function initializeModules() {
        if (!loadProgress()) {
            // If no saved progress, start with first module unlocked
            const firstNode = document.querySelector('.skill-node');
            firstNode.classList.remove('locked');
            firstNode.querySelector('i').className = 'fas fa-circle';
            currentModule = 0;
        }
        
        loadModule(currentModule);
        updateModuleStatus();
        updateProgress();
    }

    // Initialize the page
    initializeModules();

    // Remove XP from lesson stats in the header
    const lessonStats = document.querySelector('.lesson-stats');
    if (lessonStats) {
        lessonStats.innerHTML = `
            <span><i class="fas fa-clock"></i> 15 mins</span>
        `;
    }

    // Update the progress calculation function
    function calculateProgress() {
        const percentPerModule = 16.7; // 100% divided by 6 modules
        return Math.round(completedModules.size * percentPerModule);
    }

    // Update the progress display function
    function updateProgress() {
        const newProgress = calculateProgress();
        progressBar.style.width = newProgress + '%';
        progressText.textContent = newProgress + '% Complete';
        progressBar.style.transition = 'width 0.5s ease-in-out';
    }

    // Add this function to generate the certificate
    function generateCertificate() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            padding: 20px;
        `;

        // Separate the certificate content from the buttons
        const certificateHTML = `
            <div class="certificate-container">
                <div class="certificate" style="
                    background: url('images/background.png') center center/cover no-repeat, white;
                    border-radius: 10px;
                    padding: 30px;
                    text-align: center;
                    max-width: 750px;
                    width: 100%;
                    position: relative;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                ">
                    <div style="
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        display: flex;
                        gap: 10px;
                    ">
                        <button class="edit-name-btn" style="
                            background: #008fa2;
                            color: white;
                            border: none;
                            padding: 8px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                        ">
                            <i class="fas fa-edit"></i> Edit Name
                        </button>
                        <button class="close-cert-btn" style="
                            background: rgba(0, 0, 0, 0.1);
                            color: #333;
                            border: none;
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 18px;
                        ">&times;</button>
                    </div>

                    <div class="certificate-content" style="margin: 20px auto;">
                        <div style="
                            width: 80px;
                            height: 80px;
                            margin: 0 auto;
                            background-color: #008fa2;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 32px;
                        ">
                            <i class="fas fa-code"></i>
                        </div>

                        <h1 style="
                            color: #008fa2; 
                            font-size: 32px; 
                            margin-bottom: 15px;
                        ">Certificate of Completion</h1>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">This certifies that</p>
                        
                        <h2 style="
                            color: #333;
                            font-size: 24px;
                            margin-bottom: 20px;
                            font-style: italic;
                            padding: 8px 0;
                            border-bottom: 2px solid #008fa2;
                            display: inline-block;
                        ">${localStorage.getItem('userName') || 'Student'}</h2>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">has successfully completed the</p>
                        
                        <h3 style="
                            color: #008fa2; 
                            font-size: 24px; 
                            margin-bottom: 30px;
                        ">HTML Fundamentals Course</h3>
                        
                        <p style="
                            font-size: 16px; 
                            margin-bottom: 40px; 
                            color: #666;
                        ">Demonstrating proficiency in HTML structure, elements, and web content creation</p>
                        
                        <div style="
                            display: flex;
                            justify-content: center;
                            margin-top: 30px;
                            margin-bottom: 15px;
                            gap: 80px;
                        ">
                            <div style="text-align: center;">
                                <div style="
                                    border-bottom: 2px solid #008fa2;
                                    padding-bottom: 6px;
                                    margin-bottom: 6px;
                                    min-width: 150px;
                                ">
                                    ${localStorage.getItem('userName') || 'Student'}
                                </div>
                                <p style="
                                    font-size: 12px;
                                    color: #666;
                                    margin: 0;
                                ">Student</p>
                            </div>
                            
                            <div style="text-align: center;">
                                <div style="
                                    border-bottom: 2px solid #008fa2;
                                    padding-bottom: 6px;
                                    margin-bottom: 6px;
                                    min-width: 150px;
                                    font-family: 'Dancing Script', cursive;
                                    font-size: 22px;
                                ">
                                    Blaine Oler
                                </div>
                                <p style="
                                    font-size: 12px;
                                    color: #666;
                                    margin: 0;
                                ">CEO, CodeSpark</p>
                            </div>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <p style="font-size: 14px; color: #666;">Completed on</p>
                            <p style="font-size: 16px; color: #333;">${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <!-- Separate buttons container -->
                <div class="certificate-buttons" style="
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin-top: 30px;
                ">
                    <button onclick="window.downloadCertificateAsPDF()" style="
                        background: #008fa2;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-download"></i> Download Certificate
                    </button>
                    <button onclick="window.print()" style="
                        background: #4caf50;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    ">
                        <i class="fas fa-print"></i> Print Certificate
                    </button>
                </div>
            </div>
        `;

        modal.innerHTML = certificateHTML;
        document.body.appendChild(modal);

        // Add event listeners
        const editNameBtn = modal.querySelector('.edit-name-btn');
        const closeCertBtn = modal.querySelector('.close-cert-btn');
        
        editNameBtn.addEventListener('click', () => {
            modal.remove();
            showNameDialog();
        });

        closeCertBtn.addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Create a separate function for the name dialog
    function showNameDialog() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 400px;
                width: 90%;
                text-align: center;
            ">
                <h3 style="margin-bottom: 20px; color: #008fa2;">Enter Your Name for the Certificate</h3>
                <input type="text" id="nameInput" style="
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 20px;
                    border: 2px solid #008fa2;
                    border-radius: 6px;
                    font-size: 16px;
                " placeholder="Enter your full name">
                <div style="display: flex; justify-content: center; gap: 10px;">
                    <button id="saveName" style="
                        background: #008fa2;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                    ">Save Name</button>
                    <button id="cancelName" style="
                        background: #666;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                    ">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const nameInput = modal.querySelector('#nameInput');
        const currentName = localStorage.getItem('userName');
        if (currentName) {
            nameInput.value = currentName;
        }

        // Handle save button
        modal.querySelector('#saveName').addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (name) {
                localStorage.setItem('userName', name);
                modal.remove();
                generateCertificate(); // Regenerate certificate with new name
            }
        });

        // Handle cancel button
        modal.querySelector('#cancelName').addEventListener('click', () => {
            modal.remove();
            generateCertificate(); // Go back to certificate
        });

        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                generateCertificate(); // Go back to certificate
            }
        });
    }

    // Add this function to check for user name when Firebase auth state changes
    firebase.auth().onAuthStateChanged((user) => {
        if (user && user.displayName) {
            localStorage.setItem('userName', user.displayName);
        }
    });
}); 