// DOM Elements
const lockScreen = document.getElementById('lockScreen');
const desktop = document.getElementById('desktop');
const lockTime = document.getElementById('lockTime');
const lockDate = document.getElementById('lockDate');
const desktopTime = document.getElementById('desktopTime');
const lockPassword = document.getElementById('lockPassword');
const unlockBtn = document.getElementById('unlockBtn');
const desktopIcons = document.querySelectorAll('.desktop-icon');
const dockItems = document.querySelectorAll('.dock-item');
const contextMenu = document.getElementById('contextMenu');
const notificationCenter = document.getElementById('notificationCenter');
const closeNotifications = document.getElementById('closeNotifications');
const trashWindow = document.getElementById('trashWindow');
const spotlightBtn = document.getElementById('spotlightBtn');

// Power buttons
const lockRestartBtn = document.getElementById('lockRestartBtn');
const lockShutdownBtn = document.getElementById('lockShutdownBtn');
const sleepBtn = document.getElementById('sleepBtn');
const desktopRestartBtn = document.getElementById('desktopRestartBtn');
const desktopShutdownBtn = document.getElementById('desktopShutdownBtn');
const desktopSleepBtn = document.getElementById('desktopSleepBtn');

// Modals
const shutdownModal = document.getElementById('shutdownModal');
const restartModal = document.getElementById('restartModal');
const sleepModal = document.getElementById('sleepModal');
const aboutMacModal = document.getElementById('aboutMacModal');
const appStoreModal = document.getElementById('appStoreModal');

// Music Player
const musicPlayer = document.getElementById('musicPlayer');

// State Management
let systemState = {
    notifications: [],
    trashItems: [],
    openWindows: [],
    activeApp: null,
    selectedFile: null,
    isLocked: true,
    isShuttingDown: false,
    isRestarting: false,
    isSleeping: false,
    currentUser: 'Neel Patel',
    volume: 0.7,
    isDarkMode: false
};

// Music State
let musicState = {
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    playlist: [
        {
            id: 1,
            title: 'Blinding Lights',
            artist: 'The Weeknd',
            album: 'After Hours',
            duration: 200,
            color: '#f5576c',
            icon: 'fas fa-fire'
        },
        {
            id: 2,
            title: 'Midnight City',
            artist: 'M83',
            album: 'Hurry Up, We\'re Dreaming',
            duration: 244,
            color: '#764ba2',
            icon: 'fas fa-moon'
        },
        {
            id: 3,
            title: 'Levitating',
            artist: 'Dua Lipa',
            album: 'Future Nostalgia',
            duration: 203,
            color: '#f093fb',
            icon: 'fas fa-star'
        },
        {
            id: 4,
            title: 'Stay',
            artist: 'The Kid LAROI, Justin Bieber',
            album: 'F*CK LOVE 3',
            duration: 141,
            color: '#4facfe',
            icon: 'fas fa-heart'
        },
        {
            id: 5,
            title: 'Good 4 U',
            artist: 'Olivia Rodrigo',
            album: 'SOUR',
            duration: 178,
            color: '#f5576c',
            icon: 'fas fa-guitar'
        },
        {
            id: 6,
            title: 'Heat Waves',
            artist: 'Glass Animals',
            album: 'Dreamland',
            duration: 238,
            color: '#667eea',
            icon: 'fas fa-sun'
        }
    ],
    currentPlaylistIndex: 0
};

// Sound System State
let soundState = {
    enabled: true,
    volume: 0.7,
    sounds: {
        login: { freq: 523.25, duration: 1500, type: 'sine' },      // Classic Mac startup
        click: { freq: 800, duration: 30, type: 'square' },        // Soft click
        notification: { freq: 1046.50, duration: 200, type: 'sine' }, // Gentle bell
        windowOpen: { freq: 659.25, duration: 150, type: 'sine' },   // Window open
        windowClose: { freq: 392.00, duration: 150, type: 'sine' },  // Window close
        error: { freq: 220, duration: 500, type: 'sawtooth' },       // Error tone
        trash: { freq: 130.81, duration: 400, type: 'sawtooth' },    // Trash sound
        mission: { freq: 880.00, duration: 200, type: 'sine' },      // Mission Control
        launchpad: { freq: 1046.50, duration: 200, type: 'sine' },   // Launchpad
        spotlight: { freq: 783.99, duration: 150, type: 'sine' },    // Spotlight
        success: { freq: 1046.50, duration: 300, type: 'sine' },     // Success
        minimize: { freq: 523.25, duration: 150, type: 'sine' },     // Minimize
        shutdown: { freq: 174.61, duration: 1000, type: 'sine' },    // Shutdown
        restart: { freq: 261.63, duration: 800, type: 'sine' },      // Restart
        sleep: { freq: 329.63, duration: 600, type: 'sine' }         // Sleep
    }
};

// ========== TIME FUNCTIONS ==========
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    lockTime.textContent = timeString;
    desktopTime.textContent = timeString;
    lockDate.textContent = dateString;
}

// ========== SOUND SYSTEM ==========
function playSound(soundName) {
    if (!soundState.enabled) return;
    
    const sound = soundState.sounds[soundName];
    if (!sound) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = sound.freq;
        oscillator.type = sound.type;
        
        const volume = soundState.volume * 0.3;
        const now = audioContext.currentTime;
        
        // Different envelope for each sound
        switch(soundName) {
            case 'login':
                // Classic Mac startup chime
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(volume, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + sound.duration/1000);
                break;
            case 'click':
                // Short, sharp click
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(volume * 0.5, now + 0.001);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + sound.duration/1000);
                break;
            case 'shutdown':
                // Smooth fade out
                gainNode.gain.setValueAtTime(volume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + sound.duration/1000);
                break;
            default:
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + sound.duration/1000);
        }
        
        oscillator.start(now);
        oscillator.stop(now + sound.duration/1000);
    } catch (error) {
        console.log('Audio:', error);
    }
}

function playSystemSound(event) {
    if (!soundState.enabled) return;
    
    const soundMap = {
        'login': 'login',
        'click': 'click',
        'notification': 'notification',
        'window-open': 'windowOpen',
        'window-close': 'windowClose',
        'error': 'error',
        'trash': 'trash',
        'mission-control': 'mission',
        'launchpad': 'launchpad',
        'spotlight': 'spotlight',
        'success': 'success',
        'minimize': 'minimize',
        'shutdown': 'shutdown',
        'restart': 'restart',
        'sleep': 'sleep'
    };
    
    if (soundMap[event]) {
        playSound(soundMap[event]);
    }
}

function updateVolume(value) {
    soundState.volume = value / 100;
    localStorage.setItem('macosSoundVolume', value);
    
    const volumeValue = document.getElementById('volumeValue');
    if (volumeValue) volumeValue.textContent = value + '%';
    
    if (Math.abs(value - 50) > 10) {
        playSound('click');
    }
}

function toggleMute() {
    soundState.enabled = !soundState.enabled;
    localStorage.setItem('macosSoundMuted', !soundState.enabled);
    
    const muteToggle = document.getElementById('muteToggle');
    if (muteToggle) muteToggle.checked = soundState.enabled;
    
    if (soundState.enabled) playSound('notification');
    
    showNotification(
        soundState.enabled ? 'Sound On' : 'Sound Muted',
        `System sounds ${soundState.enabled ? 'enabled' : 'disabled'}`,
        soundState.enabled ? 'success' : 'info'
    );
}

function showSoundTest() {
    const modal = document.getElementById('soundTestModal');
    modal.style.display = 'flex';
}

function hideSoundTest() {
    document.getElementById('soundTestModal').style.display = 'none';
}

// ========== POWER FUNCTIONS ==========
function showShutdownModal() {
    playSystemSound('click');
    shutdownModal.style.display = 'flex';
}

function showRestartModal() {
    playSystemSound('click');
    restartModal.style.display = 'flex';
}

function showSleepModal() {
    playSystemSound('click');
    sleepModal.style.display = 'flex';
}

function shutdownSystem() {
    if (systemState.isShuttingDown) return;
    
    systemState.isShuttingDown = true;
    playSystemSound('shutdown');
    
    shutdownModal.style.display = 'none';
    
    // Create shutdown animation
    const shutdownOverlay = document.createElement('div');
    shutdownOverlay.className = 'shutdown-overlay';
    shutdownOverlay.innerHTML = '<div class="shutdown-text">Shutting down...</div>';
    document.body.appendChild(shutdownOverlay);
    
    setTimeout(() => {
        shutdownOverlay.style.opacity = '0';
        setTimeout(() => {
            shutdownOverlay.remove();
            
            // Return to lock screen
            lockScreen.classList.add('active');
            desktop.classList.remove('active');
            systemState.isLocked = true;
            lockPassword.value = '';
            
            // Close all windows
            document.querySelectorAll('.app-window').forEach(window => {
                window.style.display = 'none';
            });
            systemState.openWindows = [];
            updateDockIndicators();
            
            // Reset music
            stopMusic();
            
            // Reset state
            setTimeout(() => {
                systemState.isShuttingDown = false;
                showNotification('System Shut Down', 'Click screen to turn on', 'info');
            }, 1000);
        }, 500);
    }, 2000);
}

function restartSystem() {
    if (systemState.isRestarting) return;
    
    systemState.isRestarting = true;
    playSystemSound('restart');
    
    restartModal.style.display = 'none';
    
    // Create restart animation
    const restartOverlay = document.createElement('div');
    restartOverlay.className = 'restart-overlay';
    restartOverlay.innerHTML = '<div class="restart-text">Restarting...</div><div class="apple-logo"></div>';
    document.body.appendChild(restartOverlay);
    
    setTimeout(() => {
        restartOverlay.style.opacity = '0';
        setTimeout(() => {
            restartOverlay.remove();
            
            // Close all windows
            document.querySelectorAll('.app-window').forEach(window => {
                window.style.display = 'none';
            });
            systemState.openWindows = [];
            updateDockIndicators();
            
            // Reset music
            stopMusic();
            
            // Show lock screen with startup sound
            lockScreen.classList.add('active');
            desktop.classList.remove('active');
            systemState.isLocked = true;
            lockPassword.value = '';
            
            // Play startup sound after delay
            setTimeout(() => {
                playSystemSound('login');
                setTimeout(() => {
                    systemState.isRestarting = false;
                    showNotification('System Restarted', 'Welcome back!', 'success');
                }, 1000);
            }, 500);
        }, 500);
    }, 2000);
}

function sleepSystem() {
    if (systemState.isSleeping) return;
    
    systemState.isSleeping = true;
    playSystemSound('sleep');
    
    sleepModal.style.display = 'none';
    
    // Create sleep animation
    const sleepOverlay = document.createElement('div');
    sleepOverlay.className = 'sleep-overlay';
    document.body.appendChild(sleepOverlay);
    
    setTimeout(() => {
        sleepOverlay.style.opacity = '0';
        setTimeout(() => {
            sleepOverlay.remove();
            
            // Dim the screen but keep it visible
            desktop.style.opacity = '0.3';
            desktop.style.filter = 'blur(5px)';
            
            // Set a wake up listener
            document.addEventListener('click', wakeUpSystem);
            
            systemState.isSleeping = false;
            showNotification('Entering Sleep', 'Click to wake up', 'info');
        }, 500);
    }, 1000);
}

function wakeUpSystem() {
    if (!systemState.isSleeping && desktop.style.opacity === '0.3') {
        desktop.style.opacity = '1';
        desktop.style.filter = 'none';
        playSound('click');
        showNotification('Waking Up', 'Welcome back!', 'success');
        document.removeEventListener('click', wakeUpSystem);
    }
}

// ========== UNLOCK SYSTEM ==========
function unlockMac() {
    if(systemState.isLocked && (lockPassword.value === 'macos' || lockPassword.value === '')) {
        systemState.isLocked = false;
        
        // Play classic Mac startup sound
        playSystemSound('login');
        
        lockScreen.style.animation = 'fadeOut 0.5s ease forwards';
        
        setTimeout(() => {
            lockScreen.classList.remove('active');
            desktop.classList.add('active');
            desktop.style.animation = 'slideUp 0.5s ease forwards';
            
            setTimeout(() => {
                lockScreen.style.display = 'none';
                desktop.style.display = 'block';
                showNotification('Welcome to macOS Web', `Welcome back, ${systemState.currentUser}!`, 'success');
                
                // Auto open helpful hints
                setTimeout(() => {
                    showNotification('Tips', 'Try Cmd+Space for Spotlight, F3 for Mission Control', 'info');
                }, 2000);
            }, 300);
        }, 300);
    } else if (systemState.isLocked) {
        lockPassword.style.animation = 'shake 0.5s';
        playSystemSound('error');
        setTimeout(() => {
            lockPassword.style.animation = '';
            lockPassword.value = '';
        }, 500);
    }
}

function lockMac() {
    systemState.isLocked = true;
    desktop.style.animation = 'fadeOut 0.5s ease forwards';
    
    setTimeout(() => {
        desktop.classList.remove('active');
        lockScreen.classList.add('active');
        lockScreen.style.display = 'block';
        lockScreen.style.animation = 'fadeIn 0.5s ease forwards';
        
        setTimeout(() => {
            desktop.style.display = 'none';
        }, 300);
    }, 300);
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(title, message, type = 'info') {
    if (type === 'error') {
        playSystemSound('error');
    } else if (type === 'success') {
        playSystemSound('success');
    } else {
        playSystemSound('notification');
    }
    
    const notification = {
        id: Date.now(),
        title,
        message,
        type,
        time: new Date()
    };
    
    systemState.notifications.unshift(notification);
    
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification-item ${type}`;
    notificationEl.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-time">${notification.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    
    const notificationsList = document.querySelector('.notifications-list');
    notificationsList.insertBefore(notificationEl, notificationsList.firstChild);
    
    // Show toast
    showToastNotification(title, message, type);
    
    // Limit to 50 notifications
    if(systemState.notifications.length > 50) {
        systemState.notifications.pop();
        const lastNotification = notificationsList.lastChild;
        if(lastNotification) lastNotification.remove();
    }
}

function showToastNotification(title, message, type) {
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ========== APP WINDOW SYSTEM ==========
function createAppWindow(appName) {
    if (systemState.isLocked) return;
    
    playSystemSound('window-open');
    
    // Check if window already exists
    const existingWindow = document.querySelector(`.app-window[data-app="${appName}"]`);
    if (existingWindow && !['finder', 'photos', 'messages'].includes(appName)) {
        existingWindow.style.display = 'block';
        existingWindow.style.zIndex = getHighestZIndex() + 1;
        systemState.activeApp = appName;
        updateDockIndicators();
        return existingWindow;
    }
    
    const windowId = 'window_' + Date.now();
    let windowHTML = '';
    
    switch(appName) {
        case 'finder':
            windowHTML = createFinderWindow(windowId);
            break;
        case 'safari':
            openSafari();
            return;
        case 'music':
            openMusic();
            return;
        case 'calculator':
            openCalculator();
            return;
        case 'terminal':
            openTerminal();
            return;
        case 'preferences':
            openPreferences();
            return;
        case 'photos':
            openPhotos();
            return;
        case 'messages':
            openMessages();
            return;
        default:
            windowHTML = createDefaultWindow(windowId, appName);
    }
    
    const container = document.getElementById('windowsContainer');
    if (windowHTML) {
        container.insertAdjacentHTML('beforeend', windowHTML);
    }
    
    const newWindow = document.getElementById(windowId);
    if (newWindow) {
        systemState.openWindows.push(newWindow);
        systemState.activeApp = appName;
        
        updateDockIndicators();
        makeWindowDraggable(newWindow);
        setupWindowControls(newWindow);
        
        const maxX = window.innerWidth - 400;
        const maxY = window.innerHeight - 300;
        newWindow.style.left = Math.max(50, Math.random() * maxX) + 'px';
        newWindow.style.top = Math.max(50, Math.random() * maxY) + 'px';
    }
    
    return newWindow;
}

// ========== MUSIC APP ==========
function openMusic() {
    const musicWindow = document.getElementById('musicWindow');
    if (!musicWindow) return;
    
    musicWindow.style.display = 'block';
    musicWindow.style.zIndex = getHighestZIndex() + 1;
    makeWindowDraggable(musicWindow);
    setupWindowControls(musicWindow);
    systemState.activeApp = 'music';
    updateDockIndicators();
    
    musicWindow.style.left = '150px';
    musicWindow.style.top = '80px';
    
    // Setup music player
    setupMusicPlayer();
}

function setupMusicPlayer() {
    const musicGrid = document.getElementById('musicGrid');
    if (!musicGrid) return;
    
    // Clear and populate music grid
    musicGrid.innerHTML = '';
    
    musicState.playlist.forEach((song, index) => {
        const musicCard = document.createElement('div');
        musicCard.className = 'music-card';
        musicCard.dataset.songId = song.id;
        musicCard.innerHTML = `
            <div class="music-card-art" style="background: linear-gradient(135deg, ${song.color}, ${adjustColor(song.color, -20)});">
                <i class="${song.icon}"></i>
                <div class="play-overlay"><i class="fas fa-play"></i></div>
            </div>
            <div class="music-card-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
                <span class="song-duration">${formatTime(song.duration)}</span>
            </div>
        `;
        
        musicCard.addEventListener('click', () => {
            playSong(song.id);
        });
        
        musicGrid.appendChild(musicCard);
    });
    
    // Setup player controls
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const musicVolume = document.getElementById('musicVolume');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', playPreviousSong);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', playNextSong);
    }
    
    if (musicVolume) {
        musicVolume.addEventListener('input', (e) => {
            musicPlayer.volume = e.target.value / 100;
        });
    }
    
    if (progressBar) {
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if (musicState.currentSong) {
                musicPlayer.currentTime = percent * musicPlayer.duration;
            }
        });
    }
    
    // Update player state
    musicPlayer.addEventListener('timeupdate', updateMusicProgress);
    musicPlayer.addEventListener('loadedmetadata', updateMusicDuration);
    musicPlayer.addEventListener('ended', playNextSong);
}

function playSong(songId) {
    const song = musicState.playlist.find(s => s.id === songId);
    if (!song) return;
    
    musicState.currentSong = song;
    musicState.currentPlaylistIndex = musicState.playlist.findIndex(s => s.id === songId);
    
    // Update UI
    document.getElementById('npTitle').textContent = song.title;
    document.getElementById('npArtist').textContent = song.artist;
    document.getElementById('npAlbumArt').innerHTML = `<i class="${song.icon}"></i>`;
    document.getElementById('npAlbumArt').style.background = `linear-gradient(135deg, ${song.color}, ${adjustColor(song.color, -20)})`;
    
    // Play the song
    musicPlayer.src = `https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3`; // Fallback URL
    musicPlayer.volume = musicState.volume;
    
    musicPlayer.play()
        .then(() => {
            musicState.isPlaying = true;
            updatePlayPauseButton();
            showNotification('Now Playing', `${song.title} - ${song.artist}`, 'success');
        })
        .catch(error => {
            console.log('Audio playback failed:', error);
            // Simulate playback for demo
            musicState.isPlaying = true;
            updatePlayPauseButton();
            showNotification('Now Playing', `${song.title} - ${song.artist}`, 'success');
        });
}

function togglePlayPause() {
    if (!musicState.currentSong) {
        // If nothing is playing, play the first song
        playSong(musicState.playlist[0].id);
        return;
    }
    
    if (musicState.isPlaying) {
        musicPlayer.pause();
        musicState.isPlaying = false;
    } else {
        musicPlayer.play()
            .then(() => {
                musicState.isPlaying = true;
            })
            .catch(() => {
                // Simulate play for demo
                musicState.isPlaying = true;
            });
    }
    updatePlayPauseButton();
}

function stopMusic() {
    musicPlayer.pause();
    musicPlayer.currentTime = 0;
    musicState.isPlaying = false;
    musicState.currentSong = null;
    updatePlayPauseButton();
    
    document.getElementById('npTitle').textContent = 'Not Playing';
    document.getElementById('npArtist').textContent = '-';
}

function playNextSong() {
    if (!musicState.currentSong) return;
    
    const nextIndex = (musicState.currentPlaylistIndex + 1) % musicState.playlist.length;
    playSong(musicState.playlist[nextIndex].id);
}

function playPreviousSong() {
    if (!musicState.currentSong) return;
    
    const prevIndex = musicState.currentPlaylistIndex > 0 ? 
        musicState.currentPlaylistIndex - 1 : 
        musicState.playlist.length - 1;
    playSong(musicState.playlist[prevIndex].id);
}

function updatePlayPauseButton() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (playPauseBtn) {
        playPauseBtn.innerHTML = `<i class="fas fa-${musicState.isPlaying ? 'pause' : 'play'}"></i>`;
    }
}

function updateMusicProgress() {
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    
    if (progressFill && currentTimeEl && musicPlayer.duration) {
        const percent = (musicPlayer.currentTime / musicPlayer.duration) * 100;
        progressFill.style.width = percent + '%';
        currentTimeEl.textContent = formatTime(musicPlayer.currentTime);
    }
}

function updateMusicDuration() {
    const totalTimeEl = document.getElementById('totalTime');
    if (totalTimeEl && musicPlayer.duration) {
        totalTimeEl.textContent = formatTime(musicPlayer.duration);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function adjustColor(color, amount) {
    // Simple color adjustment
    return color.replace(/\d+/g, num => Math.min(255, Math.max(0, parseInt(num) + amount)));
}

// ========== OTHER APPS ==========
function openPhotos() {
    const photosWindow = document.getElementById('photosWindow');
    photosWindow.style.display = 'block';
    photosWindow.style.zIndex = getHighestZIndex() + 1;
    makeWindowDraggable(photosWindow);
    setupWindowControls(photosWindow);
    systemState.activeApp = 'photos';
    updateDockIndicators();
    
    photosWindow.style.left = '200px';
    photosWindow.style.top = '100px';
    
    // Populate photos
    const photosGrid = document.getElementById('photosGrid');
    if (photosGrid) {
        photosGrid.innerHTML = '';
        for (let i = 0; i < 12; i++) {
            const photo = document.createElement('div');
            photo.className = 'photo-item';
            photo.style.background = getRandomColor();
            photo.innerHTML = `<i class="fas fa-image"></i>`;
            photosGrid.appendChild(photo);
        }
    }
}

function openMessages() {
    const messagesWindow = document.getElementById('messagesWindow');
    messagesWindow.style.display = 'block';
    messagesWindow.style.zIndex = getHighestZIndex() + 1;
    makeWindowDraggable(messagesWindow);
    setupWindowControls(messagesWindow);
    systemState.activeApp = 'messages';
    updateDockIndicators();
    
    messagesWindow.style.left = '250px';
    messagesWindow.style.top = '80px';
    
    // Setup messaging
    const sendMessageBtn = document.getElementById('sendMessage');
    const messageInput = document.getElementById('messageInput');
    
    if (sendMessageBtn && messageInput) {
        sendMessageBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    
    if (messageInput.value.trim()) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message sent';
        messageDiv.innerHTML = `
            <div class="message-content">${messageInput.value}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        `;
        chatMessages.appendChild(messageDiv);
        messageInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Auto-reply after delay
        setTimeout(() => {
            const autoReply = document.createElement('div');
            autoReply.className = 'message received';
            autoReply.innerHTML = `
                <div class="message-content">Thanks for your message! This is a simulated messaging system.</div>
                <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            `;
            chatMessages.appendChild(autoReply);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', () => {
    // Update time
    updateTime();
    setInterval(updateTime, 60000);
    
    // Load saved settings
    const savedVolume = localStorage.getItem('macosSoundVolume');
    const savedMute = localStorage.getItem('macosSoundMuted');
    if (savedVolume !== null) soundState.volume = savedVolume / 100;
    if (savedMute !== null) soundState.enabled = !(savedMute === 'true');
    
    // Power buttons
    lockRestartBtn.addEventListener('click', showRestartModal);
    lockShutdownBtn.addEventListener('click', showShutdownModal);
    sleepBtn.addEventListener('click', showSleepModal);
    desktopRestartBtn.addEventListener('click', showRestartModal);
    desktopShutdownBtn.addEventListener('click', showShutdownModal);
    desktopSleepBtn.addEventListener('click', showSleepModal);
    
    // Power modal actions
    document.getElementById('confirmShutdown').addEventListener('click', shutdownSystem);
    document.getElementById('confirmRestart').addEventListener('click', restartSystem);
    document.getElementById('confirmSleep').addEventListener('click', sleepSystem);
    
    // Cancel buttons
    document.querySelectorAll('.power-cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            playSystemSound('click');
            shutdownModal.style.display = 'none';
            restartModal.style.display = 'none';
            sleepModal.style.display = 'none';
        });
    });
    
    // Apple menu
    const appleMenu = document.querySelector('.apple-menu');
    const appleMenuDropdown = document.querySelector('.apple-menu-dropdown');
    
    appleMenu.addEventListener('click', () => {
        playSystemSound('click');
        appleMenuDropdown.classList.toggle('show');
    });
    
    // Apple menu items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            appleMenuDropdown.classList.remove('show');
            
            switch(action) {
                case 'about':
                    showAboutMac();
                    break;
                case 'preferences':
                    createAppWindow('preferences');
                    break;
                case 'app-store':
                    showAppStore();
                    break;
                case 'sleep':
                    showSleepModal();
                    break;
                case 'restart':
                    showRestartModal();
                    break;
                case 'shutdown':
                    showShutdownModal();
                    break;
                case 'lock':
                    lockMac();
                    break;
                case 'force-quit':
                    showNotification('Force Quit', 'Press Option+Command+Esc to force quit apps', 'info');
                    break;
            }
        });
    });
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!appleMenu.contains(e.target)) {
            appleMenuDropdown.classList.remove('show');
        }
    });
    
    // Unlock system
    unlockBtn.addEventListener('click', unlockMac);
    lockPassword.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') unlockMac();
    });
    
    // Desktop icons
    desktopIcons.forEach(icon => {
        icon.addEventListener('dblclick', () => {
            const appName = icon.getAttribute('data-app');
            createAppWindow(appName);
        });
    });
    
    // Dock items
    dockItems.forEach(item => {
        const appName = item.getAttribute('data-app');
        
        if(appName === 'trash') {
            item.addEventListener('click', () => {
                if(trashWindow.style.display === 'none') {
                    createAppWindow('finder');
                } else {
                    trashWindow.style.display = 'none';
                }
            });
        } else if (appName === 'missioncontrol') {
            item.addEventListener('click', () => {
                showMissionControl();
            });
        } else if (appName === 'launchpad') {
            item.addEventListener('click', () => {
                showLaunchpad();
            });
        } else {
            item.addEventListener('click', () => {
                createAppWindow(appName);
            });
        }
    });
    
    // Notification button
    document.getElementById('notificationBtn').addEventListener('click', () => {
        playSystemSound('notification');
        notificationCenter.classList.toggle('active');
    });
    
    closeNotifications.addEventListener('click', () => {
        playSystemSound('click');
        notificationCenter.classList.remove('active');
    });
    
    // Spotlight button
    if (spotlightBtn) {
        spotlightBtn.addEventListener('click', showSpotlight);
    }
    
    // User menu button
    document.getElementById('userMenuBtn').addEventListener('click', () => {
        playSystemSound('click');
        showNotification('User Menu', 'Click Apple menu for more options', 'info');
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Cmd/Ctrl + Space for Spotlight
        if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
            e.preventDefault();
            showSpotlight();
        }
        
        // F3 for Mission Control
        if (e.key === 'F3') {
            e.preventDefault();
            showMissionControl();
        }
        
        // F4 for Launchpad
        if (e.key === 'F4') {
            e.preventDefault();
            showLaunchpad();
        }
        
        // Cmd/Ctrl + Q to quit
        if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
            e.preventDefault();
            showNotification('Quit Application', 'Use Cmd+Q to quit apps', 'info');
        }
        
        // Cmd/Ctrl + W to close window
        if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
            e.preventDefault();
            if (systemState.activeApp) {
                const window = document.querySelector(`.app-window[data-app="${systemState.activeApp}"]`);
                if (window) {
                    const closeBtn = window.querySelector('.window-control.close');
                    if (closeBtn) closeBtn.click();
                }
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
            });
            notificationCenter.classList.remove('active');
            document.querySelector('.apple-menu-dropdown').classList.remove('show');
        }
        
        // Cmd/Ctrl + L to lock
        if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
            e.preventDefault();
            lockMac();
        }
        
        // Media keys
        if (e.key === ' ') {
            // Space to play/pause music
            if (musicState.currentSong) {
                e.preventDefault();
                togglePlayPause();
            }
        }
    });
    
    // Auto-add some photos for demo
    setTimeout(() => {
        showNotification('System Ready', 'macOS Web is fully loaded and ready!', 'success');
    }, 1000);
});

// ========== HELPER FUNCTIONS ==========
function getHighestZIndex() {
    const windows = document.querySelectorAll('.app-window');
    let highest = 100;
    windows.forEach(window => {
        const zIndex = parseInt(window.style.zIndex || 100);
        if (zIndex > highest) highest = zIndex;
    });
    return highest;
}

function makeWindowDraggable(windowElement) {
    const titlebar = windowElement.querySelector('.window-titlebar');
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    titlebar.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    function startDrag(e) {
        if (systemState.isLocked) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = windowElement.offsetLeft;
        startTop = windowElement.offsetTop;
        
        windowElement.style.zIndex = getHighestZIndex() + 1;
        e.preventDefault();
    }
    
    function drag(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        windowElement.style.left = (startLeft + dx) + 'px';
        windowElement.style.top = (startTop + dy) + 'px';
    }
    
    function stopDrag() {
        isDragging = false;
    }
}

function setupWindowControls(windowElement) {
    const closeBtn = windowElement.querySelector('.window-control.close');
    const minimizeBtn = windowElement.querySelector('.window-control.minimize');
    const expandBtn = windowElement.querySelector('.window-control.expand');
    
    closeBtn.addEventListener('click', () => {
        playSystemSound('window-close');
        windowElement.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            windowElement.style.display = 'none';
            systemState.openWindows = systemState.openWindows.filter(w => w !== windowElement);
            updateDockIndicators();
        }, 300);
    });
    
    minimizeBtn.addEventListener('click', () => {
        playSystemSound('minimize');
        windowElement.style.animation = 'minimizeToDock 0.3s ease forwards';
        setTimeout(() => {
            windowElement.style.display = 'none';
        }, 300);
    });
    
    expandBtn.addEventListener('click', () => {
        playSystemSound('click');
        if(windowElement.classList.contains('maximized')) {
            windowElement.classList.remove('maximized');
            windowElement.style.width = '';
            windowElement.style.height = '';
            windowElement.style.left = '';
            windowElement.style.top = '';
        } else {
            windowElement.classList.add('maximized');
            windowElement.style.width = 'calc(100% - 40px)';
            windowElement.style.height = 'calc(100% - 80px)';
            windowElement.style.left = '20px';
            windowElement.style.top = '60px';
        }
    });
}

function updateDockIndicators() {
    dockItems.forEach(item => item.classList.remove('running'));
    systemState.openWindows.forEach(window => {
        const appName = window.getAttribute('data-app');
        const dockItem = document.querySelector(`.dock-item[data-app="${appName}"]`);
        if(dockItem) dockItem.classList.add('running');
    });
}

function showAboutMac() {
    playSystemSound('click');
    aboutMacModal.style.display = 'flex';
}

function showAppStore() {
    playSystemSound('click');
    appStoreModal.style.display = 'flex';
}

function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Add CSS for new elements
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
/* Power buttons on lock screen */
.lock-screen-power {
    position: absolute;
    bottom: 30px;
    right: 30px;
    display: flex;
    gap: 15px;
}

.power-icon {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    transition: all 0.3s;
    backdrop-filter: blur(10px);
}

.power-icon:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

/* Desktop power menu */
.desktop-power-menu {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    opacity: 0;
    transition: opacity 0.3s;
}

.desktop-power-menu:hover {
    opacity: 1;
}

.power-btn {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 8px 15px;
    color: #1d1d1f;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    transition: all 0.3s;
    backdrop-filter: blur(10px);
}

.power-btn:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* Apple menu dropdown */
.apple-menu {
    position: relative;
    cursor: pointer;
}

.apple-menu-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 8px;
    padding: 8px 0;
    min-width: 200px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    display: none;
    z-index: 10000;
}

.apple-menu-dropdown.show {
    display: block;
    animation: fadeIn 0.2s ease;
}

.dropdown-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #1d1d1f;
    transition: background 0.2s;
}

.dropdown-item:hover {
    background: #007aff;
    color: white;
}

.dropdown-divider {
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
    margin: 6px 0;
}

/* Power modals */
.power-modal {
    text-align: center;
    max-width: 400px;
}

.power-icon-large {
    font-size: 3rem;
    color: #007aff;
    margin-bottom: 20px;
}

.power-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 25px;
}

.power-cancel, .power-confirm {
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    border: none;
    transition: all 0.2s;
}

.power-cancel {
    background: #f5f5f7;
    color: #424245;
}

.power-confirm {
    background: #007aff;
    color: white;
}

.power-cancel:hover {
    background: #e5e5e7;
}

.power-confirm:hover {
    background: #0056cc;
}

/* Shutdown/Restart overlays */
.shutdown-overlay, .restart-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    z-index: 100000;
    transition: opacity 0.5s;
}

.restart-overlay .apple-logo {
    font-size: 4rem;
    margin-top: 20px;
}

.sleep-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 100000;
    transition: opacity 0.5s;
}

/* Music player enhancements */
.music-card {
    cursor: pointer;
    transition: transform 0.2s;
}

.music-card:hover {
    transform: translateY(-5px);
}

.music-card-art {
    position: relative;
    border-radius: 8px;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: white;
    overflow: hidden;
}

.play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.music-card:hover .play-overlay {
    opacity: 1;
}

.now-playing-bar {
    background: #f5f5f7;
    border-radius: 10px;
    padding: 15px;
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
}

.np-album-art {
    width: 50px;
    height: 50px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
}

.np-controls {
    display: flex;
    gap: 15px;
    align-items: center;
}

.np-control-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: white;
    color: #424245;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.np-control-btn:hover {
    background: #007aff;
    color: white;
}

.play-btn {
    width: 50px;
    height: 50px;
    background: #007aff !important;
    color: white !important;
}

/* Photos app */
.photos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
    padding: 20px;
}

.photo-item {
    aspect-ratio: 1;
    border-radius: 8px;
    background: #f5f5f7;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    color: #86868b;
    cursor: pointer;
    transition: transform 0.2s;
}

.photo-item:hover {
    transform: scale(1.05);
}

/* Messages app */
.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.message {
    margin-bottom: 15px;
    max-width: 70%;
}

.message.received {
    margin-right: auto;
}

.message.sent {
    margin-left: auto;
}

.message-content {
    background: #f5f5f7;
    padding: 10px 15px;
    border-radius: 15px;
    font-size: 0.9rem;
}

.message.sent .message-content {
    background: #007aff;
    color: white;
}

.message-time {
    font-size: 0.8rem;
    color: #86868b;
    margin-top: 5px;
    text-align: right;
}

.chat-input {
    display: flex;
    gap: 10px;
    padding: 15px;
    border-top: 1px solid #e5e5e7;
}

.chat-input input {
    flex: 1;
    padding: 10px 15px;
    border: 1px solid #e5e5e7;
    border-radius: 20px;
    font-size: 0.9rem;
}

.chat-input button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: #007aff;
    color: white;
    cursor: pointer;
}

/* About Mac modal */
.about-modal {
    max-width: 500px;
}

.about-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
}

.about-logo {
    font-size: 2.5rem;
}

.about-section {
    margin-bottom: 20px;
}

.about-section h3, .about-section h4 {
    margin-bottom: 10px;
}

.about-section p {
    margin: 5px 0;
    color: #424245;
}

.about-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 20px;
}

.about-btn {
    padding: 8px 16px;
    border: 1px solid #e5e5e7;
    border-radius: 6px;
    background: white;
    color: #424245;
    cursor: pointer;
    font-size: 0.9rem;
}

.about-btn:hover {
    background: #f5f5f7;
}

/* App Store modal */
.appstore-modal {
    max-width: 600px;
    max-height: 80vh;
}

.appstore-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.featured-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.featured-app {
    background: #f5f5f7;
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s;
}

.featured-app:hover {
    transform: translateY(-5px);
}

.featured-app .app-icon {
    width: 60px;
    height: 60px;
    background: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin: 0 auto 15px;
}
`;
document.head.appendChild(additionalStyles);