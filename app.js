let currentPage = 'home';
let currentWordIndex = 0;
let reciteWordList = [];
let reciteMode = 'order';
let reciteSelectedLetter = '';
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
    isPlayerTurn: true,
    energy: 3,
    maxEnergy: 3,
    cardsPlayed: 0,
    regeneration: false,
    damageReduction: 0,
    damageImmunity: false,
    damageBoost: 0,
    stunTurns: 0
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
let collectionType = 'word';

let dungeonMode = 'normal';

let achievementsCategory = 'all';
let achievementsSearch = '';
let achievementsFilter = 'all';
let achievementsInitialized = false;

let audioPlayer = {
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    loopMode: 'none',
    volume: 0.8
};

let audioElement = null;
let wordIndexMap = {};

function buildWordIndexMap() {
    if (!vocabulary3500 || !vocabulary3500.words) return;
    vocabulary3500.words.forEach(function(word, index) {
        wordIndexMap[word.word.toLowerCase()] = index + 1;
    });
}

function getWordIndex(word) {
    return wordIndexMap[word.toLowerCase()] || 0;
}

function formatWordNumber(num) {
    return String(num).padStart(4, '0');
}

function setupThemeToggle() {
    console.log('Setting up theme toggle...');
    var themeHandle = document.getElementById('theme-handle');
    console.log('Theme handle:', themeHandle);
    var isLight = false;

    var savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        isLight = true;
        document.body.classList.add('light-theme');
        if (themeHandle) {
            var iconEl = themeHandle.querySelector('.handle-icon');
            if (iconEl) iconEl.textContent = '☀️';
        }
    }

    if (themeHandle) {
        console.log('Adding click listener to theme handle');
        themeHandle.addEventListener('click', function() {
            console.log('Theme handle clicked');
            isLight = !isLight;
            document.body.classList.toggle('light-theme');
            
            var iconEl = themeHandle.querySelector('.handle-icon');
            if (iconEl) {
                iconEl.textContent = isLight ? '☀️' : '🌙';
            }
            
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }
}

function setupSidebarToggle() {
    console.log('Setting up sidebar toggle...');
    var sidebar = document.getElementById('sidebar');
    var toggleBtn = document.getElementById('sidebar-toggle');
    var expandBtn = document.getElementById('sidebar-expand-btn');
    var mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    console.log('Sidebar:', sidebar);
    console.log('Toggle button:', toggleBtn);
    console.log('Expand button:', expandBtn);
    
    if (!sidebar) {
        console.log('Sidebar not found');
        return;
    }
    
    var savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
        sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
        if (expandBtn) {
            expandBtn.classList.add('show');
            expandBtn.classList.add('visible');
            expandBtn.classList.add('position-collapsed');
        }
    }
    
    if (toggleBtn) {
        console.log('Adding click listener to toggle button');
        toggleBtn.addEventListener('click', function(e) {
            console.log('Toggle button clicked');
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        });
    }
    
    if (expandBtn) {
        console.log('Adding click listener to expand button');
        expandBtn.addEventListener('click', function(e) {
            console.log('Expand button clicked');
            e.preventDefault();
            e.stopPropagation();
            expandSidebar();
        });
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileSidebar();
        });
    }
    
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(e.target) && mobileMenuBtn && !mobileMenuBtn.contains(e.target)) {
                closeMobileSidebar();
            }
        }
    });
    
    sidebar.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                closeMobileSidebar();
            }
        });
    });
    
    function toggleSidebar() {
        console.log('Toggling sidebar, currently collapsed:', sidebar.classList.contains('collapsed'));
        if (sidebar.classList.contains('collapsed')) {
            expandSidebar();
        } else {
            collapseSidebar();
        }
    }
    
    function collapseSidebar() {
        console.log('Collapsing sidebar');
        sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
        if (expandBtn) {
            expandBtn.classList.add('show');
            expandBtn.classList.add('visible');
            expandBtn.classList.add('position-collapsed');
        }
        localStorage.setItem('sidebarCollapsed', 'true');
    }
    
    function expandSidebar() {
        console.log('Expanding sidebar');
        sidebar.classList.remove('collapsed');
        document.body.classList.remove('sidebar-collapsed');
        if (expandBtn) {
            expandBtn.classList.remove('show');
            expandBtn.classList.remove('visible');
            expandBtn.classList.remove('position-collapsed');
        }
        localStorage.setItem('sidebarCollapsed', 'false');
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
    }
    
    function closeMobileSidebar() {
        sidebar.classList.remove('mobile-open');
    }
}

function setupNavigation() {
    console.log('Setting up navigation...');
    var navLinks = document.querySelectorAll('.nav-link');
    console.log('Found ' + navLinks.length + ' nav links');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            console.log('Nav link clicked:', link.dataset.page);
            e.preventDefault();
            var page = link.dataset.page;
            console.log('Navigating to: ' + page);
            navigateTo(page);
        });
    });
}

function updateDashboard() {
    updateScoreDisplay();
    
    var learnedEl = document.getElementById('stat-learned-new');
    var streakEl = document.getElementById('stat-streak-new');
    var achEl = document.getElementById('stat-achievements-new');
    
    if (learnedEl) learnedEl.textContent = gameState.reciteProgress;
    if (streakEl) streakEl.textContent = gameState.streak;
    if (achEl) achEl.textContent = gameState.achievements.length;
}

function initAlphabetFilters() {
    var alphabetContainer = document.getElementById('alphabet-buttons');
    var alphabetFilter = document.getElementById('alphabet-filter');
    var collectionAlphabet = document.getElementById('collection-alphabet');
    
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    if (alphabetFilter) {
        var filterHtml = '<button class="active" data-letter="">全部</button>';
        letters.forEach(function(letter) {
            filterHtml += '<button data-letter="' + letter + '">' + letter + '</button>';
        });
        alphabetFilter.innerHTML = filterHtml;
        alphabetFilter.querySelectorAll('button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                alphabetFilter.querySelectorAll('button').forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                currentLetter = btn.dataset.letter;
                searchPage = 1;
                performSearch();
            });
        });
    }
    
    if (alphabetContainer) {
        var html = '';
        letters.forEach(function(letter) {
            html += '<button data-letter="' + letter + '">' + letter + '</button>';
        });
        alphabetContainer.innerHTML = html;
        alphabetContainer.querySelectorAll('button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                alphabetContainer.querySelectorAll('button').forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                currentLetter = btn.dataset.letter;
                searchPage = 1;
                performSearch();
            });
        });
    }
    
    if (collectionAlphabet) {
        var collHtml = '<button class="active" data-letter="">All</button>';
        letters.forEach(function(letter) {
            collHtml += '<button data-letter="' + letter + '">' + letter + '</button>';
        });
        collectionAlphabet.innerHTML = collHtml;
        collectionAlphabet.querySelectorAll('button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                collectionAlphabet.querySelectorAll('button').forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                collectionLetterFilter = btn.dataset.letter;
                collectionPage = 1;
                updateCollection();
            });
        });
    }
}

function initAudioPlayer() {
    var playerToggle = document.getElementById('player-toggle-square');
    var audioPlayerEl = document.getElementById('audio-player-square');
    var playPauseBtn = document.getElementById('play-btn-square');
    var prevBtn = document.getElementById('prev-btn-square');
    var nextBtn = document.getElementById('next-btn-square');
    var loopBtn = document.getElementById('loop-btn-square');
    var volumeSlider = document.getElementById('volume-slider-square');
    var progressFill = document.getElementById('progress-fill-square');
    var currentTimeEl = document.getElementById('time-current-square');
    var durationEl = document.getElementById('time-total-square');
    var trackNameEl = document.getElementById('track-name-square');
    var squareAudio = document.getElementById('audio-element-square');
    
    if (!squareAudio) {
        squareAudio = document.createElement('audio');
        squareAudio.id = 'audio-element-square';
        document.body.appendChild(squareAudio);
    }
    
    audioElement = squareAudio;
    
    if (playerToggle && audioPlayerEl) {
        playerToggle.addEventListener('click', function() {
            audioPlayerEl.classList.toggle('expanded');
        });
    }
    
    if (playPauseBtn && audioElement) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', playPrevious);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', playNext);
    }
    
    if (loopBtn) {
        loopBtn.addEventListener('click', function() {
            if (audioPlayer.loopMode === 'none') {
                audioPlayer.loopMode = 'one';
                loopBtn.style.opacity = '1';
            } else if (audioPlayer.loopMode === 'one') {
                audioPlayer.loopMode = 'all';
                loopBtn.style.opacity = '1';
            } else {
                audioPlayer.loopMode = 'none';
                loopBtn.style.opacity = '0.5';
            }
        });
    }
    
    if (volumeSlider && audioElement) {
        volumeSlider.addEventListener('input', function() {
            audioPlayer.volume = volumeSlider.value / 100;
            audioElement.volume = audioPlayer.volume;
        });
    }
    
    if (audioElement) {
        audioElement.addEventListener('timeupdate', function() {
            if (audioElement.duration) {
                var percent = (audioElement.currentTime / audioElement.duration) * 100;
                if (progressFill) progressFill.style.width = percent + '%';
                if (currentTimeEl) currentTimeEl.textContent = formatTime(audioElement.currentTime);
            }
        });
        audioElement.addEventListener('ended', handleTrackEnd);
        audioElement.addEventListener('loadedmetadata', function() {
            if (durationEl) durationEl.textContent = formatTime(audioElement.duration);
        });
    }
}

function togglePlayPause() {
    var playPauseBtn = document.getElementById('play-btn-square');
    if (!audioElement) return;
    
    if (audioPlayer.isPlaying) {
        audioElement.pause();
        audioPlayer.isPlaying = false;
        if (playPauseBtn) playPauseBtn.textContent = '\u25B6';
    } else {
        audioElement.play();
        audioPlayer.isPlaying = true;
        if (playPauseBtn) playPauseBtn.textContent = '\u23F8';
    }
}

function playPrevious() {
    if (audioPlayer.playlist.length === 0) return;
    audioPlayer.currentIndex = (audioPlayer.currentIndex - 1 + audioPlayer.playlist.length) % audioPlayer.playlist.length;
    loadAndPlayTrack();
}

function playNext() {
    if (audioPlayer.playlist.length === 0) return;
    audioPlayer.currentIndex = (audioPlayer.currentIndex + 1) % audioPlayer.playlist.length;
    loadAndPlayTrack();
}

function loadAndPlayTrack() {
    if (!audioElement || audioPlayer.playlist.length === 0) return;
    
    var track = audioPlayer.playlist[audioPlayer.currentIndex];
    audioElement.src = track.src;
    
    var trackNameEl = document.getElementById('track-name-square');
    if (trackNameEl) trackNameEl.textContent = track.name;
    
    audioElement.play();
    audioPlayer.isPlaying = true;
    
    var playPauseBtn = document.getElementById('play-btn-square');
    if (playPauseBtn) playPauseBtn.textContent = '\u23F8';
    
    updatePlaylistUI();
}

function updateProgress() {
    if (!audioElement) return;
    
    var progressFill = document.getElementById('progress-bar-fill');
    var currentTimeEl = document.getElementById('progress-current');
    var trackDurationEl = document.getElementById('player-track-duration');
    
    if (audioElement.duration) {
        var percent = (audioElement.currentTime / audioElement.duration) * 100;
        if (progressFill) progressFill.style.width = percent + '%';
        
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audioElement.currentTime);
        if (trackDurationEl) {
            trackDurationEl.textContent = formatTime(audioElement.currentTime) + ' / ' + formatTime(audioElement.duration);
        }
    }
}

function updateTrackDuration() {
    var totalEl = document.getElementById('progress-total');
    if (audioElement && totalEl) {
        totalEl.textContent = formatTime(audioElement.duration);
    }
}

function handleTrackEnd() {
    switch(audioPlayer.loopMode) {
        case 'one':
            if (audioElement) {
                audioElement.currentTime = 0;
                audioElement.play();
            }
            break;
        case 'all':
            playNext();
            break;
        default:
            audioPlayer.isPlaying = false;
            var playPauseBtn = document.getElementById('play-btn-square');
            if (playPauseBtn) playPauseBtn.textContent = '\u25B6';
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function addToPlaylist(name, src) {
    audioPlayer.playlist.push({ name: name, src: src });
    updatePlaylistUI();
}

function updatePlaylistUI() {
    var container = document.getElementById('playlist-items');
    if (!container) return;
    
    var html = '';
    audioPlayer.playlist.forEach(function(track, index) {
        var activeClass = index === audioPlayer.currentIndex ? 'active' : '';
        html += '<div class="playlist-item-square ' + activeClass + '" data-index="' + index + '">';
        html += '<span class="playlist-item-icon-square">\uD83C\uDFB5</span>';
        html += '<span class="playlist-item-name-square">' + track.name + '</span>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    container.querySelectorAll('.playlist-item-square').forEach(function(item) {
        item.addEventListener('click', function() {
            audioPlayer.currentIndex = parseInt(item.dataset.index);
            loadAndPlayTrack();
        });
    });
}

let reciteInitialized = false;

function initWordRecite() {
    if (reciteInitialized) {
        startReciteSession();
        updateReciteStats();
        updateDailyGoal();
        return;
    }
    reciteInitialized = true;
    
    console.log('Initializing word recite...');
    
    var modeBtns = document.querySelectorAll('.mode-tab');
    var showBtn = document.getElementById('recite-show-btn');
    var unknownBtn = document.getElementById('recite-unknown-btn');
    var hardBtn = document.getElementById('recite-hard-btn');
    var knowBtn = document.getElementById('recite-know-btn');
    var audioBtn = document.getElementById('recite-audio-btn');
    var audioBtnBack = document.getElementById('recite-audio-btn-back');
    var resetBtn = document.getElementById('recite-reset');
    var letterPicker = document.getElementById('letter-picker');
    var letterGrid = document.getElementById('letter-grid');
    var favoriteBtn = document.getElementById('recite-favorite-btn');
    var favoriteBtnBack = document.getElementById('recite-favorite-btn-back');
    var settingsBtn = document.getElementById('recite-settings-btn');
    var autoSpeakBtn = document.getElementById('auto-speak-btn');
    var goalSettingBtn = document.getElementById('goal-setting-btn');
    var closeStatsPanel = document.getElementById('close-stats-panel');
    var closeSettingsModal = document.getElementById('close-settings-modal');
    var saveSettingsBtn = document.getElementById('save-settings-btn');
    var statsPanel = document.getElementById('recite-stats-panel');
    var settingsModal = document.getElementById('recite-settings-modal');
    
    console.log('Show button:', showBtn);
    console.log('Unknown button:', unknownBtn);
    console.log('Hard button:', hardBtn);
    console.log('Know button:', knowBtn);
    
    if (letterGrid) {
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        var letterHtml = '';
        letters.forEach(function(letter) {
            letterHtml += '<button data-letter="' + letter + '">' + letter + '</button>';
        });
        letterGrid.innerHTML = letterHtml;
        
        letterGrid.querySelectorAll('button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                letterGrid.querySelectorAll('button').forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                reciteSelectedLetter = btn.dataset.letter;
                startReciteSession();
            });
        });
    }
    
    modeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            modeBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            reciteMode = btn.dataset.mode;
            
            if (letterPicker) {
                letterPicker.style.display = reciteMode === 'letter' ? 'block' : 'none';
            }
            
            startReciteSession();
        });
    });
    
    if (showBtn) {
        console.log('Adding click listener to show button');
        showBtn.addEventListener('click', function() {
            console.log('Show button clicked');
            showReciteAnswer();
        });
    }
    
    if (unknownBtn) {
        console.log('Adding click listener to unknown button');
        unknownBtn.addEventListener('click', function() {
            console.log('Unknown button clicked');
            handleReciteAnswer('unknown');
        });
    }
    
    if (hardBtn) {
        console.log('Adding click listener to hard button');
        hardBtn.addEventListener('click', function() {
            console.log('Hard button clicked');
            handleReciteAnswer('hard');
        });
    }
    
    if (knowBtn) {
        console.log('Adding click listener to know button');
        knowBtn.addEventListener('click', function() {
            console.log('Know button clicked');
            handleReciteAnswer('know');
        });
    }
    
    if (audioBtn) {
        audioBtn.addEventListener('click', function() { playWordAudio(); });
    }
    
    if (audioBtnBack) {
        audioBtnBack.addEventListener('click', function() { playWordAudio(); });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('确定要重置背诵进度吗？')) {
                gameState.reciteProgress = 0;
                gameState.learnedWords = [];
                saveGameState();
                startReciteSession();
                updateReciteStats();
            }
        });
    }
    
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', toggleFavoriteWord);
    }
    
    if (favoriteBtnBack) {
        favoriteBtnBack.addEventListener('click', toggleFavoriteWord);
    }
    
    if (settingsBtn && settingsModal) {
        settingsBtn.addEventListener('click', function() {
            settingsModal.classList.add('open');
        });
    }
    
    if (closeSettingsModal && settingsModal) {
        closeSettingsModal.addEventListener('click', function() {
            settingsModal.classList.remove('open');
        });
    }
    
    if (autoSpeakBtn) {
        autoSpeakBtn.addEventListener('click', function() {
            autoSpeakBtn.classList.toggle('active');
            var settings = getReciteSettings();
            settings.autoSpeak = autoSpeakBtn.classList.contains('active');
            saveReciteSettings(settings);
        });
    }
    
    if (goalSettingBtn && settingsModal) {
        goalSettingBtn.addEventListener('click', function() {
            settingsModal.classList.add('open');
        });
    }
    
    if (closeStatsPanel && statsPanel) {
        closeStatsPanel.addEventListener('click', function() {
            statsPanel.classList.remove('open');
        });
    }
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveReciteSettingsFromUI);
    }
    
    var settingOptions = document.querySelectorAll('.setting-option');
    settingOptions.forEach(function(opt) {
        opt.addEventListener('click', function() {
            var parent = opt.parentElement;
            parent.querySelectorAll('.setting-option').forEach(function(o) { o.classList.remove('active'); });
            opt.classList.add('active');
        });
    });
    
    document.addEventListener('keydown', handleReciteKeydown);
    
    loadReciteSettings();
    startReciteSession();
    updateReciteStats();
    updateDailyGoal();
    
    console.log('Word recite initialized');
}

function handleReciteKeydown(e) {
    var recitePage = document.getElementById('page-word-recite');
    if (!recitePage || !recitePage.classList.contains('active')) return;
    
    console.log('Key pressed:', e.key);
    
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        showReciteAnswer();
    } else if (e.key === '1' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleReciteAnswer('unknown');
    } else if (e.key === '2' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleReciteAnswer('hard');
    } else if (e.key === '3' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleReciteAnswer('know');
    } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFavoriteWord();
    }
}

function toggleFavoriteWord() {
    if (reciteWordList.length === 0 || currentWordIndex >= reciteWordList.length) return;
    var word = reciteWordList[currentWordIndex];
    
    var favoriteBtn = document.getElementById('recite-favorite-btn');
    var favoriteBtnBack = document.getElementById('recite-favorite-btn-back');
    
    if (gameState.notebook.includes(word.word)) {
        var index = gameState.notebook.indexOf(word.word);
        gameState.notebook.splice(index, 1);
        if (favoriteBtn) {
            favoriteBtn.textContent = '♡';
            favoriteBtn.classList.remove('active');
        }
        if (favoriteBtnBack) {
            favoriteBtnBack.textContent = '♡';
            favoriteBtnBack.classList.remove('active');
        }
    } else {
        gameState.notebook.push(word.word);
        if (favoriteBtn) {
            favoriteBtn.textContent = '♥';
            favoriteBtn.classList.add('active');
        }
        if (favoriteBtnBack) {
            favoriteBtnBack.textContent = '♥';
            favoriteBtnBack.classList.add('active');
        }
    }
    saveGameState();
}

function getReciteSettings() {
    var saved = localStorage.getItem('reciteSettings');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        dailyGoal: 50,
        mode: 'en-zh',
        autoSpeak: false,
        showExample: true,
        showPhonetic: true
    };
}

function saveReciteSettings(settings) {
    localStorage.setItem('reciteSettings', JSON.stringify(settings));
}

function loadReciteSettings() {
    var settings = getReciteSettings();
    var dailyGoalInput = document.getElementById('setting-daily-goal');
    var autoSpeakInput = document.getElementById('setting-auto-speak');
    var showExampleInput = document.getElementById('setting-show-example');
    var showPhoneticInput = document.getElementById('setting-show-phonetic');
    var autoSpeakBtn = document.getElementById('auto-speak-btn');
    
    if (dailyGoalInput) dailyGoalInput.value = settings.dailyGoal;
    if (autoSpeakInput) autoSpeakInput.checked = settings.autoSpeak;
    if (showExampleInput) showExampleInput.checked = settings.showExample;
    if (showPhoneticInput) showPhoneticInput.checked = settings.showPhonetic;
    
    if (autoSpeakBtn && settings.autoSpeak) {
        autoSpeakBtn.classList.add('active');
    }
    
    var settingOptions = document.querySelectorAll('.setting-option');
    settingOptions.forEach(function(opt) {
        if (opt.dataset.mode === settings.mode) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
}

function saveReciteSettingsFromUI() {
    var dailyGoalInput = document.getElementById('setting-daily-goal');
    var autoSpeakInput = document.getElementById('setting-auto-speak');
    var showExampleInput = document.getElementById('setting-show-example');
    var showPhoneticInput = document.getElementById('setting-show-phonetic');
    var activeMode = document.querySelector('.setting-option.active');
    
    var settings = {
        dailyGoal: dailyGoalInput ? parseInt(dailyGoalInput.value) : 50,
        mode: activeMode ? activeMode.dataset.mode : 'en-zh',
        autoSpeak: autoSpeakInput ? autoSpeakInput.checked : false,
        showExample: showExampleInput ? showExampleInput.checked : true,
        showPhonetic: showPhoneticInput ? showPhoneticInput.checked : true
    };
    
    saveReciteSettings(settings);
    
    var settingsModal = document.getElementById('recite-settings-modal');
    if (settingsModal) settingsModal.classList.remove('open');
    
    updateDailyGoal();
}

function updateDailyGoal() {
    var settings = getReciteSettings();
    var dailyLearnedEl = document.getElementById('daily-learned');
    var dailyGoalEl = document.getElementById('daily-goal');
    var dailyGoalFill = document.getElementById('daily-goal-fill');
    
    var learned = gameState.todayLearned || 0;
    var goal = settings.dailyGoal || 50;
    
    if (dailyLearnedEl) dailyLearnedEl.textContent = learned;
    if (dailyGoalEl) dailyGoalEl.textContent = goal;
    if (dailyGoalFill) {
        var percent = Math.min((learned / goal) * 100, 100);
        dailyGoalFill.style.width = percent + '%';
    }
}

function startReciteSession() {
    if (!vocabulary3500 || !vocabulary3500.words) return;
    
    if (reciteMode === 'order') {
        reciteWordList = vocabulary3500.words.slice(gameState.reciteProgress);
        updateCurrentLetterDisplay();
    } else if (reciteMode === 'random') {
        reciteWordList = vocabulary3500.words.slice().sort(function() { return Math.random() - 0.5; });
        hideCurrentLetterDisplay();
    } else if (reciteMode === 'letter' && reciteSelectedLetter) {
        reciteWordList = vocabulary3500.words.filter(function(w) {
            return w.word.charAt(0).toUpperCase() === reciteSelectedLetter;
        });
        showSelectedLetterDisplay(reciteSelectedLetter);
    } else if (reciteMode === 'notebook') {
        reciteWordList = gameState.notebook.map(function(word) {
            return vocabulary3500.words.find(function(v) { return v.word === word; }) || { word: word, phonetic: '', meaning: '', example: '' };
        }).filter(function(w) { return w.word; });
        hideCurrentLetterDisplay();
    } else {
        reciteWordList = vocabulary3500.words.slice();
        hideCurrentLetterDisplay();
    }
    
    currentWordIndex = 0;
    displayReciteWord();
}

function updateCurrentLetterDisplay() {
    if (reciteWordList.length > 0) {
        var currentWord = reciteWordList[0];
        var currentLetter = currentWord.word.charAt(0).toUpperCase();
        showSelectedLetterDisplay(currentLetter);
    }
}

function showSelectedLetterDisplay(letter) {
    var letterDisplay = document.getElementById('current-letter-display');
    if (!letterDisplay) {
        var toolbar = document.querySelector('.recite-toolbar');
        if (toolbar) {
            letterDisplay = document.createElement('div');
            letterDisplay.id = 'current-letter-display';
            letterDisplay.className = 'current-letter-badge';
            toolbar.insertBefore(letterDisplay, toolbar.firstChild);
        }
    }
    if (letterDisplay) {
        var letterCount = vocabulary3500.words.filter(function(w) {
            return w.word.charAt(0).toUpperCase() === letter;
        }).length;
        letterDisplay.innerHTML = '<span class="letter-badge-icon">🔤</span><span class="letter-badge-text">正在背诵 <strong>' + letter + '</strong> 开头的单词</span><span class="letter-badge-count">(' + letterCount + '个)</span>';
        letterDisplay.style.display = 'flex';
    }
}

function hideCurrentLetterDisplay() {
    var letterDisplay = document.getElementById('current-letter-display');
    if (letterDisplay) {
        letterDisplay.style.display = 'none';
    }
}

function displayReciteWord() {
    if (reciteWordList.length === 0 || currentWordIndex >= reciteWordList.length) {
        var cardContainer = document.getElementById('recite-card-container');
        if (cardContainer) {
            cardContainer.innerHTML = '<div class="recite-complete"><h2>🎉 恭喜完成！</h2><p>本组单词已全部背诵完毕</p></div>';
        }
        hideCurrentLetterDisplay();
        return;
    }
    
    var word = reciteWordList[currentWordIndex];
    var wordIndex = getWordIndex(word.word);
    
    if (reciteMode === 'order') {
        var currentLetter = word.word.charAt(0).toUpperCase();
        showSelectedLetterDisplay(currentLetter);
    }
    
    var wordEl = document.getElementById('recite-word');
    var wordBackEl = document.getElementById('recite-word-back');
    var phoneticEl = document.getElementById('recite-phonetic');
    var phoneticBackEl = document.getElementById('recite-phonetic-back');
    var wordNumberEl = document.getElementById('recite-word-number');
    var wordNumberBackEl = document.getElementById('recite-word-number-back');
    var meaningEl = document.getElementById('recite-meaning');
    var exampleEl = document.getElementById('recite-example');
    var currentEl = document.getElementById('recite-current');
    var totalEl = document.getElementById('recite-total');
    var progressFill = document.getElementById('recite-progress-fill');
    var percentageEl = document.getElementById('recite-percentage');
    var card = document.getElementById('recite-card');
    var favoriteBtn = document.getElementById('recite-favorite-btn');
    var favoriteBtnBack = document.getElementById('recite-favorite-btn-back');
    
    if (wordEl) wordEl.textContent = word.word;
    if (wordBackEl) wordBackEl.textContent = word.word;
    if (phoneticEl) phoneticEl.textContent = word.phonetic;
    if (phoneticBackEl) phoneticBackEl.textContent = word.phonetic;
    if (wordNumberEl) wordNumberEl.textContent = '#' + formatWordNumber(wordIndex);
    if (wordNumberBackEl) wordNumberBackEl.textContent = '#' + formatWordNumber(wordIndex);
    if (meaningEl) meaningEl.textContent = word.meaning;
    if (exampleEl) exampleEl.textContent = word.example || '';
    
    var isFavorite = gameState.notebook.includes(word.word);
    if (favoriteBtn) {
        favoriteBtn.textContent = isFavorite ? '♥' : '♡';
        favoriteBtn.classList.toggle('active', isFavorite);
    }
    if (favoriteBtnBack) {
        favoriteBtnBack.textContent = isFavorite ? '♥' : '♡';
        favoriteBtnBack.classList.toggle('active', isFavorite);
    }
    
    var total = reciteWordList.length;
    if (currentEl) currentEl.textContent = currentWordIndex + 1;
    if (totalEl) totalEl.textContent = total;
    
    var percent = Math.round(((currentWordIndex + 1) / total) * 100);
    if (progressFill) progressFill.style.width = percent + '%';
    if (percentageEl) percentageEl.textContent = percent + '%';
    
    if (card) card.classList.remove('flipped');
    
    var settings = getReciteSettings();
    if (settings.autoSpeak) {
        setTimeout(function() { playWordAudio(); }, 300);
    }
    
    updateReciteStats();
}

function updateReciteStats() {
    var learnedEl = document.getElementById('recite-learned');
    var masteredEl = document.getElementById('recite-mastered');
    var streakEl = document.getElementById('recite-streak');
    
    if (learnedEl) learnedEl.textContent = gameState.reciteProgress || 0;
    if (masteredEl) masteredEl.textContent = gameState.learnedWords ? gameState.learnedWords.length : 0;
    if (streakEl) streakEl.textContent = gameState.streak || 0;
    
    updateDailyGoal();
}

function showReciteAnswer() {
    console.log('showReciteAnswer called');
    var card = document.getElementById('recite-card');
    console.log('Card element:', card);
    if (card) {
        card.classList.add('flipped');
        console.log('Card flipped');
    }
}

function handleReciteAnswer(result) {
    console.log('handleReciteAnswer called with result:', result);
    console.log('currentWordIndex:', currentWordIndex);
    console.log('reciteWordList length:', reciteWordList.length);
    
    if (!reciteWordList || reciteWordList.length === 0) {
        console.log('reciteWordList is empty');
        return;
    }
    
    if (currentWordIndex >= reciteWordList.length) {
        console.log('currentWordIndex out of bounds');
        return;
    }
    
    var word = reciteWordList[currentWordIndex];
    console.log('Current word:', word);
    
    if (result === 'unknown') {
        if (!gameState.notebook.includes(word.word)) {
            gameState.notebook.push(word.word);
        }
    } else if (result === 'know') {
        gameState.reciteProgress++;
        gameState.todayLearned = (gameState.todayLearned || 0) + 1;
        addScore(5);
        
        if (currentWordIndex === 0) {
            unlockAchievement(2);
        }
        if (gameState.reciteProgress >= 10) unlockAchievement(3);
        if (gameState.reciteProgress >= 100) unlockAchievement(4);
        if (gameState.reciteProgress >= 1000) unlockAchievement(5);
    } else if (result === 'hard') {
        if (!gameState.notebook.includes(word.word)) {
            gameState.notebook.push(word.word);
        }
        gameState.todayLearned = (gameState.todayLearned || 0) + 1;
        addScore(2);
    }
    
    saveGameState();
    updateDailyGoal();
    currentWordIndex++;
    displayReciteWord();
}

var lastAudioWord = '';
function playWordAudio() {
    console.log('playWordAudio called');
    
    if (!('speechSynthesis' in window)) {
        console.log('speechSynthesis not supported');
        alert('您的浏览器不支持语音合成');
        return;
    }
    
    if (!reciteWordList || reciteWordList.length === 0 || currentWordIndex >= reciteWordList.length) {
        console.log('No word to play');
        return;
    }
    
    var word = reciteWordList[currentWordIndex];
    if (!word) {
        console.log('Word is null');
        return;
    }
    
    console.log('Playing word:', word.word);
    
    // 取消之前的语音
    speechSynthesis.cancel();
    
    var utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    
    utterance.onstart = function() {
        console.log('Speech started');
    };
    
    utterance.onend = function() {
        console.log('Speech ended');
        lastAudioWord = '';
    };
    
    utterance.onerror = function(e) {
        console.log('Speech error:', e);
    };
    
    speechSynthesis.speak(utterance);
}

let reviewMode = 'meaning';
let reviewCount = 20;
let reviewScope = 'all';

function initWordReview() {
    var startBtn = document.getElementById('start-review-btn');
    var submitBtn = document.getElementById('review-submit');
    var nextBtn = document.getElementById('review-next');
    var skipBtn = document.getElementById('review-skip');
    var restartBtn = document.getElementById('review-restart');
    var inputEl = document.getElementById('review-input');
    var modeBtns = document.querySelectorAll('.review-mode-btn');
    var countSelect = document.getElementById('review-count');
    var scopeSelect = document.getElementById('review-scope');
    var audioBtn = document.getElementById('review-audio-btn');
    var backBtn = document.getElementById('back-from-review');
    
    modeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            modeBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            reviewMode = btn.dataset.mode;
        });
    });
    
    if (countSelect) {
        countSelect.addEventListener('change', function() {
            reviewCount = parseInt(countSelect.value);
        });
    }
    
    if (scopeSelect) {
        scopeSelect.addEventListener('change', function() {
            reviewScope = scopeSelect.value;
        });
    }
    
    if (startBtn) {
        startBtn.addEventListener('click', startReview);
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', submitReviewAnswer);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', nextReviewWord);
    }
    
    if (skipBtn) {
        skipBtn.addEventListener('click', skipReviewWord);
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', restartReview);
    }
    
    if (inputEl) {
        inputEl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') submitReviewAnswer();
        });
    }
    
    if (audioBtn) {
        audioBtn.addEventListener('click', function() {
            if (reviewQueue[reviewIndex]) {
                playReviewAudio(reviewQueue[reviewIndex].word);
            }
        });
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            navigateTo('home');
        });
    }
    
    updateReviewStats();
}

function playReviewAudio(word) {
    if (!('speechSynthesis' in window)) return;
    var utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

function updateReviewStats() {
    var totalEl = document.getElementById('review-total');
    var doneEl = document.getElementById('review-done');
    var masteredEl = document.getElementById('review-mastered');
    
    var pending = gameState.notebook.length + Math.max(0, reviewCount - gameState.reviewed.length);
    
    if (totalEl) totalEl.textContent = pending;
    if (doneEl) doneEl.textContent = gameState.reviewed.length;
    if (masteredEl) masteredEl.textContent = Math.floor(gameState.reviewed.length * 0.7);
}

function startReview() {
    var welcomeEl = document.getElementById('review-welcome');
    var sessionEl = document.getElementById('review-session');
    var completeEl = document.getElementById('review-complete');
    
    if (welcomeEl) welcomeEl.classList.add('hidden');
    if (sessionEl) sessionEl.classList.remove('hidden');
    if (completeEl) completeEl.classList.add('hidden');
    
    reviewQueue = [];
    
    if (reviewScope === 'weak' && gameState.notebook.length > 0) {
        gameState.notebook.forEach(function(word) {
            var wordData = vocabulary3500.words.find(function(v) { return v.word === word; });
            if (wordData) reviewQueue.push(wordData);
        });
    } else if (reviewScope === 'recent' && gameState.recentWords && gameState.recentWords.length > 0) {
        gameState.recentWords.forEach(function(word) {
            var wordData = vocabulary3500.words.find(function(v) { return v.word === word; });
            if (wordData) reviewQueue.push(wordData);
        });
    } else {
        reviewQueue = vocabulary3500.words.slice();
    }
    
    reviewQueue = reviewQueue.sort(function() { return Math.random() - 0.5; }).slice(0, reviewCount);
    
    reviewIndex = 0;
    reviewCorrect = 0;
    reviewWrong = 0;
    
    displayReviewWord();
    unlockAchievement(11);
}

function displayReviewWord() {
    if (reviewIndex >= reviewQueue.length) {
        endReview();
        return;
    }
    
    var word = reviewQueue[reviewIndex];
    var wordIndex = getWordIndex(word.word);
    
    var wordEl = document.getElementById('review-word');
    var phoneticEl = document.getElementById('review-phonetic');
    var inputEl = document.getElementById('review-input');
    var resultArea = document.getElementById('review-result-area');
    var progressFill = document.getElementById('review-progress-fill');
    var progressText = document.getElementById('review-progress-text');
    var cardNumber = document.getElementById('review-card-number');
    var inputArea = document.getElementById('review-input-area');
    var choiceArea = document.getElementById('review-choice-area');
    var nextBtn = document.getElementById('review-next');
    
    if (reviewMode === 'meaning') {
        if (wordEl) wordEl.textContent = word.word;
        if (phoneticEl) phoneticEl.textContent = word.phonetic;
        if (inputEl) inputEl.placeholder = '输入中文释义...';
    } else if (reviewMode === 'word') {
        if (wordEl) wordEl.textContent = word.meaning;
        if (phoneticEl) phoneticEl.textContent = '';
        if (inputEl) inputEl.placeholder = '输入英文单词...';
    } else if (reviewMode === 'listening') {
        if (wordEl) wordEl.textContent = '🎧 听音写词';
        if (phoneticEl) phoneticEl.textContent = '点击播放按钮听发音';
        if (inputEl) inputEl.placeholder = '输入听到的单词...';
        playReviewAudio(word.word);
    } else if (reviewMode === 'choice') {
        if (wordEl) wordEl.textContent = word.word;
        if (phoneticEl) phoneticEl.textContent = word.phonetic;
        setupChoiceMode(word);
    }
    
    if (cardNumber) cardNumber.textContent = '#' + formatWordNumber(wordIndex);
    if (inputEl) {
        inputEl.value = '';
        inputEl.disabled = false;
        if (reviewMode !== 'choice') inputEl.focus();
    }
    if (resultArea) resultArea.classList.add('hidden');
    if (nextBtn) nextBtn.classList.add('hidden');
    
    if (inputArea) inputArea.classList.toggle('hidden', reviewMode === 'choice');
    if (choiceArea) choiceArea.classList.toggle('hidden', reviewMode !== 'choice');
    
    var progress = ((reviewIndex + 1) / reviewQueue.length) * 100;
    if (progressFill) progressFill.style.width = progress + '%';
    if (progressText) progressText.textContent = (reviewIndex + 1) + '/' + reviewQueue.length;
}

function setupChoiceMode(correctWord) {
    var choiceGrid = document.getElementById('choice-grid');
    if (!choiceGrid) return;
    
    var choices = [correctWord];
    var allWords = vocabulary3500.words.filter(function(w) { return w.word !== correctWord.word; });
    
    while (choices.length < 4 && allWords.length > 0) {
        var randomIndex = Math.floor(Math.random() * allWords.length);
        choices.push(allWords.splice(randomIndex, 1)[0]);
    }
    
    choices = choices.sort(function() { return Math.random() - 0.5; });
    
    var html = '';
    choices.forEach(function(choice, idx) {
        html += '<button class="choice-btn" data-word="' + choice.word + '" data-correct="' + (choice.word === correctWord.word) + '">';
        html += choice.meaning;
        html += '</button>';
    });
    choiceGrid.innerHTML = html;
    
    choiceGrid.querySelectorAll('.choice-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            handleChoiceAnswer(btn);
        });
    });
}

function handleChoiceAnswer(btn) {
    var isCorrect = btn.dataset.correct === 'true';
    var word = reviewQueue[reviewIndex];
    
    var choiceBtns = document.querySelectorAll('.choice-btn');
    choiceBtns.forEach(function(b) {
        b.disabled = true;
        if (b.dataset.correct === 'true') {
            b.classList.add('correct');
        } else if (b === btn && !isCorrect) {
            b.classList.add('wrong');
        }
    });
    
    showReviewResult(isCorrect, word.meaning, btn.dataset.word);
}

function submitReviewAnswer() {
    var inputEl = document.getElementById('review-input');
    if (!inputEl) return;
    
    var userAnswer = inputEl.value.trim();
    var word = reviewQueue[reviewIndex];
    var correctAnswer;
    var isCorrect;
    
    if (reviewMode === 'meaning') {
        correctAnswer = word.meaning;
        isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase() ||
                    correctAnswer.toLowerCase().includes(userAnswer.toLowerCase());
    } else if (reviewMode === 'word' || reviewMode === 'listening') {
        correctAnswer = word.word;
        isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    }
    
    inputEl.disabled = true;
    showReviewResult(isCorrect, correctAnswer, userAnswer);
}

function showReviewResult(isCorrect, correctAnswer, userAnswer) {
    var resultArea = document.getElementById('review-result-area');
    var badge = document.getElementById('result-badge');
    var correctEl = document.getElementById('correct-answer');
    var yourEl = document.getElementById('your-answer');
    var nextBtn = document.getElementById('review-next');
    
    if (resultArea) resultArea.classList.remove('hidden');
    if (badge) {
        badge.textContent = isCorrect ? '正确 ✓' : '错误 ✗';
        badge.className = 'result-badge ' + (isCorrect ? 'correct' : 'wrong');
    }
    if (correctEl) correctEl.textContent = correctAnswer;
    if (yourEl) yourEl.textContent = userAnswer || '(空)';
    if (nextBtn) nextBtn.classList.remove('hidden');
    
    if (isCorrect) {
        reviewCorrect++;
        addScore(5);
    } else {
        reviewWrong++;
    }
    
    var word = reviewQueue[reviewIndex];
    if (!gameState.reviewed.includes(word.word)) {
        gameState.reviewed.push(word.word);
        saveGameState();
    }
}

function skipReviewWord() {
    reviewWrong++;
    nextReviewWord();
}

function nextReviewWord() {
    reviewIndex++;
    displayReviewWord();
}

function endReview() {
    var sessionEl = document.getElementById('review-session');
    var completeEl = document.getElementById('review-complete');
    var correctEl = document.getElementById('complete-correct');
    var wrongEl = document.getElementById('complete-wrong');
    var accuracyEl = document.getElementById('complete-accuracy');
    
    if (sessionEl) sessionEl.classList.add('hidden');
    if (completeEl) completeEl.classList.remove('hidden');
    
    var total = reviewCorrect + reviewWrong;
    var accuracy = total > 0 ? Math.round((reviewCorrect / total) * 100) : 0;
    
    if (correctEl) correctEl.textContent = reviewCorrect;
    if (wrongEl) wrongEl.textContent = reviewWrong;
    if (accuracyEl) accuracyEl.textContent = accuracy + '%';
    
    updateReviewStats();
    
    if (reviewCorrect === reviewQueue.length) {
        unlockAchievement(71);
    }
    
    if (accuracy >= 80) {
        addScore(20);
    }
}

function restartReview() {
    var welcomeEl = document.getElementById('review-welcome');
    var completeEl = document.getElementById('review-complete');
    
    if (welcomeEl) welcomeEl.classList.remove('hidden');
    if (completeEl) completeEl.classList.add('hidden');
}

function initRandomWord() {
    var randomBtn = document.getElementById('random-btn');
    var meaningBtn = document.getElementById('random-meaning-btn');
    
    if (randomBtn) {
        randomBtn.addEventListener('click', getRandomWord);
    }
    
    if (meaningBtn) {
        meaningBtn.addEventListener('click', toggleRandomMeaning);
    }
    
    getRandomWord();
}

function getRandomWord() {
    if (!vocabulary3500 || !vocabulary3500.words) return;
    
    var randomIndex = Math.floor(Math.random() * vocabulary3500.words.length);
    var word = vocabulary3500.words[randomIndex];
    var wordIndex = getWordIndex(word.word);
    
    var wordEl = document.getElementById('random-word');
    var phoneticEl = document.getElementById('random-phonetic');
    var meaningTextEl = document.getElementById('random-meaning-text');
    var exampleEl = document.getElementById('random-example');
    var meaningEl = document.getElementById('random-meaning');
    var indexEl = document.getElementById('random-word-index');
    
    if (wordEl) wordEl.textContent = word.word;
    if (phoneticEl) phoneticEl.textContent = word.phonetic + ' #' + formatWordNumber(wordIndex);
    if (meaningTextEl) meaningTextEl.textContent = word.meaning;
    if (exampleEl) exampleEl.textContent = word.example;
    if (meaningEl) meaningEl.classList.add('hidden');
    
    randomHistory.unshift(word.word);
    if (randomHistory.length > 10) randomHistory.pop();
    
    updateRandomHistory();
    
    if (randomHistory.length >= 10) {
        unlockAchievement(37);
    }
}

function toggleRandomMeaning() {
    var meaningEl = document.getElementById('random-meaning');
    if (meaningEl) meaningEl.classList.toggle('hidden');
}

function updateRandomHistory() {
    var container = document.getElementById('random-history');
    if (!container) return;
    
    var html = '';
    randomHistory.forEach(function(word) {
        html += '<span class="history-item">' + word + '</span>';
    });
    container.innerHTML = html;
}

function initWordSearch() {
    var searchInput = document.getElementById('search-input');
    var searchBtn = document.getElementById('search-btn');
    var clearBtn = document.getElementById('search-clear-btn');
    var sortSelect = document.getElementById('search-sort');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchFilter = searchInput.value;
            searchPage = 1;
            performSearch();
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            searchFilter = searchInput ? searchInput.value : '';
            searchPage = 1;
            performSearch();
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                searchFilter = '';
                searchPage = 1;
                performSearch();
            }
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            performSearch();
        });
    }
    
    performSearch();
}

function performSearch() {
    if (!vocabulary3500 || !vocabulary3500.words) return;
    
    var results = [];
    vocabulary3500.words.forEach(function(word, index) {
        var matchesFilter = !searchFilter || 
            word.word.toLowerCase().includes(searchFilter.toLowerCase()) ||
            word.meaning.toLowerCase().includes(searchFilter.toLowerCase());
        
        var matchesLetter = !currentLetter || word.word.charAt(0).toUpperCase() === currentLetter;
        
        if (matchesFilter && matchesLetter) {
            results.push({ word: word, originalIndex: index });
        }
    });
    
    var sortSelect = document.getElementById('search-sort');
    var sortValue = sortSelect ? sortSelect.value : 'default';
    
    if (sortValue === 'asc') {
        results.sort(function(a, b) { return a.word.word.localeCompare(b.word.word); });
    } else if (sortValue === 'desc') {
        results.sort(function(a, b) { return b.word.word.localeCompare(a.word.word); });
    } else {
        results.sort(function(a, b) { return a.originalIndex - b.originalIndex; });
    }
    
    searchResults = results.map(function(r) { return r.word; });
    displaySearchResults();
    
    var countEl = document.getElementById('search-results-count');
    if (countEl) countEl.textContent = searchResults.length;
    
    if (searchFilter) {
        unlockAchievement(7);
    }
}

function displaySearchResults() {
    var container = document.getElementById('search-results');
    var pagination = document.getElementById('search-pagination');
    
    if (!container) return;
    
    var perPage = 24;
    var totalPages = Math.ceil(searchResults.length / perPage);
    var start = (searchPage - 1) * perPage;
    var end = start + perPage;
    var pageResults = searchResults.slice(start, end);
    
    var html = '';
    pageResults.forEach(function(word) {
        var wordIndex = getWordIndex(word.word);
        html += '<div class="search-result-card" data-word="' + word.word + '">';
        html += '<div class="result-word">' + word.word + '</div>';
        html += '<div class="result-phonetic">' + word.phonetic + '</div>';
        html += '<div class="result-meaning">' + word.meaning + '</div>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    container.querySelectorAll('.search-result-card').forEach(function(card) {
        card.addEventListener('click', function() {
            showWordModal(card.dataset.word);
        });
    });
    
    container.querySelectorAll('.word-item').forEach(function(item) {
        item.addEventListener('click', function() {
            showWordModal(item.dataset.word);
        });
    });
    
    if (pagination && totalPages > 1) {
        pagination.innerHTML = '';
        pagination.appendChild(createPagination(totalPages, searchPage, function(page) {
            searchPage = page;
            displaySearchResults();
        }));
    } else if (pagination) {
        pagination.innerHTML = '';
    }
}

function createPagination(totalPages, currentPage, callback) {
    if (totalPages <= 1) return '';
    
    var container = document.createElement('div');
    container.className = 'pagination-container';
    
    var prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn';
    prevBtn.textContent = '上一页';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', function() {
        if (currentPage > 1) callback(currentPage - 1);
    });
    container.appendChild(prevBtn);
    
    var start = Math.max(1, currentPage - 2);
    var end = Math.min(totalPages, currentPage + 2);
    
    if (start > 1) {
        var firstBtn = document.createElement('button');
        firstBtn.className = 'page-btn';
        firstBtn.textContent = '1';
        firstBtn.addEventListener('click', function() { callback(1); });
        container.appendChild(firstBtn);
        
        if (start > 2) {
            var dots1 = document.createElement('span');
            dots1.className = 'page-dots';
            dots1.textContent = '...';
            container.appendChild(dots1);
        }
    }
    
    for (var i = start; i <= end; i++) {
        var pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        (function(pageNum) {
            pageBtn.addEventListener('click', function() { callback(pageNum); });
        })(i);
        container.appendChild(pageBtn);
    }
    
    if (end < totalPages) {
        if (end < totalPages - 1) {
            var dots2 = document.createElement('span');
            dots2.className = 'page-dots';
            dots2.textContent = '...';
            container.appendChild(dots2);
        }
        var lastBtn = document.createElement('button');
        lastBtn.className = 'page-btn';
        lastBtn.textContent = totalPages;
        lastBtn.addEventListener('click', function() { callback(totalPages); });
        container.appendChild(lastBtn);
    }
    
    var nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn';
    nextBtn.textContent = '下一页';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', function() {
        if (currentPage < totalPages) callback(currentPage + 1);
    });
    container.appendChild(nextBtn);
    
    var jumpDiv = document.createElement('div');
    jumpDiv.className = 'page-jump';
    
    var jumpInput = document.createElement('input');
    jumpInput.type = 'number';
    jumpInput.min = 1;
    jumpInput.max = totalPages;
    jumpInput.value = currentPage;
    jumpInput.placeholder = '页码';
    
    var jumpBtn = document.createElement('button');
    jumpBtn.className = 'page-jump-btn';
    jumpBtn.textContent = 'GO';
    
    var doJump = function() {
        var page = parseInt(jumpInput.value);
        if (page >= 1 && page <= totalPages) {
            callback(page);
        }
    };
    
    jumpBtn.addEventListener('click', doJump);
    jumpInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') doJump();
    });
    
    jumpDiv.appendChild(jumpInput);
    jumpDiv.appendChild(jumpBtn);
    container.appendChild(jumpDiv);
    
    return container;
}

function showWordModal(wordStr) {
    var word = vocabulary3500.words.find(function(w) { return w.word === wordStr; });
    if (!word) return;
    
    var card = gameState.collection.find(function(c) { return c.word === wordStr; });
    var rarity = card ? card.rarity : 'common';
    var effect = card ? card.effect : getEffectByRarity(rarity);
    var effectData = cardEffects[effect];
    var drawTime = card && card.drawTime ? card.drawTime : '--';
    var cardId = card && card.cardId ? card.cardId : 'WRD-' + String(getWordIndex(wordStr)).padStart(4, '0');
    var effectName = card && card.effectName ? card.effectName : (effectData ? effectData.name : '攻击');
    var effectDesc = card && card.effectDesc ? card.effectDesc : (effectData ? effectData.desc : '造成基础伤害');
    
    var modal = document.getElementById('card-modal');
    var cardIdBadge = document.getElementById('card-id-badge');
    var rarityBadge = document.getElementById('card-rarity-badge');
    var wordTitle = document.getElementById('card-word-title');
    var phoneticText = document.getElementById('card-phonetic-text');
    var meaningText = document.getElementById('card-meaning-text');
    var exampleText = document.getElementById('card-example-text');
    var effectSection = document.getElementById('card-effect-section');
    var effectNameEl = document.getElementById('card-effect-name');
    var effectDescEl = document.getElementById('card-effect-desc');
    var rarityText = document.getElementById('card-rarity-text');
    var drawTimeEl = document.getElementById('card-draw-time');
    var audioBtn = document.getElementById('card-audio-btn');
    var notebookBtn = document.getElementById('card-notebook-btn');
    var closeBtn = document.getElementById('modal-close');
    var overlay = document.getElementById('modal-overlay');
    
    if (cardIdBadge) cardIdBadge.textContent = cardId;
    if (rarityBadge) {
        rarityBadge.textContent = getRarityName(rarity);
        rarityBadge.className = 'card-rarity-badge ' + rarity;
    }
    if (wordTitle) wordTitle.textContent = word.word;
    if (phoneticText) phoneticText.textContent = word.phonetic;
    if (meaningText) meaningText.textContent = word.meaning;
    if (exampleText) exampleText.textContent = word.example || '';
    if (effectNameEl) effectNameEl.textContent = effectName;
    if (effectDescEl) effectDescEl.textContent = effectDesc;
    if (rarityText) rarityText.textContent = getRarityName(rarity);
    if (drawTimeEl) drawTimeEl.textContent = drawTime;
    
    if (effectSection) {
        effectSection.style.display = effectData ? 'block' : 'none';
    }
    
    if (audioBtn) {
        audioBtn.onclick = function() { speakWord(wordStr); };
    }
    
    if (notebookBtn) {
        notebookBtn.onclick = function() { addToNotebook(wordStr); };
    }
    
    if (closeBtn) {
        closeBtn.onclick = closeCardModal;
    }
    
    if (overlay) {
        overlay.onclick = closeCardModal;
    }
    
    if (modal) {
        modal.classList.add('active');
    }
}

function closeCardModal() {
    var modal = document.getElementById('card-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function showProverbModal(index) {
    var proverb = proverbs[index];
    if (!proverb) return;
    
    var modal = document.getElementById('card-modal');
    var rarityBadge = document.getElementById('card-rarity-badge');
    var wordTitle = document.getElementById('card-word-title');
    var phoneticText = document.getElementById('card-phonetic-text');
    var meaningText = document.getElementById('card-meaning-text');
    var exampleText = document.getElementById('card-example-text');
    var effectSection = document.getElementById('card-effect-section');
    var drawTimeEl = document.getElementById('card-draw-time');
    var audioBtn = document.getElementById('card-audio-btn');
    var notebookBtn = document.getElementById('card-notebook-btn');
    var closeBtn = document.getElementById('modal-close');
    var overlay = document.getElementById('modal-overlay');
    
    var isFav = gameState.proverbFavorites && gameState.proverbFavorites.includes(index);
    var rarity = gameState.proverbCardRarities && gameState.proverbCardRarities[index] ? gameState.proverbCardRarities[index] : 'common';
    
    if (rarityBadge) {
        rarityBadge.textContent = getRarityName(rarity);
        rarityBadge.className = 'card-rarity-badge ' + rarity;
    }
    if (wordTitle) wordTitle.textContent = proverb.en;
    if (phoneticText) phoneticText.textContent = '';
    if (meaningText) meaningText.textContent = proverb.zh;
    if (exampleText) exampleText.textContent = '';
    if (effectSection) effectSection.style.display = 'none';
    if (drawTimeEl) drawTimeEl.textContent = isFav ? '已收藏' : '--';
    
    if (audioBtn) {
        audioBtn.style.display = 'none';
    }
    
    if (notebookBtn) {
        notebookBtn.textContent = isFav ? '⭐ 已收藏' : '⭐ 收藏';
        notebookBtn.onclick = function() {
            toggleProverbFavorite(index);
            showProverbModal(index);
        };
    }
    
    if (closeBtn) closeBtn.onclick = closeCardModal;
    if (overlay) overlay.onclick = closeCardModal;
    if (modal) modal.classList.add('active');
}

function showPhraseModal(index) {
    var phrase = phrases[index];
    if (!phrase) return;
    
    var modal = document.getElementById('card-modal');
    var rarityBadge = document.getElementById('card-rarity-badge');
    var wordTitle = document.getElementById('card-word-title');
    var phoneticText = document.getElementById('card-phonetic-text');
    var meaningText = document.getElementById('card-meaning-text');
    var exampleText = document.getElementById('card-example-text');
    var effectSection = document.getElementById('card-effect-section');
    var drawTimeEl = document.getElementById('card-draw-time');
    var audioBtn = document.getElementById('card-audio-btn');
    var notebookBtn = document.getElementById('card-notebook-btn');
    var closeBtn = document.getElementById('modal-close');
    var overlay = document.getElementById('modal-overlay');
    
    var isFav = gameState.phraseFavorites && gameState.phraseFavorites.includes(index);
    var rarity = gameState.phraseCardRarities && gameState.phraseCardRarities[index] ? gameState.phraseCardRarities[index] : 'common';
    
    if (rarityBadge) {
        rarityBadge.textContent = getRarityName(rarity);
        rarityBadge.className = 'card-rarity-badge ' + rarity;
    }
    if (wordTitle) wordTitle.textContent = phrase.en;
    if (phoneticText) phoneticText.textContent = '';
    if (meaningText) meaningText.textContent = phrase.zh;
    if (exampleText) exampleText.textContent = '';
    if (effectSection) effectSection.style.display = 'none';
    if (drawTimeEl) drawTimeEl.textContent = isFav ? '已收藏' : '--';
    
    if (audioBtn) {
        audioBtn.style.display = 'none';
    }
    
    if (notebookBtn) {
        notebookBtn.textContent = isFav ? '⭐ 已收藏' : '⭐ 收藏';
        notebookBtn.onclick = function() {
            togglePhraseFavorite(index);
            showPhraseModal(index);
        };
    }
    
    if (closeBtn) closeBtn.onclick = closeCardModal;
    if (overlay) overlay.onclick = closeCardModal;
    if (modal) modal.classList.add('active');
}

function toggleDungeonEffect(btn) {
    var attrs = btn.nextElementSibling;
    var icon = btn.querySelector('.toggle-icon');
    if (attrs.classList.contains('hidden')) {
        attrs.classList.remove('hidden');
        icon.textContent = '▼';
        btn.innerHTML = '<span class="toggle-icon">▼</span> 收起卡牌效果';
    } else {
        attrs.classList.add('hidden');
        icon.textContent = '▶';
        btn.innerHTML = '<span class="toggle-icon">▶</span> 查看卡牌效果';
    }
}

function getRarityName(rarity) {
    var names = { common: '\u666E\u901A', rare: '\u7A00\u6709', epic: '\u53F2\u8BD7', legendary: '\u4F20\u8BF4' };
    return names[rarity] || rarity;
}

function speakWord(word) {
    if (!('speechSynthesis' in window)) return;
    var utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

function addToNotebook(word) {
    if (!gameState.notebook.includes(word)) {
        gameState.notebook.push(word);
        saveGameState();
        
        if (gameState.notebook.length >= 10) unlockAchievement(9);
        if (gameState.notebook.length >= 100) unlockAchievement(10);
        
        alert('\u5DF2\u6DFB\u52A0\u5230\u751F\u8BCD\u672C!');
    } else {
        alert('\u8BE5\u5355\u8BCD\u5DF2\u5728\u751F\u8BCD\u672C\u4E2D!');
    }
}

function closeModal() {
    var modal = document.getElementById('card-modal');
    if (modal) modal.classList.remove('active');
}

function showPhraseModal(index) {
    var phrase = phrases[index];
    if (!phrase) return;
    
    var modal = document.getElementById('card-modal');
    var content = document.getElementById('modal-content');
    
    if (!modal || !content) return;
    
    var rarity = generateCardRarity();
    var effect = getEffectByRarity(rarity);
    var effectData = cardEffects[effect];
    var cardId = 'PHR-' + String(index + 1).padStart(4, '0');
    
    var html = '<div class="modal-phrase-card">';
    html += '<div class="modal-card-type phrase">📝 短语半透卡</div>';
    html += '<div class="modal-card-id">No. ' + cardId + '</div>';
    html += '<h2 class="modal-phrase-title">' + phrase.en + '</h2>';
    html += '<p class="modal-phrase-translation">' + phrase.zh + '</p>';
    html += '<button class="btn btn-secondary dungeon-effect-toggle" onclick="toggleDungeonEffect(this)">';
    html += '<span class="toggle-icon">▶</span> 查看卡牌效果';
    html += '</button>';
    html += '<div class="modal-card-effect hidden">';
    html += '<div class="modal-effect-header">';
    html += '<span class="collection-card-rarity ' + rarity + '">' + getRarityName(rarity) + '</span>';
    html += '<span class="modal-effect-name">' + effectData.name + '</span>';
    html += '</div>';
    html += '<p class="modal-effect-desc">' + effectData.desc + '</p>';
    html += '</div>';
    html += '<div class="modal-actions">';
    html += '<button class="btn btn-secondary" onclick="speakPhrase(' + index + ')">🔊 发音</button>';
    html += '<button class="btn btn-secondary" onclick="closeModal()">关闭</button>';
    html += '</div>';
    html += '</div>';
    
    content.innerHTML = html;
    modal.classList.add('active');
}

function showProverbModal(index) {
    var proverb = proverbs[index];
    if (!proverb) return;
    
    var modal = document.getElementById('card-modal');
    var content = document.getElementById('modal-content');
    
    if (!modal || !content) return;
    
    var rarity = generateCardRarity();
    var effect = getEffectByRarity(rarity);
    var effectData = cardEffects[effect];
    var cardId = 'PRV-' + String(index + 1).padStart(4, '0');
    
    var html = '<div class="modal-proverb-card">';
    html += '<div class="modal-card-type proverb">📜 俗语谚语透卡</div>';
    html += '<div class="modal-card-id">No. ' + cardId + '</div>';
    html += '<h2 class="modal-proverb-title">' + proverb.en + '</h2>';
    html += '<p class="modal-proverb-translation">' + proverb.zh + '</p>';
    html += '<button class="btn btn-secondary dungeon-effect-toggle" onclick="toggleDungeonEffect(this)">';
    html += '<span class="toggle-icon">▶</span> 查看卡牌效果';
    html += '</button>';
    html += '<div class="modal-card-effect hidden">';
    html += '<div class="modal-effect-header">';
    html += '<span class="collection-card-rarity ' + rarity + '">' + getRarityName(rarity) + '</span>';
    html += '<span class="modal-effect-name">' + effectData.name + '</span>';
    html += '</div>';
    html += '<p class="modal-effect-desc">' + effectData.desc + '</p>';
    html += '</div>';
    html += '<div class="modal-actions">';
    html += '<button class="btn btn-secondary" onclick="speakProverb(' + index + ')">🔊 发音</button>';
    html += '<button class="btn btn-secondary" onclick="closeModal()">关闭</button>';
    html += '</div>';
    html += '</div>';
    
    content.innerHTML = html;
    modal.classList.add('active');
}

function speakPhrase(index) {
    if (!('speechSynthesis' in window)) return;
    var phrase = phrases[index];
    if (!phrase) return;
    var utterance = new SpeechSynthesisUtterance(phrase.en);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

function speakProverb(index) {
    if (!('speechSynthesis' in window)) return;
    var proverb = proverbs[index];
    if (!proverb) return;
    var utterance = new SpeechSynthesisUtterance(proverb.en);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
}

let selectedNotebookWords = new Set();
let notebookFilter = 'all';
let notebookSearch = '';

function initNotebook() {
    var exportBtn = document.getElementById('export-notebook');
    var importBtn = document.getElementById('import-notebook');
    var searchInput = document.getElementById('notebook-search');
    var filterBtns = document.querySelectorAll('.notebook-filters .filter-btn');
    var selectAllBtn = document.getElementById('select-all-btn');
    var batchDeleteBtn = document.getElementById('batch-delete');
    var batchMasteredBtn = document.getElementById('batch-mastered');
    var batchExportBtn = document.getElementById('batch-export');
    var batchCancelBtn = document.getElementById('batch-cancel');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportNotebook);
    }
    
    if (importBtn) {
        importBtn.addEventListener('click', function() {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt,.json';
            input.onchange = function(e) {
                var file = e.target.files[0];
                if (file) {
                    var reader = new FileReader();
                    reader.onload = function(event) {
                        try {
                            var content = event.target.result;
                            var words;
                            if (file.name.endsWith('.json')) {
                                words = JSON.parse(content);
                            } else {
                                words = content.split('\n').map(function(w) { return w.trim(); }).filter(function(w) { return w; });
                            }
                            words.forEach(function(word) {
                                if (!gameState.notebook.includes(word)) {
                                    gameState.notebook.push(word);
                                }
                            });
                            saveGameState();
                            displayNotebook();
                            alert('成功导入 ' + words.length + ' 个单词');
                        } catch (err) {
                            alert('导入失败，请检查文件格式');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            notebookSearch = searchInput.value.toLowerCase();
            displayNotebook();
        });
    }
    
    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            notebookFilter = btn.dataset.filter;
            displayNotebook();
        });
    });
    
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', toggleSelectAll);
    }
    
    if (batchDeleteBtn) {
        batchDeleteBtn.addEventListener('click', batchDeleteWords);
    }
    
    if (batchMasteredBtn) {
        batchMasteredBtn.addEventListener('click', batchMarkMastered);
    }
    
    if (batchExportBtn) {
        batchExportBtn.addEventListener('click', batchExportWords);
    }
    
    if (batchCancelBtn) {
        batchCancelBtn.addEventListener('click', cancelSelection);
    }
    
    displayNotebook();
}

function displayNotebook() {
    var container = document.getElementById('notebook-list');
    var emptyEl = document.getElementById('notebook-empty');
    var countEl = document.getElementById('notebook-count');
    var batchActions = document.getElementById('notebook-batch-actions');
    
    if (!container) return;
    
    var filteredWords = gameState.notebook.filter(function(wordStr) {
        var word = vocabulary3500.words.find(function(w) { return w.word === wordStr; });
        if (!word) return false;
        
        if (notebookSearch) {
            var searchMatch = word.word.toLowerCase().includes(notebookSearch) || 
                             word.meaning.toLowerCase().includes(notebookSearch);
            if (!searchMatch) return false;
        }
        
        return true;
    });
    
    if (countEl) countEl.textContent = gameState.notebook.length;
    
    updateNotebookStats();
    
    if (filteredWords.length === 0) {
        container.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'flex';
        return;
    }
    
    if (emptyEl) emptyEl.style.display = 'none';
    
    var html = '';
    filteredWords.forEach(function(wordStr) {
        var word = vocabulary3500.words.find(function(w) { return w.word === wordStr; });
        if (word) {
            var wordIndex = getWordIndex(word.word);
            var isSelected = selectedNotebookWords.has(word.word);
            var status = getWordStatus(word.word);
            
            html += '<div class="notebook-item ' + (isSelected ? 'selected' : '') + '" data-word="' + word.word + '">';
            html += '<div class="checkbox"></div>';
            html += '<div class="word-info">';
            html += '<div class="word-text">' + word.word + '</div>';
            html += '<div class="word-phonetic">' + word.phonetic + '</div>';
            html += '</div>';
            html += '<div class="word-meaning">' + word.meaning + '</div>';
            html += '<span class="word-status ' + status + '">' + getStatusText(status) + '</span>';
            html += '<div class="word-actions">';
            html += '<button class="word-action-btn" onclick="speakWord(\'' + word.word + '\')">🔊 发音</button>';
            html += '<button class="word-action-btn" onclick="removeFromNotebook(\'' + word.word + '\')">🗑️ 删除</button>';
            html += '</div>';
            html += '</div>';
        }
    });
    container.innerHTML = html;
    
    container.querySelectorAll('.notebook-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('word-action-btn')) return;
            toggleWordSelection(item.dataset.word);
        });
    });
    
    updateBatchActions();
}

function getWordStatus(word) {
    if (!gameState.wordStatus) gameState.wordStatus = {};
    return gameState.wordStatus[word] || 'new';
}

function getStatusText(status) {
    var texts = {
        'new': '新词',
        'learning': '学习中',
        'mastered': '已掌握'
    };
    return texts[status] || '新词';
}

function updateNotebookStats() {
    var newCount = 0, learningCount = 0, masteredCount = 0;
    
    gameState.notebook.forEach(function(word) {
        var status = getWordStatus(word);
        if (status === 'new') newCount++;
        else if (status === 'learning') learningCount++;
        else if (status === 'mastered') masteredCount++;
    });
    
    var newCountEl = document.getElementById('notebook-new-count');
    var learningCountEl = document.getElementById('notebook-learning-count');
    var masteredCountEl = document.getElementById('notebook-mastered-count');
    var masteryRateEl = document.getElementById('notebook-mastery-rate');
    
    if (newCountEl) newCountEl.textContent = newCount;
    if (learningCountEl) learningCountEl.textContent = learningCount;
    if (masteredCountEl) masteredCountEl.textContent = masteredCount;
    
    var total = gameState.notebook.length;
    var rate = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
    if (masteryRateEl) masteryRateEl.textContent = rate + '%';
}

function toggleWordSelection(word) {
    if (selectedNotebookWords.has(word)) {
        selectedNotebookWords.delete(word);
    } else {
        selectedNotebookWords.add(word);
    }
    displayNotebook();
}

function toggleSelectAll() {
    var allSelected = selectedNotebookWords.size === gameState.notebook.length;
    
    if (allSelected) {
        selectedNotebookWords.clear();
    } else {
        gameState.notebook.forEach(function(word) {
            selectedNotebookWords.add(word);
        });
    }
    displayNotebook();
}

function updateBatchActions() {
    var batchActions = document.getElementById('notebook-batch-actions');
    var selectedCountEl = document.getElementById('selected-count');
    
    if (batchActions) {
        batchActions.style.display = selectedNotebookWords.size > 0 ? 'flex' : 'none';
    }
    if (selectedCountEl) {
        selectedCountEl.textContent = selectedNotebookWords.size;
    }
}

function batchDeleteWords() {
    if (selectedNotebookWords.size === 0) return;
    if (!confirm('确定要删除选中的 ' + selectedNotebookWords.size + ' 个单词吗？')) return;
    
    selectedNotebookWords.forEach(function(word) {
        var index = gameState.notebook.indexOf(word);
        if (index > -1) {
            gameState.notebook.splice(index, 1);
        }
    });
    
    saveGameState();
    selectedNotebookWords.clear();
    displayNotebook();
}

function batchMarkMastered() {
    if (selectedNotebookWords.size === 0) return;
    
    if (!gameState.wordStatus) gameState.wordStatus = {};
    selectedNotebookWords.forEach(function(word) {
        gameState.wordStatus[word] = 'mastered';
    });
    
    saveGameState();
    selectedNotebookWords.clear();
    displayNotebook();
}

function batchExportWords() {
    if (selectedNotebookWords.size === 0) return;
    
    var words = Array.from(selectedNotebookWords);
    var content = words.join('\n');
    var blob = new Blob([content], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'selected_words.txt';
    a.click();
}

function cancelSelection() {
    selectedNotebookWords.clear();
    displayNotebook();
}

function exportNotebook() {
    var content = gameState.notebook.join('\n');
    var blob = new Blob([content], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'notebook.txt';
    a.click();
}

function removeFromNotebook(word) {
    var index = gameState.notebook.indexOf(word);
    if (index > -1) {
        gameState.notebook.splice(index, 1);
        saveGameState();
        displayNotebook();
    }
}

var listeningFiles = [];
var speakingFiles = [];

let listeningIndex = 0;
let speakingIndex = 0;
let listeningPlayMode = 'sequence';
let speakingPlayMode = 'follow';

var listeningFiles = [
    '1-201403(1).mp3', '1-201403.mp3', '10-（16年9月全国二级）.mp3', '2-  2014年9月.mp3',
    '20   2019年9月PETS2级听力音频(1).mp3', '2018(15)(听力).mp3', '2018年（16）.mp3',
    '2018年（17）.mp3', '2018年（18）.mp3', '2018（19）.mp3', '2020高考英语听力音频（全国卷II,III）(1).mp3',
    '2020高考英语听力音频（全国卷II,III）(3).mp3', '21--2019年3月贵州高考听力音频(1).mp3',
    '22-2019年全国Ⅰ卷（主播：男Kristopher Chung和女Tushka Bergen）.mp3',
    '23 2019年全国II卷Ⅲ卷（主播：男Kristopher Chung和女Tushka Bergen）(1).mp3',
    '23 2019年全国II卷Ⅲ卷（主播：男Kristopher Chung和女Tushka Bergen）.mp3',
    '24  2019年浙江卷（音频）.mp3', '24-2020年9月26日PETS2英语听力音频(1).mp3',
    '25-2020年全国II卷Ⅲ卷(1).mp3', '26-2020年高考全国卷英语听力试题 第一套卷：适用河南、山西(1).mp3',
    '27-2020年1月8日山东新高考英语听力真题音频（第二次）(1).mp3',
    '28-2020年山东卷-高考英语听力真题（含MP3）(1).mp3', '2_2020高考英语听力音频（全国卷II,III）.mp3',
    '3-(2015年3月).mp3', '3_2020高考英语听力音频（全国卷II,III）.mp3',
    '3_听力训练51（2025年全国二卷）.mp3', '4-(2015年9月).mp3', '5 2014年高考湖北卷听力（.mp3',
    '6-2016年全国卷I.mp3', '7-2016年全国卷Ⅱ.mp3', '8-2016浙江卷10月.mp3',
    '9-（2016年3月全国二级）.mp3', '听力训练11 全国1卷(1).mp3', '听力训练12 （2017年全国2卷）.mp3',
    '听力训练13（浙江卷）.mp3', '听力训练14（北京卷）.mp3', '听力训练29 2021年英语全国甲、乙卷听力(1).mp3',
    '听力训练51（2025年全国二卷）(2).mp3', '英语听力3(1).mp3'
];

var speakingFiles = [
    '大一轮复习讲义（话题版）语境 1(1) (1).mp3', '大一轮复习讲义（话题版）语境 10(1).mp3',
    '大一轮复习讲义（话题版）语境 3(1) (1).mp3', '大一轮复习讲义（话题版）语境 33(1) (1).mp3',
    '大一轮复习讲义（话题版）语境 34(1) (1).mp3', '大一轮复习讲义（话题版）语境 4(1) (1).mp3',
    '大一轮复习讲义（话题版）语境 5(1) (1).mp3', '大一轮复习讲义（话题版）语境 6(1) (1).mp3',
    '大一轮复习讲义（话题版）语境 7(1) (1).mp3', '大一轮复习讲义（话题版）语境 8(1) (1).mp3',
    '大一轮复习讲义（话题版）语境 9(1).mp3'
];

var listeningCustomPlaylist = [];
var speakingCustomPlaylist = [];

function initAudioLists() {
    loadCustomPlaylists();
    setupListeningPageNew();
    setupSpeakingPageNew();
}

function loadCustomPlaylists() {
    var savedListening = localStorage.getItem('listeningCustomPlaylist');
    var savedSpeaking = localStorage.getItem('speakingCustomPlaylist');
    if (savedListening) listeningCustomPlaylist = JSON.parse(savedListening);
    if (savedSpeaking) speakingCustomPlaylist = JSON.parse(savedSpeaking);
}

function saveCustomPlaylists() {
    localStorage.setItem('listeningCustomPlaylist', JSON.stringify(listeningCustomPlaylist));
    localStorage.setItem('speakingCustomPlaylist', JSON.stringify(speakingCustomPlaylist));
}

var listeningAudios = [];
var speakingAudios = [];
var currentListeningIndex = -1;
var currentSpeakingIndex = -1;
var listeningAudioElement = null;
var speakingAudioElement = null;

function setupListeningPageNew() {
    var container = document.getElementById('audio-list');
    var searchInput = document.getElementById('listening-search');
    var countEl = document.getElementById('listening-count');
    var playedEl = document.getElementById('listening-played');
    var player = document.getElementById('listening-player');
    var playBtn = document.getElementById('listening-play-btn');
    var prevBtn = document.getElementById('listening-prev-btn');
    var nextBtn = document.getElementById('listening-next-btn');
    var volumeSlider = document.getElementById('listening-volume');
    var progressSlider = document.getElementById('listening-progress-slider');
    var currentTimeEl = document.getElementById('listening-current-time');
    var durationEl = document.getElementById('listening-duration');
    var titleEl = document.getElementById('listening-player-title');
    
    if (!listeningAudioElement) {
        listeningAudioElement = document.createElement('audio');
        listeningAudioElement.id = 'listening-audio-element';
        document.body.appendChild(listeningAudioElement);
    }
    
    var localAudio = listeningAudioElement;
    
    listeningAudios = [
        { name: '2014年3月高考听力', path: 'audio/听力/1-201403(1).mp3' },
        { name: '2014年9月高考听力', path: 'audio/听力/2-  2014年9月.mp3' },
        { name: '2015年3月高考听力', path: 'audio/听力/3-(2015年3月).mp3' },
        { name: '2015年9月高考听力', path: 'audio/听力/4-(2015年9月).mp3' },
        { name: '2014年湖北卷听力', path: 'audio/听力/5 2014年高考湖北卷听力（.mp3' },
        { name: '2016年全国卷I', path: 'audio/听力/6-2016年全国卷I.mp3' },
        { name: '2016年全国卷II', path: 'audio/听力/7-2016年全国卷Ⅱ.mp3' },
        { name: '2016年浙江卷10月', path: 'audio/听力/8-2016浙江卷10月.mp3' },
        { name: '2016年3月全国二级', path: 'audio/听力/9-（2016年3月全国二级）.mp3' },
        { name: '2016年9月全国二级', path: 'audio/听力/10-（16年9月全国二级）.mp3' },
        { name: '2018年高考听力(15)', path: 'audio/听力/2018(15)(听力).mp3' },
        { name: '2018年高考听力(16)', path: 'audio/听力/2018年（16）.mp3' },
        { name: '2018年高考听力(17)', path: 'audio/听力/2018年（17）.mp3' },
        { name: '2018年高考听力(18)', path: 'audio/听力/2018年（18）.mp3' },
        { name: '2018年高考听力(19)', path: 'audio/听力/2018（19）.mp3' },
        { name: '2020年全国卷II III', path: 'audio/听力/2020高考英语听力音频（全国卷II,III）(1).mp3' },
        { name: '2019年9月PETS2级', path: 'audio/听力/20   2019年9月PETS2级听力音频(1).mp3' },
        { name: '2019年3月贵州高考', path: 'audio/听力/21--2019年3月贵州高考听力音频(1).mp3' },
        { name: '2019年全国I卷', path: 'audio/听力/22-2019年全国Ⅰ卷（主播：男Kristopher Chung和女Tushka Bergen）.mp3' },
        { name: '2019年全国II III卷', path: 'audio/听力/23 2019年全国II卷Ⅲ卷（主播：男Kristopher Chung和女Tushka Bergen）(1).mp3' },
        { name: '2019年浙江卷', path: 'audio/听力/24  2019年浙江卷（音频）.mp3' },
        { name: '2020年9月PETS2', path: 'audio/听力/24-2020年9月26日PETS2英语听力音频(1).mp3' },
        { name: '2020年全国II III卷', path: 'audio/听力/25-2020年全国II卷Ⅲ卷(1).mp3' },
        { name: '2020年全国卷河南山西', path: 'audio/听力/26-2020年高考全国卷英语听力试题 第一套卷：适用河南、山西(1).mp3' },
        { name: '2020年山东新高考(第二次)', path: 'audio/听力/27-2020年1月8日山东新高考英语听力真题音频（第二次）(1).mp3' },
        { name: '2020年山东卷', path: 'audio/听力/28-2020年山东卷-高考英语听力真题（含MP3）(1).mp3' },
        { name: '2021年全国甲乙卷', path: 'audio/听力/听力训练29 2021年英语全国甲、乙卷听力(1).mp3' },
        { name: '2025年全国二卷', path: 'audio/听力/3_听力训练51（2025年全国二卷）.mp3' }
    ];
    
    if (countEl) countEl.textContent = listeningAudios.length;
    if (playedEl) playedEl.textContent = gameState.listeningPlayed || 0;
    
    function renderList(filter) {
        if (!container) return;
        var filtered = listeningAudios.filter(function(a) {
            return !filter || a.name.toLowerCase().includes(filter.toLowerCase());
        });
        
        var html = '';
        filtered.forEach(function(audio, index) {
            html += '<div class="audio-item-premium" data-index="' + listeningAudios.indexOf(audio) + '">';
            html += '<span class="audio-item-name">' + audio.name + '</span>';
            html += '</div>';
        });
        container.innerHTML = html;
        
        container.querySelectorAll('.audio-item-premium').forEach(function(item) {
            item.addEventListener('click', function() {
                var idx = parseInt(item.dataset.index);
                playListeningAudio(idx);
            });
        });
    }
    
    renderList();
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderList(searchInput.value);
        });
    }
    
    function playListeningAudio(index) {
        if (index < 0 || index >= listeningAudios.length) return;
        currentListeningIndex = index;
        var audio = listeningAudios[index];
        
        if (localAudio) {
            localAudio.src = audio.path;
            localAudio.play();
        }
        
        if (titleEl) titleEl.textContent = audio.name;
        if (player) player.style.display = 'block';
        
        gameState.listeningPlayed = (gameState.listeningPlayed || 0) + 1;
        if (playedEl) playedEl.textContent = gameState.listeningPlayed;
        saveGameState();
        
        container.querySelectorAll('.audio-item-premium').forEach(function(item, i) {
            item.classList.toggle('playing', i === index);
        });
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            if (localAudio) {
                if (localAudio.paused) {
                    localAudio.play();
                    playBtn.textContent = '⏸';
                } else {
                    localAudio.pause();
                    playBtn.textContent = '▶';
                }
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentListeningIndex > 0) {
                playListeningAudio(currentListeningIndex - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentListeningIndex < listeningAudios.length - 1) {
                playListeningAudio(currentListeningIndex + 1);
            }
        });
    }
    
    if (volumeSlider && localAudio) {
        volumeSlider.addEventListener('input', function() {
            localAudio.volume = volumeSlider.value / 100;
        });
    }
    
    if (progressSlider && localAudio) {
        progressSlider.addEventListener('input', function() {
            if (localAudio.duration) {
                localAudio.currentTime = (progressSlider.value / 100) * localAudio.duration;
            }
        });
    }
    
    if (localAudio) {
        localAudio.addEventListener('timeupdate', function() {
            if (localAudio.duration) {
                var percent = (localAudio.currentTime / localAudio.duration) * 100;
                if (progressSlider) progressSlider.value = percent;
            }
            if (currentTimeEl) {
                currentTimeEl.textContent = formatTime(localAudio.currentTime);
            }
        });
        
        localAudio.addEventListener('loadedmetadata', function() {
            if (durationEl) {
                durationEl.textContent = formatTime(localAudio.duration);
            }
        });
        
        localAudio.addEventListener('play', function() {
            if (playBtn) playBtn.textContent = '⏸';
        });
        
        localAudio.addEventListener('pause', function() {
            if (playBtn) playBtn.textContent = '▶';
        });
    }
}

function setupSpeakingPageNew() {
    var container = document.getElementById('speaking-list');
    var searchInput = document.getElementById('speaking-search');
    var countEl = document.getElementById('speaking-count');
    var playedEl = document.getElementById('speaking-played');
    var player = document.getElementById('speaking-player');
    var playBtn = document.getElementById('speaking-play-btn');
    var prevBtn = document.getElementById('speaking-prev-btn');
    var nextBtn = document.getElementById('speaking-next-btn');
    var volumeSlider = document.getElementById('speaking-volume');
    var currentTimeEl = document.getElementById('speaking-current-time');
    var durationEl = document.getElementById('speaking-duration');
    var titleEl = document.getElementById('speaking-player-title');
    
    if (!speakingAudioElement) {
        speakingAudioElement = document.createElement('audio');
        speakingAudioElement.id = 'speaking-audio-element';
        document.body.appendChild(speakingAudioElement);
    }
    
    var localAudio = speakingAudioElement;
    
    speakingAudios = [
        { name: '语境1', path: 'audio/口语/大一轮复习讲义（话题版）语境 1(1) (1).mp3' },
        { name: '语境3', path: 'audio/口语/大一轮复习讲义（话题版）语境 3(1) (1).mp3' },
        { name: '语境4', path: 'audio/口语/大一轮复习讲义（话题版）语境 4(1) (1).mp3' },
        { name: '语境5', path: 'audio/口语/大一轮复习讲义（话题版）语境 5(1) (1).mp3' },
        { name: '语境6', path: 'audio/口语/大一轮复习讲义（话题版）语境 6(1) (1).mp3' },
        { name: '语境7', path: 'audio/口语/大一轮复习讲义（话题版）语境 7(1) (1).mp3' },
        { name: '语境8', path: 'audio/口语/大一轮复习讲义（话题版）语境 8(1) (1).mp3' },
        { name: '语境9', path: 'audio/口语/大一轮复习讲义（话题版）语境 9(1).mp3' },
        { name: '语境10', path: 'audio/口语/大一轮复习讲义（话题版）语境 10(1).mp3' },
        { name: '语境33', path: 'audio/口语/大一轮复习讲义（话题版）语境 33(1) (1).mp3' },
        { name: '语境34', path: 'audio/口语/大一轮复习讲义（话题版）语境 34(1) (1).mp3' }
    ];
    
    if (countEl) countEl.textContent = speakingAudios.length;
    if (playedEl) playedEl.textContent = gameState.speakingPlayed || 0;
    
    function renderList(filter) {
        if (!container) return;
        var filtered = speakingAudios.filter(function(a) {
            return !filter || a.name.toLowerCase().includes(filter.toLowerCase());
        });
        
        var html = '';
        filtered.forEach(function(audio, index) {
            html += '<div class="audio-item-premium" data-index="' + speakingAudios.indexOf(audio) + '">';
            html += '<span class="audio-item-name">' + audio.name + '</span>';
            html += '</div>';
        });
        container.innerHTML = html;
        
        container.querySelectorAll('.audio-item-premium').forEach(function(item) {
            item.addEventListener('click', function() {
                var idx = parseInt(item.dataset.index);
                playSpeakingAudio(idx);
            });
        });
    }
    
    renderList();
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderList(searchInput.value);
        });
    }
    
    function playSpeakingAudio(index) {
        if (index < 0 || index >= speakingAudios.length) return;
        currentSpeakingIndex = index;
        var audio = speakingAudios[index];
        
        if (localAudio) {
            localAudio.src = audio.path;
            localAudio.play();
        }
        
        if (titleEl) titleEl.textContent = audio.name;
        if (player) player.style.display = 'block';
        
        gameState.speakingPlayed = (gameState.speakingPlayed || 0) + 1;
        if (playedEl) playedEl.textContent = gameState.speakingPlayed;
        saveGameState();
        
        container.querySelectorAll('.audio-item-premium').forEach(function(item, i) {
            item.classList.toggle('playing', i === index);
        });
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            if (localAudio) {
                if (localAudio.paused) {
                    localAudio.play();
                    playBtn.textContent = '⏸';
                } else {
                    localAudio.pause();
                    playBtn.textContent = '▶';
                }
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentSpeakingIndex > 0) {
                playSpeakingAudio(currentSpeakingIndex - 1);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentSpeakingIndex < speakingAudios.length - 1) {
                playSpeakingAudio(currentSpeakingIndex + 1);
            }
        });
    }
    
    if (volumeSlider && localAudio) {
        volumeSlider.addEventListener('input', function() {
            localAudio.volume = volumeSlider.value / 100;
        });
    }
    
    if (localAudio) {
        localAudio.addEventListener('timeupdate', function() {
            if (currentTimeEl && localAudio.duration) {
                currentTimeEl.textContent = formatTime(localAudio.currentTime);
            }
        });
        
        localAudio.addEventListener('loadedmetadata', function() {
            if (durationEl) {
                durationEl.textContent = formatTime(localAudio.duration);
            }
        });
        
        localAudio.addEventListener('play', function() {
            if (playBtn) playBtn.textContent = '⏸';
        });
        
        localAudio.addEventListener('pause', function() {
            if (playBtn) playBtn.textContent = '▶';
        });
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function addToListeningPlaylist(idx) {
    if (!listeningCustomPlaylist.includes(idx)) {
        listeningCustomPlaylist.push(idx);
        saveCustomPlaylists();
        renderListeningCustomPlaylist();
    }
}

function removeFromListeningPlaylist(idx) {
    var pos = listeningCustomPlaylist.indexOf(idx);
    if (pos > -1) {
        listeningCustomPlaylist.splice(pos, 1);
        saveCustomPlaylists();
        renderListeningCustomPlaylist();
    }
}

function renderListeningCustomPlaylist() {
    var container = document.getElementById('listening-custom-list');
    var emptyMsg = document.getElementById('listening-playlist-empty');
    
    if (!container) return;
    
    if (listeningCustomPlaylist.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    if (emptyMsg) emptyMsg.style.display = 'none';
    
    var html = '';
    listeningCustomPlaylist.forEach(function(idx, i) {
        html += '<div class="custom-playlist-item" data-index="' + idx + '">';
        html += '<span class="custom-playlist-num">' + (i + 1) + '</span>';
        html += '<span class="custom-playlist-name">' + listeningFiles[idx] + '</span>';
        html += '<button class="remove-from-playlist-btn" data-index="' + idx + '" title="移除">×</button>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    container.querySelectorAll('.custom-playlist-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-from-playlist-btn')) return;
            listeningIndex = parseInt(item.dataset.index);
            playListeningAudio();
        });
    });
    
    container.querySelectorAll('.remove-from-playlist-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            removeFromListeningPlaylist(parseInt(btn.dataset.index));
        });
    });
}

function playListeningAudio() {
    var audioEl = document.getElementById('listening-audio');
    var titleEl = document.getElementById('listening-title');
    var playlistEl = document.getElementById('listening-playlist');
    
    if (audioEl) {
        audioEl.src = 'audio/听力/' + encodeURIComponent(listeningFiles[listeningIndex]);
        audioEl.play();
    }
    
    if (titleEl) {
        titleEl.textContent = listeningFiles[listeningIndex];
    }
    
    if (playlistEl) {
        playlistEl.querySelectorAll('.audio-playlist-item').forEach(function(item, idx) {
            item.classList.toggle('active', idx === listeningIndex);
        });
    }
    
    var countEl = document.getElementById('listening-count');
    if (countEl) countEl.textContent = listeningIndex + 1;
    
    if (!gameState.listenedCount) gameState.listenedCount = 0;
    gameState.listenedCount++;
    saveGameState();
    if (gameState.listenedCount >= 1) unlockAchievement(33);
    if (gameState.listenedCount >= 50) unlockAchievement(34);
}

function setupSpeakingPage() {
    var playlistEl = document.getElementById('speaking-playlist');
    var audioEl = document.getElementById('speaking-audio');
    var titleEl = document.getElementById('speaking-title');
    var prevBtn = document.getElementById('speaking-prev');
    var nextBtn = document.getElementById('speaking-next');
    var playBtn = document.getElementById('speaking-play-btn');
    var backBtn = document.getElementById('back-from-speaking');
    var playModeBtns = document.querySelectorAll('#page-audio-speaking .play-mode-btn');
    var speedSelect = document.getElementById('speaking-speed');
    var clearPlaylistBtn = document.getElementById('speaking-clear-playlist');
    
    if (playlistEl) {
        var html = '';
        speakingFiles.forEach(function(file, idx) {
            html += '<div class="audio-playlist-item" data-index="' + idx + '">';
            html += '<span class="playlist-number">' + (idx + 1) + '</span>';
            html += '<span class="playlist-name">' + file + '</span>';
            html += '<button class="add-to-playlist-btn" data-index="' + idx + '" title="添加到播放列表">+</button>';
            html += '</div>';
        });
        playlistEl.innerHTML = html;
        
        playlistEl.querySelectorAll('.audio-playlist-item').forEach(function(item) {
            item.addEventListener('click', function(e) {
                if (e.target.classList.contains('add-to-playlist-btn')) return;
                speakingIndex = parseInt(item.dataset.index);
                playSpeakingAudio();
            });
        });
        
        playlistEl.querySelectorAll('.add-to-playlist-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var idx = parseInt(btn.dataset.index);
                addToSpeakingPlaylist(idx);
            });
        });
    }
    
    if (clearPlaylistBtn) {
        clearPlaylistBtn.addEventListener('click', function() {
            speakingCustomPlaylist = [];
            saveCustomPlaylists();
            renderSpeakingCustomPlaylist();
        });
    }
    
    playModeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            playModeBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            speakingPlayMode = btn.dataset.mode;
        });
    });
    
    if (speedSelect && audioEl) {
        speedSelect.addEventListener('change', function() {
            audioEl.playbackRate = parseFloat(speedSelect.value);
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (speakingIndex > 0) {
                speakingIndex--;
                playSpeakingAudio();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (speakingIndex < speakingFiles.length - 1) {
                speakingIndex++;
                playSpeakingAudio();
            }
        });
    }
    
    if (playBtn && audioEl) {
        playBtn.addEventListener('click', function() {
            if (audioEl.paused) {
                audioEl.play();
            } else {
                audioEl.pause();
            }
        });
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            navigateTo('home');
        });
    }
    
    renderSpeakingCustomPlaylist();
}

function addToSpeakingPlaylist(idx) {
    if (!speakingCustomPlaylist.includes(idx)) {
        speakingCustomPlaylist.push(idx);
        saveCustomPlaylists();
        renderSpeakingCustomPlaylist();
    }
}

function removeFromSpeakingPlaylist(idx) {
    var pos = speakingCustomPlaylist.indexOf(idx);
    if (pos > -1) {
        speakingCustomPlaylist.splice(pos, 1);
        saveCustomPlaylists();
        renderSpeakingCustomPlaylist();
    }
}

function renderSpeakingCustomPlaylist() {
    var container = document.getElementById('speaking-custom-list');
    var emptyMsg = document.getElementById('speaking-playlist-empty');
    
    if (!container) return;
    
    if (speakingCustomPlaylist.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    
    if (emptyMsg) emptyMsg.style.display = 'none';
    
    var html = '';
    speakingCustomPlaylist.forEach(function(idx, i) {
        html += '<div class="custom-playlist-item" data-index="' + idx + '">';
        html += '<span class="custom-playlist-num">' + (i + 1) + '</span>';
        html += '<span class="custom-playlist-name">' + speakingFiles[idx] + '</span>';
        html += '<button class="remove-from-playlist-btn" data-index="' + idx + '" title="移除">×</button>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    container.querySelectorAll('.custom-playlist-item').forEach(function(item) {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-from-playlist-btn')) return;
            speakingIndex = parseInt(item.dataset.index);
            playSpeakingAudio();
        });
    });
    
    container.querySelectorAll('.remove-from-playlist-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            removeFromSpeakingPlaylist(parseInt(btn.dataset.index));
        });
    });
}

function playSpeakingAudio() {
    var audioEl = document.getElementById('speaking-audio');
    var titleEl = document.getElementById('speaking-title');
    var playlistEl = document.getElementById('speaking-playlist');
    
    if (audioEl) {
        audioEl.src = 'audio/口语/' + encodeURIComponent(speakingFiles[speakingIndex]);
        audioEl.play();
    }
    
    if (titleEl) {
        titleEl.textContent = speakingFiles[speakingIndex];
    }
    
    if (playlistEl) {
        playlistEl.querySelectorAll('.audio-playlist-item').forEach(function(item, idx) {
            item.classList.toggle('active', idx === speakingIndex);
        });
    }
    
    var countEl = document.getElementById('speaking-count');
    if (countEl) countEl.textContent = speakingIndex + 1;
    
    if (!gameState.spokenCount) gameState.spokenCount = 0;
    gameState.spokenCount++;
    saveGameState();
    if (gameState.spokenCount >= 1) unlockAchievement(35);
    if (gameState.spokenCount >= 50) unlockAchievement(36);
}

let memoryGameMode = 'word-meaning';

function initMemoryGame() {
    var restartBtn = document.getElementById('memory-restart');
    var modeBtns = document.querySelectorAll('.memory-mode-btn');
    var difficultyBtns = document.querySelectorAll('.difficulty-btn');
    var backBtn = document.getElementById('back-from-memory');
    
    modeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            modeBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            memoryGameMode = btn.dataset.mode;
        });
    });
    
    difficultyBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            difficultyBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            memoryGame.difficulty = btn.dataset.difficulty;
        });
    });
    
    if (restartBtn) {
        restartBtn.addEventListener('click', startMemoryGame);
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            navigateTo('home');
        });
    }
    
    startMemoryGame();
}

function startMemoryGame() {
    var pairs = memoryGame.difficulty === 'easy' ? 6 : 
                memoryGame.difficulty === 'medium' ? 9 : 
                memoryGame.difficulty === 'hard' ? 12 : 16;
    
    var words = vocabulary3500.words
        .sort(function() { return Math.random() - 0.5; })
        .slice(0, pairs);
    
    memoryGame.cards = [];
    words.forEach(function(word, index) {
        if (memoryGameMode === 'word-meaning') {
            memoryGame.cards.push({ id: index * 2, type: 'word', content: word.word, pairId: index });
            memoryGame.cards.push({ id: index * 2 + 1, type: 'meaning', content: word.meaning, pairId: index });
        } else if (memoryGameMode === 'word-phonetic') {
            memoryGame.cards.push({ id: index * 2, type: 'word', content: word.word, pairId: index });
            memoryGame.cards.push({ id: index * 2 + 1, type: 'phonetic', content: word.phonetic, pairId: index });
        } else if (memoryGameMode === 'synonym') {
            memoryGame.cards.push({ id: index * 2, type: 'word', content: word.word, pairId: index });
            memoryGame.cards.push({ id: index * 2 + 1, type: 'meaning', content: word.meaning, pairId: index });
        }
    });
    
    memoryGame.cards = memoryGame.cards.sort(function() { return Math.random() - 0.5; });
    memoryGame.flipped = [];
    memoryGame.matched = [];
    memoryGame.moves = 0;
    memoryGame.timeElapsed = 0;
    
    if (memoryGame.timer) {
        clearInterval(memoryGame.timer);
        memoryGame.timer = null;
    }
    
    memoryGame.timer = setInterval(function() {
        memoryGame.timeElapsed++;
        updateMemoryStats();
    }, 1000);
    
    displayMemoryCards();
    updateMemoryStats();
}

function displayMemoryCards() {
    var grid = document.getElementById('memory-grid');
    if (!grid) return;
    
    var cols = memoryGame.difficulty === 'easy' ? 3 : 
               memoryGame.difficulty === 'medium' ? 4 : 
               memoryGame.difficulty === 'hard' ? 4 : 5;
    grid.setAttribute('data-cols', cols);
    
    var html = '';
    memoryGame.cards.forEach(function(card, index) {
        var isFlipped = memoryGame.flipped.includes(index) || memoryGame.matched.includes(card.pairId);
        var isMatched = memoryGame.matched.includes(card.pairId);
        
        html += '<div class="memory-card-premium ' + (isFlipped ? 'flipped' : '') + ' ' + (isMatched ? 'matched' : '') + '" data-index="' + index + '">';
        html += '<div class="memory-card-face memory-card-front"></div>';
        html += '<div class="memory-card-face memory-card-back">' + card.content + '</div>';
        html += '</div>';
    });
    grid.innerHTML = html;
    
    grid.querySelectorAll('.memory-card-premium').forEach(function(cardEl) {
        cardEl.addEventListener('click', function() {
            var index = parseInt(cardEl.dataset.index);
            handleMemoryCardClick(index);
        });
    });
}

function handleMemoryCardClick(index) {
    if (memoryGame.flipped.length >= 2) return;
    if (memoryGame.flipped.includes(index)) return;
    if (memoryGame.matched.includes(memoryGame.cards[index].pairId)) return;
    
    memoryGame.flipped.push(index);
    displayMemoryCards();
    
    if (memoryGame.flipped.length === 2) {
        memoryGame.moves++;
        updateMemoryStats();
        
        var first = memoryGame.cards[memoryGame.flipped[0]];
        var second = memoryGame.cards[memoryGame.flipped[1]];
        
        if (first.pairId === second.pairId) {
            memoryGame.matched.push(first.pairId);
            memoryGame.flipped = [];
            displayMemoryCards();
            
            if (memoryGame.matched.length === memoryGame.cards.length / 2) {
                endMemoryGame();
            }
        } else {
            setTimeout(function() {
                memoryGame.flipped = [];
                displayMemoryCards();
            }, 1000);
        }
    }
}

function updateMemoryStats() {
    var matchesEl = document.getElementById('memory-matches');
    var movesEl = document.getElementById('memory-moves');
    var timeEl = document.getElementById('memory-time');
    
    if (matchesEl) matchesEl.textContent = memoryGame.matched.length;
    if (movesEl) movesEl.textContent = memoryGame.moves;
    if (timeEl) {
        var mins = Math.floor(memoryGame.timeElapsed / 60);
        var secs = memoryGame.timeElapsed % 60;
        timeEl.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
}

function endMemoryGame() {
    if (memoryGame.timer) {
        clearInterval(memoryGame.timer);
        memoryGame.timer = null;
    }
    
    addScore(20);
    unlockAchievement(13);
    
    if (memoryGame.timeElapsed <= 30) unlockAchievement(73);
    if (memoryGame.moves === memoryGame.cards.length / 2) unlockAchievement(74);
}

function getCardCost(effect) {
    var costs = {
        attack: 1, heavy_attack: 2, double_attack: 2, triple_attack: 3,
        heal: 1, big_heal: 3, shield: 1, big_shield: 2,
        power_up: 1, super_power_up: 2,
        poison: 2, super_poison: 3,
        stun: 3, sleep: 4,
        draw: 1, big_draw: 2, draw_risk: 2, refresh: 2,
        critical: 2, super_critical: 3,
        lifesteal: 2, big_lifesteal: 3,
        fireball: 2, ice_shield: 3, thunder: 2,
        regeneration: 2, super_regeneration: 3,
        energy_restore: 2, full_energy: 3,
        damage_reduction: 2, damage_immunity: 4,
        damage_boost: 2, double_damage: 3
    };
    return costs[effect] || 1;
}

function spawnEnemy() {
    var enemyIndex = Math.min(dungeonGame.floor - 1, enemies.length - 1);
    dungeonGame.enemy = enemies[enemyIndex];
    dungeonGame.enemyHP = dungeonGame.enemy.hp + (dungeonGame.floor - 1) * 20;
    dungeonGame.enemyMaxHP = dungeonGame.enemyHP;
}

function drawCards(count) {
    count = count || 1;
    for (var i = 0; i < count; i++) {
        if (dungeonGame.deck.length === 0) {
            if (dungeonGame.discardPile.length === 0) break;
            dungeonGame.deck = dungeonGame.discardPile.sort(function() { return Math.random() - 0.5; });
            dungeonGame.discardPile = [];
        }
        
        if (dungeonGame.deck.length > 0 && dungeonGame.hand.length < 10) {
            dungeonGame.hand.push(dungeonGame.deck.pop());
        }
    }
    updateBattleUI();
}

function playCard(index) {
    if (!dungeonGame.isPlayerTurn) return;
    
    var card = dungeonGame.hand[index];
    var effect = cardEffects[card.effect];
    
    if (dungeonGame.energy < card.cost) {
        addBattleLog('能量不足!');
        return;
    }
    
    dungeonGame.energy -= card.cost;
    dungeonGame.cardsPlayed++;
    
    var damage = dungeonGame.playerATK;
    var effectPower = effect.power || 1;
    
    if (dungeonGame.powerUp) {
        if (dungeonGame.powerUp === 'super') {
            damage *= 3;
        } else {
            damage *= 2;
        }
        dungeonGame.powerUp = false;
    }
    
    if (dungeonGame.damageBoost > 0) {
        damage = Math.floor(damage * (1 + dungeonGame.damageBoost));
    }
    
    var isCrit = Math.random() < 0.3 && dungeonGame.playerClass === 'archer';
    
    if (dungeonGame.playerClass === 'assassin' && dungeonGame.firstAttack) {
        isCrit = true;
        dungeonGame.firstAttack = false;
    }
    
    var berserkerBonus = 0;
    if (dungeonGame.playerClass === 'berserker') {
        var hpPercent = dungeonGame.playerHP / dungeonGame.playerMaxHP;
        berserkerBonus = Math.floor((1 - hpPercent) * 0.5 * dungeonGame.playerATK);
        if (berserkerBonus > 0) {
            damage += berserkerBonus;
        }
    }
    
    if (dungeonGame.summons && dungeonGame.summons.length > 0) {
        var summonDamage = 0;
        dungeonGame.summons.forEach(function(summon) {
            summonDamage += summon.attack;
        });
        damage += summonDamage;
        if (summonDamage > 0) {
            addBattleLog('随从造成 ' + summonDamage + ' 伤害!');
        }
    }
    
    switch(effect.effect) {
        case 'damage':
            damage = Math.floor(damage * effectPower);
            if (isCrit) damage = Math.floor(damage * 1.5);
            dungeonGame.enemyHP -= damage;
            addBattleLog('使用 ' + card.word + ' 造成 ' + damage + ' 伤害!' + (isCrit ? ' 暴击!' : ''));
            break;
            
        case 'double_damage':
        case 'triple_damage':
        case 'heavy_attack':
            damage = Math.floor(damage * effectPower);
            if (isCrit) damage = Math.floor(damage * 1.5);
            dungeonGame.enemyHP -= damage;
            if (effect.effect === 'double_damage') dungeonGame.enemyHP -= damage;
            if (effect.effect === 'triple_damage') dungeonGame.enemyHP -= damage * 2;
            var times = effect.effect === 'triple_damage' ? 'x3' : (effect.effect === 'double_damage' ? 'x2' : '');
            addBattleLog('使用 ' + card.word + ' 造成 ' + damage + times + ' 伤害!');
            break;
            
        case 'heal':
        case 'big_heal':
            var healAmount = Math.floor(dungeonGame.playerMaxHP * effect.amount);
            dungeonGame.playerHP = Math.min(dungeonGame.playerMaxHP, dungeonGame.playerHP + healAmount);
            addBattleLog('使用 ' + card.word + ' 恢复 ' + healAmount + ' HP!');
            break;
            
        case 'shield':
        case 'big_shield':
            dungeonGame.shield = effect.effect === 'big_shield' ? 'big' : true;
            addBattleLog('使用 ' + card.word + ' 获得护盾!');
            break;
            
        case 'power_up':
        case 'super_power_up':
            dungeonGame.powerUp = effect.effect === 'super_power_up' ? 'super' : true;
            addBattleLog('使用 ' + card.word + ' 下次攻击伤害' + (effect.effect === 'super_power_up' ? '三倍' : '翻倍') + '!');
            break;
            
        case 'poison':
        case 'super_poison':
            dungeonGame.poison = effect.effect === 'super_poison' ? 'super' : true;
            addBattleLog('使用 ' + card.word + ' 敌人中毒!');
            break;
            
        case 'stun':
        case 'sleep':
            dungeonGame.stunEnemy = effect.effect === 'sleep' ? 'sleep' : true;
            if (effect.effect === 'sleep') {
                dungeonGame.stunTurns = 1;
            }
            addBattleLog('使用 ' + card.word + ' 敌人被' + (effect.effect === 'sleep' ? '催眠' : '眩晕') + '!');
            break;
            
        case 'draw':
        case 'big_draw':
        case 'draw_risk':
            drawCards(effect.count);
            if (effect.effect === 'draw_risk') {
                var riskHeal = Math.floor(dungeonGame.enemyMaxHP * 0.2);
                dungeonGame.enemyHP = Math.min(dungeonGame.enemyMaxHP, dungeonGame.enemyHP + riskHeal);
            }
            addBattleLog('使用 ' + card.word + ' 抽取 ' + effect.count + ' 张牌!' + (effect.effect === 'draw_risk' ? ' 敌人恢复了20%HP!' : ''));
            break;
            
        case 'refresh':
            drawCards(5 - dungeonGame.hand.length);
            addBattleLog('使用 ' + card.word + ' 补满手牌!');
            break;
            
        case 'critical':
        case 'super_critical':
            damage = Math.floor(damage * (effect.effect === 'super_critical' ? 3 : 2));
            dungeonGame.enemyHP -= damage;
            addBattleLog('使用 ' + card.word + ' ' + (effect.effect === 'super_critical' ? '超级暴击' : '暴击') + '造成 ' + damage + ' 伤害!');
            break;
            
        case 'lifesteal':
        case 'big_lifesteal':
            dungeonGame.enemyHP -= damage;
            var lifesteal = Math.floor(damage * effect.rate);
            dungeonGame.playerHP = Math.min(dungeonGame.playerMaxHP, dungeonGame.playerHP + lifesteal);
            addBattleLog('使用 ' + card.word + ' 造成 ' + damage + ' 伤害, 恢复 ' + lifesteal + ' HP!');
            break;
            
        case 'fireball':
        case 'thunder':
            damage = Math.floor(damage * effectPower);
            if (isCrit) damage = Math.floor(damage * 1.5);
            dungeonGame.enemyHP -= damage;
            if (effect.effect === 'thunder' && Math.random() < 0.5) {
                dungeonGame.stunEnemy = true;
                addBattleLog('使用 ' + card.word + ' 造成 ' + damage + ' 伤害, 敌人被眩晕!');
            } else {
                addBattleLog('使用 ' + card.word + ' 造成 ' + damage + ' 伤害!' + (isCrit ? ' 暴击!' : ''));
            }
            break;
            
        case 'ice_shield':
            dungeonGame.shield = true;
            dungeonGame.stunEnemy = 'freeze';
            addBattleLog('使用 ' + card.word + ' 获得护盾并冻结敌人!');
            break;
            
        case 'regeneration':
        case 'super_regeneration':
            dungeonGame.regeneration = effect.effect === 'super_regeneration' ? 'super' : true;
            addBattleLog('使用 ' + card.word + ' 获得再生效果!');
            break;
            
        case 'energy_restore':
            dungeonGame.energy = Math.min(dungeonGame.maxEnergy, dungeonGame.energy + effect.amount);
            addBattleLog('使用 ' + card.word + ' 恢复 ' + effect.amount + ' 点能量!');
            break;
            
        case 'full_energy':
            dungeonGame.energy = dungeonGame.maxEnergy;
            addBattleLog('使用 ' + card.word + ' 能量满格!');
            break;
            
        case 'damage_reduction':
            dungeonGame.damageReduction = effect.rate;
            addBattleLog('使用 ' + card.word + ' 获得减伤效果!');
            break;
            
        case 'damage_immunity':
            dungeonGame.damageImmunity = true;
            addBattleLog('使用 ' + card.word + ' 本回合免疫伤害!');
            break;
            
        case 'damage_boost':
            dungeonGame.damageBoost = effect.rate;
            addBattleLog('使用 ' + card.word + ' 伤害提升30%!');
            break;
    }
    
    dungeonGame.discardPile.push(dungeonGame.hand.splice(index, 1)[0]);
    
    if (dungeonGame.enemyHP <= 0) {
        enemyDefeated();
    }
    
    updateBattleUI();
}

function endTurn() {
    dungeonGame.isPlayerTurn = false;
    dungeonGame.turnCount++;
    
    if (dungeonGame.poison) {
        var poisonRate = dungeonGame.poison === 'super' ? 0.2 : 0.1;
        var poisonDamage = Math.floor(dungeonGame.enemyMaxHP * poisonRate);
        dungeonGame.enemyHP -= poisonDamage;
        addBattleLog('毒素造成 ' + poisonDamage + ' 伤害!');
    }
    
    if (dungeonGame.regeneration) {
        var regenRate = dungeonGame.regeneration === 'super' ? 0.2 : 0.1;
        var regenAmount = Math.floor(dungeonGame.playerMaxHP * regenRate);
        dungeonGame.playerHP = Math.min(dungeonGame.playerMaxHP, dungeonGame.playerHP + regenAmount);
        addBattleLog('再生效果恢复 ' + regenAmount + ' HP!');
    }
    
    if (classes[dungeonGame.playerClass] && dungeonGame.playerClass === 'support') {
        var heal = Math.floor(dungeonGame.playerMaxHP * 0.1);
        dungeonGame.playerHP = Math.min(dungeonGame.playerMaxHP, dungeonGame.playerHP + heal);
        addBattleLog('被动治愈恢复 ' + heal + ' HP!');
    }
    
    if (dungeonGame.playerClass === 'paladin') {
        dungeonGame.poison = false;
        dungeonGame.damageReduction = 0;
        dungeonGame.damageBoost = 0;
        addBattleLog('圣光净化所有负面效果!');
    }
    
    if (dungeonGame.playerClass === 'monk') {
        dungeonGame.energy = Math.min(dungeonGame.maxEnergy, dungeonGame.energy + 1);
        addBattleLog('禅意恢复 1 点能量!');
    }
    
    if (dungeonGame.playerClass === 'summoner' && dungeonGame.summons.length < 3) {
        var summonTypes = [
            { name: '小精灵', icon: '🧚', attack: 5 },
            { name: '火元素', icon: '🔥', attack: 8 },
            { name: '冰元素', icon: '❄️', attack: 7 }
        ];
        var summon = summonTypes[Math.floor(Math.random() * summonTypes.length)];
        dungeonGame.summons.push(summon);
        addBattleLog('召唤了 ' + summon.name + '!');
    }
    
    if (dungeonGame.playerClass === 'timeMage' && dungeonGame.turnCount % 3 === 0) {
        addBattleLog('时间操控！获得额外回合!');
        dungeonGame.isPlayerTurn = true;
        dungeonGame.energy = dungeonGame.maxEnergy;
        drawCards(1);
        updateBattleUI();
        return;
    }
    
    if (dungeonGame.enemyHP <= 0) {
        enemyDefeated();
        return;
    }
    
    var enemySkipTurn = false;
    if (dungeonGame.stunEnemy) {
        if (dungeonGame.stunEnemy === 'sleep') {
            if (dungeonGame.stunTurns <= 0) {
                dungeonGame.stunTurns = 1;
            }
            dungeonGame.stunTurns--;
            if (dungeonGame.stunTurns <= 0) {
                dungeonGame.stunEnemy = false;
            }
        } else {
            dungeonGame.stunEnemy = false;
        }
        enemySkipTurn = true;
        addBattleLog(dungeonGame.enemy.name + ' 被控制, 跳过回合!');
    }
    
    if (!enemySkipTurn) {
        var enemyDamage = dungeonGame.enemy.attack + Math.floor(dungeonGame.floor * 2);
        
        if (dungeonGame.damageImmunity) {
            addBattleLog('伤害免疫生效!');
            dungeonGame.damageImmunity = false;
        } else {
            if (dungeonGame.shield) {
                if (dungeonGame.shield === 'big') {
                    enemyDamage = Math.floor(enemyDamage * 0.25);
                } else {
                    enemyDamage = Math.floor(enemyDamage * 0.5);
                }
                dungeonGame.shield = false;
                addBattleLog('护盾抵挡了部分伤害!');
            }
            
            var classData = classes[dungeonGame.playerClass];
            if (classData && dungeonGame.playerClass === 'warrior') {
                enemyDamage = Math.floor(enemyDamage * 0.8);
            }
            
            if (dungeonGame.damageReduction > 0) {
                enemyDamage = Math.floor(enemyDamage * (1 - dungeonGame.damageReduction));
                dungeonGame.damageReduction = 0;
            }
            
            enemyDamage = Math.max(1, enemyDamage - dungeonGame.playerDEF);
            dungeonGame.playerHP -= enemyDamage;
            addBattleLog(dungeonGame.enemy.name + ' 攻击造成 ' + enemyDamage + ' 伤害!');
        }
    }
    
    if (classes[dungeonGame.playerClass] && dungeonGame.playerClass === 'support') {
        var heal = Math.floor(dungeonGame.playerMaxHP * 0.1);
        dungeonGame.playerHP = Math.min(dungeonGame.playerMaxHP, dungeonGame.playerHP + heal);
        addBattleLog('被动治愈恢复 ' + heal + ' HP!');
    }
    
    if (dungeonGame.playerClass === 'paladin') {
        dungeonGame.poison = false;
        dungeonGame.damageReduction = 0;
        dungeonGame.damageBoost = 0;
        addBattleLog('圣光净化所有负面效果!');
    }
    
    if (dungeonGame.playerHP <= 0) {
        gameOver();
        return;
    }
    
    dungeonGame.isPlayerTurn = true;
    dungeonGame.energy = dungeonGame.maxEnergy;
    dungeonGame.cardsPlayed = 0;
    dungeonGame.damageBoost = 0;
    
    dungeonGame.discardPile = dungeonGame.discardPile.concat(dungeonGame.hand);
    dungeonGame.hand = [];
    drawCards(5);
    
    updateBattleUI();
}

function enemyDefeated() {
    addScore(10 * dungeonGame.floor);
    addBattleLog('\u51FB\u8D25 ' + dungeonGame.enemy.name + '!');
    
    if (dungeonGame.playerClass === 'necromancer') {
        var healAmount = Math.floor(dungeonGame.playerMaxHP * 0.3);
        dungeonGame.playerHP = Math.min(dungeonGame.playerMaxHP, dungeonGame.playerHP + healAmount);
        addBattleLog('\u6B7B\u7075\u529B\u91CF\u6062\u590D ' + healAmount + ' HP!');
    }
    
    dungeonGame.floor++;
    dungeonGame.energy = dungeonGame.maxEnergy;
    
    if (dungeonGame.floor >= 5) unlockAchievement(16);
    if (dungeonGame.floor >= 10) unlockAchievement(17);
    if (dungeonGame.floor >= 20) unlockAchievement(18);
    if (dungeonGame.floor >= 30) unlockAchievement(111);
    if (dungeonGame.floor >= 50) unlockAchievement(112);
    if (dungeonGame.floor >= 100) unlockAchievement(131);
    
    spawnEnemy();
    dungeonGame.discardPile = dungeonGame.discardPile.concat(dungeonGame.hand);
    dungeonGame.hand = [];
    drawCards(5);
    updateBattleUI();
}

function gameOver() {
    addBattleLog('\u6E38\u620F\u7ED3\u675F! \u5230\u8FBE\u7B2C ' + dungeonGame.floor + ' \u5C42');
    
    var dungeonHome = document.getElementById('dungeon-home');
    var battleScreen = document.getElementById('battle-screen');
    
    if (dungeonHome) dungeonHome.classList.remove('hidden');
    if (battleScreen) battleScreen.classList.add('hidden');
}

function addBattleLog(message) {
    var log = document.getElementById('battle-log');
    if (!log) return;
    
    var entry = document.createElement('div');
    entry.className = 'log-entry-premium';
    entry.textContent = message;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function updateBattleUI() {
    var playerName = document.getElementById('player-class-name');
    var playerHpBar = document.getElementById('player-hp-bar');
    var playerHpText = document.getElementById('player-hp-text');
    var enemyName = document.getElementById('enemy-name');
    var enemyHpBar = document.getElementById('enemy-hp-bar');
    var enemyHpText = document.getElementById('enemy-hp-text');
    var enemySprite = document.getElementById('enemy-sprite');
    var enemyAvatar = document.getElementById('enemy-avatar');
    var floorNumber = document.getElementById('floor-number');
    var handCards = document.getElementById('hand-cards');
    var deckCount = document.getElementById('deck-count');
    var discardCount = document.getElementById('discard-count');
    var energyValue = document.getElementById('energy-value');
    var energyOrbs = document.getElementById('energy-orbs');
    var handCount = document.getElementById('hand-count');
    var battleLog = document.getElementById('battle-log');
    
    if (playerName && classes[dungeonGame.playerClass]) {
        playerName.textContent = classes[dungeonGame.playerClass].name;
    }
    
    if (playerHpBar) {
        playerHpBar.style.width = (dungeonGame.playerHP / dungeonGame.playerMaxHP * 100) + '%';
    }
    if (playerHpText) {
        playerHpText.textContent = Math.max(0, dungeonGame.playerHP) + '/' + dungeonGame.playerMaxHP;
    }
    
    if (enemyName && dungeonGame.enemy) enemyName.textContent = dungeonGame.enemy.name;
    if (enemyHpBar && dungeonGame.enemy) {
        enemyHpBar.style.width = (dungeonGame.enemyHP / dungeonGame.enemyMaxHP * 100) + '%';
    }
    if (enemyHpText && dungeonGame.enemy) {
        enemyHpText.textContent = Math.max(0, dungeonGame.enemyHP) + '/' + dungeonGame.enemyMaxHP;
    }
    if (enemySprite && dungeonGame.enemy) enemySprite.textContent = dungeonGame.enemy.icon;
    if (enemyAvatar && dungeonGame.enemy) enemyAvatar.textContent = dungeonGame.enemy.icon;
    if (floorNumber) floorNumber.textContent = dungeonGame.floor;
    if (deckCount) deckCount.textContent = dungeonGame.deck.length;
    if (discardCount) discardCount.textContent = dungeonGame.discardPile.length;
    if (energyValue) energyValue.textContent = dungeonGame.energy + '/' + dungeonGame.maxEnergy;
    if (handCount) handCount.textContent = dungeonGame.hand.length + '/7';
    
    if (energyOrbs) {
        var orbHtml = '';
        for (var i = 0; i < dungeonGame.maxEnergy; i++) {
            var isActive = i < dungeonGame.energy;
            orbHtml += '<div class="energy-orb ' + (isActive ? 'active' : '') + '"></div>';
        }
        energyOrbs.innerHTML = orbHtml;
    }
    
    if (handCards) {
        var html = '';
        dungeonGame.hand.forEach(function(card, index) {
            var cardEffect = cardEffects[card.effect];
            var rarityClass = 'card-premium-' + card.rarity;
            var canAfford = dungeonGame.energy >= card.cost;
            var affordableClass = canAfford ? 'affordable' : 'too-expensive';
            
            html += '<div class="hand-card-premium ' + rarityClass + ' ' + affordableClass + '" data-index="' + index + '">';
            html += '<div class="card-premium-cost">' + card.cost + '</div>';
            html += '<div class="card-premium-content">';
            html += '<div class="card-premium-word">' + card.word + '</div>';
            html += '<div class="card-premium-translation">' + card.translation + '</div>';
            html += '<div class="card-premium-effect">' + cardEffect.name + '</div>';
            html += '<div class="card-premium-desc">' + cardEffect.desc + '</div>';
            html += '</div>';
            html += '<div class="card-premium-rarity-badge">' + getRarityName(card.rarity) + '</div>';
            html += '</div>';
        });
        handCards.innerHTML = html;
        
        handCards.querySelectorAll('.hand-card-premium').forEach(function(cardEl) {
            cardEl.addEventListener('click', function() {
                var index = parseInt(cardEl.dataset.index);
                if (dungeonGame.hand[index] && dungeonGame.energy >= dungeonGame.hand[index].cost) {
                    playCard(index);
                }
            });
        });
    }
}

function initDungeon() {
    var startBtn = document.getElementById('start-dungeon-btn');
    var battleScreen = document.getElementById('battle-screen');
    var endTurnBtn = document.getElementById('end-turn-btn');
    var backBtn = document.getElementById('back-from-dungeon');
    var dungeonHome = document.getElementById('dungeon-home');
    var drawCardBtn = document.getElementById('draw-card-btn');
    var modeCards = document.querySelectorAll('.mode-card-premium');
    var classCards = document.querySelectorAll('.class-card-premium');

    if (modeCards.length > 0) {
        modeCards.forEach(function(card) {
            card.addEventListener('click', function() {
                modeCards.forEach(function(c) {
                    c.classList.remove('selected');
                });
                card.classList.add('selected');
                dungeonMode = card.dataset.mode;
            });
        });
    }

    if (classCards.length > 0) {
        classCards.forEach(function(card) {
            card.addEventListener('click', function() {
                classCards.forEach(function(c) {
                    c.classList.remove('selected');
                });
                card.classList.add('selected');
                dungeonGame.playerClass = card.dataset.class;
            });
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (!dungeonGame.playerClass) {
                alert('请先选择职业！');
                return;
            }
            startDungeon();
        });
    }

    if (endTurnBtn) {
        endTurnBtn.addEventListener('click', function() {
            if (dungeonGame.isPlayerTurn) {
                endTurn();
            }
        });
    }

    if (drawCardBtn) {
        drawCardBtn.addEventListener('click', function() {
            if (dungeonGame.isPlayerTurn) {
                drawCards(1);
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            navigateTo('home');
        });
    }
}

function startDungeon() {
    var classData = classes[dungeonGame.playerClass];
    dungeonGame.playerHP = classData.hp;
    dungeonGame.playerMaxHP = classData.hp;
    dungeonGame.playerATK = classData.attack;
    dungeonGame.playerDEF = classData.defense;
    dungeonGame.floor = 1;
    dungeonGame.shield = false;
    dungeonGame.powerUp = false;
    dungeonGame.poison = false;
    dungeonGame.stunEnemy = false;
    dungeonGame.isPlayerTurn = true;
    dungeonGame.energy = 3;
    dungeonGame.maxEnergy = 3;
    dungeonGame.cardsPlayed = 0;
    dungeonGame.regeneration = false;
    dungeonGame.damageReduction = 0;
    dungeonGame.damageImmunity = false;
    dungeonGame.damageBoost = 0;
    dungeonGame.stunTurns = 0;
    dungeonGame.hand = [];
    dungeonGame.deck = [];
    dungeonGame.discardPile = [];
    dungeonGame.firstAttack = true;
    dungeonGame.turnCount = 0;
    dungeonGame.summons = [];
    dungeonGame.gold = 0;
    dungeonGame.bonusAttack = 0;
    dungeonGame.bonusMaxHP = 0;
    dungeonGame.bonusMaxEnergy = 0;

    var log = document.getElementById('battle-log');
    if (log) log.innerHTML = '<div class="log-entry-premium">战斗开始！</div>';

    spawnEnemy();
    generateDeck();
    drawCards(5);

    var dungeonHome = document.getElementById('dungeon-home');
    var battleScreen = document.getElementById('battle-screen');

    if (dungeonHome) dungeonHome.classList.add('hidden');
    if (battleScreen) battleScreen.classList.remove('hidden');

    unlockAchievement(15);
    updateBattleUI();
}

function generateDeck() {
    var deck = [];
    var effectKeys = Object.keys(cardEffects);
    var rarities = ['common', 'common', 'common', 'common', 'common', 'common',
                    'rare', 'rare', 'rare', 'rare', 'rare',
                    'epic', 'epic', 'epic',
                    'legendary'];

    var wordCount = 30;
    var proverbCount = 15;
    var phraseCount = 15;

    for (var i = 0; i < wordCount; i++) {
        var word = vocabulary3500.words[Math.floor(Math.random() * vocabulary3500.words.length)];
        var effect = effectKeys[Math.floor(Math.random() * effectKeys.length)];
        var rarity = rarities[Math.floor(Math.random() * rarities.length)];
        deck.push({
            word: word.word,
            translation: word.translation || '',
            type: 'word',
            effect: effect,
            rarity: rarity,
            cost: getCardCost(effect)
        });
    }

    for (var i = 0; i < proverbCount; i++) {
        var proverb = proverbs[Math.floor(Math.random() * proverbs.length)];
        var effect = effectKeys[Math.floor(Math.random() * effectKeys.length)];
        var rarity = rarities[Math.floor(Math.random() * rarities.length)];
        deck.push({
            word: proverb.en,
            translation: proverb.zh || '',
            type: 'proverb',
            effect: effect,
            rarity: rarity,
            cost: getCardCost(effect)
        });
    }

    for (var i = 0; i < phraseCount; i++) {
        var phrase = phrases[Math.floor(Math.random() * phrases.length)];
        var effect = effectKeys[Math.floor(Math.random() * effectKeys.length)];
        var rarity = rarities[Math.floor(Math.random() * rarities.length)];
        deck.push({
            word: phrase.en,
            translation: phrase.zh || '',
            type: 'phrase',
            effect: effect,
            rarity: rarity,
            cost: getCardCost(effect)
        });
    }

    dungeonGame.deck = deck.sort(function() { return Math.random() - 0.5; });
}

function initTypingGame() {
    var modeBtns = document.querySelectorAll('.mode-btn');
    var startBtn = document.getElementById('start-typing-btn');
    var inputEl = document.getElementById('typing-input');
    var backBtn = document.getElementById('back-from-typing');
    
    modeBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            modeBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            typingGame.mode = btn.dataset.mode;
        });
    });
    
    if (startBtn) {
        startBtn.addEventListener('click', startTypingGame);
    }
    
    if (inputEl) {
        inputEl.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkTypingInput();
            }
        });
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            navigateTo('home');
        });
    }
}

function playTypingSound(correct) {
    try {
        var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (correct) {
            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
        } else {
            oscillator.frequency.value = 220;
            oscillator.type = 'square';
            gainNode.gain.value = 0.2;
        }
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch(e) {}
}

function startTypingGame() {
    var inputEl = document.getElementById('typing-input');
    var startBtn = document.getElementById('start-typing-btn');
    
    typingGame.score = 0;
    typingGame.timeLeft = typingGame.mode === 'extreme' ? 30 : 60;
    typingGame.words = vocabulary3500.words.sort(function() { return Math.random() - 0.5; });
    typingGame.currentWordIndex = 0;
    typingGame.totalTyped = 0;
    typingGame.correctTyped = 0;
    typingGame.wrongTyped = 0;
    typingGame.isPlaying = true;
    
    if (inputEl) {
        inputEl.disabled = false;
        inputEl.value = '';
        inputEl.focus();
    }
    if (startBtn) startBtn.classList.add('hidden');
    
    displayTypingWord();
    
    if (typingGame.timer) clearInterval(typingGame.timer);
    typingGame.timer = setInterval(updateTypingTimer, 1000);
}

function displayTypingWord() {
    var wordEl = document.getElementById('typing-word');
    var meaningEl = document.getElementById('typing-meaning');
    if (wordEl && typingGame.words[typingGame.currentWordIndex]) {
        var word = typingGame.words[typingGame.currentWordIndex];
        var wordIndex = getWordIndex(word.word);
        wordEl.textContent = word.word + ' #' + formatWordNumber(wordIndex);
        if (meaningEl) meaningEl.textContent = word.meaning;
    }
}

function checkTypingInput() {
    var inputEl = document.getElementById('typing-input');
    if (!inputEl || !typingGame.isPlaying) return;
    
    var input = inputEl.value.trim();
    if (!input) return;
    
    var currentWord = typingGame.words[typingGame.currentWordIndex];
    
    if (input.toLowerCase() === currentWord.word.toLowerCase()) {
        typingGame.score += currentWord.word.length;
        typingGame.correctTyped++;
        typingGame.totalTyped++;
        typingGame.currentWordIndex++;
        
        playTypingSound(true);
        inputEl.value = '';
        inputEl.classList.remove('wrong');
        inputEl.classList.add('correct');
        setTimeout(function() { inputEl.classList.remove('correct'); }, 200);
        
        displayTypingWord();
        updateTypingStats();
    } else {
        typingGame.wrongTyped++;
        typingGame.totalTyped++;
        
        playTypingSound(false);
        inputEl.classList.remove('correct');
        inputEl.classList.add('wrong');
        setTimeout(function() { inputEl.classList.remove('wrong'); }, 200);
    }
}

function updateTypingTimer() {
    typingGame.timeLeft--;
    updateTypingStats();
    
    if (typingGame.timeLeft <= 0) {
        endTypingGame();
    }
}

function updateTypingStats() {
    var scoreEl = document.getElementById('typing-score');
    var timeEl = document.getElementById('typing-time');
    var wpmEl = document.getElementById('typing-wpm');
    var accuracyEl = document.getElementById('typing-accuracy');
    
    if (scoreEl) scoreEl.textContent = typingGame.score;
    if (timeEl) timeEl.textContent = typingGame.timeLeft;
    
    var elapsed = (typingGame.mode === 'extreme' ? 30 : 60) - typingGame.timeLeft;
    var wpm = elapsed > 0 ? Math.round((typingGame.correctTyped / elapsed) * 60) : 0;
    if (wpmEl) wpmEl.textContent = wpm;
    
    var accuracy = typingGame.totalTyped > 0 ? Math.round((typingGame.correctTyped / typingGame.totalTyped) * 100) : 100;
    if (accuracyEl) accuracyEl.textContent = accuracy + '%';
}

function endTypingGame() {
    typingGame.isPlaying = false;
    if (typingGame.timer) clearInterval(typingGame.timer);
    
    var inputEl = document.getElementById('typing-input');
    var startBtn = document.getElementById('start-typing-btn');
    
    if (inputEl) inputEl.disabled = true;
    if (startBtn) startBtn.classList.remove('hidden');
    
    addScore(typingGame.score);
    unlockAchievement(19);
    
    var elapsed = typingGame.mode === 'extreme' ? 30 : 60;
    var wpm = Math.round((typingGame.correctTyped / elapsed) * 60);
    if (wpm >= 30) unlockAchievement(20);
    if (wpm >= 50) unlockAchievement(21);
    if (wpm >= 80) unlockAchievement(22);
}

var proverbsPage = 1;
var phrasesPage = 1;

var achievementsPage = 1;

function initGacha() {
    var tabBtns = document.querySelectorAll('.gacha-tab-btn');
    var singleBtn = document.getElementById('gacha-single-btn');
    var tenBtn = document.getElementById('gacha-ten-btn');
    var rarityFilters = document.querySelectorAll('.rarity-filter');
    
    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            tabBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            
            var tabId = btn.dataset.tab;
            document.querySelectorAll('.gacha-tab-content').forEach(function(content) {
                content.classList.remove('active');
            });
            var tabContent = document.getElementById(tabId);
            if (tabContent) tabContent.classList.add('active');
            
            gachaTab = tabId;
        });
    });
    
    if (singleBtn) {
        singleBtn.addEventListener('click', function() { performGacha(1); });
    }
    
    if (tenBtn) {
        tenBtn.addEventListener('click', function() { performGacha(10); });
    }
    
    rarityFilters.forEach(function(filter) {
        filter.addEventListener('click', function() {
            rarityFilters.forEach(function(f) { f.classList.remove('active'); });
            filter.classList.add('active');
            collectionRarityFilter = filter.dataset.rarity;
            collectionPage = 1;
            updateCollection();
        });
    });
    
    updateGachaScore();
    updateCollection();
}

function updateGachaScore() {
    var scoreEl = document.getElementById('gacha-score');
    if (scoreEl) scoreEl.textContent = gameState.score;
}

function performGacha(count) {
    var cost = count === 1 ? 10 : 90;
    
    if (gameState.score < cost) {
        alert('\u79EF\u5206\u4E0D\u8DB3!');
        return;
    }
    
    gameState.score -= cost;
    saveGameState();
    updateScoreDisplay();
    updateGachaScore();
    
    var results = [];
    var guaranteedRare = count === 10;
    var rareCount = 0;
    
    for (var i = 0; i < count; i++) {
        var word = vocabulary3500.words[Math.floor(Math.random() * vocabulary3500.words.length)];
        var rarity = generateCardRarity();
        
        if (guaranteedRare && i === count - 1 && rareCount === 0) {
            rarity = Math.random() < 0.3 ? 'epic' : 'rare';
        }
        
        if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
            rareCount++;
        }
        
        var effect = getEffectByRarity(rarity);
        var effectData = cardEffects[effect];
        var dungeonEffect = typeof dungeonCardEffects !== 'undefined' ? dungeonCardEffects[effect] : null;
        var now = new Date();
        var drawTime = now.toLocaleString('zh-CN');
        var wordIndex = getWordIndex(word.word);
        var cardId = 'WRD-' + String(wordIndex).padStart(4, '0');
        
        var card = {
            word: word.word,
            meaning: word.meaning,
            phonetic: word.phonetic,
            example: word.example,
            rarity: rarity,
            effect: effect,
            effectName: effectData ? effectData.name : '攻击',
            effectDesc: effectData ? effectData.desc : '造成基础伤害',
            effectType: effectData ? effectData.effect : 'damage',
            drawTime: drawTime,
            cardId: cardId,
            wordIndex: wordIndex,
            dungeonUsable: true,
            cost: dungeonEffect ? dungeonEffect.cost : 1,
            power: dungeonEffect ? (dungeonEffect.power || 1) : 1
        };
        
        results.push(card);
        
        var existing = gameState.collection.find(function(c) { return c.word === card.word; });
        if (!existing) {
            gameState.collection.push(card);
        } else {
            var idx = gameState.collection.indexOf(existing);
            gameState.collection[idx] = card;
        }
    }
    
    saveGameState();
    displayGachaResults(results);
    updateCollection();
    
    unlockAchievement(23);
    
    var hasRare = results.some(function(r) { return r.rarity === 'rare'; });
    var hasEpic = results.some(function(r) { return r.rarity === 'epic'; });
    var hasLegendary = results.some(function(r) { return r.rarity === 'legendary'; });
    
    if (hasRare) unlockAchievement(25);
    if (hasEpic) unlockAchievement(26);
    if (hasLegendary) unlockAchievement(88);
    if (gameState.collection.length >= 10) unlockAchievement(27);
    if (gameState.collection.length >= 100) unlockAchievement(28);
}

function displayGachaResults(results) {
    var container = document.getElementById('gacha-results');
    var animationArea = document.getElementById('gacha-animation-area');
    
    if (!container) return;
    
    if (animationArea) animationArea.classList.add('hidden');
    container.classList.remove('hidden');
    
    var html = '<div class="gacha-results-grid">';
    results.forEach(function(card) {
        var wordIndex = card.wordIndex || getWordIndex(card.word);
        var cardId = card.cardId || ('WRD-' + formatWordNumber(wordIndex));
        var effectData = cardEffects[card.effect];
        var effectName = card.effectName || (effectData ? effectData.name : '攻击');
        
        html += '<div class="gacha-card result-' + card.rarity + '" onclick="showWordModal(\'' + card.word + '\')">';
        html += '<div class="gacha-card-number">' + cardId + '</div>';
        html += '<div class="gacha-card-word">' + card.word + '</div>';
        html += '<div class="gacha-card-phonetic">' + (card.phonetic || '') + '</div>';
        html += '<div class="gacha-card-rarity ' + card.rarity + '">' + getRarityName(card.rarity) + '</div>';
        html += '<div class="gacha-card-effect">' + effectName + '</div>';
        html += '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
    
    setTimeout(function() {
        container.classList.add('hidden');
        if (animationArea) animationArea.classList.remove('hidden');
    }, 5000);
}

function updateCollection() {
    var container = document.getElementById('collection-grid');
    var statsEl = document.getElementById('collection-stats');
    var pagination = document.getElementById('collection-pagination');
    
    if (!container) return;
    
    var filtered = gameState.collection.filter(function(card) {
        var matchesRarity = collectionRarityFilter === 'all' || card.rarity === collectionRarityFilter;
        var matchesLetter = !collectionLetterFilter || card.word.charAt(0).toUpperCase() === collectionLetterFilter;
        return matchesRarity && matchesLetter;
    });
    
    if (statsEl) {
        statsEl.textContent = '\u5DF2\u6536\u96C6: ' + gameState.collection.length + ' / 3500';
    }
    
    var perPage = 20;
    var totalPages = Math.ceil(3500 / perPage);
    
    var start = (collectionPage - 1) * perPage;
    var end = start + perPage;
    
    var html = '';
    var allWordsByLetter = {};
    
    vocabulary3500.words.forEach(function(w) {
        var letter = w.word.charAt(0).toUpperCase();
        if (!allWordsByLetter[letter]) allWordsByLetter[letter] = [];
        allWordsByLetter[letter].push(w);
    });
    
    var displayWords = [];
    if (collectionLetterFilter) {
        displayWords = (allWordsByLetter[collectionLetterFilter] || []).slice(start, end);
    } else {
        var allWords = vocabulary3500.words;
        displayWords = allWords.slice(start, end);
    }
    
    displayWords.forEach(function(word) {
        var wordIndex = getWordIndex(word.word);
        var hasCard = gameState.collection.some(function(c) { return c.word === word.word; });
        
        if (hasCard) {
            var card = gameState.collection.find(function(c) { return c.word === word.word; });
            var effectData = cardEffects[card.effect];
            var effectName = card.effectName || (effectData ? effectData.name : '攻击');
            var cardId = card.cardId || ('WRD-' + formatWordNumber(wordIndex));
            
            html += '<div class="collection-card unlocked" onclick="showWordModal(\'' + word.word + '\')">';
            html += '<div class="collection-card-number">' + cardId + '</div>';
            html += '<div class="collection-card-word">' + word.word + '</div>';
            html += '<div class="collection-card-phonetic">' + (card.phonetic || word.phonetic || '') + '</div>';
            html += '<div class="collection-card-meaning">' + (card.meaning || word.meaning || '') + '</div>';
            html += '<div class="collection-card-rarity ' + card.rarity + '">' + getRarityName(card.rarity) + '</div>';
            html += '<div class="collection-card-effect">' + effectName + '</div>';
            html += '</div>';
        } else {
            var cardId = 'WRD-' + formatWordNumber(wordIndex);
            html += '<div class="collection-card locked">';
            html += '<div class="collection-card-number">' + cardId + '</div>';
            html += '<div class="collection-card-word">???</div>';
            html += '<div class="collection-card-phonetic">???</div>';
            html += '<div class="collection-card-meaning">???</div>';
            html += '<div class="collection-card-rarity">???</div>';
            html += '<div class="collection-card-effect">???</div>';
            html += '</div>';
        }
    });
    
    container.innerHTML = html;
    
    if (pagination && totalPages > 1) {
        pagination.innerHTML = '';
        pagination.appendChild(createPagination(totalPages, collectionPage, function(page) {
            collectionPage = page;
            updateCollection();
        }));
    } else if (pagination) {
        pagination.innerHTML = '';
    }
}

let proverbsRandomIndex = 0;
let proverbsMainPage = 1;
let proverbsMainFilter = '';
let proverbsMainLetter = '';
let proverbsFavoritesPage = 1;

let phrasesRandomIndex = 0;
let phrasesMainPage = 1;
let phrasesMainFilter = '';
let phrasesMainLetter = '';
let phrasesFavoritesPage = 1;

let dungeonMap = [];
let dungeonCurrentNode = 0;
let dungeonCompletedNodes = [];

function initProverbs() {
    initProverbsRandom();
    initProverbsMain();
    initProverbsFavorites();
}

function initProverbsRandom() {
    var btn = document.getElementById('proverbs-random-btn');
    if (btn) {
        btn.addEventListener('click', function() {
            proverbsRandomIndex = Math.floor(Math.random() * proverbs.length);
            displayProverbsRandom();
        });
    }
    proverbsRandomIndex = Math.floor(Math.random() * proverbs.length);
    displayProverbsRandom();
}

function displayProverbsRandom() {
    var container = document.getElementById('proverbs-random-container');
    if (!container) return;
    
    var p = proverbs[proverbsRandomIndex];
    var isFavorited = gameState.proverbsFavorites && gameState.proverbsFavorites.includes(proverbsRandomIndex);
    
    var html = '<div class="random-content-card">';
    html += '<button class="content-favorite-btn ' + (isFavorited ? 'favorited' : '') + '" onclick="toggleProverbFavorite(' + proverbsRandomIndex + ')">' + (isFavorited ? '⭐' : '☆') + '</button>';
    html += '<h3>' + p.en + '</h3>';
    html += '<p>' + p.zh + '</p>';
    html += '</div>';
    container.innerHTML = html;
}

function toggleProverbFavorite(index) {
    if (!gameState.proverbsFavorites) gameState.proverbsFavorites = [];
    
    var idx = gameState.proverbsFavorites.indexOf(index);
    if (idx === -1) {
        gameState.proverbsFavorites.push(index);
    } else {
        gameState.proverbsFavorites.splice(idx, 1);
    }
    
    saveGameState();
    displayProverbsRandom();
    displayProverbsFavorites();
}

function initProverbsMain() {
    var searchInput = document.getElementById('proverbs-search-input');
    var searchBtn = document.getElementById('proverbs-search-btn');
    var alphabetContainer = document.getElementById('proverbs-alphabet');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            proverbsMainFilter = searchInput.value;
            proverbsMainPage = 1;
            displayProverbsMain();
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            proverbsMainFilter = searchInput ? searchInput.value : '';
            proverbsMainPage = 1;
            displayProverbsMain();
        });
    }
    
    if (alphabetContainer) {
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        var html = '<button class="active" data-letter="">All</button>';
        letters.forEach(function(letter) {
            html += '<button data-letter="' + letter + '">' + letter + '</button>';
        });
        alphabetContainer.innerHTML = html;
        
        alphabetContainer.querySelectorAll('button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                alphabetContainer.querySelectorAll('button').forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                proverbsMainLetter = btn.dataset.letter;
                proverbsMainPage = 1;
                displayProverbsMain();
            });
        });
    }
    
    displayProverbsMain();
}

function displayProverbsMain() {
    var container = document.getElementById('proverbs-main-list');
    var pagination = document.getElementById('proverbs-main-pagination');
    
    if (!container) return;
    
    var filtered = proverbs.filter(function(p, idx) {
        var matchesFilter = !proverbsMainFilter || 
            p.en.toLowerCase().includes(proverbsMainFilter.toLowerCase()) ||
            p.zh.includes(proverbsMainFilter);
        
        var matchesLetter = !proverbsMainLetter || p.en.charAt(0).toUpperCase() === proverbsMainLetter;
        
        return matchesFilter && matchesLetter;
    });
    
    var perPage = 16;
    var totalPages = Math.ceil(filtered.length / perPage);
    var start = (proverbsMainPage - 1) * perPage;
    var end = start + perPage;
    var pageItems = filtered.slice(start, end);
    
    var html = '';
    pageItems.forEach(function(p, idx) {
        var originalIndex = proverbs.indexOf(p);
        var isFavorited = gameState.proverbsFavorites && gameState.proverbsFavorites.includes(originalIndex);
        
        html += '<div class="content-item-large">';
        html += '<button class="content-favorite-btn ' + (isFavorited ? 'favorited' : '') + '" onclick="toggleProverbFavorite(' + originalIndex + ')">' + (isFavorited ? '⭐' : '☆') + '</button>';
        html += '<h4>' + p.en + '</h4>';
        html += '<p>' + p.zh + '</p>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    if (pagination && totalPages > 1) {
        pagination.innerHTML = '';
        pagination.appendChild(createPagination(totalPages, proverbsMainPage, function(page) {
            proverbsMainPage = page;
            displayProverbsMain();
        }));
    } else if (pagination) {
        pagination.innerHTML = '';
    }
}

function initProverbsFavorites() {
    displayProverbsFavorites();
}

function displayProverbsFavorites() {
    var container = document.getElementById('proverbs-favorites-list');
    var pagination = document.getElementById('proverbs-favorites-pagination');
    
    if (!container) return;
    
    if (!gameState.proverbsFavorites || gameState.proverbsFavorites.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⭐</div><div class="empty-state-text">还没有收藏的俗语谚语</div></div>';
        if (pagination) pagination.innerHTML = '';
        return;
    }
    
    var favorites = gameState.proverbsFavorites.map(function(idx) {
        return proverbs[idx];
    }).filter(function(p) { return p; });
    
    var perPage = 24;
    var totalPages = Math.ceil(favorites.length / perPage);
    var start = (proverbsFavoritesPage - 1) * perPage;
    var end = start + perPage;
    var pageItems = favorites.slice(start, end);
    
    var html = '';
    pageItems.forEach(function(p, idx) {
        var originalIndex = proverbs.indexOf(p);
        html += '<div class="content-item">';
        html += '<button class="content-favorite-btn favorited" onclick="toggleProverbFavorite(' + originalIndex + ')">⭐</button>';
        html += '<h4>' + p.en + '</h4>';
        html += '<p>' + p.zh + '</p>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    if (pagination && totalPages > 1) {
        pagination.innerHTML = ''; pagination.appendChild(createPagination(totalPages, proverbsFavoritesPage, function(page) {
            proverbsFavoritesPage = page;
            displayProverbsFavorites();
        }));
    } else if (pagination) {
        pagination.innerHTML = '';
    }
}

function initPhrases() {
    initPhrasesRandom();
    initPhrasesMain();
    initPhrasesFavorites();
}

function initPhrasesRandom() {
    var btn = document.getElementById('phrases-random-btn');
    if (btn) {
        btn.addEventListener('click', function() {
            phrasesRandomIndex = Math.floor(Math.random() * phrases.length);
            displayPhrasesRandom();
        });
    }
    phrasesRandomIndex = Math.floor(Math.random() * phrases.length);
    displayPhrasesRandom();
}

function displayPhrasesRandom() {
    var container = document.getElementById('phrases-random-container');
    if (!container) return;
    
    var p = phrases[phrasesRandomIndex];
    var isFavorited = gameState.phrasesFavorites && gameState.phrasesFavorites.includes(phrasesRandomIndex);
    
    var html = '<div class="random-content-card">';
    html += '<button class="content-favorite-btn ' + (isFavorited ? 'favorited' : '') + '" onclick="togglePhraseFavorite(' + phrasesRandomIndex + ')">' + (isFavorited ? '⭐' : '☆') + '</button>';
    html += '<h3>' + p.en + '</h3>';
    html += '<p>' + p.zh + '</p>';
    html += '</div>';
    container.innerHTML = html;
}

function togglePhraseFavorite(index) {
    if (!gameState.phrasesFavorites) gameState.phrasesFavorites = [];
    
    var idx = gameState.phrasesFavorites.indexOf(index);
    if (idx === -1) {
        gameState.phrasesFavorites.push(index);
    } else {
        gameState.phrasesFavorites.splice(idx, 1);
    }
    
    saveGameState();
    displayPhrasesRandom();
    displayPhrasesFavorites();
}

function initPhrasesMain() {
    var searchInput = document.getElementById('phrases-search-input');
    var searchBtn = document.getElementById('phrases-search-btn');
    var alphabetContainer = document.getElementById('phrases-alphabet');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            phrasesMainFilter = searchInput.value;
            phrasesMainPage = 1;
            displayPhrasesMain();
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            phrasesMainFilter = searchInput ? searchInput.value : '';
            phrasesMainPage = 1;
            displayPhrasesMain();
        });
    }
    
    if (alphabetContainer) {
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        var html = '<button class="active" data-letter="">All</button>';
        letters.forEach(function(letter) {
            html += '<button data-letter="' + letter + '">' + letter + '</button>';
        });
        alphabetContainer.innerHTML = html;
        
        alphabetContainer.querySelectorAll('button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                alphabetContainer.querySelectorAll('button').forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                phrasesMainLetter = btn.dataset.letter;
                phrasesMainPage = 1;
                displayPhrasesMain();
            });
        });
    }
    
    displayPhrasesMain();
}

function displayPhrasesMain() {
    var container = document.getElementById('phrases-main-list');
    var pagination = document.getElementById('phrases-main-pagination');
    
    if (!container) return;
    
    var filtered = phrases.filter(function(p, idx) {
        var matchesFilter = !phrasesMainFilter || 
            p.en.toLowerCase().includes(phrasesMainFilter.toLowerCase()) ||
            p.zh.includes(phrasesMainFilter);
        
        var matchesLetter = !phrasesMainLetter || p.en.charAt(0).toUpperCase() === phrasesMainLetter;
        
        return matchesFilter && matchesLetter;
    });
    
    var perPage = 16;
    var totalPages = Math.ceil(filtered.length / perPage);
    var start = (phrasesMainPage - 1) * perPage;
    var end = start + perPage;
    var pageItems = filtered.slice(start, end);
    
    var html = '';
    pageItems.forEach(function(p, idx) {
        var originalIndex = phrases.indexOf(p);
        var isFavorited = gameState.phrasesFavorites && gameState.phrasesFavorites.includes(originalIndex);
        
        html += '<div class="content-item-large">';
        html += '<button class="content-favorite-btn ' + (isFavorited ? 'favorited' : '') + '" onclick="togglePhraseFavorite(' + originalIndex + ')">' + (isFavorited ? '⭐' : '☆') + '</button>';
        html += '<h4>' + p.en + '</h4>';
        html += '<p>' + p.zh + '</p>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    if (pagination && totalPages > 1) {
        pagination.innerHTML = ''; pagination.appendChild(createPagination(totalPages, phrasesMainPage, function(page) {
            phrasesMainPage = page;
            displayPhrasesMain();
        }));
    } else if (pagination) {
        pagination.innerHTML = '';
    }
}

function initPhrasesFavorites() {
    displayPhrasesFavorites();
}

function displayPhrasesFavorites() {
    var container = document.getElementById('phrases-favorites-list');
    var pagination = document.getElementById('phrases-favorites-pagination');
    
    if (!container) return;
    
    if (!gameState.phrasesFavorites || gameState.phrasesFavorites.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⭐</div><div class="empty-state-text">还没有收藏的短语</div></div>';
        if (pagination) pagination.innerHTML = '';
        return;
    }
    
    var favorites = gameState.phrasesFavorites.map(function(idx) {
        return phrases[idx];
    }).filter(function(p) { return p; });
    
    var perPage = 24;
    var totalPages = Math.ceil(favorites.length / perPage);
    var start = (phrasesFavoritesPage - 1) * perPage;
    var end = start + perPage;
    var pageItems = favorites.slice(start, end);
    
    var html = '';
    pageItems.forEach(function(p, idx) {
        var originalIndex = phrases.indexOf(p);
        html += '<div class="content-item">';
        html += '<button class="content-favorite-btn favorited" onclick="togglePhraseFavorite(' + originalIndex + ')">⭐</button>';
        html += '<h4>' + p.en + '</h4>';
        html += '<p>' + p.zh + '</p>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    if (pagination && totalPages > 1) {
        pagination.innerHTML = ''; pagination.appendChild(createPagination(totalPages, phrasesFavoritesPage, function(page) {
            phrasesFavoritesPage = page;
            displayPhrasesFavorites();
        }));
    } else if (pagination) {
        pagination.innerHTML = '';
    }
}

function updatePlaylistUI() {
    var container = document.getElementById('playlist-items');
    if (!container) return;
    
    var html = '';
    audioPlayer.playlist.forEach(function(track, index) {
        var activeClass = index === audioPlayer.currentIndex ? 'active' : '';
        html += '<div class="playlist-item-square ' + activeClass + '" data-index="' + index + '">';
        html += '<span class="playlist-item-icon-square">🎵</span>';
        html += '<span class="playlist-item-name-square">' + track.name + '</span>';
        html += '<button class="playlist-item-remove" onclick="removeFromPlaylist(event, ' + index + ')">×</button>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    container.querySelectorAll('.playlist-item-square').forEach(function(item) {
        item.addEventListener('click', function(e) {
            if (e.target.classList.contains('playlist-item-remove')) return;
            var index = parseInt(item.dataset.index);
            audioPlayer.currentIndex = index;
            loadAndPlayTrack();
        });
    });
}

function removeFromPlaylist(event, index) {
    event.stopPropagation();
    audioPlayer.playlist.splice(index, 1);
    if (audioPlayer.currentIndex >= audioPlayer.playlist.length) {
        audioPlayer.currentIndex = Math.max(0, audioPlayer.playlist.length - 1);
    }
    updatePlaylistUI();
}

function initWordSearch() {
    var searchInput = document.getElementById('search-input');
    var searchBtn = document.getElementById('search-btn');
    var showAllBtn = document.getElementById('search-show-all-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchFilter = searchInput.value;
            searchPage = 1;
            performSearch();
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            searchFilter = searchInput ? searchInput.value : '';
            searchPage = 1;
            performSearch();
        });
    }
    
    if (showAllBtn) {
        showAllBtn.addEventListener('click', function() {
            searchFilter = '';
            currentLetter = '';
            searchPage = 1;
            if (searchInput) searchInput.value = '';
            document.querySelectorAll('#alphabet-buttons button').forEach(function(b) {
                b.classList.remove('active');
            });
            performSearch();
        });
    }
    
    performSearch();
}

function performSearch() {
    if (!vocabulary3500 || !vocabulary3500.words) return;
    
    var results = [];
    vocabulary3500.words.forEach(function(word, index) {
        var matchesFilter = !searchFilter || 
            word.word.toLowerCase().includes(searchFilter.toLowerCase()) ||
            word.meaning.toLowerCase().includes(searchFilter.toLowerCase());
        
        var matchesLetter = !currentLetter || word.word.charAt(0).toUpperCase() === currentLetter;
        
        if (matchesFilter && matchesLetter) {
            results.push({ word: word, originalIndex: index });
        }
    });
    
    results.sort(function(a, b) { return a.originalIndex - b.originalIndex; });
    searchResults = results.map(function(r) { return r.word; });
    displaySearchResults();
    
    if (searchFilter) {
        unlockAchievement(7);
    }
}



function showReciteAnswer() {
    var cardFront = document.querySelector('.card-front');
    var cardBack = document.querySelector('.card-back');
    var card = document.getElementById('recite-card');
    var showBtn = document.getElementById('recite-show-btn');
    
    if (cardBack && cardBack.classList.contains('hidden')) {
        if (cardFront) cardFront.classList.add('hidden');
        if (cardBack) cardBack.classList.remove('hidden');
        if (card) card.classList.add('flipped');
        if (showBtn) showBtn.textContent = '隐藏释义';
    } else {
        if (cardFront) cardFront.classList.remove('hidden');
        if (cardBack) cardBack.classList.add('hidden');
        if (card) card.classList.remove('flipped');
        if (showBtn) showBtn.textContent = '查看释义';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

let proverbsCurrentTab = 'proverbs-random';
let phrasesCurrentTab = 'phrases-random';
let achievementsNewPage = 1;
let gachaCurrentSection = 'draw';
let gachaNewCollectionPage = 1;

function init() {
    try {
        console.log('Initializing app...');
        loadGameState();
        audioElement = document.getElementById('main-audio');
        buildWordIndexMap();
        setupNavigation();
        setupQuickStartButtons();
        setupThemeToggle();
        setupSidebarToggle();
        setupLogoEasterEgg();
        console.log('Sidebar toggle setup complete');
        updateDashboard();
        initAlphabetFilters();
        initAudioPlayer();
        initMemoryGame();
        initWordRecite();
        initWordReview();
        initRandomWord();
        initWordSearch();
        initAudioLists();
        initProverbsRedesigned();
        initPhrasesRedesigned();
        initAchievementsRedesigned();
        initGachaRedesigned();
        initTypingGame();
        initDungeon();
        unlockAchievement(1);
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Init error:', error);
    }
}

let logoClickCount = 0;
let logoClickTimer = null;

function setupLogoEasterEgg() {
    var logo = document.getElementById('sidebar-logo');
    if (!logo) return;
    
    logo.style.cursor = 'pointer';
    
    logo.addEventListener('click', function() {
        logoClickCount++;
        
        if (logoClickTimer) {
            clearTimeout(logoClickTimer);
        }
        
        logoClickTimer = setTimeout(function() {
            logoClickCount = 0;
        }, 3000);
        
        if (logoClickCount >= 10) {
            logoClickCount = 0;
            showVideoEasterEgg();
        }
    });
}

function showVideoEasterEgg() {
    var existingModal = document.getElementById('video-easter-egg-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    var modal = document.createElement('div');
    modal.id = 'video-easter-egg-modal';
    modal.innerHTML = `
        <div class="easter-egg-overlay"></div>
        <div class="easter-egg-content">
            <button class="easter-egg-close" onclick="closeVideoEasterEgg()">✕</button>
            <h2 class="easter-egg-title">🎬 彩蛋视频</h2>
            <video id="easter-egg-video" controls autoplay>
                <source src="彩蛋/视频/屏幕录制 2026-02-11 210916.mp4" type="video/mp4">
                您的浏览器不支持视频播放
            </video>
        </div>
    `;
    document.body.appendChild(modal);
    
    if (typeof unlockAchievement === 'function') {
        unlockAchievement(291);
    }
}

function closeVideoEasterEgg() {
    var modal = document.getElementById('video-easter-egg-modal');
    if (modal) {
        var video = document.getElementById('easter-egg-video');
        if (video) {
            video.pause();
        }
        modal.remove();
    }
}

function setupQuickStartButtons() {
    console.log('Setting up quick start buttons...');
    
    var actionItems = document.querySelectorAll('.action-item-new, .quick-card, .feature-card, .hero-btn');
    console.log('Found ' + actionItems.length + ' action items');
    
    actionItems.forEach(function(item) {
        item.addEventListener('click', function() {
            console.log('Action item clicked:', item.dataset.action);
            var action = item.dataset.action;
            switch(action) {
                case 'recite':
                    navigateTo('word-recite');
                    break;
                case 'review':
                    navigateTo('word-review');
                    break;
                case 'memory':
                    navigateTo('memory-cards');
                    break;
                case 'dungeon':
                    navigateTo('word-dungeon');
                    break;
                case 'typing':
                    navigateTo('typing-game');
                    break;
                case 'gacha':
                    navigateTo('gacha');
                    break;
                case 'listening':
                    navigateTo('audio-listening');
                    break;
                case 'proverbs':
                    navigateTo('proverbs');
                    break;
            }
        });
    });
}

function initProverbsRedesigned() {
    setupContentTabs('proverbs');
    initProverbsRandomRedesigned();
    initProverbsAllRedesigned();
    initProverbsFavoritesRedesigned();
}

function initPhrasesRedesigned() {
    setupContentTabs('phrases');
    initPhrasesRandomRedesigned();
    initPhrasesAllRedesigned();
    initPhrasesFavoritesRedesigned();
}

function setupContentTabs(prefix) {
    var tabBtns = document.querySelectorAll('[data-tab^="' + prefix + '-"]');
    
    tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var tabId = btn.dataset.tab;
            
            document.querySelectorAll('[data-tab^="' + prefix + '-"]').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            
            document.querySelectorAll('[id^="' + prefix + '-"][id$="-tab"]').forEach(function(content) {
                content.classList.remove('active');
            });
            var tabContent = document.getElementById(tabId + '-tab');
            if (tabContent) tabContent.classList.add('active');
            
            if (prefix === 'proverbs') {
                proverbsCurrentTab = tabId;
            } else {
                phrasesCurrentTab = tabId;
            }
        });
    });
}

function initProverbsRandomRedesigned() {
    var nextBtn = document.getElementById('proverbs-random-btn');
    var favoriteBtn = document.getElementById('proverb-fav-btn');
    var audioBtn = document.getElementById('proverb-audio-btn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            proverbsRandomIndex = Math.floor(Math.random() * proverbs.length);
            displayProverbsRandomRedesigned();
        });
    }
    
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function() {
            toggleProverbFavoriteRedesigned();
        });
    }
    
    if (audioBtn) {
        audioBtn.addEventListener('click', function() {
            speakProverb(proverbsRandomIndex);
        });
    }
    
    if (proverbs.length > 0) {
        proverbsRandomIndex = Math.floor(Math.random() * proverbs.length);
        displayProverbsRandomRedesigned();
    }
}

function displayProverbsRandomRedesigned() {
    var contentEl = document.getElementById('proverb-content');
    var translationEl = document.getElementById('proverb-translation');
    var favoriteBtn = document.getElementById('proverb-fav-btn');
    
    if (!proverbs[proverbsRandomIndex]) return;
    
    var p = proverbs[proverbsRandomIndex];
    var isFavorited = gameState.proverbsFavorites && gameState.proverbsFavorites.includes(proverbsRandomIndex);
    
    if (contentEl) contentEl.textContent = p.en;
    if (translationEl) translationEl.textContent = p.zh;
    
    if (favoriteBtn) {
        favoriteBtn.textContent = isFavorited ? '⭐ 已收藏' : '☆ 收藏';
        favoriteBtn.classList.toggle('favorited', isFavorited);
    }
}

function toggleProverbFavoriteRedesigned() {
    if (!gameState.proverbsFavorites) gameState.proverbsFavorites = [];
    
    var idx = gameState.proverbsFavorites.indexOf(proverbsRandomIndex);
    if (idx === -1) {
        gameState.proverbsFavorites.push(proverbsRandomIndex);
    } else {
        gameState.proverbsFavorites.splice(idx, 1);
    }
    
    saveGameState();
    displayProverbsRandomRedesigned();
    displayProverbsFavoritesRedesigned();
}

function initProverbsAllRedesigned() {
    var searchInput = document.getElementById('proverbs-search');
    var searchBtn = document.getElementById('proverbs-search-go');
    var alphabetContainer = document.getElementById('proverbs-alphabet');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            proverbsMainFilter = searchInput.value;
            proverbsMainPage = 1;
            displayProverbsAllRedesigned();
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            proverbsMainFilter = searchInput ? searchInput.value : '';
            proverbsMainPage = 1;
            displayProverbsAllRedesigned();
        });
    }
    
    if (alphabetContainer) {
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        var html = '<button class="active" data-letter="">All</button>';
        letters.forEach(function(letter) {
            html += '<button data-letter="' + letter + '">' + letter + '</button>';
        });
        alphabetContainer.innerHTML = html;
        
        alphabetContainer.querySelectorAll('button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                alphabetContainer.querySelectorAll('button').forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                proverbsMainLetter = btn.dataset.letter;
                proverbsMainPage = 1;
                displayProverbsAllRedesigned();
            });
        });
    }
    
    displayProverbsAllRedesigned();
}

function displayProverbsAllRedesigned() {
    var container = document.getElementById('proverbs-all-grid');
    var pagination = document.getElementById('proverbs-pagination');
    
    if (!container) return;
    
    var filtered = proverbs.filter(function(p, idx) {
        var matchesFilter = !proverbsMainFilter || 
            p.en.toLowerCase().includes(proverbsMainFilter.toLowerCase()) ||
            p.zh.includes(proverbsMainFilter);
        
        var matchesLetter = !proverbsMainLetter || p.en.charAt(0).toUpperCase() === proverbsMainLetter;
        
        return matchesFilter && matchesLetter;
    });
    
    var perPage = 24;
    var totalPages = Math.ceil(filtered.length / perPage);
    var start = (proverbsMainPage - 1) * perPage;
    var end = start + perPage;
    var pageItems = filtered.slice(start, end);
    
    var html = '';
    pageItems.forEach(function(p, idx) {
        var originalIndex = proverbs.indexOf(p);
        var isFavorited = gameState.proverbsFavorites && gameState.proverbsFavorites.includes(originalIndex);
        
        html += '<div class="content-item-large content-item-clickable" onclick="showProverbModal(' + originalIndex + ')">';
        html += '<button class="content-favorite-btn ' + (isFavorited ? 'favorited' : '') + '" onclick="event.stopPropagation(); toggleProverbFavoriteByIndex(' + originalIndex + ')">' + (isFavorited ? '⭐' : '☆') + '</button>';
        html += '<h4>' + p.en + '</h4>';
        html += '<p>' + p.zh + '</p>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    if (pagination && totalPages > 1) {
        pagination.innerHTML = ''; pagination.appendChild(createPagination(totalPages, proverbsMainPage, function(page) {
            proverbsMainPage = page;
            displayProverbsAllRedesigned();
        }));
    } else if (pagination) {
        pagination.innerHTML = '';
    }
}

function toggleProverbFavoriteByIndex(index) {
    if (!gameState.proverbsFavorites) gameState.proverbsFavorites = [];
    
    var idx = gameState.proverbsFavorites.indexOf(index);
    if (idx === -1) {
        gameState.proverbsFavorites.push(index);
    } else {
        gameState.proverbsFavorites.splice(idx, 1);
    }
    
    saveGameState();
    displayProverbsRandomRedesigned();
    displayProverbsAllRedesigned();
    displayProverbsFavoritesRedesigned();
}

function initProverbsFavoritesRedesigned() {
    displayProverbsFavoritesRedesigned();
}

function displayProverbsFavoritesRedesigned() {
    var container = document.getElementById('proverbs-favorites-grid');
    var pagination = document.getElementById('proverbs-favorites-pagination');
    var emptyState = document.getElementById('proverbs-favorites-empty');
    
    if (!container) return;
    
    if (!gameState.proverbsFavorites || gameState.proverbsFavorites.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        container.innerHTML = '';
        if (pagination) pagination.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    var favorites = gameState.proverbsFavorites.map(function(idx) {
        return proverbs[idx];
    }).filter(function(p) { return p; });
    
    var perPage = 24;
    var totalPages = Math.ceil(favorites.length / perPage);
    var start = (proverbsFavoritesPage - 1) * perPage;
    var end = start + perPage;
    var pageItems = favorites.slice(start, end);
    
    var html = '';
    pageItems.forEach(function(p, idx) {
        var originalIndex = proverbs.indexOf(p);
        html += '<div class="content-item-large content-item-clickable" onclick="showProverbModal(' + originalIndex + ')">';
        html += '<button class="content-favorite-btn favorited" onclick="event.stopPropagation(); toggleProverbFavoriteByIndex(' + originalIndex + ')">⭐</button>';
        html += '<h4>' + p.en + '</h4>';
        html += '<p>' + p.zh + '</p>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    if (pagination && totalPages > 1) {
        pagination.innerHTML = ''; pagination.appendChild(createPagination(totalPages, proverbsFavoritesPage, function(page) {
            proverbsFavoritesPage = page;
            displayProverbsFavoritesRedesigned();
        }));
    } else if (pagination) {
        pagination.innerHTML = '';
    }
}

function initPhrasesRandomRedesigned() {
    var nextBtn = document.getElementById('phrases-random-btn');
    var favoriteBtn = document.getElementById('phrase-fav-btn');
    var audioBtn = document.getElementById('phrase-audio-btn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            phrasesRandomIndex = Math.floor(Math.random() * phrases.length);
            displayPhrasesRandomRedesigned();
        });
    }
    
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function() {
            togglePhraseFavoriteRedesigned();
        });
    }
    
    if (audioBtn) {
        audioBtn.addEventListener('click', function() {
            speakPhrase(phrasesRandomIndex);
        });
    }
    
    if (phrases.length > 0) {
        phrasesRandomIndex = Math.floor(Math.random() * phrases.length);
        displayPhrasesRandomRedesigned();
    }
}

function displayPhrasesRandomRedesigned() {
    var contentEl = document.getElementById('phrase-content');
    var translationEl = document.getElementById('phrase-translation');
    var favoriteBtn = document.getElementById('phrase-fav-btn');
    
    if (!phrases[phrasesRandomIndex]) return;
    
    var p = phrases[phrasesRandomIndex];
    var isFavorited = gameState.phrasesFavorites && gameState.phrasesFavorites.includes(phrasesRandomIndex);
    
    if (contentEl) contentEl.textContent = p.en;
    if (translationEl) translationEl.textContent = p.zh;
    
    if (favoriteBtn) {
        favoriteBtn.textContent = isFavorited ? '⭐ 已收藏' : '☆ 收藏';
        favoriteBtn.classList.toggle('favorited', isFavorited);
    }
}

function togglePhraseFavoriteRedesigned() {
    if (!gameState.phrasesFavorites) gameState.phrasesFavorites = [];
    
    var idx = gameState.phrasesFavorites.indexOf(phrasesRandomIndex);
    if (idx === -1) {
        gameState.phrasesFavorites.push(phrasesRandomIndex);
    } else {
        gameState.phrasesFavorites.splice(idx, 1);
    }
    
    saveGameState();
    displayPhrasesRandomRedesigned();
    displayPhrasesFavoritesRedesigned();
}

function initPhrasesAllRedesigned() {
    var searchInput = document.getElementById('phrases-search');
    var searchBtn = document.getElementById('phrases-search-go');
    var alphabetContainer = document.getElementById('phrases-alphabet');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            phrasesMainFilter = searchInput.value;
            phrasesMainPage = 1;
            displayPhrasesAllRedesigned();
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            phrasesMainFilter = searchInput ? searchInput.value : '';
            phrasesMainPage = 1;
            displayPhrasesAllRedesigned();
        });
    }
    
    if (alphabetContainer) {
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        var html = '<button class="active" data-letter="">All</button>';
        letters.forEach(function(letter) {
            html += '<button data-letter="' + letter + '">' + letter + '</button>';
        });
        alphabetContainer.innerHTML = html;
        
        alphabetContainer.querySelectorAll('button').forEach(function(btn) {
            btn.addEventListener('click', function() {
                alphabetContainer.querySelectorAll('button').forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                phrasesMainLetter = btn.dataset.letter;
                phrasesMainPage = 1;
                displayPhrasesAllRedesigned();
            });
        });
    }
    
    displayPhrasesAllRedesigned();
}

function displayPhrasesAllRedesigned() {
    var container = document.getElementById('phrases-all-grid');
    var pagination = document.getElementById('phrases-pagination');
    
    if (!container) return;
    
    var filtered = phrases.filter(function(p, idx) {
        var matchesFilter = !phrasesMainFilter || 
            p.en.toLowerCase().includes(phrasesMainFilter.toLowerCase()) ||
            p.zh.includes(phrasesMainFilter);
        
        var matchesLetter = !phrasesMainLetter || p.en.charAt(0).toUpperCase() === phrasesMainLetter;
        
        return matchesFilter && matchesLetter;
    });
    
    var perPage = 24;
    var totalPages = Math.ceil(filtered.length / perPage);
    var start = (phrasesMainPage - 1) * perPage;
    var end = start + perPage;
    var pageItems = filtered.slice(start, end);
    
    var html = '';
    pageItems.forEach(function(p, idx) {
        var originalIndex = phrases.indexOf(p);
        var isFavorited = gameState.phrasesFavorites && gameState.phrasesFavorites.includes(originalIndex);
        
        html += '<div class="content-item-large content-item-clickable" onclick="showPhraseModal(' + originalIndex + ')">';
        html += '<button class="content-favorite-btn ' + (isFavorited ? 'favorited' : '') + '" onclick="event.stopPropagation(); togglePhraseFavoriteByIndex(' + originalIndex + ')">' + (isFavorited ? '⭐' : '☆') + '</button>';
        html += '<h4>' + p.en + '</h4>';
        html += '<p>' + p.zh + '</p>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    if (pagination && totalPages > 1) {
        pagination.innerHTML = ''; pagination.appendChild(createPagination(totalPages, phrasesMainPage, function(page) {
            phrasesMainPage = page;
            displayPhrasesAllRedesigned();
        }));
    } else if (pagination) {
        pagination.innerHTML = '';
    }
}

function togglePhraseFavoriteByIndex(index) {
    if (!gameState.phrasesFavorites) gameState.phrasesFavorites = [];
    
    var idx = gameState.phrasesFavorites.indexOf(index);
    if (idx === -1) {
        gameState.phrasesFavorites.push(index);
    } else {
        gameState.phrasesFavorites.splice(idx, 1);
    }
    
    saveGameState();
    displayPhrasesRandomRedesigned();
    displayPhrasesAllRedesigned();
    displayPhrasesFavoritesRedesigned();
}

function initPhrasesFavoritesRedesigned() {
    displayPhrasesFavoritesRedesigned();
}

function displayPhrasesFavoritesRedesigned() {
    var container = document.getElementById('phrases-favorites-grid');
    var pagination = document.getElementById('phrases-favorites-pagination');
    var emptyState = document.getElementById('phrases-favorites-empty');
    
    if (!container) return;
    
    if (!gameState.phrasesFavorites || gameState.phrasesFavorites.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        container.innerHTML = '';
        if (pagination) pagination.innerHTML = '';
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    
    var favorites = gameState.phrasesFavorites.map(function(idx) {
        return phrases[idx];
    }).filter(function(p) { return p; });
    
    var perPage = 24;
    var totalPages = Math.ceil(favorites.length / perPage);
    var start = (phrasesFavoritesPage - 1) * perPage;
    var end = start + perPage;
    var pageItems = favorites.slice(start, end);
    
    var html = '';
    pageItems.forEach(function(p, idx) {
        var originalIndex = phrases.indexOf(p);
        html += '<div class="content-item-large content-item-clickable" onclick="showPhraseModal(' + originalIndex + ')">';
        html += '<button class="content-favorite-btn favorited" onclick="event.stopPropagation(); togglePhraseFavoriteByIndex(' + originalIndex + ')">⭐</button>';
        html += '<h4>' + p.en + '</h4>';
        html += '<p>' + p.zh + '</p>';
        html += '</div>';
    });
    container.innerHTML = html;
    
    if (pagination && totalPages > 1) {
        pagination.innerHTML = ''; pagination.appendChild(createPagination(totalPages, phrasesFavoritesPage, function(page) {
            phrasesFavoritesPage = page;
            displayPhrasesFavoritesRedesigned();
        }));
    } else if (pagination) {
        pagination.innerHTML = '';
    }
}
var achievementsEventHandler = null;

function initAchievementsRedesigned() {
    console.log('initAchievementsRedesigned called');
    
    var filterBtns = document.querySelectorAll('.ach-filter-btn');
    var modalOverlay = document.getElementById('achievement-modal-overlay');
    var modalClose = document.getElementById('achievement-modal-close');
    var modalActionBtn = document.getElementById('achievement-modal-action-btn');
    
    if (filterBtns && filterBtns.length > 0) {
        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                filterBtns.forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                achievementsCategory = btn.getAttribute('data-category');
                displayAchievementsRedesigned();
            });
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeAchievementModal);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeAchievementModal);
    }
    
    if (modalActionBtn) {
        modalActionBtn.addEventListener('click', closeAchievementModal);
    }
    
    displayAchievementsRedesigned();
    updateAchievementStats();
}

function displayAchievementsRedesigned() {
    var container = document.getElementById('achievements-grid');
    if (!container) {
        console.error('achievements-grid not found');
        return;
    }
    
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
    container.style.gap = '20px';
    container.style.minHeight = '200px';
    container.style.padding = '4px';
    
    console.log('Displaying achievements, category:', achievementsCategory);
    console.log('Total achievements:', achievements ? achievements.length : 0);
    
    if (!achievements || achievements.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-tertiary);">成就数据加载失败</div>';
        return;
    }
    
    var filtered = [];
    for (var i = 0; i < achievements.length; i++) {
        var ach = achievements[i];
        var matchCat = (achievementsCategory === 'all' || ach.category === achievementsCategory);
        if (matchCat) {
            filtered.push(ach);
        }
    }
    
    console.log('Filtered achievements:', filtered.length);
    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-tertiary);">没有找到匹配的成就</div>';
        return;
    }
    
    for (var j = 0; j < filtered.length; j++) {
        var a = filtered[j];
        var isUnlocked = gameState.achievements && gameState.achievements.indexOf(a.id) >= 0;
        var unlockTime = gameState.achievementTimes ? gameState.achievementTimes[a.id] : null;
        
        var card = document.createElement('div');
        card.className = 'ach-card ' + (isUnlocked ? 'unlocked' : 'locked');
        card.setAttribute('data-id', a.id);
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'center';
        card.style.justifyContent = 'flex-start';
        card.style.padding = '20px 14px';
        card.style.background = 'var(--bg-card)';
        card.style.border = '2px solid ' + (isUnlocked ? 'var(--accent)' : 'var(--border-subtle)');
        card.style.borderRadius = '18px';
        card.style.cursor = 'pointer';
        card.style.transition = 'all 0.3s ease';
        card.style.minHeight = '180px';
        card.style.boxSizing = 'border-box';
        card.style.position = 'relative';
        
        var cardHtml = 
            '<div style="position:absolute;top:12px;right:12px;font-size:0.625rem;padding:3px 8px;border-radius:8px;font-weight:600;z-index:2;' + 
            (isUnlocked ? 'background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:white;' : 'background:var(--bg-tertiary);color:var(--text-tertiary);') + '">' + 
            (isUnlocked ? '✓' : '🔒') + '</div>' +
            '<div style="font-size:3rem;margin-bottom:10px;line-height:1;position:relative;z-index:1;">' + a.icon + '</div>' +
            '<div style="font-size:0.9375rem;font-weight:700;text-align:center;margin-bottom:6px;color:var(--text-primary);position:relative;z-index:1;">' + a.name + '</div>' +
            '<div style="font-size:0.75rem;color:var(--text-secondary);text-align:center;line-height:1.5;margin-bottom:10px;position:relative;z-index:1;flex-grow:1;">' + a.desc + '</div>';
        
        if (isUnlocked && unlockTime) {
            cardHtml += '<div style="font-size:0.6875rem;color:var(--accent);background:rgba(99,102,241,0.15);padding:4px 10px;border-radius:12px;margin-top:auto;position:relative;z-index:1;font-weight:500;">📅 ' + unlockTime + '</div>';
        } else if (!isUnlocked) {
            cardHtml += '<div style="font-size:0.6875rem;color:var(--accent);background:rgba(99,102,241,0.15);padding:5px 12px;border-radius:12px;margin-top:auto;font-weight:600;position:relative;z-index:1;">点击前往解锁</div>';
        }
        
        card.innerHTML = cardHtml;
        
        (function(cardEl, achData, unlocked, targetPage) {
            cardEl.addEventListener('click', function() {
                openAchievementModal(achData, unlocked);
            });
            cardEl.addEventListener('mouseenter', function() {
                cardEl.style.transform = 'translateY(-6px) scale(1.02)';
                cardEl.style.boxShadow = '0 20px 40px -12px rgba(99, 102, 241, 0.25)';
            });
            cardEl.addEventListener('mouseleave', function() {
                cardEl.style.transform = 'translateY(0) scale(1)';
                cardEl.style.boxShadow = 'none';
            });
        })(card, a, isUnlocked, a.targetPage || 'home');
        
        container.appendChild(card);
    }
}

function updateAchievementStats() {
    var unlockedNumEl = document.getElementById('ach-unlocked-num');
    var totalNumEl = document.getElementById('ach-total-num');
    var unlockedCountEl = document.getElementById('ach-unlocked-count');
    var lockedCountEl = document.getElementById('ach-locked-count');
    var pointsEl = document.getElementById('ach-points');
    
    if (!achievements) return;
    
    var total = achievements.length;
    var unlocked = gameState.achievements ? gameState.achievements.length : 0;
    
    if (unlockedNumEl) unlockedNumEl.textContent = unlocked;
    if (totalNumEl) totalNumEl.textContent = total;
    if (unlockedCountEl) unlockedCountEl.textContent = unlocked;
    if (lockedCountEl) lockedCountEl.textContent = total - unlocked;
    if (pointsEl) pointsEl.textContent = unlocked * 10;
}

function openAchievementModal(achievement, isUnlocked) {
    var modal = document.getElementById('achievement-modal');
    var overlay = document.getElementById('achievement-modal-overlay');
    var iconEl = document.getElementById('achievement-modal-icon');
    var titleEl = document.getElementById('achievement-modal-title');
    var categoryEl = document.getElementById('achievement-modal-category');
    var descEl = document.getElementById('achievement-modal-description');
    var statusEl = document.getElementById('achievement-modal-status');
    var timeEl = document.getElementById('achievement-modal-time');
    var tipEl = document.getElementById('achievement-modal-tip');
    var tipContentEl = document.getElementById('achievement-modal-tip-content');
    var actionBtn = document.getElementById('achievement-modal-action-btn');
    
    if (!modal || !achievement) return;
    
    var categoryInfo = achievementCategories.find(function(cat) { return cat.id === achievement.category; }) || { name: '综合', icon: '📋' };
    var unlockTime = gameState.achievementTimes ? gameState.achievementTimes[achievement.id] : null;
    
    if (iconEl) iconEl.textContent = achievement.icon;
    if (titleEl) titleEl.textContent = achievement.name;
    if (categoryEl) categoryEl.textContent = categoryInfo.icon + ' ' + categoryInfo.name;
    if (descEl) descEl.textContent = achievement.desc;
    
    if (statusEl) {
        if (isUnlocked) {
            statusEl.innerHTML = '<span class="status-icon">✅</span><span class="status-text">已解锁</span>';
            statusEl.className = 'achievement-modal-status achievement-status-unlocked';
        } else {
            statusEl.innerHTML = '<span class="status-icon">🔒</span><span class="status-text">未解锁</span>';
            statusEl.className = 'achievement-modal-status achievement-status-locked';
        }
    }
    
    if (timeEl) {
        if (isUnlocked && unlockTime) {
            timeEl.innerHTML = '<span class="time-icon">📅</span><span class="time-text">解锁时间：' + unlockTime + '</span>';
        } else {
            timeEl.innerHTML = '<span class="time-icon">⏳</span><span class="time-text">等待解锁</span>';
        }
    }
    
    if (tipEl) {
        if (!isUnlocked && achievement.targetPage) {
            tipEl.style.display = 'block';
            if (tipContentEl) {
                tipContentEl.textContent = '前往"' + getPageName(achievement.targetPage) + '"完成任务解锁';
            }
            if (actionBtn) {
                actionBtn.textContent = '前往解锁';
                actionBtn.onclick = null;
                actionBtn.addEventListener('click', function() {
                    closeAchievementModal();
                    navigateTo(achievement.targetPage);
                });
            }
        } else {
            tipEl.style.display = 'none';
            if (actionBtn) {
                actionBtn.textContent = '关闭';
                actionBtn.onclick = null;
                actionBtn.addEventListener('click', closeAchievementModal);
            }
        }
    }
    
    modal.classList.add('show');
    if (overlay) overlay.classList.add('show');
}

function closeAchievementModal() {
    var modal = document.getElementById('achievement-modal');
    var overlay = document.getElementById('achievement-modal-overlay');
    
    if (modal) modal.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
}

function getPageName(page) {
    var pageNames = {
        'home': '首页',
        'word-recite': '单词背诵',
        'word-review': '复习系统',
        'word-search': '单词搜索',
        'word-notebook': '生词本',
        'memory-cards': '记忆卡片',
        'word-dungeon': '单词地下城',
        'typing-game': '打字游戏',
        'gacha': '积分抽卡',
        'audio-listening': '听力专区',
        'audio-speaking': '口语专区',
        'proverbs': '俗语谚语',
        'phrases': '短语学习'
    };
    return pageNames[page] || '相关页面';
}

function initGachaRedesigned() {
    console.log('initGachaRedesigned called');
    
    var gachaScore = document.getElementById('gacha-score');
    var gachaCollected = document.getElementById('gacha-collected');
    
    if (gachaScore) gachaScore.textContent = gameState.score;
    if (gachaCollected) gachaCollected.textContent = gameState.collection.length;
    
    var navBtns = document.querySelectorAll('.gacha-nav-btn');
    for (var i = 0; i < navBtns.length; i++) {
        navBtns[i].onclick = function() {
            for (var j = 0; j < navBtns.length; j++) {
                navBtns[j].classList.remove('active');
            }
            this.classList.add('active');
            
            var section = this.getAttribute('data-section');
            var sections = document.querySelectorAll('.gacha-section');
            for (var k = 0; k < sections.length; k++) {
                sections[k].classList.remove('active');
            }
            var targetSection = document.getElementById('gacha-' + section + '-section');
            if (targetSection) targetSection.classList.add('active');
        };
    }
    
    var singleBtn = document.getElementById('gacha-single-btn');
    var tenBtn = document.getElementById('gacha-ten-btn');
    
    if (singleBtn) {
        singleBtn.onclick = function() {
            performGachaRedesigned(1);
        };
    }
    
    if (tenBtn) {
        tenBtn.onclick = function() {
            performGachaRedesigned(10);
        };
    }
    
    var rarityFilters = document.querySelectorAll('.filter-btn-premium');
    for (var i = 0; i < rarityFilters.length; i++) {
        rarityFilters[i].onclick = function() {
            for (var j = 0; j < rarityFilters.length; j++) {
                rarityFilters[j].classList.remove('active');
            }
            this.classList.add('active');
            collectionRarityFilter = this.getAttribute('data-rarity');
            gachaNewCollectionPage = 1;
            updateCollectionRedesigned();
        };
    }
    
    var alphabetContainer = document.getElementById('collection-alphabet');
    if (alphabetContainer) {
        var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        var html = '<button class="active" data-letter="">All</button>';
        for (var i = 0; i < letters.length; i++) {
            html += '<button data-letter="' + letters[i] + '">' + letters[i] + '</button>';
        }
        alphabetContainer.innerHTML = html;
        
        var alphaBtns = alphabetContainer.querySelectorAll('button');
        for (var i = 0; i < alphaBtns.length; i++) {
            alphaBtns[i].onclick = function() {
                for (var j = 0; j < alphaBtns.length; j++) {
                    alphaBtns[j].classList.remove('active');
                }
                this.classList.add('active');
                collectionLetterFilter = this.getAttribute('data-letter');
                gachaNewCollectionPage = 1;
                updateCollectionRedesigned();
            };
        }
    }
    
    updateCollectionRedesigned();
}

function performGachaRedesigned(count) {
    var cost = count === 1 ? 100 : 900;
    
    if (gameState.score < cost) {
        alert('积分不足! 当前积分: ' + gameState.score + ', 需要: ' + cost);
        return;
    }
    
    if (!vocabulary3500 || !vocabulary3500.words || vocabulary3500.words.length === 0) {
        alert('词库加载失败，请刷新页面重试');
        return;
    }
    
    gameState.score -= cost;
    saveGameState();
    updateScoreDisplay();
    
    var gachaScore = document.getElementById('gacha-score');
    if (gachaScore) gachaScore.textContent = gameState.score;
    
    var results = [];
    var guaranteedRare = count === 10;
    var rareCount = 0;
    
    for (var i = 0; i < count; i++) {
        var wordIndex = Math.floor(Math.random() * vocabulary3500.words.length);
        var word = vocabulary3500.words[wordIndex];
        var rarity = generateCardRarity();
        
        if (guaranteedRare && i === count - 1 && rareCount === 0) {
            rarity = Math.random() < 0.3 ? 'epic' : 'rare';
        }
        
        if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
            rareCount++;
        }
        
        var effect = getEffectByRarity(rarity);
        var effectData = cardEffects[effect];
        var now = new Date();
        var drawTime = now.toLocaleString('zh-CN');
        var wordIndex = getWordIndex(word.word);
        var cardId = 'WRD-' + String(wordIndex).padStart(4, '0');
        
        var card = {
            word: word.word,
            meaning: word.meaning,
            phonetic: word.phonetic,
            example: word.example,
            rarity: rarity,
            effect: effect,
            effectName: effectData ? effectData.name : '攻击',
            effectDesc: effectData ? effectData.desc : '造成基础伤害',
            effectType: effectData ? effectData.effect : 'damage',
            drawTime: drawTime,
            cardId: cardId,
            wordIndex: wordIndex
        };
        
        results.push(card);
        
        var existing = false;
        for (var j = 0; j < gameState.collection.length; j++) {
            if (gameState.collection[j].word === card.word) {
                existing = true;
                break;
            }
        }
        if (!existing) {
            gameState.collection.push(card);
        }
    }
    
    saveGameState();
    displayGachaResultsRedesigned(results);
    updateCollectionRedesigned();
    
    var gachaCollected = document.getElementById('gacha-collected');
    if (gachaCollected) gachaCollected.textContent = gameState.collection.length;
    
    unlockAchievement(23);
    
    var hasRare = false, hasEpic = false, hasLegendary = false;
    for (var j = 0; j < results.length; j++) {
        if (results[j].rarity === 'rare') hasRare = true;
        if (results[j].rarity === 'epic') hasEpic = true;
        if (results[j].rarity === 'legendary') hasLegendary = true;
    }
    
    if (hasRare) unlockAchievement(25);
    if (hasEpic) unlockAchievement(26);
    if (hasLegendary) unlockAchievement(88);
    if (gameState.collection.length >= 10) unlockAchievement(27);
    if (gameState.collection.length >= 100) unlockAchievement(28);
}

function displayGachaResultsRedesigned(results) {
    var displayArea = document.getElementById('gacha-result');
    if (!displayArea) return;
    
    var html = '<div class="gacha-results-grid">';
    for (var i = 0; i < results.length; i++) {
        var card = results[i];
        var rarityClass = 'rarity-' + card.rarity;
        var rarityName = getRarityName(card.rarity);
        var effectData = cardEffects[card.effect];
        var effectName = card.effectName || (effectData ? effectData.name : '攻击');
        var effectDesc = card.effectDesc || (effectData ? effectData.desc : '造成基础伤害');
        
        html += '<div class="gacha-result-card ' + rarityClass + '" style="animation-delay: ' + (i * 0.1) + 's" onclick="showWordModal(\'' + card.word + '\')">';
        html += '<div class="gacha-result-card-id">' + (card.cardId || 'WRD-0000') + '</div>';
        html += '<div class="gacha-result-word">' + card.word + '</div>';
        html += '<div class="gacha-result-phonetic">' + card.phonetic + '</div>';
        html += '<div class="gacha-result-meaning">' + (card.meaning || '') + '</div>';
        html += '<div class="gacha-result-rarity ' + card.rarity + '">' + rarityName + '</div>';
        html += '<div class="gacha-result-effect">';
        html += '<span class="effect-icon">⚔️</span>';
        html += '<span class="effect-name">' + effectName + '</span>';
        html += '</div>';
        html += '<div class="gacha-result-effect-desc">' + effectDesc + '</div>';
        html += '</div>';
    }
    html += '</div>';
    displayArea.innerHTML = html;
}

function updateCollectionRedesigned() {
    var container = document.getElementById('collection-grid');
    var pagination = document.getElementById('collection-pagination');
    var progressFill = document.getElementById('collection-progress-fill');
    var gachaTotal = document.getElementById('gacha-total');
    
    if (gachaTotal && vocabulary3500 && vocabulary3500.words) {
        gachaTotal.textContent = vocabulary3500.words.length;
    }
    
    if (progressFill && vocabulary3500 && vocabulary3500.words) {
        var percent = (gameState.collection.length / vocabulary3500.words.length) * 100;
        progressFill.style.width = percent + '%';
    }
    
    if (!container) return;
    
    var perPage = 30;
    var totalPages = 1;
    var start = (gachaNewCollectionPage - 1) * perPage;
    var end = start + perPage;
    
    var allWordsByLetter = {};
    for (var i = 0; i < vocabulary3500.words.length; i++) {
        var w = vocabulary3500.words[i];
        var letter = w.word.charAt(0).toUpperCase();
        if (!allWordsByLetter[letter]) allWordsByLetter[letter] = [];
        allWordsByLetter[letter].push(w);
    }
    
    var displayWords = [];
    if (collectionLetterFilter) {
        var letterWords = allWordsByLetter[collectionLetterFilter] || [];
        displayWords = letterWords.slice(start, end);
        totalPages = Math.ceil(letterWords.length / perPage);
    } else {
        displayWords = vocabulary3500.words.slice(start, end);
        totalPages = Math.ceil(vocabulary3500.words.length / perPage);
    }
    
    var html = '';
    for (var i = 0; i < displayWords.length; i++) {
        var word = displayWords[i];
        var card = null;
        
        for (var j = 0; j < gameState.collection.length; j++) {
            if (gameState.collection[j].word === word.word) {
                card = gameState.collection[j];
                break;
            }
        }
        
        if (card) {
            if (collectionRarityFilter === 'all' || card.rarity === collectionRarityFilter) {
                var rarityName = getRarityName(card.rarity);
                var effectData = cardEffects[card.effect];
                var effectName = card.effectName || (effectData ? effectData.name : '攻击');
                var wordIndex = card.wordIndex || getWordIndex(word.word);
                var cardId = card.cardId || ('WRD-' + String(wordIndex).padStart(4, '0'));
                
                html += '<div class="collection-card-premium unlocked" onclick="showWordModal(\'' + word.word + '\')">';
                html += '<div class="collection-card-id-premium">' + cardId + '</div>';
                html += '<div class="collection-card-word-premium">' + word.word + '</div>';
                html += '<div class="collection-card-phonetic-premium">' + (card.phonetic || word.phonetic || '') + '</div>';
                html += '<div class="collection-card-meaning-premium">' + (card.meaning || word.meaning || '') + '</div>';
                html += '<div class="collection-card-rarity-premium ' + card.rarity + '">' + rarityName + '</div>';
                html += '<div class="collection-card-effect-premium">' + effectName + '</div>';
                html += '</div>';
            }
        } else if (collectionRarityFilter === 'all') {
            var wordIndex = getWordIndex(word.word);
            var cardId = 'WRD-' + String(wordIndex).padStart(4, '0');
            html += '<div class="collection-card-premium locked">';
            html += '<div class="collection-card-id-premium">' + cardId + '</div>';
            html += '<div class="collection-card-word-premium">???</div>';
            html += '<div class="collection-card-phonetic-premium">???</div>';
            html += '<div class="collection-card-meaning-premium">???</div>';
            html += '<div class="collection-card-rarity-premium">???</div>';
            html += '<div class="collection-card-effect-premium">???</div>';
            html += '</div>';
        }
    }
    
    container.innerHTML = html;
    
    if (pagination) {
        if (totalPages > 1) {
            var pagHtml = '';
            if (gachaNewCollectionPage > 1) {
                pagHtml += '<button class="pagination-btn" data-page="' + (gachaNewCollectionPage - 1) + '">上一页</button>';
            }
            pagHtml += '<span class="pagination-info">第 ' + gachaNewCollectionPage + ' / ' + totalPages + ' 页</span>';
            if (gachaNewCollectionPage < totalPages) {
                pagHtml += '<button class="pagination-btn" data-page="' + (gachaNewCollectionPage + 1) + '">下一页</button>';
            }
            pagination.innerHTML = pagHtml;
            
            var pagBtns = pagination.querySelectorAll('.pagination-btn');
            for (var i = 0; i < pagBtns.length; i++) {
                pagBtns[i].onclick = function() {
                    gachaNewCollectionPage = parseInt(this.getAttribute('data-page'));
                    updateCollectionRedesigned();
                };
            }
        } else {
            pagination.innerHTML = '';
        }
    }
}

function updateBattleUI() {
    var playerName = document.getElementById('player-class-name');
    var playerHpBar = document.getElementById('player-hp-bar');
    var playerHpText = document.getElementById('player-hp-text');
    var enemyName = document.getElementById('enemy-name');
    var enemyHpBar = document.getElementById('enemy-hp-bar');
    var enemyHpText = document.getElementById('enemy-hp-text');
    var enemySprite = document.getElementById('enemy-sprite');
    var floorNumber = document.getElementById('floor-number');
    var handCards = document.getElementById('hand-cards');
    var deckInfo = document.getElementById('deck-info');
    var energyValue = document.getElementById('energy-value');
    var energyOrbs = document.getElementById('energy-orbs');
    
    if (playerName && classes[dungeonGame.playerClass]) {
        playerName.textContent = classes[dungeonGame.playerClass].name;
    }
    
    if (playerHpBar) {
        playerHpBar.style.width = (dungeonGame.playerHP / dungeonGame.playerMaxHP * 100) + '%';
    }
    if (playerHpText) {
        playerHpText.textContent = Math.max(0, dungeonGame.playerHP) + '/' + dungeonGame.playerMaxHP;
    }
    
    if (enemyName && dungeonGame.enemy) enemyName.textContent = dungeonGame.enemy.name;
    if (enemyHpBar && dungeonGame.enemy) {
        enemyHpBar.style.width = (dungeonGame.enemyHP / dungeonGame.enemyMaxHP * 100) + '%';
    }
    if (enemyHpText && dungeonGame.enemy) {
        enemyHpText.textContent = Math.max(0, dungeonGame.enemyHP) + '/' + dungeonGame.enemyMaxHP;
    }
    if (enemySprite && dungeonGame.enemy) enemySprite.textContent = dungeonGame.enemy.icon;
    if (floorNumber) floorNumber.textContent = dungeonGame.floor;
    if (deckInfo) deckInfo.textContent = '牌库: ' + dungeonGame.deck.length + ' | 弃牌: ' + dungeonGame.discardPile.length;
    if (energyValue) energyValue.textContent = dungeonGame.energy + '/' + dungeonGame.maxEnergy;
    
    if (energyOrbs) {
        var html = '';
        for (var i = 0; i < dungeonGame.maxEnergy; i++) {
            html += '<div class="energy-orb ' + (i >= dungeonGame.energy ? 'empty' : '') + '"></div>';
        }
        energyOrbs.innerHTML = html;
    }
    
    if (handCards) {
        var html = '';
        dungeonGame.hand.forEach(function(card, index) {
            var cardEffect = cardEffects[card.effect];
            var canPlay = dungeonGame.energy >= card.cost && dungeonGame.isPlayerTurn;
            
            var damage = dungeonGame.playerATK;
            if (cardEffect.multiplier) damage = Math.floor(damage * cardEffect.multiplier);
            
            var healAmount = 0;
            if (cardEffect.amount) {
                healAmount = Math.floor(dungeonGame.playerMaxHP * cardEffect.amount);
            }
            
            html += '<div class="hand-card-premium rarity-' + card.rarity + (canPlay ? '' : ' disabled') + '" data-index="' + index + '">';
            html += '<div class="hand-card-cost-premium">' + card.cost + '</div>';
            html += '<div class="hand-card-header-premium">';
            html += '<div class="hand-card-name-premium">' + card.word + '</div>';
            html += '<div class="hand-card-meaning-premium">' + card.meaning + '</div>';
            html += '</div>';
            html += '<div class="hand-card-stats-premium">';
            
            if (cardEffect.effect === 'damage' || cardEffect.effect === 'double_damage' || cardEffect.effect === 'heavy_attack' || cardEffect.effect === 'critical' || cardEffect.effect === 'lifesteal') {
                var totalDamage = cardEffect.effect === 'double_damage' ? damage * 2 : damage;
                html += '<div class="hand-card-stat-premium">';
                html += '<span class="stat-icon-premium damage">⚔️</span>';
                html += '<span class="stat-value-premium damage">' + totalDamage + ' 伤害</span>';
                html += '</div>';
            }
            
            if (cardEffect.effect === 'heal') {
                html += '<div class="hand-card-stat-premium">';
                html += '<span class="stat-icon-premium heal">❤️</span>';
                html += '<span class="stat-value-premium heal">' + healAmount + ' 治疗</span>';
                html += '</div>';
            }
            
            if (cardEffect.effect === 'shield') {
                html += '<div class="hand-card-stat-premium">';
                html += '<span class="stat-icon-premium shield">🛡️</span>';
                html += '<span class="stat-value-premium shield">护盾</span>';
                html += '</div>';
            }
            
            if (cardEffect.effect === 'power_up') {
                html += '<div class="hand-card-stat-premium">';
                html += '<span class="stat-icon-premium power">⚡</span>';
                html += '<span class="stat-value-premium power">伤害×2</span>';
                html += '</div>';
            }
            
            if (cardEffect.effect === 'poison') {
                html += '<div class="hand-card-stat-premium">';
                html += '<span class="stat-icon-premium poison">☠️</span>';
                html += '<span class="stat-value-premium poison">中毒</span>';
                html += '</div>';
            }
            
            if (cardEffect.effect === 'stun') {
                html += '<div class="hand-card-stat-premium">';
                html += '<span class="stat-icon-premium stun">💫</span>';
                html += '<span class="stat-value-premium stun">眩晕</span>';
                html += '</div>';
            }
            
            if (cardEffect.effect === 'draw') {
                html += '<div class="hand-card-stat-premium">';
                html += '<span class="stat-icon-premium draw">🎴</span>';
                html += '<span class="stat-value-premium draw">抽' + cardEffect.count + '张</span>';
                html += '</div>';
            }
            
            if (cardEffect.effect === 'refresh') {
                html += '<div class="hand-card-stat-premium">';
                html += '<span class="stat-icon-premium draw">🔄</span>';
                html += '<span class="stat-value-premium draw">补满手牌</span>';
                html += '</div>';
            }
            
            if (cardEffect.effect === 'lifesteal') {
                var lifesteal = Math.floor(damage * 0.5);
                html += '<div class="hand-card-stat-premium">';
                html += '<span class="stat-icon-premium heal">💚</span>';
                html += '<span class="stat-value-premium heal">+' + lifesteal + ' 吸血</span>';
                html += '</div>';
            }
            
            html += '</div>';
            html += '<div class="hand-card-effect-premium">' + cardEffect.name + ' - ' + cardEffect.desc + '</div>';
            html += '<div class="hand-card-rarity-premium">';
            html += '<span class="rarity-badge-premium ' + card.rarity + '">' + getRarityName(card.rarity) + '</span>';
            html += '</div>';
            html += '</div>';
        });
        handCards.innerHTML = html;
        
        handCards.querySelectorAll('.hand-card-premium').forEach(function(cardEl) {
            cardEl.addEventListener('click', function() {
                playCard(parseInt(cardEl.dataset.index));
            });
        });
    }
}

function navigateTo(page) {
    console.log('navigateTo called with page: ' + page);
    
    // 如果打字游戏正在进行，切换页面时结束游戏
    if (window.typingGame && window.typingGame.isPlaying && page !== 'typing-game') {
        if (typeof window.endTypingGame === 'function') {
            window.endTypingGame();
        }
    }
    
    // 如果记忆卡牌游戏正在进行，切换页面时结束游戏
    if (window.memoryGame && window.memoryGame.isPlaying && page !== 'memory-cards') {
        if (typeof window.resetMemoryGame === 'function') {
            window.resetMemoryGame();
        }
    }
    
    var allPages = document.querySelectorAll('.page');
    
    allPages.forEach(function(p) {
        p.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    var targetPage = document.getElementById('page-' + page);
    console.log('Target page element:', targetPage);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    currentPage = page;

    switch(page) {
        case 'home':
            updateDashboard();
            break;
        case 'word-recite':
            if (typeof window.startReciteSessionInline === 'function') {
                window.startReciteSessionInline();
            }
            break;
        case 'word-review':
            if (typeof window.displayReviewInline === 'function') {
                window.displayReviewInline();
            }
            break;
        case 'word-search':
            if (typeof window.displaySearchResults === 'function') {
                window.displaySearchResults();
            }
            break;
        case 'memory-cards':
            if (window.memoryGame && window.memoryGame.isPlaying) {
                // 游戏正在进行中，不做任何操作
            }
            break;
        case 'word-dungeon':
            initDungeon();
            break;
        case 'typing-game':
            if (window.typingGame && window.typingGame.isPlaying) {
                // 游戏正在进行中，不做任何操作
            }
            break;
        case 'proverbs':
            if (typeof window.initProverbs === 'function') {
                window.initProverbs();
            }
            break;
        case 'phrases':
            if (typeof window.initPhrases === 'function') {
                window.initPhrases();
            }
            break;
        case 'achievements':
            initAchievementsRedesigned();
            break;
        case 'gacha':
            initGachaRedesigned();
            break;
        case 'audio-listening':
            if (typeof window.loadAudioList === 'function') {
                window.loadAudioList('listening');
                window.updatePlaylistUI('listening');
            }
            break;
        case 'audio-speaking':
            if (typeof window.loadAudioList === 'function') {
                window.loadAudioList('speaking');
                window.updatePlaylistUI('speaking');
            }
            break;
        case 'word-notebook':
            if (typeof window.displayNotebookInline === 'function') {
                window.displayNotebookInline();
            }
            break;
    }
}
