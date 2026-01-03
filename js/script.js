// DOM Elements
const lockScreen = document.getElementById('lockScreen');
const desktop = document.getElementById('desktop');
const lockTime = document.getElementById('lockTime');
const lockDate = document.getElementById('lockDate');
const desktopTime = document.getElementById('desktopTime');
const lockPassword = document.getElementById('lockPassword');
const unlockBtn = document.getElementById('unlockBtn');
const restartBtn = document.getElementById('restartBtn');
const shutdownBtn = document.getElementById('shutdownBtn');
const desktopIcons = document.querySelectorAll('.desktop-icon');
const dockItems = document.querySelectorAll('.dock-item');
const contextMenu = document.getElementById('contextMenu');
const notificationCenter = document.getElementById('notificationCenter');
const closeNotifications = document.getElementById('closeNotifications');
const trashWindow = document.getElementById('trashWindow');
const emptyTrashBtn = document.getElementById('emptyTrash');
const restoreItemBtn = document.getElementById('restoreItem');
const trashContents = document.getElementById('trashContents');
const spotlightBtn = document.getElementById('spotlightBtn');
const shutdownModal = document.getElementById('shutdownModal');
const restartModal = document.getElementById('restartModal');

// State Management
let systemState = {
    notifications: [],
    trashItems: [],
    openWindows: [],
    activeApp: null,
    selectedFile: null,
    isLocked: true,
    isShuttingDown: false,
    isRestarting: false
};

// Sound System State
let soundState = {
    enabled: true,
    volume: 0.7,
    audioContext: null,
    sounds: {
        login: { freq: 523.25, duration: 1000 },    // macOS startup sound
        click: { freq: 400, duration: 50 },         // Soft click
        notification: { freq: 659.25, duration: 300 }, // Gentle bell
        windowOpen: { freq: 523.25, duration: 150 },   // Subtle open
        windowClose: { freq: 349.23, duration: 150 },  // Soft close
        error: { freq: 220, duration: 500 },           // Low error tone
        trash: { freq: 200, duration: 400 },           // Deep trash sound
        mission: { freq: 659.25, duration: 200 },      // Mission Control
        launchpad: { freq: 783.99, duration: 200 },    // Launchpad
        spotlight: { freq: 698.46, duration: 150 },    // Spotlight
        success: { freq: 523.25, duration: 300 },      // Success tone
        minimize: { freq: 329.63, duration: 150 },     // Minimize
        shutdown: { freq: 174.61, duration: 800 },     // Shutdown sound
        restart: { freq: 261.63, duration: 600 }       // Restart sound
    }
};

// Initialize audio context
function initAudioContext() {
    if (!soundState.audioContext) {
        soundState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return soundState.audioContext;
}

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
        const audioContext = initAudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = sound.freq;
        oscillator.type = ['login', 'shutdown', 'restart'].includes(soundName) ? 'sine' : 'triangle';
        
        const volume = soundState.volume * (['login', 'shutdown', 'restart'].includes(soundName) ? 0.3 : 0.2);
        
        const now = audioContext.currentTime;
        
        if (soundName === 'login') {
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + sound.duration/1000);
        } else if (soundName === 'shutdown' || soundName === 'restart') {
            gainNode.gain.setValueAtTime(volume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + sound.duration/1000);
        } else {
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + sound.duration/1000);
        }
        
        oscillator.start(now);
        oscillator.stop(now + sound.duration/1000);
    } catch (error) {
        console.log('Audio context error:', error);
        // Fallback to Web Audio API
        try {
            const audio = new Audio();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = sound.freq;
            oscillator.type = 'sine';
            gainNode.gain.value = soundState.volume * 0.2;
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + sound.duration/1000);
        } catch (fallbackError) {
            console.log('Fallback audio also failed:', fallbackError);
        }
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
        'restart': 'restart'
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
    playSound('click');
}

function hideSoundTest() {
    document.getElementById('soundTestModal').style.display = 'none';
    playSound('click');
}

// ========== POWER FUNCTIONS ==========
function shutdownSystem() {
    if (systemState.isShuttingDown || systemState.isRestarting) return;
    
    systemState.isShuttingDown = true;
    playSystemSound('shutdown');
    
    shutdownModal.style.display = 'flex';
    
    const progressBar = shutdownModal.querySelector('.shutdown-progress');
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                shutdownModal.style.display = 'none';
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
                
                // Reset state after delay
                setTimeout(() => {
                    systemState.isShuttingDown = false;
                    showNotification('System Shut Down', 'Computer has been shut down', 'info');
                }, 1000);
            }, 500);
        }
    }, 30);
}

function restartSystem() {
    if (systemState.isShuttingDown || systemState.isRestarting) return;
    
    systemState.isRestarting = true;
    playSystemSound('restart');
    
    restartModal.style.display = 'flex';
    
    const progressBar = restartModal.querySelector('.restart-progress');
    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                restartModal.style.display = 'none';
                
                // Close all windows
                document.querySelectorAll('.app-window').forEach(window => {
                    window.style.display = 'none';
                });
                systemState.openWindows = [];
                updateDockIndicators();
                
                // Show lock screen
                lockScreen.classList.add('active');
                desktop.classList.remove('active');
                systemState.isLocked = true;
                lockPassword.value = '';
                
                // Reset state
                setTimeout(() => {
                    systemState.isRestarting = false;
                    showNotification('System Restarted', 'Computer has been restarted', 'success');
                }, 1000);
            }, 500);
        }
    }, 30);
}

// ========== UNLOCK SYSTEM ==========
function unlockMac() {
    if(systemState.isLocked && (lockPassword.value === 'macos' || lockPassword.value === '')) {
        systemState.isLocked = false;
        playSystemSound('login');
        
        lockScreen.style.animation = 'fadeOut 0.5s ease forwards';
        
        setTimeout(() => {
            lockScreen.classList.remove('active');
            desktop.classList.add('active');
            desktop.style.animation = 'slideUp 0.5s ease forwards';
            
            setTimeout(() => {
                lockScreen.style.display = 'none';
                desktop.style.display = 'block';
                showNotification('Welcome to macOS Web', 'Created by Neel Patel', 'success');
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

// ========== CONTEXT MENU ==========
let contextMenuTarget = null;

function showContextMenu(x, y, target) {
    contextMenuTarget = target;
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';
    
    const rect = contextMenu.getBoundingClientRect();
    if(rect.right > window.innerWidth) {
        contextMenu.style.left = (window.innerWidth - rect.width - 5) + 'px';
    }
    if(rect.bottom > window.innerHeight) {
        contextMenu.style.top = (window.innerHeight - rect.height - 5) + 'px';
    }
}

function hideContextMenu() {
    contextMenu.style.display = 'none';
    contextMenuTarget = null;
}

function handleContextMenuAction(action) {
    playSystemSound('click');
    switch(action) {
        case 'new-folder':
            createNewFolder();
            break;
        case 'get-info':
            showFileInfo();
            break;
        case 'copy':
            showNotification('Copy', 'Item copied to clipboard', 'info');
            break;
        case 'paste':
            showNotification('Paste', 'Item pasted from clipboard', 'info');
            break;
        case 'duplicate':
            showNotification('Duplicate', 'Item duplicated', 'info');
            break;
        case 'move-to-trash':
            moveToTrash();
            break;
    }
    hideContextMenu();
}

function createNewFolder() {
    const folderName = prompt('Enter folder name:', 'Untitled Folder');
    if(folderName) {
        showNotification('New Folder', `Folder "${folderName}" created`, 'success');
        
        const desktopIconsContainer = document.querySelector('.desktop-icons');
        const newFolder = document.createElement('div');
        newFolder.className = 'desktop-icon';
        newFolder.setAttribute('data-app', 'folder');
        newFolder.innerHTML = `
            <div class="icon-img">
                <i class="fas fa-folder"></i>
            </div>
            <span class="icon-label">${folderName}</span>
        `;
        desktopIconsContainer.appendChild(newFolder);
        
        newFolder.addEventListener('dblclick', () => {
            createAppWindow('finder');
        });
        
        newFolder.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, newFolder);
        });
    }
}

function moveToTrash() {
    if(contextMenuTarget) {
        const itemName = contextMenuTarget.querySelector('.icon-label')?.textContent || 'Item';
        systemState.trashItems.push({
            name: itemName,
            type: contextMenuTarget.getAttribute('data-app'),
            element: contextMenuTarget,
            deletedAt: new Date()
        });
        
        contextMenuTarget.style.opacity = '0.5';
        
        const trashDockItem = document.querySelector('.dock-item[data-app="trash"]');
        trashDockItem.innerHTML = '<i class="fas fa-trash"></i>';
        
        updateTrashWindow();
        playSystemSound('trash');
        showNotification('Move to Trash', `"${itemName}" moved to Trash`, 'info');
    }
}

function updateTrashWindow() {
    trashContents.innerHTML = '';
    
    if(systemState.trashItems.length === 0) {
        trashContents.innerHTML = '<p class="empty-trash">Trash is empty</p>';
        return;
    }
    
    systemState.trashItems.forEach((item, index) => {
        const fileEl = document.createElement('div');
        fileEl.className = 'finder-file';
        fileEl.setAttribute('data-index', index);
        fileEl.innerHTML = `
            <div class="file-icon">
                <i class="fas fa-${item.type === 'folder' ? 'folder' : 'file'}"></i>
            </div>
            <div class="file-name">${item.name}</div>
        `;
        
        fileEl.addEventListener('click', () => {
            document.querySelectorAll('.finder-file.selected').forEach(el => {
                el.classList.remove('selected');
            });
            fileEl.classList.add('selected');
            systemState.selectedFile = index;
        });
        
        trashContents.appendChild(fileEl);
    });
}

// ========== APP WINDOW SYSTEM ==========
function createAppWindow(appName) {
    if (systemState.isLocked) return;
    
    playSystemSound('window-open');
    
    // Check if window already exists
    const existingWindow = document.querySelector(`.app-window[data-app="${appName}"]`);
    if (existingWindow && appName !== 'finder') {
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

function createFinderWindow(id) {
    return `
        <div class="app-window finder-window" id="${id}" data-app="finder">
            <div class="window-titlebar">
                <div class="window-controls">
                    <div class="window-control close"></div>
                    <div class="window-control minimize"></div>
                    <div class="window-control expand"></div>
                </div>
                <div class="window-title">Finder</div>
            </div>
            <div class="window-content finder-content">
                <div class="finder-sidebar">
                    <div class="sidebar-section">
                        <h4>Favorites</h4>
                        <div class="sidebar-item active"><i class="fas fa-desktop"></i> Desktop</div>
                        <div class="sidebar-item"><i class="fas fa-download"></i> Downloads</div>
                        <div class="sidebar-item"><i class="fas fa-user"></i> Documents</div>
                    </div>
                </div>
                <div class="finder-main">
                    <div class="finder-files">
                        <div class="finder-file" data-type="folder">
                            <div class="file-icon">
                                <i class="fas fa-folder"></i>
                            </div>
                            <div class="file-name">Applications</div>
                        </div>
                        <div class="finder-file" data-type="folder">
                            <div class="file-icon">
                                <i class="fas fa-folder"></i>
                            </div>
                            <div class="file-name">Documents</div>
                        </div>
                        <div class="finder-file" data-type="file">
                            <div class="file-icon">
                                <i class="fas fa-file-pdf"></i>
                            </div>
                            <div class="file-name">Resume.pdf</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createDefaultWindow(id, appName) {
    const appTitle = appName.charAt(0).toUpperCase() + appName.slice(1);
    return `
        <div class="app-window" id="${id}" data-app="${appName}">
            <div class="window-titlebar">
                <div class="window-controls">
                    <div class="window-control close"></div>
                    <div class="window-control minimize"></div>
                    <div class="window-control expand"></div>
                </div>
                <div class="window-title">${appTitle}</div>
            </div>
            <div class="window-content">
                <h3>Welcome to ${appTitle}</h3>
                <p>This is a macOS web application simulation by Neel Patel.</p>
                <p>Double-click desktop icons or click dock items to open apps.</p>
            </div>
        </div>
    `;
}

// ========== WINDOW CONTROLS ==========
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

function getHighestZIndex() {
    const windows = document.querySelectorAll('.app-window');
    let highest = 100;
    windows.forEach(window => {
        const zIndex = parseInt(window.style.zIndex || 100);
        if (zIndex > highest) highest = zIndex;
    });
    return highest;
}

function setupWindowControls(windowElement) {
    const closeBtn = windowElement.querySelector('.window-control.close');
    const minimizeBtn = windowElement.querySelector('.window-control.minimize');
    const expandBtn = windowElement.querySelector('.window-control.expand');
    
    closeBtn.addEventListener('click', () => {
        playSystemSound('window-close');
        windowElement.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            windowElement.remove();
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
            windowElement.style.width = '400px';
            windowElement.style.height = '300px';
            windowElement.style.left = '100px';
            windowElement.style.top = '100px';
        } else {
            windowElement.classList.add('maximized');
            windowElement.style.width = '100%';
            windowElement.style.height = 'calc(100% - 25px)';
            windowElement.style.left = '0';
            windowElement.style.top = '25px';
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

// ========== MISSION CONTROL ==========
function showMissionControl() {
    if (systemState.isLocked) return;
    playSystemSound('mission-control');
    const missionControl = document.getElementById('missionControl');
    missionControl.style.display = 'block';
    document.getElementById('desktop').style.pointerEvents = 'none';
}

function hideMissionControl() {
    document.getElementById('missionControl').style.display = 'none';
    document.getElementById('desktop').style.pointerEvents = 'auto';
}

// ========== LAUNCHPAD ==========
function showLaunchpad() {
    if (systemState.isLocked) return;
    playSystemSound('launchpad');
    const launchpad = document.getElementById('launchpad');
    launchpad.style.display = 'block';
    populateLaunchpad();
}

function hideLaunchpad() {
    document.getElementById('launchpad').style.display = 'none';
}

function populateLaunchpad() {
    const appGrid = document.querySelector('.app-grid');
    appGrid.innerHTML = '';
    
    const apps = [
        { name: 'Finder', icon: 'fas fa-compass', color: '#007aff' },
        { name: 'Safari', icon: 'fas fa-globe', color: '#34c759' },
        { name: 'Music', icon: 'fas fa-music', color: '#ff2d55' },
        { name: 'Calculator', icon: 'fas fa-calculator', color: '#ff9500' },
        { name: 'Terminal', icon: 'fas fa-terminal', color: '#1d1d1f' },
        { name: 'System Preferences', icon: 'fas fa-sliders-h', color: '#8e8e93' }
    ];
    
    apps.forEach((app, index) => {
        const appIcon = document.createElement('div');
        appIcon.className = 'app-icon';
        appIcon.style.animationDelay = (index * 0.05) + 's';
        appIcon.innerHTML = `
            <div class="app-icon-image" style="background: ${app.color}">
                <i class="${app.icon}"></i>
            </div>
            <div class="app-icon-name">${app.name}</div>
        `;
        
        appIcon.addEventListener('click', () => {
            hideLaunchpad();
            createAppWindow(app.name.toLowerCase().replace(' ', ''));
        });
        
        appGrid.appendChild(appIcon);
    });
}

// ========== SPOTLIGHT SEARCH ==========
function showSpotlight() {
    if (systemState.isLocked) return;
    playSystemSound('spotlight');
    const spotlight = document.getElementById('spotlight');
    spotlight.style.display = 'block';
    document.getElementById('spotlightInput').focus();
}

function hideSpotlight() {
    document.getElementById('spotlight').style.display = 'none';
}

// ========== APPS ==========
// Safari
function openSafari() {
    const safariWindow = document.getElementById('safariWindow');
    safariWindow.style.display = 'block';
    safariWindow.style.zIndex = getHighestZIndex() + 1;
    makeWindowDraggable(safariWindow);
    setupWindowControls(safariWindow);
    systemState.activeApp = 'safari';
    updateDockIndicators();
    
    // Position
    safariWindow.style.left = '100px';
    safariWindow.style.top = '100px';
}

// Music
function openMusic() {
    const musicWindow = document.getElementById('musicWindow');
    musicWindow.style.display = 'block';
    musicWindow.style.zIndex = getHighestZIndex() + 1;
    makeWindowDraggable(musicWindow);
    setupWindowControls(musicWindow);
    systemState.activeApp = 'music';
    updateDockIndicators();
    
    musicWindow.style.left = '150px';
    musicWindow.style.top = '80px';
    
    // Setup music player
    document.querySelectorAll('.music-card').forEach(card => {
        card.addEventListener('click', function() {
            const song = this.getAttribute('data-song');
            playSong(song);
        });
    });
    
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            playSystemSound('click');
            const isPlaying = this.classList.contains('playing');
            if (isPlaying) {
                this.classList.remove('playing');
                this.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                this.classList.add('playing');
                this.innerHTML = '<i class="fas fa-pause"></i>';
                showNotification('Music', 'Now playing', 'success');
            }
        });
    }
}

function playSong(songId) {
    const songs = {
        1: { title: 'Midnight City', artist: 'M83' },
        2: { title: 'Blinding Lights', artist: 'The Weeknd' }
    };
    
    const song = songs[songId];
    if (song) {
        document.querySelector('.np-info h3').textContent = song.title;
        document.querySelector('.np-info p').textContent = song.artist;
        
        const playBtn = document.querySelector('.play-btn');
        playBtn.classList.add('playing');
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        playSystemSound('notification');
        showNotification('Music', `Now playing: ${song.title}`, 'success');
    }
}

// Calculator
function openCalculator() {
    const calcWindow = document.getElementById('calculatorWindow');
    calcWindow.style.display = 'block';
    calcWindow.style.zIndex = getHighestZIndex() + 1;
    makeWindowDraggable(calcWindow);
    setupWindowControls(calcWindow);
    systemState.activeApp = 'calculator';
    updateDockIndicators();
    
    calcWindow.style.left = '200px';
    calcWindow.style.top = '150px';
    setupCalculator();
}

function setupCalculator() {
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let resetScreen = false;

    const display = document.querySelector('.calc-current');
    const history = document.querySelector('.calc-history');

    function updateDisplay() {
        display.textContent = currentInput;
        history.textContent = previousInput + (operation || '');
    }

    function appendNumber(number) {
        playSystemSound('click');
        if (currentInput === '0' || resetScreen) {
            currentInput = number;
            resetScreen = false;
        } else {
            currentInput += number;
        }
    }

    function chooseOperation(op) {
        playSystemSound('click');
        if (currentInput === '') return;
        if (previousInput !== '') compute();
        operation = op;
        previousInput = currentInput;
        currentInput = '';
    }

    function compute() {
        playSystemSound('click');
        let computation;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (operation) {
            case '+': computation = prev + current; break;
            case '−': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷': computation = prev / current; break;
            case '%': computation = prev % current; break;
            default: return;
        }
        
        currentInput = computation.toString();
        operation = undefined;
        previousInput = '';
    }

    function clear() {
        playSystemSound('click');
        currentInput = '0';
        previousInput = '';
        operation = null;
    }

    // Add event listeners
    document.querySelectorAll('.calculator-buttons .calc-btn').forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;
            
            if (button.classList.contains('function')) {
                switch (value) {
                    case 'C': clear(); break;
                    case '±': currentInput = (parseFloat(currentInput) * -1).toString(); break;
                    case '%': chooseOperation('%'); break;
                }
            } else if (button.classList.contains('operator')) {
                chooseOperation(value);
            } else if (button.classList.contains('equals')) {
                compute();
            } else {
                appendNumber(value);
            }
            
            updateDisplay();
        });
    });
}

// Terminal
function openTerminal() {
    const terminalWindow = document.getElementById('terminalWindow');
    terminalWindow.style.display = 'block';
    terminalWindow.style.zIndex = getHighestZIndex() + 1;
    makeWindowDraggable(terminalWindow);
    setupWindowControls(terminalWindow);
    systemState.activeApp = 'terminal';
    updateDockIndicators();
    
    terminalWindow.style.left = '100px';
    terminalWindow.style.top = '120px';
    setupTerminal();
}

function setupTerminal() {
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.querySelector('.terminal-output');
    
    if (!terminalInput || !terminalOutput) return;
    
    const commands = {
        'help': 'Available: help, clear, date, time, echo [text], ls, pwd, about, neel',
        'clear': function() { terminalOutput.innerHTML = ''; return ''; },
        'date': () => new Date().toLocaleDateString(),
        'time': () => new Date().toLocaleTimeString(),
        'echo': (args) => args.join(' '),
        'ls': 'Desktop    Documents    Downloads    Applications',
        'pwd': '/Users/neelpatel/macos-web',
        'about': 'macOS Web v1.0 by Neel Patel - A macOS simulation',
        'neel': 'Creator: Neel Patel - Built with HTML, CSS & JavaScript'
    };
    
    function executeCommand(cmd) {
        const parts = cmd.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        if (commands[command]) {
            if (typeof commands[command] === 'function') {
                return commands[command](args);
            }
            return commands[command];
        }
        
        return `Command not found: ${command}. Type 'help' for commands.`;
    }
    
    function addOutput(text) {
        const line = document.createElement('div');
        line.className = 'output-line';
        line.textContent = text;
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
    
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            playSystemSound('click');
            const command = terminalInput.value.trim();
            if (command) {
                addOutput(`macOS-Web:~ neelpatel$ ${command}`);
                const result = executeCommand(command);
                if (result) addOutput(result);
                terminalInput.value = '';
            }
            e.preventDefault();
        }
    });
    
    addOutput('Welcome to macOS Web Terminal by Neel Patel');
    addOutput('Type "help" for available commands');
}

// System Preferences
function openPreferences() {
    const prefWindow = document.getElementById('preferencesWindow');
    prefWindow.style.display = 'block';
    prefWindow.style.zIndex = getHighestZIndex() + 1;
    makeWindowDraggable(prefWindow);
    setupWindowControls(prefWindow);
    systemState.activeApp = 'preferences';
    updateDockIndicators();
    
    prefWindow.style.left = '200px';
    prefWindow.style.top = '100px';
    loadPreferencePanel('general');
}

function loadPreferencePanel(panelId) {
    const panelContainer = document.getElementById('preferencesPanel');
    
    document.querySelectorAll('.preferences-sidebar .sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-pref') === panelId) {
            item.classList.add('active');
        }
    });
    
    let panelHTML = '';
    
    switch(panelId) {
        case 'general':
            panelHTML = `
                <div class="preference-panel active">
                    <h2 class="panel-title">General</h2>
                    <div class="preference-item">
                        <label>Appearance</label>
                        <select id="appearanceSelect">
                            <option>Light</option>
                            <option>Dark</option>
                            <option>Auto</option>
                        </select>
                    </div>
                    <div class="preference-item">
                        <label>Accent Color</label>
                        <div class="color-picker">
                            <div class="color-option active" style="background: #007aff;" data-color="blue"></div>
                            <div class="color-option" style="background: #34c759;" data-color="green"></div>
                            <div class="color-option" style="background: #ff9500;" data-color="orange"></div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'desktop':
            panelHTML = `
                <div class="preference-panel active">
                    <h2 class="panel-title">Desktop & Dock</h2>
                    <div class="preference-item">
                        <label>Desktop Background</label>
                        <select id="backgroundSelect">
                            <option>Default</option>
                            <option>Solid Color</option>
                        </select>
                    </div>
                    <div class="preference-item">
                        <label>Dock Size</label>
                        <input type="range" id="dockSize" min="20" max="80" value="50">
                    </div>
                </div>
            `;
            break;
            
        case 'sound':
            panelHTML = `
                <div class="preference-panel active">
                    <h2 class="panel-title">Sound</h2>
                    <div class="sound-item">
                        <label>Output Volume</label>
                        <div class="volume-control">
                            <i class="fas fa-volume-off"></i>
                            <input type="range" class="volume-slider" id="volumeSlider" 
                                   min="0" max="100" value="${soundState.volume * 100}">
                            <i class="fas fa-volume-up"></i>
                            <span class="volume-value" id="volumeValue">${Math.round(soundState.volume * 100)}%</span>
                        </div>
                    </div>
                    <div class="sound-item">
                        <div class="mute-toggle">
                            <label>Mute Sounds</label>
                            <label class="toggle-switch">
                                <input type="checkbox" id="muteToggle" ${soundState.enabled ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="sound-item">
                        <button class="test-sound-btn" id="testSounds">
                            <i class="fas fa-volume-up"></i> Test System Sounds
                        </button>
                    </div>
                </div>
            `;
            break;
    }
    
    panelContainer.innerHTML = panelHTML;
    setupPreferenceListeners();
}

function setupPreferenceListeners() {
    // Volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            updateVolume(this.value);
        });
    }
    
    // Mute toggle
    const muteToggle = document.getElementById('muteToggle');
    if (muteToggle) {
        muteToggle.addEventListener('change', toggleMute);
    }
    
    // Test sounds button
    const testSoundsBtn = document.getElementById('testSounds');
    if (testSoundsBtn) {
        testSoundsBtn.addEventListener('click', showSoundTest);
    }
    
    // Sidebar items
    document.querySelectorAll('.preferences-sidebar .sidebar-item').forEach(item => {
        item.addEventListener('click', function() {
            playSystemSound('click');
            const panelId = this.getAttribute('data-pref');
            loadPreferencePanel(panelId);
        });
    });
}

// ========== UTILITY FUNCTIONS ==========
function showFileInfo() {
    if(contextMenuTarget) {
        const itemName = contextMenuTarget.querySelector('.icon-label')?.textContent || 'Item';
        alert(`Name: ${itemName}\nType: File\nCreated: Today\nModified: Today\n\nmacOS Web by Neel Patel`);
    }
}

// ========== SETUP SOUND EVENTS ==========
function setupSoundEvents() {
    // Click sounds
    document.addEventListener('click', (e) => {
        if (systemState.isLocked) return;
        
        if (e.target.tagName === 'BUTTON' || 
            e.target.closest('button') ||
            e.target.classList.contains('dock-item') ||
            e.target.closest('.dock-item') ||
            e.target.classList.contains('desktop-icon') ||
            e.target.closest('.desktop-icon') ||
            e.target.classList.contains('menu-item')) {
            playSystemSound('click');
        }
    });
}

// ========== HOT CORNERS ==========
function setupHotCorners() {
    let cornerTimeout;
    
    document.addEventListener('mousemove', (e) => {
        if (systemState.isLocked) return;
        
        const x = e.clientX;
        const y = e.clientY;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (x < 50 && y < 50) {
            if (!cornerTimeout) {
                cornerTimeout = setTimeout(() => {
                    showMissionControl();
                    cornerTimeout = null;
                }, 500);
            }
        } else if (x > width - 50 && y < 50) {
            if (!cornerTimeout) {
                cornerTimeout = setTimeout(() => {
                    notificationCenter.classList.add('active');
                    cornerTimeout = null;
                }, 500);
            }
        } else if (x < 50 && y > height - 50) {
            if (!cornerTimeout) {
                cornerTimeout = setTimeout(() => {
                    showLaunchpad();
                    cornerTimeout = null;
                }, 500);
            }
        } else {
            if (cornerTimeout) {
                clearTimeout(cornerTimeout);
                cornerTimeout = null;
            }
        }
    });
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', () => {
    // Update time
    updateTime();
    setInterval(updateTime, 60000);
    
    // Initialize audio context
    initAudioContext();
    
    // Load saved sound settings
    const savedVolume = localStorage.getItem('macosSoundVolume');
    const savedMute = localStorage.getItem('macosSoundMuted');
    if (savedVolume !== null) soundState.volume = savedVolume / 100;
    if (savedMute !== null) soundState.enabled = !(savedMute === 'true');
    
    // Setup sound system
    setupSoundEvents();
    
    // Power buttons
    restartBtn.addEventListener('click', restartSystem);
    shutdownBtn.addEventListener('click', shutdownSystem);
    
    // Unlock system
    unlockBtn.addEventListener('click', unlockMac);
    lockPassword.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') unlockMac();
    });
    
    lockScreen.addEventListener('click', (e) => {
        if(e.target === lockScreen || e.target.classList.contains('unlock-hint')) {
            lockPassword.focus();
        }
    });
    
    // Desktop icons
    desktopIcons.forEach(icon => {
        icon.addEventListener('dblclick', () => {
            const appName = icon.getAttribute('data-app');
            createAppWindow(appName);
        });
        
        icon.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, icon);
        });
    });
    
    // Dock items
    dockItems.forEach(item => {
        const appName = item.getAttribute('data-app');
        
        if(appName === 'trash') {
            item.addEventListener('click', () => {
                if(trashWindow.style.display === 'none') {
                    trashWindow.style.display = 'block';
                    trashWindow.style.zIndex = getHighestZIndex() + 1;
                    makeWindowDraggable(trashWindow);
                    setupWindowControls(trashWindow);
                    trashWindow.style.left = '200px';
                    trashWindow.style.top = '100px';
                } else {
                    trashWindow.style.display = 'none';
                }
            });
        } else if (appName === 'missioncontrol') {
            item.addEventListener('click', showMissionControl);
        } else if (appName === 'launchpad') {
            item.addEventListener('click', showLaunchpad);
        } else {
            item.addEventListener('click', () => {
                createAppWindow(appName);
            });
        }
    });
    
    // Context menu
    document.addEventListener('contextmenu', (e) => {
        if(!e.target.closest('.app-window') && !e.target.closest('.menu-bar') && !e.target.closest('.dock')) {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, null);
        }
    });
    
    document.addEventListener('click', hideContextMenu);
    
    // Context menu actions
    document.querySelectorAll('#contextMenu .menu-item[data-action]').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            handleContextMenuAction(action);
        });
    });
    
    // Notification center
    document.querySelector('.status-icons').addEventListener('click', (e) => {
        if(e.target.closest('.status-icons')) {
            playSystemSound('click');
            notificationCenter.classList.toggle('active');
        }
    });
    
    closeNotifications.addEventListener('click', () => {
        playSystemSound('click');
        notificationCenter.classList.remove('active');
    });
    
    // Spotlight button
    if (spotlightBtn) {
        spotlightBtn.addEventListener('click', showSpotlight);
    }
    
    // Close spotlight on input
    document.getElementById('closeSpotlight').addEventListener('click', hideSpotlight);
    
    // Mission Control
    document.getElementById('exitMission').addEventListener('click', hideMissionControl);
    
    // Launchpad
    document.getElementById('exitLaunchpad').addEventListener('click', hideLaunchpad);
    
    // Sound test modal
    document.getElementById('closeSoundTest').addEventListener('click', hideSoundTest);
    document.querySelectorAll('.sound-test-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sound = this.getAttribute('data-sound');
            playSystemSound(sound);
        });
    });
    
    document.getElementById('soundTestModal').addEventListener('click', function(e) {
        if (e.target === this) hideSoundTest();
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
        
        // Escape to close modals
        if (e.key === 'Escape') {
            if (document.getElementById('missionControl').style.display === 'block') {
                hideMissionControl();
            }
            if (document.getElementById('launchpad').style.display === 'block') {
                hideLaunchpad();
            }
            if (document.getElementById('spotlight').style.display === 'block') {
                hideSpotlight();
            }
            if (notificationCenter.classList.contains('active')) {
                notificationCenter.classList.remove('active');
            }
            if (document.getElementById('soundTestModal').style.display === 'flex') {
                hideSoundTest();
            }
            if (document.getElementById('shutdownModal').style.display === 'flex') {
                shutdownModal.style.display = 'none';
                systemState.isShuttingDown = false;
            }
            if (document.getElementById('restartModal').style.display === 'flex') {
                restartModal.style.display = 'none';
                systemState.isRestarting = false;
            }
        }
        
        // Lock screen with Cmd/Ctrl + L
        if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
            e.preventDefault();
            lockMac();
        }
    });
    
    // Setup hot corners
    setupHotCorners();
    
    // Show hint
    setTimeout(() => {
        const hint = document.createElement('div');
        hint.className = 'hot-corner-hint';
        hint.innerHTML = '💡 Move mouse to corners for Mission Control & Launchpad';
        desktop.appendChild(hint);
        setTimeout(() => hint.remove(), 5000);
    }, 2000);
    
    // Auto-unlock for testing (optional)
    setTimeout(() => {
        if (systemState.isLocked) {
            // lockPassword.value = 'macos';
            // unlockMac();
        }
    }, 1000);
});

// Add CSS for notification toast
const toastStyle = document.createElement('style');
toastStyle.textContent = `
.notification-toast {
    position: fixed;
    top: 40px;
    right: 20px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 10px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s;
    max-width: 350px;
}
.notification-toast .toast-icon {
    font-size: 1.5rem;
    color: #007aff;
}
.notification-toast.success .toast-icon { color: #34c759; }
.notification-toast.error .toast-icon { color: #ff3b30; }
.toast-content { flex: 1; }
.toast-title { font-weight: 600; margin-bottom: 5px; color: #1d1d1f; }
.toast-message { font-size: 0.9rem; color: #424245; }
`;
document.head.appendChild(toastStyle);