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
const emptyTrashBtn = document.getElementById('emptyTrash');
const restoreItemBtn = document.getElementById('restoreItem');
const trashContents = document.getElementById('trashContents');

// State Management
let systemState = {
    notifications: [],
    trashItems: [],
    openWindows: [],
    activeApp: null,
    selectedFile: null
};

// Sound System State
let soundState = {
    enabled: true,
    volume: 0.7,
    sounds: {
        login: { freq: 523.25, duration: 800 },      // C5
        click: { freq: 392.00, duration: 100 },      // G4
        notification: { freq: 659.25, duration: 300 }, // E5
        windowOpen: { freq: 440.00, duration: 200 },  // A4
        windowClose: { freq: 349.23, duration: 200 }, // F4
        error: { freq: 293.66, duration: 500 },       // D4
        trash: { freq: 261.63, duration: 400 },       // C4
        mission: { freq: 523.25, duration: 300 },     // C5
        launchpad: { freq: 659.25, duration: 300 },   // E5
        spotlight: { freq: 783.99, duration: 200 },   // G5
        success: { freq: 659.25, duration: 400 },     // E5
        minimize: { freq: 329.63, duration: 200 }     // E4
    }
};

// Time Update Function
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

// Sound System Functions
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
        oscillator.type = 'sine';
        
        const volume = soundState.volume * 0.5; // Reduce max volume
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + sound.duration/1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration/1000);
    } catch (error) {
        console.log('Audio context not supported:', error);
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
        'minimize': 'minimize'
    };
    
    if (soundMap[event]) {
        playSound(soundMap[event]);
    }
}

function updateVolume(value) {
    soundState.volume = value / 100;
    localStorage.setItem('macosSoundVolume', value);
    
    // Update UI
    const volumeValue = document.getElementById('volumeValue');
    if (volumeValue) volumeValue.textContent = value + '%';
    
    // Play test sound if volume changed significantly
    if (Math.abs(value - 50) > 10) {
        playSound('click');
    }
}

function toggleMute() {
    soundState.enabled = !soundState.enabled;
    localStorage.setItem('macosSoundMuted', !soundState.enabled);
    
    const muteToggle = document.getElementById('muteToggle');
    if (muteToggle) {
        muteToggle.checked = soundState.enabled;
    }
    
    // Play sound when unmuting
    if (soundState.enabled) {
        playSound('notification');
    }
    
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

// Unlock Function
function unlockMac() {
    if(lockPassword.value === 'macos' || lockPassword.value === '') {
        playSystemSound('login');
        lockScreen.style.animation = 'fadeOut 0.5s ease forwards';
        
        setTimeout(() => {
            lockScreen.classList.remove('active');
            desktop.classList.add('active');
            desktop.style.animation = 'slideUp 0.5s ease forwards';
            
            // Show welcome notification
            showNotification('Welcome to macOS Web', 'You have successfully logged in.', 'success');
        }, 300);
    } else {
        lockPassword.style.animation = 'shake 0.5s';
        setTimeout(() => {
            lockPassword.style.animation = '';
            lockPassword.value = '';
        }, 500);
    }
}

// Notification System
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
    
    // Create notification element
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification-item ${type}`;
    notificationEl.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-time">${notification.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
    `;
    
    // Add to notification center
    const notificationsList = document.querySelector('.notifications-list');
    notificationsList.insertBefore(notificationEl, notificationsList.firstChild);
    
    // Show toast notification if center isn't open
    if(!notificationCenter.classList.contains('active')) {
        showToastNotification(title, message, type);
    }
    
    // Limit notifications to 50
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
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// Context Menu System
let contextMenuTarget = null;

function showContextMenu(x, y, target) {
    contextMenuTarget = target;
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
    contextMenu.style.display = 'block';
    
    // Position adjustment if menu goes off-screen
    const rect = contextMenu.getBoundingClientRect();
    if(rect.right > window.innerWidth) {
        contextMenu.style.left = (window.innerWidth - rect.width - 5) + 'px';
    }
    if(rect.bottom > window.innerHeight) {
        contextMenu.style.top = (window.innerHeight - rect.height - 5) + 'px';
    }
}

function handleContextMenuAction(action) {
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
        
        // Add to desktop (in a real app, you'd update the UI)
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
        
        // Add event listeners to new icon
        newFolder.addEventListener('dblclick', () => {
            createFolderWindow(folderName);
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
        
        // Hide the item
        contextMenuTarget.style.opacity = '0.5';
        
        // Update trash dock icon
        const trashDockItem = document.querySelector('.dock-item[data-app="trash"]');
        trashDockItem.innerHTML = '<i class="fas fa-trash-full"></i>';
        
        // Update trash window if open
        updateTrashWindow();
        
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
            // Remove previous selection
            document.querySelectorAll('.finder-file.selected').forEach(el => {
                el.classList.remove('selected');
            });
            // Select this file
            fileEl.classList.add('selected');
            systemState.selectedFile = index;
        });
        
        trashContents.appendChild(fileEl);
    });
}

// Enhanced App Window Creation
function createAppWindow(appName) {
    playSystemSound('window-open');
    const windowId = 'window_' + Date.now();
    let windowHTML = '';
    
    // Different content for different apps
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
        default:
            windowHTML = createDefaultWindow(windowId, appName);
    }
    
    const container = document.getElementById('windowsContainer');
    container.insertAdjacentHTML('beforeend', windowHTML);
    
    const newWindow = document.getElementById(windowId);
    systemState.openWindows.push(newWindow);
    systemState.activeApp = appName;
    
    // Update dock indicators
    updateDockIndicators();
    
    // Setup window
    makeWindowDraggable(newWindow);
    setupWindowControls(newWindow);
    setupWindowSnapping(newWindow);
    
    // Random position within bounds
    const maxX = window.innerWidth - 400;
    const maxY = window.innerHeight - 300;
    newWindow.style.left = Math.max(50, Math.random() * maxX) + 'px';
    newWindow.style.top = Math.max(50, Math.random() * maxY) + 'px';
    
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
                <div class="finder-path">Desktop</div>
            </div>
            <div class="window-content finder-content">
                <div class="finder-sidebar">
                    <div class="sidebar-section">
                        <h4>Favorites</h4>
                        <div class="sidebar-item active"><i class="fas fa-desktop"></i> Desktop</div>
                        <div class="sidebar-item"><i class="fas fa-download"></i> Downloads</div>
                        <div class="sidebar-item"><i class="fas fa-user"></i> Documents</div>
                        <div class="sidebar-item"><i class="fas fa-film"></i> Movies</div>
                        <div class="sidebar-item"><i class="fas fa-music"></i> Music</div>
                        <div class="sidebar-item"><i class="fas fa-image"></i> Pictures</div>
                    </div>
                    <div class="sidebar-section">
                        <h4>Locations</h4>
                        <div class="sidebar-item"><i class="fas fa-hdd"></i> Macintosh HD</div>
                        <div class="sidebar-item"><i class="fas fa-network-wired"></i> Network</div>
                        <div class="sidebar-item"><i class="fas fa-trash"></i> Trash</div>
                    </div>
                </div>
                <div class="finder-main">
                    <div class="finder-toolbar">
                        <div class="finder-actions">
                            <button class="finder-btn" onclick="createNewFolder()"><i class="fas fa-folder-plus"></i> New Folder</button>
                            <button class="finder-btn"><i class="fas fa-upload"></i> Share</button>
                            <button class="finder-btn"><i class="fas fa-tag"></i> Tags</button>
                        </div>
                        <div class="finder-view">
                            <button class="view-btn active"><i class="fas fa-th-large"></i></button>
                            <button class="view-btn"><i class="fas fa-list"></i></button>
                            <button class="view-btn"><i class="fas fa-columns"></i></button>
                        </div>
                    </div>
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
                        <div class="finder-file" data-type="folder">
                            <div class="file-icon">
                                <i class="fas fa-folder"></i>
                            </div>
                            <div class="file-name">Downloads</div>
                        </div>
                        <div class="finder-file" data-type="file">
                            <div class="file-icon">
                                <i class="fas fa-file-pdf"></i>
                            </div>
                            <div class="file-name">Resume.pdf</div>
                        </div>
                        <div class="finder-file" data-type="file">
                            <div class="file-icon">
                                <i class="fas fa-file-image"></i>
                            </div>
                            <div class="file-name">Photo.jpg</div>
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
                <p>This is a macOS web application simulation.</p>
                <p>Try right-clicking on the desktop or icons for context menus.</p>
                <div class="app-content">
                    <p>🔄 <strong>New in Step 2:</strong></p>
                    <ul>
                        <li>Right-click context menus</li>
                        <li>Window snapping (drag to edges)</li>
                        <li>Notification system</li>
                        <li>Trash functionality</li>
                        <li>Full Finder app</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Enhanced Window Controls
function makeWindowDraggable(windowElement) {
    const titlebar = windowElement.querySelector('.window-titlebar');
    let isDragging = false;
    let offsetX, offsetY;
    let startX, startY;
    let startLeft, startTop;
    
    titlebar.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    function startDrag(e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = windowElement.offsetLeft;
        startTop = windowElement.offsetTop;
        
        windowElement.classList.remove('snapping');
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
    
    function stopDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        
        // Check for snapping
        checkWindowSnapping(windowElement);
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

// Window Snapping
function setupWindowSnapping(windowElement) {
    windowElement.addEventListener('mouseup', () => {
        checkWindowSnapping(windowElement);
    });
}

function checkWindowSnapping(windowElement) {
    const rect = windowElement.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Reset any existing snapping
    windowElement.classList.remove('snapping');
    
    // Check for left/right snapping
    if (rect.left < 50) {
        snapWindow(windowElement, 'left');
    } else if (rect.right > windowWidth - 50) {
        snapWindow(windowElement, 'right');
    }
    
    // Check for top snapping (maximize)
    if (rect.top < 50) {
        snapWindow(windowElement, 'top');
    }
}

function snapWindow(windowElement, edge) {
    windowElement.classList.add('snapping');
    
    switch(edge) {
        case 'left':
            windowElement.style.left = '0';
            windowElement.style.top = '25px';
            windowElement.style.width = '50%';
            windowElement.style.height = 'calc(100% - 25px)';
            windowElement.classList.add('maximized');
            break;
        case 'right':
            windowElement.style.left = '50%';
            windowElement.style.top = '25px';
            windowElement.style.width = '50%';
            windowElement.style.height = 'calc(100% - 25px)';
            windowElement.classList.add('maximized');
            break;
        case 'top':
            windowElement.style.left = '0';
            windowElement.style.top = '25px';
            windowElement.style.width = '100%';
            windowElement.style.height = 'calc(100% - 25px)';
            windowElement.classList.add('maximized');
            break;
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
            windowElement.remove();
            // Remove from open windows
            systemState.openWindows = systemState.openWindows.filter(w => w !== windowElement);
            updateDockIndicators();
        }, 300);
    });
    
    minimizeBtn.addEventListener('click', () => {
        playSystemSound('minimize');
        windowElement.style.animation = 'minimizeToDock 0.3s ease forwards';
        setTimeout(() => {
            windowElement.style.display = 'none';
            showNotification('Window Minimized', 'Window minimized to dock', 'info');
        }, 300);
    });
    
    expandBtn.addEventListener('click', () => {
        if(windowElement.classList.contains('maximized')) {
            // Restore
            windowElement.classList.remove('maximized');
            windowElement.style.width = '400px';
            windowElement.style.height = '300px';
            windowElement.style.left = '100px';
            windowElement.style.top = '100px';
        } else {
            // Maximize
            windowElement.classList.add('maximized');
            windowElement.style.width = '100%';
            windowElement.style.height = 'calc(100% - 25px)';
            windowElement.style.left = '0';
            windowElement.style.top = '25px';
        }
    });
}

function updateDockIndicators() {
    // Clear all running indicators
    dockItems.forEach(item => {
        item.classList.remove('running');
    });
    
    // Set running indicators for open apps
    systemState.openWindows.forEach(window => {
        const appName = window.getAttribute('data-app');
        const dockItem = document.querySelector(`.dock-item[data-app="${appName}"]`);
        if(dockItem) {
            dockItem.classList.add('running');
        }
    });
}

// Mission Control System
function showMissionControl() {
    playSystemSound('mission-control');
    const missionControl = document.getElementById('missionControl');
    missionControl.style.display = 'block';
    
    // Capture current windows for preview
    updateMissionControlPreviews();
    
    // Show dock preview
    updateDockPreview();
    
    // Disable interactions with actual desktop
    document.getElementById('desktop').style.pointerEvents = 'none';
}

function hideMissionControl() {
    const missionControl = document.getElementById('missionControl');
    missionControl.style.display = 'none';
    document.getElementById('desktop').style.pointerEvents = 'auto';
}

function updateMissionControlPreviews() {
    const desktopSpaces = document.querySelectorAll('.desktop-space');
    desktopSpaces.forEach(space => {
        const previewContainer = space.querySelector('.windows-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '';
            
            // For demo, show mock windows. In full version, capture real windows
            const mockWindows = [
                { title: 'Finder', icon: 'fas fa-compass' },
                { title: 'Safari', icon: 'fas fa-globe' },
                { title: 'Notes', icon: 'fas fa-sticky-note' },
                { title: 'Terminal', icon: 'fas fa-terminal' }
            ];
            
            mockWindows.forEach(win => {
                const preview = document.createElement('div');
                preview.className = 'window-preview';
                preview.innerHTML = `
                    <div class="preview-icon" style="text-align: center; font-size: 2rem; margin-bottom: 10px;">
                        <i class="${win.icon}"></i>
                    </div>
                    <div class="preview-title">${win.title}</div>
                `;
                previewContainer.appendChild(preview);
            });
        }
    });
}

function updateDockPreview() {
    const dockPreview = document.querySelector('.dock-preview');
    dockPreview.innerHTML = '';
    
    // Copy dock items to preview
    const dockItems = document.querySelectorAll('.dock-item');
    dockItems.forEach(item => {
        if (!item.querySelector('.dock-separator')) {
            const clone = item.cloneNode(true);
            clone.classList.remove('running', 'active');
            clone.style.transform = 'none';
            clone.addEventListener('click', () => {
                // When clicked in mission control, focus that app
                const appName = clone.getAttribute('data-app');
                if (appName && appName !== 'trash') {
                    hideMissionControl();
                    // Find and focus window for this app
                    const appWindow = document.querySelector(`.app-window[data-app="${appName}"]`);
                    if (appWindow) {
                        appWindow.style.zIndex = getHighestZIndex() + 1;
                    }
                }
            });
            dockPreview.appendChild(clone);
        }
    });
}

// Launchpad System
function showLaunchpad() {
    playSystemSound('launchpad');
    const launchpad = document.getElementById('launchpad');
    launchpad.style.display = 'block';
    populateLaunchpad();
    
    // Focus search input
    setTimeout(() => {
        document.querySelector('.launchpad-search').focus();
    }, 100);
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
        { name: 'Notes', icon: 'fas fa-sticky-note', color: '#ffcc00' },
        { name: 'Terminal', icon: 'fas fa-terminal', color: '#1d1d1f' },
        { name: 'Music', icon: 'fas fa-music', color: '#ff2d55' },
        { name: 'Photos', icon: 'fas fa-images', color: '#5856d6' },
        { name: 'Mail', icon: 'fas fa-envelope', color: '#007aff' },
        { name: 'Calendar', icon: 'fas fa-calendar', color: '#ff3b30' },
        { name: 'Maps', icon: 'fas fa-map', color: '#34c759' },
        { name: 'Weather', icon: 'fas fa-cloud-sun', color: '#5ac8fa' },
        { name: 'Calculator', icon: 'fas fa-calculator', color: '#ff9500' },
        { name: 'Clock', icon: 'fas fa-clock', color: '#1d1d1f' },
        { name: 'System Preferences', icon: 'fas fa-sliders-h', color: '#8e8e93' },
        { name: 'App Store', icon: 'fas fa-shopping-bag', color: '#007aff' }
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
            if (app.name === 'System Preferences') {
                showSystemPreferences();
            } else {
                createAppWindow(app.name.toLowerCase().replace(' ', ''));
            }
        });
        
        appGrid.appendChild(appIcon);
    });
}

// Spotlight Search System
function showSpotlight() {
    playSystemSound('spotlight');
    const spotlight = document.getElementById('spotlight');
    spotlight.style.display = 'block';
    document.getElementById('spotlightInput').focus();
    updateSpotlightResults('');
}

function hideSpotlight() {
    document.getElementById('spotlight').style.display = 'none';
}

function updateSpotlightResults(query) {
    const resultsContainer = document.querySelector('.result-items');
    resultsContainer.innerHTML = '';
    
    const allApps = [
        { name: 'Finder', type: 'Application', icon: 'fas fa-compass' },
        { name: 'Safari', type: 'Application', icon: 'fas fa-globe' },
        { name: 'Notes', type: 'Application', icon: 'fas fa-sticky-note' },
        { name: 'Terminal', type: 'Application', icon: 'fas fa-terminal' },
        { name: 'System Preferences', type: 'System', icon: 'fas fa-sliders-h' },
        { name: 'Mission Control', type: 'System', icon: 'fas fa-th-large' },
        { name: 'Launchpad', type: 'System', icon: 'fas fa-rocket' }
    ];
    
    const filteredApps = allApps.filter(app => 
        app.name.toLowerCase().includes(query.toLowerCase()) ||
        app.type.toLowerCase().includes(query.toLowerCase())
    );
    
    filteredApps.forEach(app => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <div class="result-icon">
                <i class="${app.icon}"></i>
            </div>
            <div class="result-info">
                <div class="result-name">${app.name}</div>
                <div class="result-type">${app.type}</div>
            </div>
        `;
        
        resultItem.addEventListener('click', () => {
            hideSpotlight();
            if (app.name === 'Mission Control') {
                showMissionControl();
            } else if (app.name === 'Launchpad') {
                showLaunchpad();
            } else if (app.name === 'System Preferences') {
                showSystemPreferences();
            } else {
                createAppWindow(app.name.toLowerCase().replace(' ', ''));
            }
        });
        
        resultsContainer.appendChild(resultItem);
    });
}

// System Preferences
function showSystemPreferences() {
    const prefWindow = document.getElementById('preferencesWindow');
    prefWindow.style.display = 'block';
    prefWindow.style.zIndex = getHighestZIndex() + 1;
    
    // Position window
    prefWindow.style.left = '200px';
    prefWindow.style.top = '100px';
    
    // Make draggable
    makeWindowDraggable(prefWindow);
    setupWindowControls(prefWindow);
    
    // Load general panel by default
    loadPreferencePanel('general');
}

function loadPreferencePanel(panelId) {
    const panelContainer = document.getElementById('preferencesPanel');
    
    // Update sidebar active state
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
                <div class="preference-panel active" id="general-panel">
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
                            <div class="color-option" style="background: #ff3b30;" data-color="red"></div>
                            <div class="color-option" style="background: #ff9500;" data-color="orange"></div>
                            <div class="color-option" style="background: #5856d6;" data-color="purple"></div>
                        </div>
                    </div>
                    <div class="preference-item">
                        <label>Highlight Color</label>
                        <select id="highlightSelect">
                            <option>Blue</option>
                            <option>Purple</option>
                            <option>Pink</option>
                            <option>Red</option>
                            <option>Orange</option>
                            <option>Yellow</option>
                            <option>Green</option>
                        </select>
                    </div>
                </div>
            `;
            break;
            
        case 'desktop':
            panelHTML = `
                <div class="preference-panel active" id="desktop-panel">
                    <h2 class="panel-title">Desktop & Dock</h2>
                    <div class="preference-item">
                        <label>Desktop Background</label>
                        <select id="backgroundSelect">
                            <option>Default Gradient</option>
                            <option>Solid Color</option>
                            <option>Dynamic</option>
                        </select>
                    </div>
                    <div class="preference-item">
                        <label>Dock Size</label>
                        <input type="range" id="dockSize" min="20" max="80" value="50">
                    </div>
                    <div class="preference-item">
                        <label>Magnification</label>
                        <input type="range" id="dockMagnification" min="0" max="100" value="20">
                    </div>
                    <div class="preference-item">
                        <label>Position on Screen</label>
                        <select id="dockPosition">
                            <option>Bottom</option>
                            <option>Left</option>
                            <option>Right</option>
                        </select>
                    </div>
                </div>
            `;
            break;
            
        case 'notifications':
            panelHTML = `
                <div class="preference-panel active" id="notifications-panel">
                    <h2 class="panel-title">Notifications</h2>
                    <div class="preference-item">
                        <label>Do Not Disturb</label>
                        <select id="doNotDisturb">
                            <option>Off</option>
                            <option>For 1 hour</option>
                            <option>Until tomorrow</option>
                            <option>On</option>
                        </select>
                    </div>
                    <div class="preference-item">
                        <label>Notification Style</label>
                        <select id="notificationStyle">
                            <option>Banners</option>
                            <option>Alerts</option>
                        </select>
                    </div>
                    <div class="preference-item">
                        <label>Show Preview</label>
                        <select id="showPreview">
                            <option>Always</option>
                            <option>When Unlocked</option>
                            <option>Never</option>
                        </select>
                    </div>
                </div>
            `;
            break;
            
        case 'sound':
            panelHTML = updateSoundPreferencesPanel();
            break;
    }
    
    panelContainer.innerHTML = panelHTML;
    
    // Add event listeners to new elements
    setupPreferenceListeners();
}

function updateSoundPreferencesPanel() {
    return `
        <div class="preference-panel active" id="sound-panel">
            <h2 class="panel-title">Sound</h2>
            <div class="sound-item">
                <label>Output Volume</label>
                <div class="volume-control">
                    <i class="fas fa-volume-off" style="color: #86868b;"></i>
                    <input type="range" class="volume-slider" id="volumeSlider" 
                           min="0" max="100" value="${soundState.volume * 100}">
                    <i class="fas fa-volume-up" style="color: #86868b;"></i>
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
                <label>Sound Effects</label>
                <button class="test-sound-btn" id="testSounds">
                    <i class="fas fa-volume-up"></i> Test System Sounds
                </button>
            </div>
            <div class="sound-item">
                <h4>Sound Events</h4>
                <div style="font-size: 0.9rem; color: #86868b; margin-top: 10px;">
                    <p>• Login/Logout: Classic macOS chime</p>
                    <p>• Clicks: Subtle button feedback</p>
                    <p>• Notifications: Gentle alert tones</p>
                    <p>• Window Actions: Open/close/minimize sounds</p>
                    <p>• System Features: Mission Control, Launchpad, Spotlight</p>
                </div>
            </div>
        </div>
    `;
}

function setupPreferenceListeners() {
    // Color picker
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            const color = this.getAttribute('data-color');
            showNotification('Accent Color', `Changed to ${color}`, 'success');
        });
    });
    
    // Dock size
    const dockSize = document.getElementById('dockSize');
    if (dockSize) {
        dockSize.addEventListener('input', function() {
            const size = 50 + (this.value - 50) * 0.5;
            document.querySelector('.dock-items').style.padding = `8px ${size}px`;
        });
    }
    
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
}

// Hot Corners (Move mouse to corners to trigger actions)
function setupHotCorners() {
    let cornerTimeout;
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Check if mouse is in top-left corner (Mission Control)
        if (x < 50 && y < 50) {
            if (!cornerTimeout) {
                cornerTimeout = setTimeout(() => {
                    showMissionControl();
                    cornerTimeout = null;
                }, 500);
            }
        }
        // Check if mouse is in top-right corner (Notification Center)
        else if (x > width - 50 && y < 50) {
            if (!cornerTimeout) {
                cornerTimeout = setTimeout(() => {
                    document.getElementById('notificationCenter').classList.add('active');
                    cornerTimeout = null;
                }, 500);
            }
        }
        // Check if mouse is in bottom-left corner (Launchpad)
        else if (x < 50 && y > height - 50) {
            if (!cornerTimeout) {
                cornerTimeout = setTimeout(() => {
                    showLaunchpad();
                    cornerTimeout = null;
                }, 500);
            }
        }
        // Check if mouse is in bottom-right corner (Desktop)
        else if (x > width - 50 && y > height - 50) {
            if (!cornerTimeout) {
                cornerTimeout = setTimeout(() => {
                    // Hide all windows
                    document.querySelectorAll('.app-window').forEach(win => {
                        win.style.display = 'none';
                    });
                    showNotification('Show Desktop', 'All windows hidden', 'info');
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

// Show hot corner hint
function showHotCornerHint() {
    const hint = document.createElement('div');
    hint.className = 'hot-corner-hint';
    hint.innerHTML = '💡 Hot Corners Active: Move mouse to screen corners';
    document.getElementById('desktop').appendChild(hint);
    
    setTimeout(() => {
        hint.remove();
    }, 5000);
}

// Safari Browser Functions
function openSafari() {
    const safariWindow = document.getElementById('safariWindow');
    safariWindow.style.display = 'block';
    safariWindow.style.zIndex = getHighestZIndex() + 1;
    
    // Position window
    safariWindow.style.left = '100px';
    safariWindow.style.top = '100px';
    
    // Make draggable
    makeWindowDraggable(safariWindow);
    setupWindowControls(safariWindow);
    
    // Set active app
    systemState.activeApp = 'safari';
    updateDockIndicators();
}

function setupSafariEvents() {
    const safariWindow = document.getElementById('safariWindow');
    
    if (!safariWindow) return;
    
    // Navigation buttons
    document.getElementById('safariBack').addEventListener('click', () => {
        showNotification('Safari', 'Navigating back', 'info');
    });
    
    document.getElementById('safariForward').addEventListener('click', () => {
        showNotification('Safari', 'Navigating forward', 'info');
    });
    
    document.getElementById('safariReload').addEventListener('click', () => {
        showNotification('Safari', 'Reloading page', 'info');
    });
    
    // URL bar
    const urlInput = document.getElementById('safariUrl');
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const url = urlInput.value;
            if (url) {
                showNotification('Safari', `Navigating to ${url}`, 'info');
            }
        }
    });
    
    // Bookmarks
    document.querySelectorAll('.bookmark').forEach(bookmark => {
        bookmark.addEventListener('click', (e) => {
            e.preventDefault();
            const url = bookmark.getAttribute('data-url');
            urlInput.value = url;
            showNotification('Safari', `Navigating to ${url}`, 'info');
        });
    });
    
    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all pages
            document.querySelectorAll('.safari-page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show corresponding page
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
    
    // Close tab button
    document.querySelectorAll('.tab-close').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const tab = this.closest('.tab');
            if (tab && !tab.classList.contains('active')) {
                tab.remove();
            }
        });
    });
    
    // Frequent sites
    document.querySelectorAll('.site').forEach(site => {
        site.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            urlInput.value = url;
            showNotification('Safari', `Opening ${url}`, 'info');
        });
    });
}

// Music App Functions
function openMusic() {
    const musicWindow = document.getElementById('musicWindow');
    musicWindow.style.display = 'block';
    musicWindow.style.zIndex = getHighestZIndex() + 1;
    
    // Position window
    musicWindow.style.left = '150px';
    musicWindow.style.top = '80px';
    
    // Make draggable
    makeWindowDraggable(musicWindow);
    setupWindowControls(musicWindow);
    
    // Set active app
    systemState.activeApp = 'music';
    updateDockIndicators();
    
    // Setup music player
    setupMusicPlayer();
}

function setupMusicPlayer() {
    // Play buttons
    document.querySelectorAll('.music-card').forEach(card => {
        card.addEventListener('click', function() {
            const song = this.getAttribute('data-song');
            playSong(song);
        });
    });
    
    // Player controls
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            const isPlaying = this.classList.contains('playing');
            if (isPlaying) {
                this.classList.remove('playing');
                this.innerHTML = '<i class="fas fa-play"></i>';
                showNotification('Music', 'Playback paused', 'info');
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
        1: { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming' },
        2: { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours' },
        3: { title: 'Shape of You', artist: 'Ed Sheeran', album: '÷' },
        4: { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia' }
    };
    
    const song = songs[songId];
    if (song) {
        // Update now playing display
        document.querySelector('.np-info h3').textContent = song.title;
        document.querySelector('.np-info p').textContent = `${song.artist} · ${song.album}`;
        
        // Set play button to playing state
        const playBtn = document.querySelector('.play-btn');
        playBtn.classList.add('playing');
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        showNotification('Music', `Now playing: ${song.title}`, 'success');
    }
}

// Calculator Functions
function openCalculator() {
    const calcWindow = document.getElementById('calculatorWindow');
    calcWindow.style.display = 'block';
    calcWindow.style.zIndex = getHighestZIndex() + 1;
    
    // Position window
    calcWindow.style.left = '200px';
    calcWindow.style.top = '150px';
    
    // Make draggable
    makeWindowDraggable(calcWindow);
    setupWindowControls(calcWindow);
    
    // Set active app
    systemState.activeApp = 'calculator';
    updateDockIndicators();
    
    // Setup calculator
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
        if (currentInput === '0' || resetScreen) {
            currentInput = number;
            resetScreen = false;
        } else {
            currentInput += number;
        }
    }

    function chooseOperation(op) {
        if (currentInput === '') return;
        
        if (previousInput !== '') {
            compute();
        }
        
        operation = op;
        previousInput = currentInput;
        currentInput = '';
    }

    function compute() {
        let computation;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                computation = prev / current;
                break;
            case '%':
                computation = prev % current;
                break;
            default:
                return;
        }
        
        currentInput = computation.toString();
        operation = undefined;
        previousInput = '';
    }

    function clear() {
        currentInput = '0';
        previousInput = '';
        operation = null;
    }

    function deleteNumber() {
        if (currentInput.length === 1) {
            currentInput = '0';
        } else {
            currentInput = currentInput.slice(0, -1);
        }
    }

    // Add event listeners to calculator buttons
    document.querySelectorAll('.calculator-buttons .calc-btn').forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;
            
            if (button.classList.contains('function')) {
                switch (value) {
                    case 'C':
                        clear();
                        break;
                    case '±':
                        currentInput = (parseFloat(currentInput) * -1).toString();
                        break;
                    case '%':
                        chooseOperation('%');
                        break;
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

// Terminal Functions
function openTerminal() {
    const terminalWindow = document.getElementById('terminalWindow');
    terminalWindow.style.display = 'block';
    terminalWindow.style.zIndex = getHighestZIndex() + 1;
    
    // Position window
    terminalWindow.style.left = '100px';
    terminalWindow.style.top = '120px';
    
    // Make draggable
    makeWindowDraggable(terminalWindow);
    setupWindowControls(terminalWindow);
    
    // Set active app
    systemState.activeApp = 'terminal';
    updateDockIndicators();
    
    // Setup terminal
    setupTerminal();
}

function setupTerminal() {
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.querySelector('.terminal-output');
    
    if (!terminalInput || !terminalOutput) return;
    
    const commands = {
        'help': 'Available commands: help, clear, date, time, echo [text], ls, pwd, about',
        'clear': function() { terminalOutput.innerHTML = ''; return ''; },
        'date': () => new Date().toLocaleDateString(),
        'time': () => new Date().toLocaleTimeString(),
        'echo': (args) => args.join(' '),
        'ls': 'Desktop    Documents    Downloads    Applications',
        'pwd': '/Users/guest/macos-web',
        'about': 'macOS Web v1.0 - A macOS simulation built with HTML, CSS & JavaScript'
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
        
        return `Command not found: ${command}. Type 'help' for available commands.`;
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
            const command = terminalInput.value.trim();
            
            if (command) {
                // Add command to output
                addOutput(`macOS-Web:~ guest$ ${command}`);
                
                // Execute command
                const result = executeCommand(command);
                if (result) {
                    addOutput(result);
                }
                
                // Clear input
                terminalInput.value = '';
            }
            
            e.preventDefault();
        }
    });
    
    // Add initial output
    addOutput('Welcome to macOS Web Terminal');
    addOutput('Type "help" for available commands');
}

// Setup sound events
function setupSoundEvents() {
    // Click sounds for buttons
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || 
            e.target.classList.contains('dock-item') ||
            e.target.classList.contains('desktop-icon') ||
            e.target.classList.contains('menu-item')) {
            playSystemSound('click');
        }
    });
    
    // Trash sounds
    const originalEmptyTrash = emptyTrashBtn?.onclick;
    if (emptyTrashBtn) {
        emptyTrashBtn.onclick = function() {
            playSystemSound('trash');
            if (originalEmptyTrash) originalEmptyTrash.apply(this, arguments);
        };
    }
}

// Utility function
function showFileInfo() {
    if(contextMenuTarget) {
        const itemName = contextMenuTarget.querySelector('.icon-label')?.textContent || 'Unknown Item';
        const itemType = contextMenuTarget.getAttribute('data-app') || 'file';
        
        alert(`File Info:\n\nName: ${itemName}\nType: ${itemType}\n\nCreated: Today\nModified: Today\nSize: --\n\nmacOS Web Simulator`);
    }
}

// Add minimize animation style
const minimizeStyle = document.createElement('style');
minimizeStyle.textContent = `
    @keyframes minimizeToDock {
        0% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        100% {
            opacity: 0;
            transform: scale(0.1) translateY(100px);
        }
    }
`;
document.head.appendChild(minimizeStyle);

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Update time
    updateTime();
    setInterval(updateTime, 60000);
    
    // Load saved sound settings
    const savedVolume = localStorage.getItem('macosSoundVolume');
    const savedMute = localStorage.getItem('macosSoundMuted');
    
    if (savedVolume !== null) {
        soundState.volume = savedVolume / 100;
    }
    if (savedMute !== null) {
        soundState.enabled = !(savedMute === 'true');
    }
    
    // Setup sound system
    setupSoundEvents();
    
    // Unlock system
    unlockBtn.addEventListener('click', unlockMac);
    lockPassword.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') unlockMac();
    });
    
    lockScreen.addEventListener('click', (e) => {
        if(e.target === lockScreen || e.target.classList.contains('unlock-hint')) {
            unlockMac();
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
                // Show/hide trash window
                if(trashWindow.style.display === 'none') {
                    trashWindow.style.display = 'block';
                    trashWindow.style.zIndex = getHighestZIndex() + 1;
                    makeWindowDraggable(trashWindow);
                    setupWindowControls(trashWindow);
                    
                    // Position
                    trashWindow.style.left = '200px';
                    trashWindow.style.top = '100px';
                } else {
                    trashWindow.style.display = 'none';
                }
            });
        } else {
            item.addEventListener('click', () => {
                createAppWindow(appName);
            });
        }
    });
    
    // Context menu
    document.addEventListener('contextmenu', (e) => {
        // Only show on desktop (not on windows or UI elements)
        if(!e.target.closest('.app-window') && !e.target.closest('.menu-bar') && !e.target.closest('.dock')) {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, null);
        }
    });
    
    document.addEventListener('click', () => {
        hideContextMenu();
    });
    
    // Context menu actions
    document.querySelectorAll('.menu-item[data-action]').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            handleContextMenuAction(action);
        });
    });
    
    // Notification center
    document.querySelector('.status-icons').addEventListener('click', (e) => {
        if(e.target.closest('.status-icons')) {
            notificationCenter.classList.toggle('active');
        }
    });
    
    closeNotifications.addEventListener('click', () => {
        notificationCenter.classList.remove('active');
    });
    
    // Trash functionality
    emptyTrashBtn.addEventListener('click', () => {
        if(systemState.trashItems.length === 0) {
            showNotification('Empty Trash', 'Trash is already empty', 'warning');
            return;
        }
        
        if(confirm(`Are you sure you want to permanently delete ${systemState.trashItems.length} item(s)?`)) {
            systemState.trashItems = [];
            updateTrashWindow();
            
            // Update trash dock icon
            const trashDockItem = document.querySelector('.dock-item[data-app="trash"]');
            trashDockItem.innerHTML = '<i class="fas fa-trash"></i>';
            
            showNotification('Trash Emptied', 'All items have been permanently deleted', 'success');
        }
    });
    
    restoreItemBtn.addEventListener('click', () => {
        if(systemState.selectedFile === null) {
            showNotification('Restore Item', 'No item selected', 'warning');
            return;
        }
        
        const item = systemState.trashItems[systemState.selectedFile];
        // Restore the item (in a real app, you'd move it back)
        item.element.style.opacity = '1';
        systemState.trashItems.splice(systemState.selectedFile, 1);
        systemState.selectedFile = null;
        
        updateTrashWindow();
        showNotification('Item Restored', `"${item.name}" restored to its original location`, 'success');
    });
    
    // Mission Control controls
    document.getElementById('exitMission').addEventListener('click', hideMissionControl);
    
    // Launchpad controls
    document.getElementById('exitLaunchpad').addEventListener('click', hideLaunchpad);
    
    // Spotlight controls
    document.getElementById('closeSpotlight').addEventListener('click', hideSpotlight);
    
    // Spotlight search input
    document.getElementById('spotlightInput').addEventListener('input', function(e) {
        updateSpotlightResults(e.target.value);
    });
    
    // System Preferences sidebar
    document.querySelectorAll('.preferences-sidebar .sidebar-item').forEach(item => {
        item.addEventListener('click', function() {
            const panelId = this.getAttribute('data-pref');
            loadPreferencePanel(panelId);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Command + Space for Spotlight
        if (e.metaKey && e.key === ' ') {
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
            if (document.getElementById('notificationCenter').classList.contains('active')) {
                document.getElementById('notificationCenter').classList.remove('active');
            }
            if (document.getElementById('soundTestModal').style.display === 'flex') {
                hideSoundTest();
            }
        }
    });
    
    // Add Mission Control and Launchpad to dock
    const dockItemsContainer = document.querySelector('.dock-items');
    const missionControlDockItem = document.createElement('div');
    missionControlDockItem.className = 'dock-item';
    missionControlDockItem.setAttribute('data-app', 'missioncontrol');
    missionControlDockItem.innerHTML = '<i class="fas fa-th-large"></i>';
    missionControlDockItem.addEventListener('click', showMissionControl);
    
    const launchpadDockItem = document.createElement('div');
    launchpadDockItem.className = 'dock-item';
    launchpadDockItem.setAttribute('data-app', 'launchpad');
    launchpadDockItem.innerHTML = '<i class="fas fa-rocket"></i>';
    launchpadDockItem.addEventListener('click', showLaunchpad);
    
    // Insert before the separator
    const separator = document.querySelector('.dock-separator');
    dockItemsContainer.insertBefore(missionControlDockItem, separator);
    dockItemsContainer.insertBefore(launchpadDockItem, separator);
    
    // Add System Preferences to desktop
    const desktopIconsContainer = document.querySelector('.desktop-icons');
    const prefsIcon = document.createElement('div');
    prefsIcon.className = 'desktop-icon';
    prefsIcon.setAttribute('data-app', 'preferences');
    prefsIcon.innerHTML = `
        <div class="icon-img">
            <i class="fas fa-sliders-h"></i>
        </div>
        <span class="icon-label">System Preferences</span>
    `;
    prefsIcon.addEventListener('dblclick', showSystemPreferences);
    desktopIconsContainer.appendChild(prefsIcon);
    
    // Add Safari, Music, Calculator to desktop icons
    // Safari icon
    const safariIcon = document.createElement('div');
    safariIcon.className = 'desktop-icon';
    safariIcon.setAttribute('data-app', 'safari');
    safariIcon.innerHTML = `
        <div class="icon-img">
            <i class="fas fa-globe"></i>
        </div>
        <span class="icon-label">Safari</span>
    `;
    safariIcon.addEventListener('dblclick', openSafari);
    desktopIconsContainer.appendChild(safariIcon);
    
    // Music icon
    const musicIcon = document.createElement('div');
    musicIcon.className = 'desktop-icon';
    musicIcon.setAttribute('data-app', 'music');
    musicIcon.innerHTML = `
        <div class="icon-img">
            <i class="fas fa-music"></i>
        </div>
        <span class="icon-label">Music</span>
    `;
    musicIcon.addEventListener('dblclick', openMusic);
    desktopIconsContainer.appendChild(musicIcon);
    
    // Calculator icon
    const calculatorIcon = document.createElement('div');
    calculatorIcon.className = 'desktop-icon';
    calculatorIcon.setAttribute('data-app', 'calculator');
    calculatorIcon.innerHTML = `
        <div class="icon-img">
            <i class="fas fa-calculator"></i>
        </div>
        <span class="icon-label">Calculator</span>
    `;
    calculatorIcon.addEventListener('dblclick', openCalculator);
    desktopIconsContainer.appendChild(calculatorIcon);
    
    // Add Safari and Music to dock
    // Safari dock item
    const safariDockItem = document.createElement('div');
    safariDockItem.className = 'dock-item';
    safariDockItem.setAttribute('data-app', 'safari');
    safariDockItem.innerHTML = '<i class="fas fa-globe"></i>';
    safariDockItem.addEventListener('click', openSafari);
    dockItemsContainer.insertBefore(safariDockItem, separator);
    
    // Music dock item
    const musicDockItem = document.createElement('div');
    musicDockItem.className = 'dock-item';
    musicDockItem.setAttribute('data-app', 'music');
    musicDockItem.innerHTML = '<i class="fas fa-music"></i>';
    musicDockItem.addEventListener('click', openMusic);
    dockItemsContainer.insertBefore(musicDockItem, separator);
    
    // Calculator dock item
    const calculatorDockItem = document.createElement('div');
    calculatorDockItem.className = 'dock-item';
    calculatorDockItem.setAttribute('data-app', 'calculator');
    calculatorDockItem.innerHTML = '<i class="fas fa-calculator"></i>';
    calculatorDockItem.addEventListener('click', openCalculator);
    dockItemsContainer.insertBefore(calculatorDockItem, separator);
    
    // Setup hot corners
    setupHotCorners();
    showHotCornerHint();
    
    // Update mission control when windows change
    const observer = new MutationObserver(updateMissionControlPreviews);
    observer.observe(document.getElementById('windowsContainer'), {
        childList: true,
        subtree: true
    });
    
    // Setup Safari events
    setupSafariEvents();
    
    // Sound test modal
    document.getElementById('closeSoundTest').addEventListener('click', hideSoundTest);
    
    // Sound test buttons
    document.querySelectorAll('.sound-test-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sound = this.getAttribute('data-sound');
            playSystemSound(sound);
        });
    });
    
    // Close modal on background click
    document.getElementById('soundTestModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideSoundTest();
        }
    });
    
    // Play login sound on successful unlock
    setTimeout(() => {
        if (desktop.classList.contains('active')) {
            playSystemSound('login');
        }
    }, 1000);
});

function hideContextMenu() {
    contextMenu.style.display = 'none';
    contextMenuTarget = null;
}