// ========================================
// PREMIUM ROMANTIC WEBSITE - CINEMATIC JS
// ========================================

// Global Variables
let appData = null;
let images = [];
let currentMemoryIndex = 0;
let memoryImages = [];
let slideTexts = [];
let autoSlideInterval = null;

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBIyIXYNvVhJnSK58rB29K9n7SNnbaoqnc",
    authDomain: "proposal-apoorva-sarvagy.firebaseapp.com",
    databaseURL: "https://proposal-apoorva-sarvagy-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "proposal-apoorva-sarvagy",
    storageBucket: "proposal-apoorva-sarvagy.firebasestorage.app",
    messagingSenderId: "794226715688",
    appId: "1:794226715688:web:284222db7af709b2cd591d",
    measurementId: "G-BZ4R12MR9T"
};

let database = null;
let sessionId = null;
let sessionRef = null;
let journeyPath = []; // Track full journey path

// ========================================
// SESSION TRACKING SYSTEM
// ========================================
function getISTTimestamp() {
    return new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "long",
        timeStyle: "medium" // Includes seconds
    });
}

function addToJourney(buttonText, actionType) {
    const step = {
        step: journeyPath.length + 1,
        action: actionType,
        button_text: buttonText,
        timestamp: getISTTimestamp()
    };
    journeyPath.push(step);
    
    // Update Firebase with the full journey
    if (sessionRef) {
        sessionRef.update({
            journey_path: journeyPath,
            total_steps: journeyPath.length
        }).catch(err => console.error('Journey update error:', err));
    }
    
    console.log(`Journey Step ${step.step}: ${actionType} - "${buttonText}"`);
}

function generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}_${random}`;
}

function initSession() {
    // Try to restore session from sessionStorage
    const storedSessionId = sessionStorage.getItem('proposal_session_id');
    
    if (storedSessionId) {
        sessionId = storedSessionId;
        sessionRef = database.ref(`upgrade responses/${sessionId}`);
        console.log('Session restored:', sessionId);
    } else {
        sessionId = generateSessionId();
        sessionStorage.setItem('proposal_session_id', sessionId);
        sessionRef = database.ref(`upgrade responses/${sessionId}`);
        
        // Create initial entry
        sessionRef.set({
            opened_at: getISTTimestamp(),
            progress: "landing_opened",
            progress_updates: {}
        }).then(() => {
            console.log('Session created:', sessionId);
        }).catch(err => console.error('Session creation error:', err));
    }
}

function updateProgress(progressStatus) {
    if (!sessionRef) return;
    
    sessionRef.update({
        progress: progressStatus,
        [`progress_updates/${progressStatus}`]: getISTTimestamp()
    }).catch(err => console.error('Progress update error:', err));
}

function setFinalChoice(choice) {
    if (!sessionRef) return;
    
    sessionRef.update({
        final_choice: choice,
        final_timestamp: getISTTimestamp()
    }).catch(err => console.error('Final choice error:', err));
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Firebase
    try {
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        console.log('Firebase initialized');
        
        // Initialize session tracking
        initSession();
    } catch (error) {
        console.log('Firebase skipped:', error.message);
    }

    // Load data
    await loadData();
    
    // Initialize pre-entry experience first
    initPreEntry();
    
    // Initialize all other components (but don't show loading screen yet)
    initLoadingScreen();
    initParticles();
    initFloatingHearts();
    initPolaroids();
    initScrollAnimations();
    initMemoryCarousel();
    initFunSection();
    initEmotionalSection();
    initWhySection();
    initParallaxImages();
    initButtons();
    initPopupSystem();
    initGifPopupSystem();
    initMicroInteractions();
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 2000);
});

// ========================================
// DATA LOADING
// ========================================
async function loadData() {
    try {
        const response = await fetch('data.json');
        appData = await response.json();
        console.log('Data loaded');
    } catch (error) {
        console.error('Error loading data:', error);
        appData = getDefaultData();
    }
    
    // Initialize images array
    initImages();
}

function getDefaultData() {
    return {
        rejectButtons: [
            { id: 1, text: "Let me think about it...", emoji: "🤔" },
            { id: 2, text: "I need more time", emoji: "⏰" },
            { id: 3, text: "We're better as friends", emoji: "💔" },
            { id: 4, text: "This is too sudden!", emoji: "😱" },
            { id: 5, text: "Maybe in another life", emoji: "🌙" },
            { id: 6, text: "You're like a sibling to me", emoji: "👬" },
            { id: 7, text: "I'm not ready for this", emoji: "😰" },
            { id: 8, text: "Let's stay as we are", emoji: "🤝" }
        ],
        termsAndConditions: {
            title: "Terms & Conditions of Rejection",
            content: ["By rejecting Shashwat's proposal, you acknowledge that this is a binding agreement of friendship."],
            acceptButtonText: "I Accept (With Love)"
        },
        noResponse: {
            reassuranceTitle: "It's Okay",
            reassuranceMessage: "I respect your decision completely.",
            finalParagraph: "You're still my favorite person."
        },
        yesResponse: {
            doubtTitle: "Wait...",
            doubtMessage: "Are you sure?",
            improveOptions: [
                { id: "upgrade1", text: "Yes, I'm 100% sure!", emoji: "💯" },
                { id: "upgrade2", text: "YES!!! Forever and always!", emoji: "💖" },
                { id: "upgrade3", text: "Stop doubting and kiss me already!", emoji: "😘" }
            ],
            celebrationTitle: "Finally!",
            celebrationMessage: "I've been waiting for this moment.",
            finalNote: "You made me the happiest person alive."
        },
        memoryLane: {
            texts: [
                "You never even gave me a handshake...",
                "Still somehow became my favorite human",
                "Suspicious behavior honestly"
            ]
        },
        funSection: {
            sarcasticLines: [
                "We already act like a couple",
                "This is just paperwork now",
                "Your parents probably like me more"
            ]
        },
        emotionalSection: {
            title: "Real Talk...",
            messages: [
                "I love your company more than anyone else's",
                "The way you say 'I love you' daily hits different"
            ]
        }
    };
}

// ========================================
// IMAGES INITIALIZATION
// ========================================
function initImages() {
    const imageData = [
        { id: 1, ext: 'png' }, { id: 2, ext: 'png' }, { id: 3, ext: 'png' },
        { id: 4, ext: 'png' }, { id: 5, ext: 'png' }, { id: 6, ext: 'png' },
        { id: 7, ext: 'png' }, { id: 8, ext: 'png' }, { id: 9, ext: 'png' },
        { id: 10, ext: 'png' }, { id: 11, ext: 'png' }, { id: 12, ext: 'png' },
        { id: 13, ext: 'png' }, { id: 14, ext: 'png' }, { id: 15, ext: 'png' },
        { id: 16, ext: 'png' }, { id: 17, ext: 'png' }, { id: 18, ext: 'jpeg' },
        { id: 19, ext: 'png' }, { id: 20, ext: 'jpeg' }, { id: 21, ext: 'jpeg' },
        { id: 22, ext: 'jpeg' }, { id: 23, ext: 'jpeg' }, { id: 24, ext: 'jpeg' },
        { id: 25, ext: 'jpeg' }, { id: 26, ext: 'jpeg' }, { id: 27, ext: 'jpeg' },
        { id: 28, ext: 'png' }, { id: 29, ext: 'jpeg' }, { id: 30, ext: 'png' },
        { id: 31, ext: 'png' }, { id: 32, ext: 'png' }, { id: 33, ext: 'png' },
        { id: 34, ext: 'png' }, { id: 35, ext: 'png' }, { id: 36, ext: 'png' },
        { id: 37, ext: 'png' }, { id: 38, ext: 'png' }, { id: 39, ext: 'png' },
        { id: 40, ext: 'png' }, { id: 41, ext: 'png' }, { id: 42, ext: 'png' },
        { id: 43, ext: 'png' }, { id: 44, ext: 'png' }, { id: 45, ext: 'png' },
        { id: 46, ext: 'png' }, { id: 47, ext: 'png' }, { id: 48, ext: 'png' },
        { id: 49, ext: 'png' }, { id: 50, ext: 'png' }, { id: 51, ext: 'png' }
    ];
    
    images = imageData.map(img => `res/photo-${img.id}.${img.ext}`);
    images = shuffleArray(images);
    
    // Get memory texts
    slideTexts = appData?.memoryLane?.texts || [
        "You never even gave me a handshake...",
        "Still somehow became my favorite human",
        "Suspicious behavior honestly"
    ];
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ========================================
// LOADING SCREEN
// ========================================
function initLoadingScreen() {
    // Loading animation handled by CSS
}

// ========================================
// PARTICLES
// ========================================
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    const colors = ['rgba(255,107,157,0.3)', 'rgba(102,126,234,0.3)', 'rgba(248,181,0,0.3)'];
    
    for (let i = 0; i < 50; i++) {
        createParticle(container, colors);
    }
    
    // Continuously create particles
    setInterval(() => {
        if (container.children.length < 60) {
            createParticle(container, colors);
        }
    }, 3000);
}

function createParticle(container, colors) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = 2 + Math.random() * 6;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.animationDuration = (15 + Math.random() * 10) + 's';
    particle.style.animationDelay = Math.random() * 5 + 's';
    
    container.appendChild(particle);
    
    // Remove after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 25000);
}

// ========================================
// FLOATING HEARTS
// ========================================
function initFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    if (!container) return;
    
    const hearts = ['💕', '💖', '💗', '💓', '💝', '❤️', '💘', '💞', '🩷', '🤍'];
    
    // Create initial hearts
    for (let i = 0; i < 15; i++) {
        setTimeout(() => createFloatingHeart(container, hearts), i * 500);
    }
    
    // Continuously create hearts
    setInterval(() => {
        if (container.children.length < 25) {
            createFloatingHeart(container, hearts);
        }
    }, 2000);
}

function createFloatingHeart(container, hearts) {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.animationDuration = (12 + Math.random() * 8) + 's';
    heart.style.animationDelay = Math.random() * 3 + 's';
    heart.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
    
    container.appendChild(heart);
    
    setTimeout(() => {
        if (heart.parentNode) {
            heart.parentNode.removeChild(heart);
        }
    }, 20000);
}

// ========================================
// POLAROIDS
// ========================================
function initPolaroids() {
    const polaroids = document.querySelectorAll('.polaroid-img');
    const shuffledImages = shuffleArray([...images]).slice(0, 3);
    
    polaroids.forEach((img, index) => {
        if (shuffledImages[index]) {
            img.src = shuffledImages[index];
        }
    });
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Special handling for emotional messages
                if (entry.target.classList.contains('emotional-message')) {
                    animateEmotionalMessages();
                }
                
                // Special handling for buildup lines
                if (entry.target.classList.contains('buildup-line')) {
                    animateBuildupLines();
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.section-header, .fun-card, .emotional-message, .buildup-line').forEach(el => {
        observer.observe(el);
    });
    
    // Also observe sections for section-specific animations
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.3 });
    
    document.querySelectorAll('.section').forEach(section => {
        sectionObserver.observe(section);
    });
}

function animateEmotionalMessages() {
    const messages = document.querySelectorAll('.emotional-message');
    messages.forEach((msg, index) => {
        setTimeout(() => {
            msg.classList.add('visible');
        }, index * 200);
    });
}

function animateBuildupLines() {
    const lines = document.querySelectorAll('.buildup-line');
    lines.forEach((line, index) => {
        const delay = parseInt(line.dataset.delay) || (index * 300);
        setTimeout(() => {
            line.classList.add('visible');
        }, delay);
    });
}

// ========================================
// MEMORY CAROUSEL
// ========================================
function initMemoryCarousel() {
    const carousel = document.getElementById('stackedCarousel');
    const dotsContainer = document.getElementById('memoryDots');
    const cardImage = document.getElementById('currentMemoryImage');
    const memoryText = document.getElementById('memoryText');
    const memoryNumber = document.getElementById('memoryNumber');
    
    if (!carousel || !dotsContainer) return;
    
    // Select random images for memory cards
    memoryImages = shuffleArray([...images]).slice(0, 10);
    
    // Create dots
    memoryImages.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `progress-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToMemory(index));
        dotsContainer.appendChild(dot);
    });
    
    // Set initial state
    updateMemoryCard(0);
    
    // Navigation
    document.getElementById('prevMemory')?.addEventListener('click', () => goToMemory(currentMemoryIndex - 1));
    document.getElementById('nextMemory')?.addEventListener('click', () => goToMemory(currentMemoryIndex + 1));
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToMemory(currentMemoryIndex - 1);
        if (e.key === 'ArrowRight') goToMemory(currentMemoryIndex + 1);
    });
    
    // Auto-slide
    startAutoSlide();
    
    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                goToMemory(currentMemoryIndex + 1);
            } else {
                goToMemory(currentMemoryIndex - 1);
            }
        }
    }
}

function goToMemory(index) {
    if (index >= memoryImages.length) index = 0;
    if (index < 0) index = memoryImages.length - 1;
    
    currentMemoryIndex = index;
    
    // Update dots
    document.querySelectorAll('.progress-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    // Update card with animation
    const card = document.getElementById('memoryCard');
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        updateMemoryCard(index);
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
    }, 300);
    
    // Reset auto-slide
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

function updateMemoryCard(index) {
    const cardImage = document.getElementById('currentMemoryImage');
    const memoryText = document.getElementById('memoryText');
    const memoryNumber = document.getElementById('memoryNumber');
    
    if (cardImage && memoryImages[index]) {
        cardImage.src = memoryImages[index];
    }
    
    if (memoryText && slideTexts[index % slideTexts.length]) {
        memoryText.textContent = slideTexts[index % slideTexts.length];
    }
    
    if (memoryNumber) {
        memoryNumber.textContent = String(index + 1).padStart(2, '0');
    }
}

function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
        goToMemory(currentMemoryIndex + 1);
    }, 5000);
}

// ========================================
// FUN SECTION
// ========================================
function initFunSection() {
    const funGrid = document.getElementById('funGrid');
    if (!funGrid) return;
    
    const lines = appData?.funSection?.sarcasticLines || [
        "We already act like a couple",
        "This is just paperwork now"
    ];
    
    const emojis = ['😏', '🤭', '😜', '😎', '🤷', '💅'];
    
    lines.forEach((line, index) => {
        const card = document.createElement('div');
        card.className = 'fun-card';
        card.innerHTML = `
            <span class="card-emoji">${emojis[index % emojis.length]}</span>
            <p class="card-text">${line}</p>
        `;
        card.style.transitionDelay = `${index * 0.1}s`;
        funGrid.appendChild(card);
    });
    
    // Create floating emojis
    createFloatingEmojis();
}

function createFloatingEmojis() {
    const container = document.getElementById('floatingEmojis');
    if (!container) return;
    
    const emojis = ['😏', '💅', '✨', '💕', '🤭', '😜', '😏', '😏', '💖', '✨'];
    
    emojis.forEach((emoji, index) => {
        const el = document.createElement('div');
        el.className = 'floating-emoji';
        el.textContent = emoji;
        el.style.left = `${5 + (index * 10)}%`;
        el.style.top = `${15 + Math.random() * 70}%`;
        el.style.animationDelay = `${index * 0.7}s`;
        container.appendChild(el);
    });
}

// ========================================
// EMOTIONAL SECTION
// ========================================
function initEmotionalSection() {
    const titleEl = document.getElementById('emotionalTitle');
    const paragraphsContainer = document.getElementById('emotionalParagraphs');
    const messagesContainer = document.getElementById('emotionalMessages');
    const handshakeNote = document.getElementById('handshakeNote');
    const imageEl = document.getElementById('emotionalImage');
    
    if (titleEl && appData?.emotionalSection?.title) {
        titleEl.textContent = appData.emotionalSection.title;
    }
    
    // Add paragraphs
    if (paragraphsContainer && appData?.emotionalSection?.paragraphs) {
        appData.emotionalSection.paragraphs.forEach((paragraph, index) => {
            const pEl = document.createElement('p');
            pEl.className = 'emotional-paragraph';
            pEl.textContent = paragraph;
            pEl.style.transitionDelay = `${index * 0.2}s`;
            paragraphsContainer.appendChild(pEl);
        });
    }
    
    // Add messages
    if (messagesContainer && appData?.emotionalSection?.messages) {
        appData.emotionalSection.messages.forEach((message, index) => {
            const msgEl = document.createElement('div');
            msgEl.className = 'emotional-message';
            msgEl.textContent = message;
            msgEl.style.transitionDelay = `${index * 0.15}s`;
            messagesContainer.appendChild(msgEl);
        });
    }
    
    // Add handshake note
    if (handshakeNote && appData?.emotionalSection?.handshakeNote) {
        handshakeNote.textContent = appData.emotionalSection.handshakeNote;
    }
    
    // Set random image
    if (imageEl) {
        const randomImage = images[Math.floor(Math.random() * images.length)];
        imageEl.src = randomImage;
    }
}

// ========================================
// WHY SAY YES SECTION
// ========================================
function initWhySection() {
    const titleEl = document.getElementById('whyTitle');
    const subtitleEl = document.getElementById('whySubtitle');
    const reasonsGrid = document.getElementById('reasonsGrid');
    const closingNote = document.getElementById('closingNote');
    
    if (!appData?.whySayYes) return;
    
    // Set title and subtitle
    if (titleEl) titleEl.textContent = appData.whySayYes.title;
    if (subtitleEl) subtitleEl.textContent = appData.whySayYes.subtitle;
    
    // Create reason cards
    if (reasonsGrid && appData.whySayYes.reasons) {
        appData.whySayYes.reasons.forEach((reason, index) => {
            const card = document.createElement('div');
            card.className = 'reason-card';
            card.style.transitionDelay = `${index * 0.1}s`;
            card.innerHTML = `
                <span class="reason-icon">${reason.icon}</span>
                <h3 class="reason-title">${reason.title}</h3>
                <p class="reason-description">${reason.description}</p>
            `;
            reasonsGrid.appendChild(card);
        });
    }
    
    // Set closing note
    if (closingNote && appData.whySayYes.closingNote) {
        closingNote.textContent = appData.whySayYes.closingNote;
    }
    
    // Observe for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });
    
    document.querySelectorAll('.reason-card, .emotional-paragraph, .handshake-note').forEach(el => {
        observer.observe(el);
    });
}

// ========================================
// PARALLAX IMAGES
// ========================================
function initParallaxImages() {
    const parallaxImages = document.querySelectorAll('.parallax-img img');
    const shuffledImages = shuffleArray([...images]).slice(0, 3);
    
    parallaxImages.forEach((img, index) => {
        if (shuffledImages[index]) {
            img.src = shuffledImages[index];
        }
    });
    
    // Parallax scroll effect
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        document.querySelectorAll('.parallax-img').forEach((img, index) => {
            const rate = (scrolled * (0.1 + index * 0.05));
            img.style.transform = `translateY(${rate}px) rotate(${img.classList.contains('img-1') ? -10 : img.classList.contains('img-2') ? 8 : -5}deg)`;
        });
    });
}

// ========================================
// BUTTONS
// ========================================
function initButtons() {
    // Start Journey button
    document.getElementById('startJourney')?.addEventListener('click', () => {
        document.getElementById('memoryLane')?.scrollIntoView({ behavior: 'smooth' });
    });
    
    // Yes button
    document.getElementById('yesButton')?.addEventListener('click', handleYesClick);
    
    // Reject buttons
    initRejectButtons();
}

function initRejectButtons() {
    const container = document.getElementById('rejectButtons');
    if (!container || !appData?.rejectButtons) return;
    
    appData.rejectButtons.forEach(button => {
        const btn = document.createElement('button');
        btn.className = 'reject-btn';
        btn.textContent = `${button.emoji} ${button.text}`;
        btn.addEventListener('click', () => handleNoClick(button));
        container.appendChild(btn);
    });
}

// ========================================
// YES BUTTON HANDLING
// ========================================
let initialYesButton = null; // Track which button was initially clicked

function handleYesClick(buttonText = 'Initial YES Button') {
    const overlay = document.getElementById('yesOverlay');
    const doubtContent = document.getElementById('doubtContent');
    const celebrationContent = document.getElementById('celebrationContent');
    
    if (!overlay || !appData?.yesResponse) return;
    
    // Add to journey path
    addToJourney(buttonText, 'YES_CLICK');
    
    // Track phase 1: Initial YES click
    initialYesButton = buttonText;
    sessionRef?.update({
        phase_1_initial_click: buttonText,
        phase_1_timestamp: getISTTimestamp()
    }).catch(err => console.error('Phase 1 tracking error:', err));
    
    overlay.classList.add('active');
    doubtContent.style.display = 'block';
    celebrationContent.style.display = 'none';
    
    // Populate doubt content
    document.getElementById('doubtTitle').textContent = appData.yesResponse.doubtTitle;
    document.getElementById('doubtMessage').textContent = appData.yesResponse.doubtMessage;
    
    // Create improve buttons
    const improveContainer = document.getElementById('improveButtons');
    if (improveContainer) {
        improveContainer.innerHTML = '';
        appData.yesResponse.improveOptions.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'improve-btn';
            btn.textContent = `${option.emoji} ${option.text}`;
            btn.addEventListener('click', () => handleConfirmedYes(option));
            improveContainer.appendChild(btn);
        });
    }
    
    // Create fallback buttons
    const fallbackContainer = document.getElementById('secondThoughtsButtons');
    if (fallbackContainer && appData?.rejectButtons) {
        fallbackContainer.innerHTML = '';
        appData.rejectButtons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = 'reject-btn';
            btn.textContent = `${button.emoji} ${button.text}`;
            btn.addEventListener('click', () => {
                overlay.classList.remove('active');
                handleNoClick(button);
            });
            fallbackContainer.appendChild(btn);
        });
    }
}

function handleConfirmedYes(option) {
    const doubtContent = document.getElementById('doubtContent');
    const celebrationContent = document.getElementById('celebrationContent');
    
    if (!celebrationContent || !appData?.yesResponse) return;
    
    // Track phase 2: Confirmed YES with exact button text
    sessionRef?.update({
        phase_2_confirmed_click: option?.text || 'Confirmed YES',
        phase_2_timestamp: getISTTimestamp(),
        final_choice: 'YES',
        final_timestamp: getISTTimestamp()
    }).catch(err => console.error('Phase 2 tracking error:', err));
    
    doubtContent.style.display = 'none';
    celebrationContent.style.display = 'block';
    
    // Populate celebration content
    document.getElementById('celebrationTitle').textContent = appData.yesResponse.celebrationTitle;
    document.getElementById('celebrationMessage').textContent = appData.yesResponse.celebrationMessage;
    document.getElementById('finalNote').textContent = appData.yesResponse.finalNote;
    
    // Create confetti
    createConfetti();
    
    // Show after yes popup
    showAfterYesPopup();
    
    // Store response (legacy format)
    storeResponse('YES', option?.text || 'Confirmed YES');
}

function createConfetti() {
    const container = document.getElementById('confetti');
    if (!container) return;
    
    const colors = ['#ff6b9d', '#c44569', '#f8b500', '#667eea', '#4facfe', '#00f2fe', '#f093fb', '#ff8a80'];
    const shapes = ['circle', 'square', 'triangle'];
    
    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (8 + Math.random() * 8) + 'px';
            confetti.style.height = (8 + Math.random() * 8) + 'px';
            
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            if (shape === 'circle') {
                confetti.style.borderRadius = '50%';
            } else if (shape === 'triangle') {
                confetti.style.width = '0';
                confetti.style.height = '0';
                confetti.style.backgroundColor = 'transparent';
                confetti.style.borderLeft = '6px solid transparent';
                confetti.style.borderRight = '6px solid transparent';
                confetti.style.borderBottom = `10px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
            }
            
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            
            container.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 4000);
        }, i * 20);
    }
}

// ========================================
// NO BUTTON HANDLING
// ========================================
function handleNoClick(button) {
    const overlay = document.getElementById('noOverlay');
    const termsContent = document.getElementById('termsContent');
    const reassuranceContent = document.getElementById('reassuranceContent');
    const finalNoContent = document.getElementById('finalNoContent');
    
    if (!overlay || !appData?.termsAndConditions) return;
    
    // Add to journey path
    addToJourney(button?.text || 'Unknown NO Button', 'NO_CLICK');
    
    overlay.classList.add('active');
    termsContent.style.display = 'block';
    reassuranceContent.style.display = 'none';
    finalNoContent.style.display = 'none';
    
    // Populate terms
    document.getElementById('termsTitle').textContent = appData.termsAndConditions.title;
    
    const termsScroll = document.getElementById('termsScroll');
    if (termsScroll) {
        termsScroll.innerHTML = '';
        appData.termsAndConditions.content.forEach(line => {
            const p = document.createElement('p');
            p.textContent = line;
            termsScroll.appendChild(p);
        });
    }
    
    document.getElementById('acceptTerms').textContent = appData.termsAndConditions.acceptButtonText;
    document.getElementById('acceptTerms').onclick = () => {
        // Track that she accepted terms (rejected the proposal)
        setFinalChoice(`REJECT_ACCEPTED_TERMS: ${button?.text || 'Unknown'}`);
        showReassurance(button);
    };
    
    // Add deny terms button (denying terms = saying YES!)
    let denyBtn = document.getElementById('denyTerms');
    if (!denyBtn) {
        denyBtn = document.createElement('button');
        denyBtn.id = 'denyTerms';
        denyBtn.className = 'deny-terms-btn';
        denyBtn.style.cssText = 'margin-top: 15px; padding: 12px 30px; font-family: var(--font-body); font-size: 1rem; background: var(--gradient-romantic); border: none; border-radius: 50px; color: white; cursor: pointer; transition: all 0.3s ease;';
        denyBtn.textContent = '💪 I Deny These Terms! (This means YES)';
        document.getElementById('acceptTerms').parentNode.insertBefore(denyBtn, document.getElementById('acceptTerms').nextSibling);
    }
    
    denyBtn.onclick = () => {
        // Denying terms = saying YES!
        addToJourney('I Deny These Terms! (This means YES)', 'DENY_TERMS_YES');
        overlay.classList.remove('active');
        handleYesClick('I Deny These Terms! (This means YES)');
    };
}

function showReassurance(button) {
    const termsContent = document.getElementById('termsContent');
    const reassuranceContent = document.getElementById('reassuranceContent');
    const finalNoContent = document.getElementById('finalNoContent');
    
    if (!reassuranceContent || !appData?.noResponse) return;
    
    termsContent.style.display = 'none';
    reassuranceContent.style.display = 'block';
    finalNoContent.style.display = 'none';
    
    document.getElementById('reassuranceTitle').textContent = appData.noResponse.reassuranceTitle;
    document.getElementById('reassuranceMessage').textContent = appData.noResponse.reassuranceMessage;
    document.getElementById('continueToFinal').onclick = () => showFinalNo(button);
}

function showFinalNo(button) {
    const termsContent = document.getElementById('termsContent');
    const reassuranceContent = document.getElementById('reassuranceContent');
    const finalNoContent = document.getElementById('finalNoContent');
    
    if (!finalNoContent || !appData?.noResponse) return;
    
    termsContent.style.display = 'none';
    reassuranceContent.style.display = 'none';
    finalNoContent.style.display = 'block';
    
    document.getElementById('finalParagraph').textContent = appData.noResponse.finalParagraph;
    
    // Store response
    storeResponse('NO', button?.text || 'Rejected');
}

// ========================================
// FIREBASE STORAGE
// ========================================
function storeResponse(response, details = '') {
    if (!database) {
        console.log('Firebase not initialized - response not stored');
        return;
    }
    
    // Store in old format for backward compatibility
    const data = {
        response: response,
        details: details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`
    };
    
    database.ref('proposals').push(data)
        .then(() => console.log('Response stored successfully'))
        .catch((error) => console.error('Error storing response:', error));
    
    // Also update the session with final choice
    const finalChoice = response === 'YES' ? 'YES' : `REJECT_${details}`;
    setFinalChoice(finalChoice);
}

// ========================================
// GIF POPUP SYSTEM
// ========================================
let gifPopupSystem = {
    initialized: false,
    shownPopups: [],
    lastPopupTime: 0,
    totalPopupsShown: 0
};

function initGifPopupSystem() {
    if (gifPopupSystem.initialized || !appData?.gifPopups) return;
    gifPopupSystem.initialized = true;
    
    // Setup close button
    document.getElementById('gifPopupClose')?.addEventListener('click', closeGifPopup);
    
    // Setup scroll observer for section-based popups
    setupSectionObservers();
    
    // Setup scroll percentage listener
    window.addEventListener('scroll', handleGifPopupScroll, { passive: true });
}

function setupSectionObservers() {
    const popups = appData.gifPopups.popups || [];
    
    popups.forEach(popup => {
        if (popup.trigger === 'section' && popup.section) {
            const section = document.getElementById(popup.section);
            if (section) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !gifPopupSystem.shownPopups.includes(popup.id)) {
                            showGifPopup(popup);
                        }
                    });
                }, { threshold: 0.3 });
                observer.observe(section);
            }
        }
    });
}

function handleGifPopupScroll() {
    const popups = appData.gifPopups.popups || [];
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    popups.forEach(popup => {
        if (popup.trigger === 'scroll' && popup.scrollPercent) {
            if (scrollPercent >= popup.scrollPercent && scrollPercent < popup.scrollPercent + 5) {
                if (!gifPopupSystem.shownPopups.includes(popup.id)) {
                    showGifPopup(popup);
                }
            }
        }
    });
}

function showGifPopup(popup) {
    const now = Date.now();
    const minInterval = appData.gifPopups.minInterval || 10000;
    
    // Check if we can show popup (respecting interval)
    if (now - gifPopupSystem.lastPopupTime < minInterval) return;
    
    // Check max popups
    const maxPopups = appData.gifPopups.maxPopups || 7;
    if (gifPopupSystem.totalPopupsShown >= maxPopups) return;
    
    // Mark as shown
    gifPopupSystem.shownPopups.push(popup.id);
    gifPopupSystem.lastPopupTime = now;
    gifPopupSystem.totalPopupsShown++;
    
    // Show popup
    const overlay = document.getElementById('gifPopupOverlay');
    const image = document.getElementById('gifPopupImage');
    const text = document.getElementById('gifPopupText');
    
    if (!overlay || !image || !text) return;
    
    image.src = popup.gif;
    text.textContent = popup.text;
    overlay.classList.add('active');
    
    // Auto close after 6 seconds
    setTimeout(() => closeGifPopup(), 6000);
}

function closeGifPopup() {
    const overlay = document.getElementById('gifPopupOverlay');
    if (overlay) overlay.classList.remove('active');
}

function showAfterYesPopup() {
    const popups = appData?.gifPopups?.popups || [];
    const afterYesPopup = popups.find(p => p.trigger === 'event' && p.event === 'yesClick');
    if (afterYesPopup && !gifPopupSystem.shownPopups.includes(afterYesPopup.id)) {
        setTimeout(() => showGifPopup(afterYesPopup), 1000);
    }
}

// ========================================
// POPUP SYSTEM
// ========================================
let popupSystemInitialized = false;
let usedFloatingMessages = [];
let usedFullscreenPopups = [];
let usedFakeAlerts = [];
let lastScrollY = 0;
let scrollThreshold = 0;

function initPopupSystem() {
    if (popupSystemInitialized || !appData?.popups) return;
    popupSystemInitialized = true;
    
    // Setup event listeners
    document.getElementById('popupClose')?.addEventListener('click', closeFloatingPopup);
    document.getElementById('fullscreenContinue')?.addEventListener('click', closeFullscreenPopup);
    document.getElementById('alertDismiss')?.addEventListener('click', closeFakeAlert);
    
    // Start timed popups
    startTimedPopups();
    
    // Scroll-based popups
    window.addEventListener('scroll', handleScrollPopups, { passive: true });
}

function startTimedPopups() {
    // Show floating message after 8 seconds
    setTimeout(() => {
        if (!document.querySelector('.floating-popup.active')) {
            showFloatingPopup();
        }
    }, 8000);
    
    // Show fullscreen popup after 25 seconds
    setTimeout(() => {
        showFullscreenPopup();
    }, 25000);
    
    // Show fake alert after 45 seconds
    setTimeout(() => {
        showFakeAlert();
    }, 45000);
    
    // Show interrupt moment after 60 seconds
    setTimeout(() => {
        showInterruptMoment();
    }, 60000);
}

function handleScrollPopups() {
    const currentScrollY = window.scrollY;
    const scrollDiff = Math.abs(currentScrollY - lastScrollY);
    
    // Trigger popups based on scroll distance
    if (scrollDiff > 500 && Math.random() > 0.7) {
        if (!document.querySelector('.floating-popup.active')) {
            showFloatingPopup();
        }
        lastScrollY = currentScrollY;
    }
    
    // Random fullscreen popup at certain scroll positions
    const scrollPercent = (currentScrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercent > 30 && scrollPercent < 35 && Math.random() > 0.8) {
        if (!document.querySelector('.fullscreen-popup.active')) {
            showFullscreenPopup();
        }
    }
    
    if (scrollPercent > 60 && scrollPercent < 65 && Math.random() > 0.8) {
        if (!document.querySelector('.fake-alert.active')) {
            showFakeAlert();
        }
    }
}

function showFloatingPopup() {
    const popup = document.getElementById('floatingPopup');
    const textEl = document.getElementById('popupText');
    
    if (!popup || !textEl || !appData?.popups?.floatingMessages) return;
    
    // Get unused message
    let messages = appData.popups.floatingMessages.filter((_, i) => !usedFloatingMessages.includes(i));
    if (messages.length === 0) {
        usedFloatingMessages = [];
        messages = appData.popups.floatingMessages;
    }
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    const originalIndex = appData.popups.floatingMessages.indexOf(messages[randomIndex]);
    usedFloatingMessages.push(originalIndex);
    
    textEl.textContent = messages[randomIndex];
    popup.classList.add('active');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        closeFloatingPopup();
    }, 5000);
}

function closeFloatingPopup() {
    const popup = document.getElementById('floatingPopup');
    if (popup) popup.classList.remove('active');
}

function showFullscreenPopup() {
    const popup = document.getElementById('fullscreenPopup');
    const textEl = document.getElementById('fullscreenText');
    
    if (!popup || !textEl || !appData?.popups?.fullscreenPopups) return;
    
    // Get unused message
    let messages = appData.popups.fullscreenPopups.filter((_, i) => !usedFullscreenPopups.includes(i));
    if (messages.length === 0) {
        usedFullscreenPopups = [];
        messages = appData.popups.fullscreenPopups;
    }
    
    const randomIndex = Math.floor(Math.random() * messages.length);
    const originalIndex = appData.popups.fullscreenPopups.indexOf(messages[randomIndex]);
    usedFullscreenPopups.push(originalIndex);
    
    textEl.textContent = messages[randomIndex];
    popup.classList.add('active');
}

function closeFullscreenPopup() {
    const popup = document.getElementById('fullscreenPopup');
    if (popup) popup.classList.remove('active');
}

function showInterruptMoment() {
    const popup = document.getElementById('interruptPopup');
    const textEl = document.getElementById('interruptText');
    
    if (!popup || !textEl || !appData?.popups?.interruptMoments) return;
    
    const message = appData.popups.interruptMoments[Math.floor(Math.random() * appData.popups.interruptMoments.length)];
    
    popup.classList.add('active');
    textEl.textContent = '';
    
    // Type out text
    let charIndex = 0;
    const typeInterval = setInterval(() => {
        if (charIndex < message.length) {
            textEl.textContent += message[charIndex];
            charIndex++;
        } else {
            clearInterval(typeInterval);
            // Auto close after 2 seconds
            setTimeout(() => {
                closeInterruptMoment();
            }, 2000);
        }
    }, 80);
}

function closeInterruptMoment() {
    const popup = document.getElementById('interruptPopup');
    if (popup) popup.classList.remove('active');
}

function showFakeAlert() {
    const popup = document.getElementById('fakeAlert');
    const titleEl = document.getElementById('alertTitle');
    const messageEl = document.getElementById('alertMessage');
    const progressEl = document.getElementById('alertProgress');
    const resultEl = document.getElementById('alertResult');
    const dismissBtn = document.getElementById('alertDismiss');
    
    if (!popup || !appData?.popups?.fakeAlerts) return;
    
    // Get unused alert
    let alerts = appData.popups.fakeAlerts.filter((_, i) => !usedFakeAlerts.includes(i));
    if (alerts.length === 0) {
        usedFakeAlerts = [];
        alerts = appData.popups.fakeAlerts;
    }
    
    const randomIndex = Math.floor(Math.random() * alerts.length);
    const alert = alerts[randomIndex];
    const originalIndex = appData.popups.fakeAlerts.indexOf(alert);
    usedFakeAlerts.push(originalIndex);
    
    titleEl.textContent = alert.title;
    messageEl.textContent = alert.message;
    resultEl.textContent = '';
    resultEl.classList.remove('visible');
    dismissBtn.classList.remove('visible');
    progressEl.style.width = '0%';
    
    popup.classList.add('active');
    
    // Animate progress bar
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Show result
            setTimeout(() => {
                resultEl.textContent = alert.result;
                resultEl.classList.add('visible');
                dismissBtn.classList.add('visible');
            }, 300);
        }
        progressEl.style.width = progress + '%';
    }, 100);
}

function closeFakeAlert() {
    const popup = document.getElementById('fakeAlert');
    if (popup) popup.classList.remove('active');
}

// ========================================
// MICRO-INTERACTIONS
// ========================================
function initMicroInteractions() {
    initCursorGlow();
    initScrollProgress();
    initRippleEffect();
    initImageTilt();
    initBackgroundMouseMove();
}

// Cursor Glow Effect
function initCursorGlow() {
    const cursorGlow = document.getElementById('cursorGlow');
    if (!cursorGlow) return;
    
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorGlow.classList.add('active');
    });
    
    document.addEventListener('mouseleave', () => {
        cursorGlow.classList.remove('active');
    });
    
    // Smooth follow animation
    function animateGlow() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(animateGlow);
    }
    animateGlow();
}

// Scroll Progress Indicator
function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgressBar');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    }, { passive: true });
}

// Button Ripple Effect
function initRippleEffect() {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// Image Tilt Effect
function initImageTilt() {
    const tiltElements = document.querySelectorAll('.framed-image, .polaroid, .reason-card, .fun-card');
    
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });
}

// Background Mouse Movement
function initBackgroundMouseMove() {
    const gradientLayer = document.querySelector('.gradient-layer');
    if (!gradientLayer) return;
    
    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        
        gradientLayer.style.transform = `translate(${x}px, ${y}px)`;
    });
}

// ========================================
// PRE-ENTRY EXPERIENCE
// ========================================
function initPreEntry() {
    const preEntry = document.getElementById('preEntry');
    if (!preEntry) return;
    
    // Create entry particles
    createEntryParticles();
    
    // Start typewriter animation
    setTimeout(() => {
        typeWriterText1();
    }, 1000);
    
    // Button event listeners
    document.getElementById('openLetterBtn')?.addEventListener('click', showLetterScreen);
    document.getElementById('continueToSiteBtn')?.addEventListener('click', enterMainSite);
    
    // Set letter date
    const letterDate = document.getElementById('letterDate');
    if (letterDate) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        letterDate.textContent = new Date().toLocaleDateString('en-US', options);
    }
    
    // Populate letter content
    populateLetterContent();
}

function createEntryParticles() {
    const container = document.getElementById('entryParticles');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'entry-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

function typeWriterText1() {
    const textEl = document.getElementById('typewriterText1');
    if (!textEl) return;
    
    const text = "Hey Apoorva… 🥰\nYou are about to enter something important…\nOops, you were already in it… my heart 🫶\nBut today, I want to say it properly.";
    
    let i = 0;
    textEl.innerHTML = '<span class="typewriter-cursor"></span>';
    
    const typeInterval = setInterval(() => {
        if (i < text.length) {
            const char = text[i] === '\n' ? '<br>' : text[i];
            textEl.innerHTML = textEl.innerHTML.replace('<span class="typewriter-cursor"></span>', '') + char + '<span class="typewriter-cursor"></span>';
            i++;
        } else {
            clearInterval(typeInterval);
            textEl.innerHTML = textEl.innerHTML.replace('<span class="typewriter-cursor"></span>', '');
            // Start second text after a delay
            setTimeout(typeWriterText2, 800);
        }
    }, 50);
}

function typeWriterText2() {
    const textEl = document.getElementById('typewriterText2');
    if (!textEl) return;
    
    const text = "Are you ready to see my confession?? 🥰🫶";
    
    let i = 0;
    textEl.innerHTML = '<span class="typewriter-cursor"></span>';
    
    const typeInterval = setInterval(() => {
        if (i < text.length) {
            textEl.innerHTML = textEl.innerHTML.replace('<span class="typewriter-cursor"></span>', '') + text[i] + '<span class="typewriter-cursor"></span>';
            i++;
        } else {
            clearInterval(typeInterval);
            textEl.innerHTML = textEl.innerHTML.replace('<span class="typewriter-cursor"></span>', '');
            // Show button
            const btn = document.getElementById('openLetterBtn');
            if (btn) btn.style.opacity = '1';
        }
    }, 60);
}

function showLetterScreen() {
    const screen1 = document.getElementById('entryScreen1');
    const screen2 = document.getElementById('entryScreen2');
    
    if (screen1) screen1.classList.add('exit');
    
    setTimeout(() => {
        if (screen1) screen1.classList.remove('active');
        if (screen2) screen2.classList.add('active');
    }, 500);
    
    // Track progress
    updateProgress('letter_opened');
}

function populateLetterContent() {
    const contentEl = document.getElementById('letterContent');
    if (!contentEl || !appData?.letter) return;
    
    contentEl.innerHTML = appData.letter.content;
}

function enterMainSite() {
    const preEntry = document.getElementById('preEntry');
    if (preEntry) {
        preEntry.classList.add('hidden');
    }
    
    // Track progress
    updateProgress('entered_main_site');
    
    // Initialize section tracking
    initSectionTracking();
}

// ========================================
// SECTION TRACKING
// ========================================
let trackedSections = [];

function initSectionTracking() {
    const sectionsToTrack = [
        { id: 'memoryLane', name: 'memory_section' },
        { id: 'funSection', name: 'fun_section' },
        { id: 'emotionalSection', name: 'emotional_section' },
        { id: 'decisionSection', name: 'final_section' }
    ];
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionName = entry.target.dataset.trackName;
                if (sectionName && !trackedSections.includes(sectionName)) {
                    trackedSections.push(sectionName);
                    updateProgress(sectionName);
                }
            }
        });
    }, { threshold: 0.3 });
    
    sectionsToTrack.forEach(section => {
        const el = document.getElementById(section.id);
        if (el) {
            el.dataset.trackName = section.name;
            sectionObserver.observe(el);
        }
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(autoSlideInterval);
    } else {
        startAutoSlide();
    }
});

// Touch support for mobile
document.addEventListener('touchmove', () => {
    const elements = document.querySelectorAll('.fun-card:not(.visible), .emotional-message:not(.visible)');
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            el.classList.add('visible');
        }
    });
}, { passive: true });

// Console message
console.log('%c💕 Made with love for Apoorva 💕', 
    'background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; padding: 15px 25px; border-radius: 8px; font-size: 18px; font-family: serif;');
console.log('%cThe answer should always be YES! 😏', 
    'color: #ff6b9d; font-size: 14px; font-style: italic;');