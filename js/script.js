// macOS Web - Main Script
// DOM Elements
const lockScreen = document.getElementById('lockScreen');
const desktop = document.getElementById('desktop');
const desktopTime = document.getElementById('desktopTime');
const lockPassword = document.getElementById('lockPassword');
const unlockBtn = document.getElementById('unlockBtn');

// State
let isLocked = true;
let currentWindows = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('macOS Web Initialized');
    
    // Set initial time
    updateTime();
    setInterval(updateTime, 60000);
    
    // Setup event listeners
    setupEventListeners();
    
    // Hide notification center initially
    const notificationCenter = document.getElementById('notificationCenter');
    if (notificationCenter) {
        notificationCenter.classList.remove('active');
    }
    
    // Setup dock items
    setupDockItems();
    
    // Setup desktop icons
    setupDesktopIcons();
    
    // Setup lock button
    setupLockButton();
});

// Update time function
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    if (desktopTime) desktopTime.textContent = timeString;
}

// Setup lock button
function setupLockButton() {
    const lockBtn = document.getElementById('desktopLockBtn');
    if (lockBtn) {
        lockBtn.addEventListener('click', () => {
            if (window.lockMac) {
                window.lockMac();
            }
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Desktop lock button
    const desktopLockBtn = document.getElementById('desktopLockBtn');
    if (desktopLockBtn) {
        desktopLockBtn.addEventListener('click', function() {
            if (window.lockMac) {
                window.lockMac();
            }
        });
    }
    
    // Close notification center
    const closeNotifications = document.getElementById('closeNotifications');
    if (closeNotifications) {
        closeNotifications.addEventListener('click', function() {
            const notificationCenter = document.getElementById('notificationCenter');
            if (notificationCenter) {
                notificationCenter.classList.remove('active');
            }
        });
    }
    
    // Spotlight button
    const spotlightBtn = document.getElementById('spotlightBtn');
    if (spotlightBtn) {
        spotlightBtn.addEventListener('click', showSpotlight);
    }
    
    // Close spotlight
    const closeSpotlight = document.getElementById('closeSpotlight');
    if (closeSpotlight) {
        closeSpotlight.addEventListener('click', hideSpotlight);
    }
    
    // Mission Control exit
    const exitMission = document.getElementById('exitMission');
    if (exitMission) {
        exitMission.addEventListener('click', hideMissionControl);
    }
    
    // Launchpad exit
    const exitLaunchpad = document.getElementById('exitLaunchpad');
    if (exitLaunchpad) {
        exitLaunchpad.addEventListener('click', hideLaunchpad);
    }
    
    // Power modal actions
    const confirmShutdown = document.getElementById('confirmShutdown');
    if (confirmShutdown) {
        confirmShutdown.addEventListener('click', shutdownSystem);
    }
    
    const confirmRestart = document.getElementById('confirmRestart');
    if (confirmRestart) {
        confirmRestart.addEventListener('click', restartSystem);
    }
    
    // Cancel buttons for modals
    document.querySelectorAll('.power-cancel').forEach(btn => {
        btn.addEventListener('click', function() {
            hideAllModals();
        });
    });
    
    // Close sound test
    const closeSoundTest = document.getElementById('closeSoundTest');
    if (closeSoundTest) {
        closeSoundTest.addEventListener('click', hideSoundTest);
    }
    
    // Sound test buttons
    document.querySelectorAll('.sound-test-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sound = this.getAttribute('data-sound');
            playSound(sound);
        });
    });
    
    // Click outside modals to close
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Cmd/Ctrl + Space for Spotlight
        if ((e.metaKey || e.ctrlKey) && e.key === ' ') {
            e.preventDefault();
            showSpotlight();
        }
        
        // Cmd/Ctrl + L to lock
        if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
            e.preventDefault();
            if (window.lockMac) {
                window.lockMac();
            }
        }
        
        // Escape to close things
        if (e.key === 'Escape') {
            hideSpotlight();
            hideMissionControl();
            hideLaunchpad();
            hideAllModals();
            
            const notificationCenter = document.getElementById('notificationCenter');
            if (notificationCenter && notificationCenter.classList.contains('active')) {
                notificationCenter.classList.remove('active');
            }
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
        
        // Cmd/Ctrl + Q to quit (lock)
        if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
            e.preventDefault();
            if (window.lockMac) {
                window.lockMac();
            }
        }
    });
}

// Setup desktop icons
function setupDesktopIcons() {
    console.log('Setting up desktop icons...');
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    
    desktopIcons.forEach(icon => {
        // Remove any existing listeners
        const newIcon = icon.cloneNode(true);
        icon.parentNode.replaceChild(newIcon, icon);
        
        // Add new listener
        newIcon.addEventListener('dblclick', function() {
            console.log('Desktop icon clicked:', this.dataset.app);
            const appName = this.getAttribute('data-app');
            openApp(appName);
        });
        
        // Add click sound
        newIcon.addEventListener('click', function() {
            playSound('click');
        });
    });
    
    console.log('Desktop icons setup complete. Found:', desktopIcons.length);
}

// Setup dock items
function setupDockItems() {
    console.log('Setting up dock items...');
    const dockItems = document.querySelectorAll('.dock-item');
    
    dockItems.forEach(item => {
        // Remove any existing listeners
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
        
        // Add new listener
        newItem.addEventListener('click', function() {
            console.log('Dock item clicked:', this.dataset.app);
            const appName = this.getAttribute('data-app');
            
            if (appName === 'missioncontrol') {
                showMissionControl();
            } else if (appName === 'launchpad') {
                showLaunchpad();
            } else if (appName === 'trash') {
                // Open trash/finder
                openApp('finder');
            } else {
                openApp(appName);
            }
            
            playSound('click');
        });
    });
    
    console.log('Dock items setup complete. Found:', dockItems.length);
}

// Open app function
function openApp(appName) {
    console.log('Opening app:', appName);
    
    if (isLocked) {
        console.log('Cannot open app - system is locked');
        return;
    }
    
    playSound('window');
    
    // Get the window element
    const windowElement = document.getElementById(appName + 'Window');
    
    if (windowElement) {
        console.log('Found window element, showing it...');
        // Show the window
        windowElement.style.display = 'block';
        
        // Make it draggable
        makeWindowDraggable(windowElement);
        
        // Setup window controls
        setupWindowControls(windowElement);
        
        // Add to current windows
        if (!currentWindows.includes(appName)) {
            currentWindows.push(appName);
        }
        
        // Update dock indicator
        updateDockIndicator(appName, true);
        
        // Position window
        positionWindow(windowElement);
    } else {
        console.error('Window element not found for app:', appName);
    }
}

// Make window draggable
function makeWindowDraggable(windowElement) {
    const titlebar = windowElement.querySelector('.window-titlebar');
    let isDragging = false;
    let offsetX, offsetY;
    
    titlebar.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    function startDrag(e) {
        isDragging = true;
        offsetX = e.clientX - windowElement.offsetLeft;
        offsetY = e.clientY - windowElement.offsetTop;
        windowElement.style.zIndex = 1000;
        e.preventDefault();
    }
    
    function drag(e) {
        if (isDragging) {
            windowElement.style.left = (e.clientX - offsetX) + 'px';
            windowElement.style.top = (e.clientY - offsetY) + 'px';
        }
    }
    
    function stopDrag() {
        isDragging = false;
    }
}

// Setup window controls
function setupWindowControls(windowElement) {
    const closeBtn = windowElement.querySelector('.window-control.close');
    const minimizeBtn = windowElement.querySelector('.window-control.minimize');
    const expandBtn = windowElement.querySelector('.window-control.expand');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            playSound('window');
            windowElement.style.display = 'none';
            
            // Remove from current windows
            const appName = windowElement.id.replace('Window', '');
            const index = currentWindows.indexOf(appName);
            if (index > -1) {
                currentWindows.splice(index, 1);
            }
            
            // Update dock indicator
            updateDockIndicator(appName, false);
        });
    }
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', function() {
            playSound('minimize');
            windowElement.style.display = 'none';
        });
    }
    
    if (expandBtn) {
        expandBtn.addEventListener('click', function() {
            playSound('click');
            if (windowElement.classList.contains('maximized')) {
                windowElement.classList.remove('maximized');
                windowElement.style.width = '400px';
                windowElement.style.height = '300px';
            } else {
                windowElement.classList.add('maximized');
                windowElement.style.width = '80%';
                windowElement.style.height = '80%';
                windowElement.style.left = '10%';
                windowElement.style.top = '10%';
            }
        });
    }
}

// Position window
function positionWindow(windowElement) {
    const windowsOpen = currentWindows.length;
    windowElement.style.left = (100 + (windowsOpen * 20)) + 'px';
    windowElement.style.top = (100 + (windowsOpen * 20)) + 'px';
}

// Update dock indicator
function updateDockIndicator(appName, isRunning) {
    const dockItem = document.querySelector(`.dock-item[data-app="${appName}"]`);
    if (dockItem) {
        if (isRunning) {
            dockItem.classList.add('running');
        } else {
            dockItem.classList.remove('running');
        }
    }
}

// Show notification
function showNotification(title, message) {
    console.log('Showing notification:', title);
    
    const notificationCenter = document.getElementById('notificationCenter');
    const notificationsList = document.querySelector('.notifications-list');
    
    if (!notificationCenter || !notificationsList) {
        console.error('Notification elements not found');
        return;
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification-item';
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-time">Just now</div>
    `;
    
    // Add to list
    notificationsList.insertBefore(notification, notificationsList.firstChild);
    
    // Show toast notification
    showToastNotification(title, message);
    
    // Play sound
    playSound('notification');
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Show toast notification
function showToastNotification(title, message) {
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-bell"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide and remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

// Play sound
function playSound(soundName) {
    console.log('Playing sound:', soundName);
    
    // Simple Web Audio API implementation
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency = 440;
        let duration = 0.1;
        
        switch(soundName) {
            case 'startup':
                // macOS startup chime
                frequency = 523.25;
                duration = 1.5;
                oscillator.type = 'sine';
                break;
            case 'click':
                frequency = 800;
                duration = 0.03;
                oscillator.type = 'square';
                break;
            case 'notification':
                frequency = 1046.50;
                duration = 0.2;
                oscillator.type = 'sine';
                break;
            case 'window':
                frequency = 659.25;
                duration = 0.15;
                oscillator.type = 'sine';
                break;
            case 'error':
                frequency = 220;
                duration = 0.5;
                oscillator.type = 'sawtooth';
                break;
            case 'minimize':
                frequency = 523.25;
                duration = 0.15;
                oscillator.type = 'sine';
                break;
            case 'trash':
                frequency = 349.23;
                duration = 0.3;
                oscillator.type = 'sawtooth';
                break;
            default:
                frequency = 440;
                duration = 0.1;
        }
        
        oscillator.frequency.value = frequency;
        
        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
    } catch (error) {
        console.log('Audio error:', error);
    }
}

// Show spotlight
function showSpotlight() {
    if (isLocked) return;
    
    const spotlight = document.getElementById('spotlight');
    if (spotlight) {
        spotlight.style.display = 'block';
        const input = document.getElementById('spotlightInput');
        if (input) {
            input.focus();
        }
        playSound('click');
    }
}

// Hide spotlight
function hideSpotlight() {
    const spotlight = document.getElementById('spotlight');
    if (spotlight) {
        spotlight.style.display = 'none';
    }
}

// Show mission control
function showMissionControl() {
    if (isLocked) return;
    
    const missionControl = document.getElementById('missionControl');
    if (missionControl) {
        missionControl.style.display = 'block';
        playSound('click');
    }
}

// Hide mission control
function hideMissionControl() {
    const missionControl = document.getElementById('missionControl');
    if (missionControl) {
        missionControl.style.display = 'none';
    }
}

// Show launchpad
function showLaunchpad() {
    if (isLocked) return;
    
    const launchpad = document.getElementById('launchpad');
    if (launchpad) {
        launchpad.style.display = 'block';
        playSound('click');
    }
}

// Hide launchpad
function hideLaunchpad() {
    const launchpad = document.getElementById('launchpad');
    if (launchpad) {
        launchpad.style.display = 'none';
    }
}

// Show shutdown modal
function showShutdownModal() {
    const modal = document.getElementById('shutdownModal');
    if (modal) {
        modal.style.display = 'flex';
        playSound('click');
    }
}

// Show restart modal
function showRestartModal() {
    const modal = document.getElementById('restartModal');
    if (modal) {
        modal.style.display = 'flex';
        playSound('click');
    }
}

// Show sleep
function showSleep() {
    if (window.sleepMac) {
        window.sleepMac();
    }
}

// Shutdown system
function shutdownSystem() {
    playSound('error');
    hideAllModals();
    
    // Create shutdown animation
    const overlay = document.createElement('div');
    overlay.className = 'shutdown-overlay';
    overlay.innerHTML = '<div class="shutdown-text">Shutting down...</div>';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        // Return to lock screen
        if (window.lockScreen) {
            window.lockScreen.lock();
        }
        
        // Close all windows
        document.querySelectorAll('.app-window').forEach(window => {
            window.style.display = 'none';
        });
        
        currentWindows = [];
        
        // Remove overlay
        overlay.remove();
        
        // Show notification
        setTimeout(() => {
            showNotification('System Shut Down', 'Click screen to turn on');
        }, 1000);
    }, 2000);
}

// Restart system
function restartSystem() {
    playSound('notification');
    hideAllModals();
    
    // Create restart animation
    const overlay = document.createElement('div');
    overlay.className = 'restart-overlay';
    overlay.innerHTML = '<div class="restart-text">Restarting...</div><div class="apple-logo"></div>';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        // Close all windows
        document.querySelectorAll('.app-window').forEach(window => {
            window.style.display = 'none';
        });
        
        currentWindows = [];
        
        // Show lock screen with startup sound
        if (window.lockScreen) {
            window.lockScreen.lock();
        }
        
        // Remove overlay
        overlay.remove();
        
        // Play startup sound after delay
        setTimeout(() => {
            if (window.lockScreen && window.lockScreen.playStartupSound) {
                window.lockScreen.playStartupSound();
            }
            setTimeout(() => {
                showNotification('System Restarted', 'Welcome back!');
            }, 1000);
        }, 500);
    }, 2000);
}

// Hide all modals
function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Hide sound test
function hideSoundTest() {
    const modal = document.getElementById('soundTestModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Setup music player
function setupMusicPlayer() {
    const musicWindow = document.getElementById('musicWindow');
    if (!musicWindow) return;
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const songItems = document.querySelectorAll('.song-item');
    
    let currentSong = null;
    let isPlaying = false;
    
    // Song data
    const songs = [
        { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
        { id: 2, title: 'Midnight City', artist: 'M83', duration: '4:04' }
    ];
    
    // Play song function
    function playSong(songId) {
        const song = songs.find(s => s.id === songId);
        if (!song) return;
        
        currentSong = song;
        document.getElementById('currentSongTitle').textContent = song.title;
        document.getElementById('currentSongArtist').textContent = song.artist;
        
        // Update play button
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        isPlaying = true;
        showNotification('Now Playing', `${song.title} - ${song.artist}`);
    }
    
    // Toggle play/pause
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', function() {
            if (!currentSong) {
                // Play first song if none is playing
                playSong(1);
            } else {
                if (isPlaying) {
                    this.innerHTML = '<i class="fas fa-play"></i>';
                    isPlaying = false;
                } else {
                    this.innerHTML = '<i class="fas fa-pause"></i>';
                    isPlaying = true;
                }
            }
            playSound('click');
        });
    }
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentSong) {
                const prevId = currentSong.id === 1 ? 2 : 1;
                playSong(prevId);
            } else {
                playSong(1);
            }
            playSound('click');
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentSong) {
                const nextId = currentSong.id === 2 ? 1 : 2;
                playSong(nextId);
            } else {
                playSong(1);
            }
            playSound('click');
        });
    }
    
    // Song items click
    songItems.forEach(item => {
        item.addEventListener('click', function() {
            const songId = parseInt(this.getAttribute('data-song'));
            playSong(songId);
            playSound('click');
        });
    });
}

// Setup calculator
function setupCalculator() {
    const calculatorWindow = document.getElementById('calculatorWindow');
    if (!calculatorWindow) return;
    
    const display = calculatorWindow.querySelector('.calc-current');
    const buttons = calculatorWindow.querySelectorAll('.calc-btn');
    
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    
    // Update display
    function updateDisplay() {
        display.textContent = currentInput;
    }
    
    // Handle button click
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const value = this.textContent;
            playSound('click');
            
            if (value >= '0' && value <= '9') {
                // Number input
                if (currentInput === '0') {
                    currentInput = value;
                } else {
                    currentInput += value;
                }
            } else if (value === '.') {
                // Decimal point
                if (!currentInput.includes('.')) {
                    currentInput += '.';
                }
            } else if (value === '=') {
                // Calculate
                if (operation && previousInput) {
                    const prev = parseFloat(previousInput);
                    const current = parseFloat(currentInput);
                    let result;
                    
                    switch(operation) {
                        case '+': result = prev + current; break;
                        case '-': result = prev - current; break;
                        case '×': result = prev * current; break;
                        case '÷': result = prev / current; break;
                        default: result = current;
                    }
                    
                    currentInput = result.toString();
                    previousInput = '';
                    operation = null;
                }
            } else {
                // Operation
                if (currentInput !== '0') {
                    previousInput = currentInput;
                    currentInput = '0';
                    operation = value;
                }
            }
            
            updateDisplay();
        });
    });
}

// Setup terminal
function setupTerminal() {
    const terminalWindow = document.getElementById('terminalWindow');
    if (!terminalWindow) return;
    
    const input = document.getElementById('terminalInput');
    const output = terminalWindow.querySelector('.terminal-output');
    
    if (input && output) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const command = this.value.trim();
                if (command) {
                    // Add command to output
                    const commandLine = document.createElement('div');
                    commandLine.textContent = `macOS-Web:~ neelpatel$ ${command}`;
                    output.appendChild(commandLine);
                    
                    // Process command
                    let result = 'Command not found. Try: help, date, time, echo, clear';
                    
                    if (command === 'help') {
                        result = 'Available commands: help, date, time, echo [text], clear, neel';
                    } else if (command === 'date') {
                        result = new Date().toLocaleDateString();
                    } else if (command === 'time') {
                        result = new Date().toLocaleTimeString();
                    } else if (command.startsWith('echo ')) {
                        result = command.substring(5);
                    } else if (command === 'clear') {
                        output.innerHTML = '';
                        result = '';
                    } else if (command === 'neel') {
                        result = 'Created by Neel Patel - macOS Web Emulator';
                    }
                    
                    if (result) {
                        const resultLine = document.createElement('div');
                        resultLine.textContent = result;
                        output.appendChild(resultLine);
                    }
                    
                    // Clear input
                    this.value = '';
                    
                    // Scroll to bottom
                    output.scrollTop = output.scrollHeight;
                    
                    playSound('click');
                }
            }
        });
    }
}

// Initialize apps when they open
document.addEventListener('click', function(e) {
    // Check if music window was opened
    if (e.target.closest('.dock-item[data-app="music"]') || 
        e.target.closest('.desktop-icon[data-app="music"]')) {
        setTimeout(setupMusicPlayer, 100);
    }
    
    // Check if calculator was opened
    if (e.target.closest('.dock-item[data-app="calculator"]') || 
        e.target.closest('.desktop-icon[data-app="calculator"]')) {
        setTimeout(setupCalculator, 100);
    }
    
    // Check if terminal was opened
    if (e.target.closest('.dock-item[data-app="terminal"]') || 
        e.target.closest('.desktop-icon[data-app="terminal"]')) {
        setTimeout(setupTerminal, 100);
    }
});

// Initialize everything when desktop is shown
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
            if (desktop.classList.contains('active')) {
                isLocked = false;
                // Re-setup icons and dock when desktop becomes active
                setTimeout(() => {
                    setupDesktopIcons();
                    setupDockItems();
                }, 100);
            }
        }
    });
});

observer.observe(desktop, { attributes: true });

// Make functions globally available
window.showNotification = showNotification;
window.playSound = playSound;
window.showShutdownModal = showShutdownModal;
window.showRestartModal = showRestartModal;
window.showSleep = showSleep;

// ========== DATABASE INTEGRATION ==========

// Initialize database connection
console.log('🔗 Connecting apps to database...');

// Update dock indicator to use database
function updateDockIndicatorFromDatabase(appName, isRunning) {
    const dockItem = document.querySelector(`.dock-item[data-app="${appName}"]`);
    if (dockItem) {
        if (isRunning) {
            dockItem.classList.add('running');
            // Add to running apps in database
            macOSDatabase.addRunningApp(appName);
        } else {
            dockItem.classList.remove('running');
            // Remove from running apps in database
            macOSDatabase.removeRunningApp(appName);
        }
    }
}

// ========== ENHANCED CALCULATOR ==========
function setupCalculator() {
    const calculatorWindow = document.getElementById('calculatorWindow');
    if (!calculatorWindow) return;
    
    const display = calculatorWindow.querySelector('.calc-current');
    const buttons = calculatorWindow.querySelectorAll('.calc-btn');
    
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let shouldResetScreen = false;
    
    // Load history from database
    function loadCalculatorHistory() {
        const history = macOSDatabase.getCalculatorHistory();
        console.log('📊 Loaded calculator history:', history.length, 'calculations');
        
        // Optional: Display history in calculator
        // You can add a history panel later
    }
    
    // Update display
    function updateDisplay() {
        display.textContent = currentInput;
    }
    
    // Calculate result
    function calculate(prev, current, op) {
        const prevNum = parseFloat(prev);
        const currentNum = parseFloat(current);
        
        switch(op) {
            case '+': return prevNum + currentNum;
            case '-': return prevNum - currentNum;
            case '×': return prevNum * currentNum;
            case '÷': return currentNum !== 0 ? prevNum / currentNum : 'Error';
            default: return currentNum;
        }
    }
    
    // Handle button click
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const value = this.textContent;
            playSound('click');
            
            if (value >= '0' && value <= '9') {
                // Number input
                if (currentInput === '0' || shouldResetScreen) {
                    currentInput = value;
                    shouldResetScreen = false;
                } else {
                    currentInput += value;
                }
            } 
            else if (value === '.') {
                // Decimal point
                if (!currentInput.includes('.')) {
                    currentInput += '.';
                }
            }
            else if (value === 'C' || value === 'CE') {
                // Clear
                currentInput = '0';
                previousInput = '';
                operation = null;
            }
            else if (value === '=') {
                // Calculate
                if (operation && previousInput) {
                    const result = calculate(previousInput, currentInput, operation);
                    
                    // Save to database BEFORE updating display
                    macOSDatabase.addCalculation(`${previousInput} ${operation} ${currentInput}`, result.toString());
                    
                    currentInput = result.toString();
                    previousInput = '';
                    operation = null;
                    shouldResetScreen = true;
                    
                    // Load updated history
                    loadCalculatorHistory();
                }
            }
            else {
                // Operation (+, -, ×, ÷)
                if (currentInput !== '0') {
                    if (previousInput && operation) {
                        // Chain calculations
                        const result = calculate(previousInput, currentInput, operation);
                        macOSDatabase.addCalculation(`${previousInput} ${operation} ${currentInput}`, result.toString());
                        previousInput = result.toString();
                    } else {
                        previousInput = currentInput;
                    }
                    
                    operation = value;
                    currentInput = '0';
                    shouldResetScreen = true;
                }
            }
            
            updateDisplay();
        });
    });
    
    // Load history on calculator open
    loadCalculatorHistory();
    
    console.log('🧮 Calculator connected to database');
}

// ========== ENHANCED MUSIC PLAYER ==========
function setupMusicPlayer() {
    const musicWindow = document.getElementById('musicWindow');
    if (!musicWindow) return;
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const songItems = document.querySelectorAll('.song-item');
    const currentSongTitle = document.getElementById('currentSongTitle');
    const currentSongArtist = document.getElementById('currentSongArtist');
    
    // Audio element
    const audioPlayer = document.getElementById('musicPlayer');
    if (!audioPlayer) {
        console.error('Music player audio element not found');
        return;
    }
    
    let currentSong = null;
    let isPlaying = false;
    let currentPlaylist = null;
    let currentSongIndex = 0;
    
    // Load music library from database
    function loadMusicLibrary() {
        const library = macOSDatabase.getMusicLibrary();
        if (!library) {
            console.error('Music library not found in database');
            return;
        }
        
        currentPlaylist = library.playlists.default;
        console.log('🎵 Loaded music library:', currentPlaylist.songs.length, 'songs');
        
        // Update UI with songs from database
        updateSongList();
    }
    
    // Update song list UI
    function updateSongList() {
        const songListContainer = document.querySelector('.song-list');
        if (!songListContainer || !currentPlaylist) return;
        
        // Clear existing items (keep first two demo songs)
        const existingItems = songListContainer.querySelectorAll('.song-item');
        if (existingItems.length > 2) {
            for (let i = 2; i < existingItems.length; i++) {
                existingItems[i].remove();
            }
        }
        
        // Add songs from database
        currentPlaylist.songs.forEach((song, index) => {
            // Skip first 2 (already in HTML)
            if (index >= 2) {
                const songItem = document.createElement('div');
                songItem.className = 'song-item';
                songItem.setAttribute('data-song', song.id);
                songItem.innerHTML = `
                    <i class="fas fa-music"></i>
                    <span>${song.title} - ${song.artist}</span>
                `;
                
                songItem.addEventListener('click', () => {
                    playSong(song.id);
                    playSound('click');
                });
                
                songListContainer.appendChild(songItem);
            }
        });
    }
    
    // Play song
    function playSong(songId) {
        const song = currentPlaylist.songs.find(s => s.id === songId);
        if (!song) {
            console.error('Song not found:', songId);
            return;
        }
        
        currentSong = song;
        currentSongIndex = currentPlaylist.songs.findIndex(s => s.id === songId);
        
        // Update UI
        currentSongTitle.textContent = song.title;
        currentSongArtist.textContent = song.artist;
        
        // Update play button
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        // Set audio source
        audioPlayer.src = song.url;
        
        // Play audio
        audioPlayer.play()
            .then(() => {
                isPlaying = true;
                
                // Add to recently played in database
                macOSDatabase.addToRecentlyPlayed(songId);
                
                // Show notification
                showNotification('Now Playing', `${song.title} - ${song.artist}`);
                
                console.log('🎶 Playing:', song.title);
            })
            .catch(error => {
                console.error('Audio play error:', error);
                showNotification('Playback Error', 'Cannot play audio in this browser');
            });
    }
    
    // Toggle play/pause
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', function() {
            if (!currentSong) {
                // Play first song if none is playing
                if (currentPlaylist && currentPlaylist.songs.length > 0) {
                    playSong(currentPlaylist.songs[0].id);
                }
            } else {
                if (isPlaying) {
                    audioPlayer.pause();
                    this.innerHTML = '<i class="fas fa-play"></i>';
                    isPlaying = false;
                } else {
                    audioPlayer.play();
                    this.innerHTML = '<i class="fas fa-pause"></i>';
                    isPlaying = true;
                }
            }
            playSound('click');
        });
    }
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPlaylist && currentPlaylist.songs.length > 0) {
                const newIndex = (currentSongIndex - 1 + currentPlaylist.songs.length) % currentPlaylist.songs.length;
                playSong(currentPlaylist.songs[newIndex].id);
            }
            playSound('click');
        });
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentPlaylist && currentPlaylist.songs.length > 0) {
                const newIndex = (currentSongIndex + 1) % currentPlaylist.songs.length;
                playSong(currentPlaylist.songs[newIndex].id);
            }
            playSound('click');
        });
    }
    
    // Song items click
    songItems.forEach(item => {
        item.addEventListener('click', function() {
            const songId = this.getAttribute('data-song');
            playSong(songId);
            playSound('click');
        });
    });
    
    // Audio event listeners
    audioPlayer.addEventListener('ended', function() {
        // Auto-play next song
        if (currentPlaylist && currentPlaylist.songs.length > 0) {
            const newIndex = (currentSongIndex + 1) % currentPlaylist.songs.length;
            playSong(currentPlaylist.songs[newIndex].id);
        }
    });
    
    // Load library on music player open
    loadMusicLibrary();
    
    console.log('🎵 Music player connected to database');
}

// ========== ENHANCED TERMINAL ==========
function setupTerminal() {
    const terminalWindow = document.getElementById('terminalWindow');
    if (!terminalWindow) return;
    
    const input = document.getElementById('terminalInput');
    const output = terminalWindow.querySelector('.terminal-output');
    
    if (!input || !output) return;
    
    // Load history from database
    function loadTerminalHistory() {
        const history = macOSDatabase.getTerminalHistory();
        console.log('💻 Loaded terminal history:', history.length, 'commands');
        
        // Clear existing output except first two lines
        const existingLines = output.querySelectorAll('div');
        if (existingLines.length > 2) {
            for (let i = 2; i < existingLines.length; i++) {
                existingLines[i].remove();
            }
        }
        
        // Add last 5 commands from history
        history.slice(0, 5).forEach(item => {
            const commandLine = document.createElement('div');
            commandLine.textContent = `macOS-Web:~ neelpatel$ ${item.command}`;
            output.appendChild(commandLine);
            
            const resultLine = document.createElement('div');
            resultLine.textContent = item.output;
            output.appendChild(resultLine);
        });
    }
    
    // Process command
    function processCommand(command) {
        let result = 'Command not found. Try: help, date, time, echo, clear, neel, ls, pwd, whoami';
        
        if (command === 'help' || command === '?') {
            result = 'Available commands:\n' +
                    '  help, ?          - Show this help\n' +
                    '  date             - Show current date\n' +
                    '  time             - Show current time\n' +
                    '  echo [text]      - Echo text\n' +
                    '  clear            - Clear terminal\n' +
                    '  neel             - About creator\n' +
                    '  ls               - List files\n' +
                    '  pwd              - Print working directory\n' +
                    '  whoami           - Show current user\n' +
                    '  history          - Show command history\n' +
                    '  calc [expression]- Calculator\n' +
                    '  theme [dark/light]- Change theme';
                    
        } else if (command === 'date') {
            result = new Date().toLocaleDateString();
            
        } else if (command === 'time') {
            result = new Date().toLocaleTimeString();
            
        } else if (command.startsWith('echo ')) {
            result = command.substring(5);
            
        } else if (command === 'clear') {
            output.innerHTML = `
                <div>Last login: Today on console</div>
                <div>macOS-Web:~ neelpatel$ <span class="cursor">_</span></div>
            `;
            result = '';
            
        } else if (command === 'neel') {
            result = 'Created by Neel Patel - macOS Web Emulator\n' +
                    'GitHub: @neelpatel05\n' +
                    'Version: 2.0 with Database\n' +
                    'All data saved locally in your browser!';
            
        } else if (command === 'ls') {
            const fileSystem = macOSDatabase.getFileSystem();
            if (fileSystem && fileSystem.home && fileSystem.home.children) {
                const folders = Object.keys(fileSystem.home.children);
                result = folders.join('  ');
            } else {
                result = 'Desktop  Documents  Downloads  Applications';
            }
            
        } else if (command === 'pwd') {
            result = '/Users/neelpatel';
            
        } else if (command === 'whoami') {
            const user = macOSDatabase.getUser();
            result = user ? user.username : 'neelpatel';
            
        } else if (command === 'history') {
            const history = macOSDatabase.getTerminalHistory();
            result = history.slice(0, 10).map((item, i) => 
                `${i + 1}. ${item.command}`
            ).join('\n');
            
        } else if (command.startsWith('calc ')) {
            const expression = command.substring(5);
            try {
                // Simple eval for demo (be careful in production)
                const calcResult = eval(expression.replace(/×/g, '*').replace(/÷/g, '/'));
                result = `${expression} = ${calcResult}`;
                // Save to calculator history too
                macOSDatabase.addCalculation(expression, calcResult.toString());
            } catch (error) {
                result = 'Calculation error';
            }
            
        } else if (command.startsWith('theme ')) {
            const theme = command.substring(6).toLowerCase();
            if (theme === 'dark' || theme === 'light') {
                const settings = macOSDatabase.getSystemSettings();
                settings.theme = theme;
                macOSDatabase.updateSystemSettings(settings);
                result = `Theme changed to ${theme}`;
                showNotification('Theme Updated', `Changed to ${theme} mode`);
            } else {
                result = 'Usage: theme [dark/light]';
            }
        }
        
        return result;
    }
    
    // Handle input
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const command = this.value.trim();
            if (command) {
                // Add command to output
                const commandLine = document.createElement('div');
                commandLine.textContent = `macOS-Web:~ neelpatel$ ${command}`;
                output.appendChild(commandLine);
                
                // Process command
                const result = processCommand(command);
                
                // Add result to output
                if (result) {
                    const resultLine = document.createElement('div');
                    resultLine.textContent = result;
                    output.appendChild(resultLine);
                }
                
                // Save to database
                macOSDatabase.addCommand(command, result);
                
                // Clear input
                this.value = '';
                
                // Scroll to bottom
                output.scrollTop = output.scrollHeight;
                
                playSound('click');
            }
        }
    });
    
    // Load history on terminal open
    loadTerminalHistory();
    
    console.log('💻 Terminal connected to database');
}

// ========== ENHANCED FINDER ==========
function setupFinder() {
    const finderWindow = document.getElementById('finderWindow');
    if (!finderWindow) return;
    
    const finderFiles = finderWindow.querySelector('.finder-files');
    if (!finderFiles) return;
    
    // Load file system from database
    function loadFileSystem() {
        const fileSystem = macOSDatabase.getFileSystem();
        if (!fileSystem || !fileSystem.home || !fileSystem.home.children) {
            console.error('File system not found in database');
            return;
        }
        
        console.log('📁 Loaded file system from database');
        
        // Clear existing files (keep the first 3 demo folders)
        const existingFiles = finderFiles.querySelectorAll('.finder-file');
        if (existingFiles.length > 3) {
            for (let i = 3; i < existingFiles.length; i++) {
                existingFiles[i].remove();
            }
        }
        
        // Add folders from database
        const folders = fileSystem.home.children;
        
        Object.entries(folders).forEach(([key, folder]) => {
            // Skip if already exists (Applications, Documents, Downloads)
            if (key !== 'applications' && key !== 'documents' && key !== 'downloads') {
                const fileElement = document.createElement('div');
                fileElement.className = 'finder-file';
                fileElement.innerHTML = `
                    <i class="fas fa-folder"></i>
                    <span>${folder.name}</span>
                `;
                
                fileElement.addEventListener('click', () => {
                    playSound('click');
                    showNotification('Finder', `Opening ${folder.name}`);
                });
                
                finderFiles.appendChild(fileElement);
            }
        });
        
        // Add "New Folder" button
        const newFolderBtn = document.createElement('div');
        newFolderBtn.className = 'finder-file';
        newFolderBtn.innerHTML = `
            <i class="fas fa-plus-circle" style="color: #007aff;"></i>
            <span style="color: #007aff;">New Folder</span>
        `;
        
        newFolderBtn.addEventListener('click', () => {
            playSound('click');
            createNewFolder();
        });
        
        finderFiles.appendChild(newFolderBtn);
    }
    
    // Create new folder
    function createNewFolder() {
        const folderName = prompt('Enter folder name:', 'New Folder');
        if (folderName && folderName.trim()) {
            const newFolder = macOSDatabase.createFolder('/Users/neelpatel/Desktop', folderName.trim());
            
            // Add to UI
            const fileElement = document.createElement('div');
            fileElement.className = 'finder-file';
            fileElement.innerHTML = `
                <i class="fas fa-folder" style="color: #ff9500;"></i>
                <span>${newFolder.name}</span>
            `;
            
            fileElement.addEventListener('click', () => {
                playSound('click');
                showNotification('Finder', `Opening ${newFolder.name}`);
            });
            
            finderFiles.insertBefore(fileElement, finderFiles.lastChild);
            
            showNotification('Folder Created', `Created "${newFolder.name}" on Desktop`);
        }
    }
    
    // Load file system on finder open
    loadFileSystem();
    
    console.log('📁 Finder connected to database');
}

// ========== ENHANCED NOTIFICATIONS ==========
function loadNotificationsFromDatabase() {
    const notificationCenter = document.getElementById('notificationCenter');
    if (!notificationCenter) return;
    
    const notificationsList = notificationCenter.querySelector('.notifications-list');
    if (!notificationsList) return;
    
    // Get notifications from database
    const notificationData = macOSDatabase.getNotifications();
    if (!notificationData) return;
    
    // Clear existing notifications (except welcome message)
    const existingNotifications = notificationsList.querySelectorAll('.notification-item');
    if (existingNotifications.length > 1) {
        for (let i = 1; i < existingNotifications.length; i++) {
            existingNotifications[i].remove();
        }
    }
    
    // Add notifications from database
    notificationData.notifications.forEach(notification => {
        if (notification.id !== 'notif_001') { // Skip welcome message (already in HTML)
            const notificationElement = document.createElement('div');
            notificationElement.className = 'notification-item';
            if (notification.read) {
                notificationElement.style.opacity = '0.7';
            }
            
            notificationElement.innerHTML = `
                <div class="notification-title">
                    ${notification.title}
                    ${notification.read ? '' : '<span style="color:#007aff; font-size:0.7em;"> ●</span>'}
                </div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${formatTime(notification.timestamp)}</div>
            `;
            
            // Mark as read on click
            notificationElement.addEventListener('click', () => {
                if (!notification.read) {
                    macOSDatabase.markAsRead(notification.id);
                    notificationElement.style.opacity = '0.7';
                    notificationElement.querySelector('.notification-title span').remove();
                }
            });
            
            notificationsList.appendChild(notificationElement);
        }
    });
}

// Helper: Format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
}

// ========== ENHANCED SYSTEM ==========
function loadSystemSettings() {
    const settings = macOSDatabase.getSystemSettings();
    if (!settings) return;
    
    console.log('⚙️ Loaded system settings:', settings.theme);
    
    // Apply theme
    if (settings.theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Apply wallpaper (simplified)
    // In a real implementation, you would update the background
}

// ========== UPDATE EXISTING FUNCTIONS ==========

// Update openApp function to use database
const originalOpenApp = openApp;
openApp = function(appName) {
    originalOpenApp(appName);
    
    // Load app-specific data from database
    switch(appName) {
        case 'calculator':
            setTimeout(setupCalculator, 100);
            break;
        case 'music':
            setTimeout(setupMusicPlayer, 100);
            break;
        case 'terminal':
            setTimeout(setupTerminal, 100);
            break;
        case 'finder':
            setTimeout(setupFinder, 100);
            break;
    }
    
    // Add to running apps in database
    macOSDatabase.addRunningApp(appName);
};

// Update window controls to remove from database when closed
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('window-control') && 
        e.target.classList.contains('close')) {
        const windowElement = e.target.closest('.app-window');
        if (windowElement) {
            const appName = windowElement.id.replace('Window', '');
            macOSDatabase.removeRunningApp(appName);
        }
    }
});

// ========== INITIALIZE ON LOAD ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔗 Initializing database integration...');
    
    // Load system settings
    setTimeout(loadSystemSettings, 500);
    
    // Load notifications
    setTimeout(loadNotificationsFromDatabase, 1000);
    
    // Show database status notification
    setTimeout(() => {
        macOSDatabase.addNotification('Database Connected', 'All app data will be saved locally in your browser', 'success', 'fas fa-database');
    }, 1500);
    
    console.log('✅ Database integration complete!');
});