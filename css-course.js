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
    
    // Create a temporary container for the clone
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 750px;
        background: url('../images/Background.png') center center/cover no-repeat, white;
        padding: 30px;
        z-index: -9999;
    `;
    
    // Style the certificate clone for PDF
    certificateClone.style.cssText = `
        background: url('../images/Background.png') center center/cover no-repeat, white;
        padding: 40px;
        text-align: center;
        width: 100%;
        position: relative;
        box-shadow: none;
        margin: 0;
        display: block;
    `;
    
    container.appendChild(certificateClone);
    document.body.appendChild(container);
    
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
                    clonedCert.style.background = `url('../images/Background.png') center center/cover no-repeat, white`;
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
                pdf.save('CSS_Course_Certificate.pdf');
            } catch (error) {
                console.error('PDF generation error:', error);
            }
            
            container.remove();
        }).catch(error => {
            console.error('Canvas generation failed:', error);
            alert('Failed to generate certificate. Please try again.');
            container.remove();
        });
    }, 500);
};

document.addEventListener('DOMContentLoaded', function() {
    // Check for required elements first
    checkRequiredElements();
    
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
            title: "Introduction to CSS",
            theory: "CSS (Cascading Style Sheets) is the language used to style web pages. It works alongside HTML to control the visual presentation of content, including colors, layouts, fonts, and animations.",
            example: "/* Basic CSS syntax */\np {\n    color: blue;\n    font-size: 16px;\n    font-weight: bold;\n}",
            exercise: "Create a CSS rule to make all paragraphs red in color",
            solution: "p{color:red;}",
            hint: "Use the color property with a value of red"
        },
        1: {
            title: "Styling Text",
            theory: "CSS provides powerful tools for text styling, including properties for font families, sizes, weights, colors, and text alignment.",
            example: "h1 {\n    font-family: Arial;\n    font-size: 24px;\n    text-align: center;\n    color: navy;\n}",
            exercise: "Style a heading with Arial font, size 20px, and bold weight",
            solution: "h1{font-family:Arial;font-size:20px;font-weight:bold;}",
            hint: "Use font-family, font-size, and font-weight properties"
        },
        2: {
            title: "Box Model",
            theory: "The CSS box model is fundamental to layout. Every element has margin, border, padding, and content areas that can be controlled independently.",
            example: ".box {\n    margin: 10px;\n    padding: 20px;\n    border: 1px solid black;\n    width: 200px;\n}",
            exercise: "Create a box with 15px padding and a 2px solid blue border",
            solution: ".box{padding:15px;border:2pxsolidblue;}",
            hint: "Use padding and border properties"
        },
        3: {
            title: "Layout & Positioning",
            theory: "CSS offers various ways to control layout, including Flexbox and Grid. Position properties help place elements exactly where you want them.",
            example: ".container {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    gap: 20px;\n}",
            exercise: "Create a flexbox container with centered content",
            solution: ".container{display:flex;justify-content:center;align-items:center;}",
            hint: "Use display: flex with justify-content and align-items"
        },
        4: {
            title: "Responsive Design",
            theory: "Responsive design ensures websites work well on all devices. Media queries allow you to apply different styles based on screen size or device characteristics.",
            example: "@media (max-width: 600px) {\n    .container {\n        width: 100%;\n        flex-direction: column;\n    }\n}",
            exercise: "Write a media query for screens smaller than 768px",
            solution: "@media(max-width:768px){.container{width:100%;}}",
            hint: "Use @media with a max-width condition"
        },
        5: {
            title: "Advanced CSS",
            theory: "Advanced CSS includes transitions, animations, transforms, and custom properties (variables) for creating dynamic and interactive styles.",
            example: ".button {\n    transition: all 0.3s ease;\n}\n.button:hover {\n    transform: scale(1.1);\n    background-color: #007bff;\n}",
            exercise: "Create a hover effect with scale transform",
            solution: ".element:hover{transform:scale(1.1);}",
            hint: "Use the transform property with scale()"
        }
    };

    // Add notification stack
    let notificationStack = [];
    let notificationCount = 0;

    // Load saved progress
    function loadProgress() {
        // Try to load from Firebase first
        const user = firebase.auth().currentUser;
        if (user) {
            return firebase.firestore().collection('users').doc(user.uid)
                .get()
                .then(doc => {
                    if (doc.exists && doc.data().cssProgress) {
                        const progressData = doc.data().cssProgress;
                        currentModule = progressData.currentModule;
                        completedModules = new Set(progressData.completedModules);
                        return true;
                    } else {
                        // If no Firebase data, try localStorage
                        const savedProgress = localStorage.getItem('cssCourseProgress');
                        if (savedProgress) {
                            const progressData = JSON.parse(savedProgress);
                            currentModule = progressData.currentModule;
                            completedModules = new Set(progressData.completedModules);
                            return true;
                        }
                        return false;
                    }
                })
                .catch(error => {
                    console.error('Error loading progress:', error);
                    return false;
                });
        } else {
            // If not logged in, use localStorage
            const savedProgress = localStorage.getItem('cssCourseProgress');
            if (savedProgress) {
                const progressData = JSON.parse(savedProgress);
                currentModule = progressData.currentModule;
                completedModules = new Set(progressData.completedModules);
                return Promise.resolve(true);
            }
            return Promise.resolve(false);
        }
    }

    // Save progress
    function saveProgress() {
        const progressData = {
            currentModule: currentModule,
            completedModules: Array.from(completedModules),
            lastUpdated: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('cssCourseProgress', JSON.stringify(progressData));

        // Save to Firebase if user is logged in
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.firestore().collection('users').doc(user.uid)
                .set({
                    cssProgress: progressData,
                    cssCompleted: completedModules.size === Object.keys(lessons).length
                }, { merge: true })
                .catch(error => console.error('Error saving progress:', error));
        }
    }

    // Initialize code editor
    function initializeLesson() {
        const lesson = lessons[currentModule];
        htmlInput.value = '/* Write your CSS here */';
        theoryText.textContent = lesson.theory;
        exampleCode.textContent = lesson.example;
        instructions.textContent = lesson.exercise;
        
        // Add initial preview content with empty style tag
        resultFrame.innerHTML = `
            <style></style>
            <div class="preview">
                <p>Sample paragraph</p>
                <h1>Sample heading</h1>
                <div class="box">Box model example</div>
                <div class="container">
                    <div>Flex item 1</div>
                    <div>Flex item 2</div>
                </div>
                <div class="element">Hover me</div>
            </div>
        `;
        
        updateNavigationButtons();
    }

    // Run code functionality
    runButton?.addEventListener('click', function() {
        const code = htmlInput.value;
        try {
            // Clear previous results and apply the CSS
            resultFrame.innerHTML = `
                <style>${code}</style>
                <div class="preview">
                    <p>Sample paragraph</p>
                    <h1>Sample heading</h1>
                    <div class="box">Box model example</div>
                    <div class="container">
                        <div>Flex item 1</div>
                        <div>Flex item 2</div>
                    </div>
                    <div class="element">Hover me</div>
                </div>
            `;

            console.log('Original code:', code);
            
            // Check if solution is correct
            const isCorrect = isCorrectSolution(code);
            console.log('Solution check result:', isCorrect);
            
            if (isCorrect) {
                showSuccess();
            }
        } catch (error) {
            console.error('Error:', error);
            showError(error);
        }
    });

    // Reset code
    resetButton?.addEventListener('click', function() {
        htmlInput.value = '/* Write your CSS here */';
        resultFrame.innerHTML = '';
    });

    // Check solution
    function isCorrectSolution(code) {
        const normalizedCode = code.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[\n\r]/g, '')
            .replace(/\/\*.*?\*\//g, '')
            .replace(/;}/g, '}')
            .replace(/;/g, '')
            .trim();

        console.log('Checking normalized code:', normalizedCode);
        
        switch(currentModule) {
            case 0: // CSS Colors
                const validRedValues = [
                    'p{color:red}',
                    'p{color:#ff0000}',
                    'p{color:#f00}',
                    'p{color:rgb(255,0,0)}',
                    'p{color:rgba(255,0,0,1)}',
                    'p{color:rgb(255,0,0,1)}'
                ];
                console.log('Checking against valid values:', validRedValues);
                const matches = validRedValues.some(valid => 
                    normalizedCode === valid || 
                    normalizedCode.replace(/\s+/g, '') === valid
                );
                console.log('Matches:', matches);
                return matches;
                
            case 1: // Text Styling
                return normalizedCode.includes('h1{') &&
                       normalizedCode.includes('font-family:arial') &&
                       normalizedCode.includes('font-size:20px') &&
                       normalizedCode.includes('font-weight:bold');
                
            case 2: // Box Model
                return normalizedCode.includes('.box{') &&
                       normalizedCode.includes('padding:15px') &&
                       (
                           normalizedCode.includes('border:2pxsolidblue') ||
                           normalizedCode.includes('border:2pxbluesolid')
                       );
                
            case 3: // Flexbox
                return normalizedCode.includes('.container{') &&
                       normalizedCode.includes('display:flex') &&
                       normalizedCode.includes('justify-content:center') &&
                       normalizedCode.includes('align-items:center');
                
            case 4: // Media Queries
                return normalizedCode.includes('@media(max-width:768px)') &&
                       normalizedCode.includes('.container{') &&
                       normalizedCode.includes('width:100%');
                
            case 5: // Transforms
                return normalizedCode.includes('.element:hover{') &&
                       normalizedCode.includes('transform:scale(1.1)');
                
            default:
                return false;
        }
    }

    // Show success message
    function showSuccess() {
        const notificationId = `notification-${notificationCount++}`;
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.id = notificationId;
        successMsg.style.cssText = `
            position: fixed;
            bottom: ${(notificationStack.length * 90) + 30}px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            width: 90%;
            max-width: 500px;
        `;
        
        const isLastModule = currentModule === Object.keys(lessons).length - 1;
        
        successMsg.innerHTML = `
            <div style="background: #4caf50; color: white; padding: 20px; border-radius: 8px; margin-top: 10px; text-align: center; position: relative;">
                <button class="close-success" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 5px;">
                    <i class="fas fa-times"></i>
                </button>
                <i class="fas fa-check-circle" style="font-size: 24px; margin-bottom: 10px;"></i>
                <h3 style="margin: 10px 0;">Great job! You've completed this module!</h3>
                ${!isLastModule ? `
                    <button class="next-exercise" style="background: white; color: #4caf50; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: all 0.3s ease;">
                        Continue to Next Module
                    </button>
                ` : `
                    <button class="view-certificate" style="background: white; color: #4caf50; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: all 0.3s ease;">
                        View Your Certificate
                    </button>
                `}
            </div>
        `;
        
        document.body.appendChild(successMsg);
        notificationStack.push(notificationId);

        // Mark current module as completed
        completedModules.add(currentModule);
        
        // Update the current module's node
        const currentNode = skillNodes[currentModule];
        if (currentNode) {
            currentNode.classList.remove('locked');
            currentNode.classList.add('completed');
            const icon = currentNode.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-check-circle';
                icon.style.color = '#4caf50';
            }
        }
        
        // Unlock next module if it exists
        if (currentModule < skillNodes.length - 1) {
            const nextNode = skillNodes[currentModule + 1];
            if (nextNode) {
                nextNode.classList.remove('locked');
                const icon = nextNode.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-circle';
                    icon.style.color = ''; // Reset color
                }
            }
        }
        
        // Update progress bar and module status
        updateProgress();
        updateModuleStatus();

        // Add event listeners for buttons
        const closeBtn = successMsg.querySelector('.close-success');
        closeBtn.addEventListener('click', () => {
            removeNotification(notificationId);
        });
        
        if (isLastModule) {
            const certificateBtn = successMsg.querySelector('.view-certificate');
            certificateBtn.addEventListener('click', () => {
                removeNotification(notificationId);
                generateCertificate();
            });
        } else {
            const nextExerciseBtn = successMsg.querySelector('.next-exercise');
            nextExerciseBtn.addEventListener('click', () => {
                removeNotification(notificationId);
                if (currentModule < Object.keys(lessons).length - 1) {
                    loadModule(currentModule + 1);
                }
            });
        }

        // Show congratulations if all modules are completed
        if (completedModules.size === Object.keys(lessons).length) {
            setTimeout(() => {
                showCongratulations();
            }, 1000);
        }

        // Save progress after marking module as complete
        saveProgress();

        // Update Firebase with completion status if this was the last module
        if (completedModules.size === Object.keys(lessons).length) {
            const user = firebase.auth().currentUser;
            if (user) {
                firebase.firestore().collection('users').doc(user.uid)
                    .set({
                        cssCompleted: true,
                        cssCompletedDate: new Date().toISOString()
                    }, { merge: true })
                    .catch(error => console.error('Error updating completion status:', error));
            }
        }
    }

    // Remove notification
    function removeNotification(notificationId) {
        const index = notificationStack.indexOf(notificationId);
        if (index > -1) {
            notificationStack.splice(index, 1);
            const element = document.getElementById(notificationId);
            element.style.opacity = '0';
            element.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                element.remove();
                notificationStack.forEach((id, idx) => {
                    const notification = document.getElementById(id);
                    if (notification) {
                        notification.style.bottom = `${(idx * 90) + 30}px`;
                    }
                });
            }, 300);
        }
    }

    // Show congratulations message
    function showCongratulations() {
        const notificationId = `notification-${notificationCount++}`;
        const congratsMsg = document.createElement('div');
        congratsMsg.className = 'success-message';
        congratsMsg.id = notificationId;
        congratsMsg.style.bottom = `${(notificationStack.length * 90) + 30}px`;
        
        congratsMsg.innerHTML = `
            <div style="background: #4caf50; color: white; padding: 20px; border-radius: 8px; margin-top: 10px; text-align: center; position: relative;">
                <button class="close-success" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 5px;">
                    <i class="fas fa-times"></i>
                </button>
                <i class="fas fa-trophy" style="font-size: 32px; margin-bottom: 15px;"></i>
                <h3 style="margin: 10px 0;">Congratulations! You've completed the CSS course!</h3>
                <button class="view-certificate" style="background: white; color: #4caf50; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 15px; transition: all 0.3s ease;">
                    View Your Certificate
                </button>
            </div>
        `;
        
        document.body.appendChild(congratsMsg);
        notificationStack.push(notificationId);

        const closeBtn = congratsMsg.querySelector('.close-success');
        closeBtn.addEventListener('click', () => {
            removeNotification(notificationId);
        });

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

    // Update progress
    function updateProgress() {
        const percentPerModule = 16.7; // 100% divided by 6 modules
        const progress = Math.round(completedModules.size * percentPerModule);
        progressBar.style.width = progress + '%';
        progressText.textContent = progress + '% Complete';
        progressBar.style.transition = 'width 0.5s ease-in-out';
    }

    // Navigation between lessons
    nextButton?.addEventListener('click', () => {
        if (currentModule < skillNodes.length - 1) {
            const nextNode = skillNodes[currentModule + 1];
            if (!nextNode.classList.contains('locked')) {
                loadModule(currentModule + 1);
                updateModuleStatus();
            }
        }
    });

    prevButton?.addEventListener('click', () => {
        if (currentModule > 0) {
            loadModule(currentModule - 1);
        }
    });

    // Update navigation buttons
    function updateNavigationButtons() {
        if (prevButton && nextButton) {
            prevButton.style.visibility = currentModule === 0 ? 'hidden' : 'visible';
            nextButton.style.visibility = currentModule === Object.keys(lessons).length - 1 ? 'hidden' : 'visible';
        }
    }

    // Update module status
    function updateModuleStatus() {
        const nodes = document.querySelectorAll('.skill-node');
        
        // First reset all nodes to locked state
        nodes.forEach((node, index) => {
            node.classList.remove('completed', 'active');
            node.classList.add('locked');
            const icon = node.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-lock';
                icon.style.color = '';
            }
        });

        // Then update based on progress
        nodes.forEach((node, index) => {
            if (index === 0 && completedModules.size === 0) {
                // Only unlock first module if no progress
                node.classList.remove('locked');
                const icon = node.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-circle';
                }
            } else if (completedModules.has(index - 1)) {
                // Unlock if previous module is completed
                node.classList.remove('locked');
                const icon = node.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-circle';
                }
            }

            // Mark completed modules
            if (completedModules.has(index)) {
                node.classList.remove('locked');
                node.classList.add('completed');
                const icon = node.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-check-circle';
                    icon.style.color = '#4caf50';
                }
            }

            // Mark current module as active
            if (index === currentModule) {
                node.classList.add('active');
            }
        });
    }

    // Load module
    function loadModule(moduleIndex) {
        if (moduleIndex < 0 || moduleIndex >= Object.keys(lessons).length) return;
        
        const nodes = document.querySelectorAll('.skill-node');
        if (nodes.length === 0) {
            console.error('No skill nodes found');
            return;
        }

        // Update current module
        currentModule = moduleIndex;

        // Update all nodes' states
        nodes.forEach((node, index) => {
            node.classList.remove('active');
            if (index === currentModule) {
                node.classList.add('active');
            }
        });

        // Update content
        const lesson = lessons[moduleIndex];
        if (lesson) {
            document.querySelector('.lesson-header h2').textContent = lesson.title;
            document.querySelector('.theory-text').textContent = lesson.theory;
            document.querySelector('.example-code').textContent = lesson.example;
            document.querySelector('.instructions').textContent = lesson.exercise;
            document.querySelector('.html-input').value = '/* Write your CSS here */';
            document.querySelector('.result-frame').innerHTML = `
                <style></style>
                <div class="preview">
                    <p>Sample paragraph</p>
                    <h1>Sample heading</h1>
                    <div class="box">Box model example</div>
                    <div class="container">
                        <div>Flex item 1</div>
                        <div>Flex item 2</div>
                    </div>
                    <div class="element">Hover me</div>
                </div>
            `;
        }

        updateNavigationButtons();
        saveProgress();
    }

    // Initialize
    async function initialize() {
        // Get all skill nodes
        const nodes = document.querySelectorAll('.skill-node');
        
        // Load saved progress
        const hasProgress = await loadProgress();
        
        if (!hasProgress) {
            currentModule = 0;
            completedModules.clear();
        }

        // Reset all nodes to initial locked state first
        nodes.forEach((node, index) => {
            // Reset all classes and icons
            node.classList.remove('completed', 'active');
            node.classList.add('locked');
            const icon = node.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-lock';
                icon.style.color = ''; // Reset color
            }
        });

        // Then update based on progress
        nodes.forEach((node, index) => {
            if (index === 0 && completedModules.size === 0) {
                // Only unlock first module if no progress
                node.classList.remove('locked');
                const icon = node.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-circle';
                }
            } else if (completedModules.has(index - 1)) {
                // Unlock if previous module is completed
                node.classList.remove('locked');
                const icon = node.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-circle';
                }
            }

            // Mark completed modules
            if (completedModules.has(index)) {
                node.classList.remove('locked');
                node.classList.add('completed');
                const icon = node.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-check-circle';
                    icon.style.color = '#4caf50';
                }
            }
        });

        // Add click handlers for modules
        nodes.forEach((node, index) => {
            node.addEventListener('click', () => {
                if (!node.classList.contains('locked')) {
                    loadModule(index);
                }
            });
        });

        // Initialize first module or last accessed module
        loadModule(currentModule);
        updateProgress();
        updateModuleStatus();
    }

    // Initialize the course
    initialize().then(() => {
        console.log('Course initialized with user progress');
    });

    // Generate certificate
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

        const certificateHTML = `
            <div class="certificate-container">
                <div class="certificate" style="
                    background: url('../images/Background.png') center center/cover no-repeat, white;
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

                        <h1 style="color: #008fa2; font-size: 32px; margin-bottom: 15px;">
                            Certificate of Completion
                        </h1>
                        
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
                        
                        <h3 style="color: #008fa2; font-size: 24px; margin-bottom: 30px;">
                            CSS Fundamentals Course
                        </h3>
                        
                        <p style="font-size: 16px; margin-bottom: 40px; color: #666;">
                            Demonstrating proficiency in CSS styling, layout, and responsive design
                        </p>
                        
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
                                <p style="font-size: 12px; color: #666; margin: 0;">Student</p>
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
                                <p style="font-size: 12px; color: #666; margin: 0;">CEO, CodeSpark</p>
                            </div>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <p style="font-size: 14px; color: #666;">Completed on</p>
                            <p style="font-size: 16px; color: #333;">${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

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

    // Show name dialog
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

        modal.querySelector('#saveName').addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (name) {
                localStorage.setItem('userName', name);
                modal.remove();
                generateCertificate();
            }
        });

        modal.querySelector('#cancelName').addEventListener('click', () => {
            modal.remove();
            generateCertificate();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                generateCertificate();
            }
        });
    }

    // Check for user name when Firebase auth state changes
    firebase.auth().onAuthStateChanged((user) => {
        if (user && user.displayName) {
            localStorage.setItem('userName', user.displayName);
        }
    });

    // Add this helper function to check if elements exist
    function checkRequiredElements() {
        const required = [
            '.skill-node',
            '.lesson-header h2',
            '.theory-text',
            '.example-code',
            '.instructions',
            '.html-input',
            '.result-frame'
        ];

        required.forEach(selector => {
            const element = document.querySelector(selector);
            if (!element) {
                console.error(`Missing required element: ${selector}`);
            }
        });
    }
}); 