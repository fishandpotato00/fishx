let currentPage = 'home';
let currentWordIndex = 0;
let reciteWordList = [];
let reciteMode = 'order';
let reviewQueue = [];
let reviewIndex = 0;
let reviewCorrect = 0;
let randomHistory = [];
let searchFilter = '';
let searchResults = [];
let searchPage = 1;
let currentLetter = '';

let memoryGame = {
    cards: [],
    flipped: [],
    matched: [],
    moves: 0,
    timer: null,
    timeElapsed: 0,
    difficulty: 'medium'
};

let dungeonGame = {
    playerClass: null,
    playerHP: 0,
    playerMaxHP: 0,
    playerATK: 0,
    playerDEF: 0,
    floor: 1,
    enemy: null,
    enemyHP: 0,
    enemyMaxHP: 0,
    hand: [],
    deck: [],
    discardPile: [],
    shield: false,
    powerUp: false,
    poison: false,
    stunEnemy: false,
    isPlayerTurn: true
};

let typingGame = {
    mode: 'normal',
    score: 0,
    timeLeft: 60,
    words: [],
    currentWordIndex: 0,
    totalTyped: 0,
    correctTyped: 0,
    timer: null,
    isPlaying: false
};

let gachaTab = 'gacha-main';
let collectionRarityFilter = 'all';
let collectionLetterFilter = '';
let collectionPage = 1;

let audioPlayer = {
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    loopMode: 'none',
    volume: 0.8
};

function init() {
    setupNavigation();
    setupThemeToggle();
    setupSidebarToggle();
    updateDashboard();
    initAlphabetFilters();
    initAudioPlayer();
    initMemoryGame();
    initWordRecite();
    initWordReview();
    initRandomWord();
    initWordSearch();
    initAudioLists();
    initProverbs();
    initPhrases();
    initAchievements();
    initGacha();
    initTypingGame();
    initDungeon();
    unlockAchievement(1);
}

function setupThemeToggle() {
    const themeHandle = document.getElementById('theme-handle');
    let isDark = true;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        isDark = false;
        document.body.classList.add('light-theme');
        if (themeHandle) {
            themeHandle.querySelector('.handle-icon').textContent = '☀️';
        }
    }

    themeHandle?.addEventListener('click', () => {
        isDark = !isDark;
        document.body.classList.toggle('light-theme');
        
        if (themeHandle) {
            themeHandle.querySelector('.handle-icon').textContent = isDark ? '🌙' : '☀️';
        }
        
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

function playUISound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'collapse') {
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
        } else if (type === 'expand') {
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        } else if (type === 'click') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.05);
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function setupSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const expandBtn = document.getElementById('sidebar-expand-btn');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    if (!sidebar) {
        console.log('Sidebar not found');
        return;
    }
    
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
        expandBtn?.classList.add('show');
    }
    
    toggleBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    });
    
    expandBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        expandSidebar();
    });
    
    mobileMenuBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileSidebar();
    });
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(e.target) && mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
                closeMobileSidebar();
            }
        }
    });
    
    sidebar.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }
        });
    });
    
    function toggleSidebar() {
        if (sidebar.classList.contains('collapsed')) {
            expandSidebar();
        } else {
            collapseSidebar();
        }
    }
    
    function collapseSidebar() {
        sidebar.classList.add('collapsed');
        expandBtn?.classList.add('show');
        localStorage.setItem('sidebarCollapsed', 'true');
        playUISound('collapse');
    }
    
    function expandSidebar() {
        sidebar.classList.remove('collapsed');
        expandBtn?.classList.remove('show');
        localStorage.setItem('sidebarCollapsed', 'false');
        playUISound('expand');
    }
    
    function toggleMobileSidebar() {
        if (sidebar.classList.contains('mobile-open')) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    }
    
    function openMobileSidebar() {
        sidebar.classList.add('mobile-open');
        playUISound('click');
    }
    
    function closeMobileSidebar() {
        sidebar.classList.remove('mobile-open');
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });
}

function navigateTo(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    const targetPage = document.getElementById('page-' + page);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    currentPage = page;

    switch(page) {
        case 'word-recite':
            initWordRecite();
            break;
        case 'word-review':
            initWordReview();
            break;
        case 'word-random':
            initRandomWord();
            break;
        case 'word-search':
            initWordSearch();
            break;
        case 'memory-cards':
            initMemoryGame();
            break;
        case 'word-dungeon':
            initDungeon();
            break;
        case 'typing-game':
            initTypingGame();
            break;
        case 'proverbs':
            initProverbs();
            break;
        case 'phrases':
            initPhrases();
            break;
        case 'achievements':
            initAchievements();
            break;
        case 'gacha':
            initGacha();
            break;
        case 'audio-listening':
        case 'audio-speaking':
            initAudioLists();
            break;
        case 'word-notebook':
            initNotebook();
            break;
    }
}
