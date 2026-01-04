// macOS Web Emulator - Enhanced Apps
class MacOSApps {
    constructor() {
        console.log('🚀 Loading enhanced apps...');
        this.init();
    }
    
    init() {
        this.setupSystemPreferences();
        this.setupFinder();
        this.setupSafari();
        this.setupMissionControl();
        this.setupLaunchpad();
    }
    
    // ========== SYSTEM PREFERENCES ==========
    setupSystemPreferences() {
        const prefWindow = document.getElementById('preferencesWindow');
        if (!prefWindow) return;
        
        const prefItems = prefWindow.querySelectorAll('.pref-item');
        
        prefItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const prefType = e.currentTarget.getAttribute('data-pref');
                this.openPreferencePane(prefType);
                playSound('click');
            });
        });
        
        // Create preference panes
        this.createPreferencePanes();
    }
    
    createPreferencePanes() {
        const prefWindow = document.getElementById('preferencesWindow');
        if (!prefWindow) return;
        
        const windowContent = prefWindow.querySelector('.window-content');
        
        // Remove existing content
        const existingContent = windowContent.querySelector('.preferences-content');
        if (existingContent) {
            existingContent.remove();
        }
        
        // Create tabbed interface
        const prefContent = document.createElement('div');
        prefContent.className = 'preferences-content';
        prefContent.innerHTML = `
            <div class="pref-sidebar">
                <div class="pref-sidebar-item active" data-pane="general">
                    <i class="fas fa-sliders-h"></i>
                    <span>General</span>
                </div>
                <div class="pref-sidebar-item" data-pane="desktop">
                    <i class="fas fa-desktop"></i>
                    <span>Desktop & Screen Saver</span>
                </div>
                <div class="pref-sidebar-item" data-pane="sound">
                    <i class="fas fa-volume-up"></i>
                    <span>Sound</span>
                </div>
                <div class="pref-sidebar-item" data-pane="dock">
                    <i class="fas fa-layer-group"></i>
                    <span>Dock & Menu Bar</span>
                </div>
                <div class="pref-sidebar-item" data-pane="notifications">
                    <i class="fas fa-bell"></i>
                    <span>Notifications</span>
                </div>
                <div class="pref-sidebar-item" data-pane="users">
                    <i class="fas fa-user"></i>
                    <span>Users & Groups</span>
                </div>
            </div>
            <div class="pref-panes">
                <div class="pref-pane active" id="pane-general">
                    ${this.createGeneralPane()}
                </div>
                <div class="pref-pane" id="pane-desktop">
                    ${this.createDesktopPane()}
                </div>
                <div class="pref-pane" id="pane-sound">
                    ${this.createSoundPane()}
                </div>
                <div class="pref-pane" id="pane-dock">
                    ${this.createDockPane()}
                </div>
                <div class="pref-pane" id="pane-notifications">
                    ${this.createNotificationsPane()}
                </div>
                <div class="pref-pane" id="pane-users">
                    ${this.createUsersPane()}
                </div>
            </div>
        `;
        
        windowContent.appendChild(prefContent);
        
        // Setup sidebar navigation
        this.setupPreferenceNavigation();
        
        // Load current settings
        this.loadPreferenceSettings();
    }
    
    setupPreferenceNavigation() {
        const sidebarItems = document.querySelectorAll('.pref-sidebar-item');
        const panes = document.querySelectorAll('.pref-pane');
        
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all
                sidebarItems.forEach(i => i.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked
                item.classList.add('active');
                const paneId = item.getAttribute('data-pane');
                document.getElementById(`pane-${paneId}`).classList.add('active');
                
                playSound('click');
            });
        });
    }
    
    createGeneralPane() {
        const settings = macOSDatabase.getSystemSettings();
        
        return `
            <h3>General</h3>
            <div class="pref-section">
                <h4>Appearance</h4>
                <div class="pref-option">
                    <label>Appearance:</label>
                    <select id="theme-select">
                        <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                        <option value="auto" ${settings.theme === 'auto' ? 'selected' : ''}>Auto</option>
                    </select>
                </div>
                <div class="pref-option">
                    <label>Highlight color:</label>
                    <select id="accent-color">
                        <option value="blue" selected>Blue</option>
                        <option value="purple">Purple</option>
                        <option value="pink">Pink</option>
                        <option value="red">Red</option>
                        <option value="orange">Orange</option>
                        <option value="yellow">Yellow</option>
                        <option value="green">Green</option>
                        <option value="graphite">Graphite</option>
                    </select>
                </div>
            </div>
            
            <div class="pref-section">
                <h4>Sidebar Icon Size</h4>
                <div class="pref-option">
                    <label>
                        <input type="radio" name="sidebar-size" value="small" checked>
                        Small
                    </label>
                    <label>
                        <input type="radio" name="sidebar-size" value="medium">
                        Medium
                    </label>
                    <label>
                        <input type="radio" name="sidebar-size" value="large">
                        Large
                    </label>
                </div>
            </div>
            
            <div class="pref-section">
                <h4>Recent Items</h4>
                <div class="pref-option">
                    <label>Show recent items in Dock:</label>
                    <select id="recent-items">
                        <option value="none">None</option>
                        <option value="5" selected>5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                    </select>
                </div>
            </div>
            
            <div class="pref-actions">
                <button class="pref-btn" id="save-general">Apply Changes</button>
                <button class="pref-btn secondary" id="reset-general">Reset to Defaults</button>
            </div>
        `;
    }
    
    createDesktopPane() {
        const settings = macOSDatabase.getSystemSettings();
        const wallpapers = [
            { id: 'default', name: 'Default', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba' },
            { id: 'bigsur', name: 'Big Sur', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' },
            { id: 'monterey', name: 'Monterey', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b' },
            { id: 'sonoma', name: 'Sonoma', url: 'https://images.unsplash.com/photo-1516542076529-1ea3854896f2' },
            { id: 'abstract', name: 'Abstract', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031' },
            { id: 'nature', name: 'Nature', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e' }
        ];
        
        const wallpaperOptions = wallpapers.map(wp => `
            <div class="wallpaper-option ${wp.url === settings.desktopWallpaper ? 'selected' : ''}" 
                 data-url="${wp.url}" data-id="${wp.id}">
                <div class="wallpaper-preview" style="background-image: url('${wp.url}?auto=format&fit=crop&w=150&h=100')"></div>
                <span class="wallpaper-name">${wp.name}</span>
            </div>
        `).join('');
        
        return `
            <h3>Desktop & Screen Saver</h3>
            
            <div class="pref-section">
                <h4>Desktop Picture</h4>
                <div class="wallpaper-grid">
                    ${wallpaperOptions}
                </div>
                <button class="pref-btn small" id="add-wallpaper">Add Wallpaper...</button>
            </div>
            
            <div class="pref-section">
                <h4>Screen Saver</h4>
                <div class="pref-option">
                    <label>Start after:</label>
                    <select id="screensaver-time">
                        <option value="1">1 minute</option>
                        <option value="5">5 minutes</option>
                        <option value="10" selected>10 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                    </select>
                </div>
                
                <div class="pref-option">
                    <label>Screen Saver:</label>
                    <select id="screensaver-type">
                        <option value="flurry">Flurry</option>
                        <option value="aerial">Aerial</option>
                        <option value="ribbons">Ribbons</option>
                        <option value="shell">Shell</option>
                        <option value="random">Random</option>
                    </select>
                </div>
            </div>
            
            <div class="pref-actions">
                <button class="pref-btn" id="save-desktop">Apply</button>
            </div>
        `;
    }
    
    createSoundPane() {
        const settings = macOSDatabase.getSystemSettings();
        
        return `
            <h3>Sound</h3>
            
            <div class="pref-section">
                <h4>Sound Effects</h4>
                <div class="pref-option">
                    <label>
                        <input type="checkbox" id="sound-effects" ${settings.soundEnabled ? 'checked' : ''}>
                        Play sound effects
                    </label>
                </div>
                
                <div class="pref-option">
                    <label>
                        <input type="checkbox" id="startup-sound" ${settings.startupSound ? 'checked' : ''}>
                        Play startup sound
                    </label>
                </div>
                
                <div class="pref-option">
                    <label>Alert sound:</label>
                    <select id="alert-sound">
                        <option value="default">Default</option>
                        <option value="basso">Basso</option>
                        <option value="blow">Blow</option>
                        <option value="bottle">Bottle</option>
                        <option value="frog">Frog</option>
                        <option value="funk">Funk</option>
                    </select>
                </div>
                
                <div class="pref-option">
                    <label>Alert volume:</label>
                    <input type="range" id="alert-volume" min="0" max="100" value="70">
                    <span id="volume-value">70%</span>
                </div>
            </div>
            
            <div class="pref-section">
                <h4>Output</h4>
                <div class="pref-option">
                    <label>Output device:</label>
                    <select id="output-device">
                        <option value="internal">Internal Speakers</option>
                        <option value="headphones">Headphones</option>
                        <option value="bluetooth">Bluetooth</option>
                    </select>
                </div>
                
                <div class="pref-option">
                    <label>Balance:</label>
                    <input type="range" id="balance" min="0" max="100" value="50">
                </div>
            </div>
            
            <div class="pref-actions">
                <button class="pref-btn" id="save-sound">Apply</button>
                <button class="pref-btn secondary" id="test-sound">Test Sound</button>
            </div>
        `;
    }
    
    createDockPane() {
        const settings = macOSDatabase.getSystemSettings();
        
        return `
            <h3>Dock & Menu Bar</h3>
            
            <div class="pref-section">
                <h4>Dock Size</h4>
                <div class="pref-option">
                    <input type="range" id="dock-size" min="20" max="80" value="${settings.dockSize === 'small' ? 30 : settings.dockSize === 'medium' ? 50 : 70}">
                </div>
                
                <div class="pref-option">
                    <label>
                        <input type="checkbox" id="dock-magnification">
                        Magnification
                    </label>
                </div>
                
                <div class="pref-option">
                    <label>Minimize effect:</label>
                    <select id="minimize-effect">
                        <option value="genie">Genie</option>
                        <option value="scale">Scale</option>
                        <option value="suck">Suck</option>
                    </select>
                </div>
                
                <div class="pref-option">
                    <label>Position on screen:</label>
                    <select id="dock-position">
                        <option value="bottom" ${settings.dockPosition === 'bottom' ? 'selected' : ''}>Bottom</option>
                        <option value="left" ${settings.dockPosition === 'left' ? 'selected' : ''}>Left</option>
                        <option value="right" ${settings.dockPosition === 'right' ? 'selected' : ''}>Right</option>
                    </select>
                </div>
                
                <div class="pref-option">
                    <label>
                        <input type="checkbox" id="auto-hide-dock">
                        Automatically hide and show the Dock
                    </label>
                </div>
            </div>
            
            <div class="pref-section">
                <h4>Menu Bar</h4>
                <div class="pref-option">
                    <label>
                        <input type="checkbox" id="auto-hide-menubar">
                        Automatically hide and show the menu bar
                    </label>
                </div>
                
                <div class="pref-option">
                    <label>Clock format:</label>
                    <select id="clock-format">
                        <option value="12h">12-hour</option>
                        <option value="24h">24-hour</option>
                        <option value="digital">Digital</option>
                        <option value="analog">Analog</option>
                    </select>
                </div>
            </div>
            
            <div class="pref-actions">
                <button class="pref-btn" id="save-dock">Apply</button>
            </div>
        `;
    }
    
    createNotificationsPane() {
        const notificationData = macOSDatabase.getNotifications();
        
        return `
            <h3>Notifications</h3>
            
            <div class="pref-section">
                <h4>Do Not Disturb</h4>
                <div class="pref-option">
                    <label>
                        <input type="checkbox" id="do-not-disturb" ${notificationData.settings.doNotDisturb ? 'checked' : ''}>
                        Enable Do Not Disturb
                    </label>
                </div>
                
                <div class="pref-option">
                    <label>Schedule:</label>
                    <select id="dnd-schedule">
                        <option value="never">Never</option>
                        <option value="night">At night (10 PM - 7 AM)</option>
                        <option value="custom">Custom schedule</option>
                    </select>
                </div>
            </div>
            
            <div class="pref-section">
                <h4>Notification Style</h4>
                <div class="pref-option">
                    <label>Notification style:</label>
                    <select id="notification-style">
                        <option value="banners">Banners</option>
                        <option value="alerts">Alerts</option>
                    </select>
                </div>
                
                <div class="pref-option">
                    <label>
                        <input type="checkbox" id="notification-sound" ${notificationData.settings.sound ? 'checked' : ''}>
                        Play sound for notifications
                    </label>
                </div>
                
                <div class="pref-option">
                    <label>
                        <input type="checkbox" id="notification-badges" checked>
                        Show badges on app icons
                    </label>
                </div>
            </div>
            
            <div class="pref-section">
                <h4>App Notifications</h4>
                <div class="app-notifications-list">
                    <div class="app-notification-item">
                        <i class="fas fa-compass"></i>
                        <span>Finder</span>
                        <select class="app-notification-setting">
                            <option value="allow">Allow</option>
                            <option value="banners">Banners</option>
                            <option value="alerts">Alerts</option>
                            <option value="none">None</option>
                        </select>
                    </div>
                    <div class="app-notification-item">
                        <i class="fas fa-music"></i>
                        <span>Music</span>
                        <select class="app-notification-setting">
                            <option value="allow">Allow</option>
                            <option value="banners" selected>Banners</option>
                            <option value="alerts">Alerts</option>
                            <option value="none">None</option>
                        </select>
                    </div>
                    <div class="app-notification-item">
                        <i class="fas fa-terminal"></i>
                        <span>Terminal</span>
                        <select class="app-notification-setting">
                            <option value="allow">Allow</option>
                            <option value="banners">Banners</option>
                            <option value="alerts">Alerts</option>
                            <option value="none" selected>None</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="pref-actions">
                <button class="pref-btn" id="save-notifications">Apply</button>
                <button class="pref-btn secondary" id="test-notification">Test Notification</button>
            </div>
        `;
    }
    
    createUsersPane() {
        const user = macOSDatabase.getUser();
        
        return `
            <h3>Users & Groups</h3>
            
            <div class="pref-section">
                <h4>Current User</h4>
                <div class="user-profile-large">
                    <div class="user-avatar-large">${user.avatar}</div>
                    <div class="user-info">
                        <h4>${user.username}</h4>
                        <p>Admin</p>
                    </div>
                </div>
                
                <div class="pref-option">
                    <button class="pref-btn" id="change-password">Change Password...</button>
                    <button class="pref-btn secondary" id="edit-profile">Edit Profile...</button>
                </div>
            </div>
            
            <div class="pref-section">
                <h4>Login Options</h4>
                <div class="pref-option">
                    <label>
                        <input type="checkbox" id="auto-login" checked>
                        Automatically log in as ${user.username}
                    </label>
                </div>
                
                <div class="pref-option">
                    <label>Show password hints:</label>
                    <select id="password-hints">
                        <option value="always">Always</option>
                        <option value="3" selected>After 3 attempts</option>
                        <option value="never">Never</option>
                    </select>
                </div>
            </div>
            
            <div class="pref-section">
                <h4>Other Users</h4>
                <div class="user-list">
                    <div class="user-item">
                        <i class="fas fa-user-friends"></i>
                        <span>Guest User</span>
                        <span class="user-status">Disabled</span>
                    </div>
                    <div class="user-item">
                        <i class="fas fa-plus-circle"></i>
                        <span>Add New User...</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    loadPreferenceSettings() {
        // Load and apply current settings to UI
        const settings = macOSDatabase.getSystemSettings();
        
        // Setup event listeners for each pane
        this.setupGeneralPaneEvents();
        this.setupDesktopPaneEvents();
        this.setupSoundPaneEvents();
        this.setupDockPaneEvents();
        this.setupNotificationsPaneEvents();
        this.setupUsersPaneEvents();
    }
    
    setupGeneralPaneEvents() {
        const saveBtn = document.getElementById('save-general');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const theme = document.getElementById('theme-select').value;
                const settings = macOSDatabase.getSystemSettings();
                settings.theme = theme;
                macOSDatabase.updateSystemSettings(settings);
                
                // Apply theme immediately
                document.body.classList.toggle('dark-theme', theme === 'dark');
                
                showNotification('Settings Updated', 'General preferences saved');
                playSound('click');
            });
        }
    }
    
    setupDesktopPaneEvents() {
        // Wallpaper selection
        const wallpaperOptions = document.querySelectorAll('.wallpaper-option');
        wallpaperOptions.forEach(option => {
            option.addEventListener('click', () => {
                wallpaperOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                
                const wallpaperUrl = option.getAttribute('data-url');
                const settings = macOSDatabase.getSystemSettings();
                settings.desktopWallpaper = wallpaperUrl;
                macOSDatabase.updateSystemSettings(settings);
                
                // Apply wallpaper
                const desktop = document.getElementById('desktop');
                if (desktop) {
                    desktop.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('${wallpaperUrl}')`;
                }
                
                showNotification('Wallpaper Changed', 'Desktop background updated');
                playSound('click');
            });
        });
    }
    
    setupSoundPaneEvents() {
        const testBtn = document.getElementById('test-sound');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                playSound('notification');
                showNotification('Sound Test', 'Test sound played successfully');
            });
        }
    }
    
    setupDockPaneEvents() {
        const saveBtn = document.getElementById('save-dock');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const position = document.getElementById('dock-position').value;
                const settings = macOSDatabase.getSystemSettings();
                settings.dockPosition = position;
                macOSDatabase.updateSystemSettings(settings);
                
                showNotification('Dock Settings', `Dock position set to ${position}`);
                playSound('click');
            });
        }
    }
    
    setupNotificationsPaneEvents() {
        const testBtn = document.getElementById('test-notification');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                macOSDatabase.addNotification('Test Notification', 'This is a test notification from System Preferences', 'info', 'fas fa-cog');
                showNotification('Test Sent', 'Test notification created');
                playSound('notification');
            });
        }
    }
    
    setupUsersPaneEvents() {
        const changePassBtn = document.getElementById('change-password');
        if (changePassBtn) {
            changePassBtn.addEventListener('click', () => {
                const newPass = prompt('Enter new password (or leave empty):', 'macos');
                if (newPass !== null) {
                    showNotification('Password Changed', 'Password updated successfully');
                    playSound('click');
                }
            });
        }
    }
    
    openPreferencePane(paneType) {
        console.log('Opening preference pane:', paneType);
        // Already handled by sidebar navigation
    }
    
    // ========== ENHANCED FINDER ==========
    setupFinder() {
        // Additional finder functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('.finder-file')) {
                const fileItem = e.target.closest('.finder-file');
                const fileName = fileItem.querySelector('span').textContent;
                
                if (fileName === 'New Folder') {
                    // Already handled
                } else if (fileName.includes('.txt') || fileName.includes('.md')) {
                    this.openTextFile(fileName);
                }
            }
        });
    }
    
    openTextFile(filename) {
        const fileSystem = macOSDatabase.getFileSystem();
        let fileContent = 'File not found';
        
        // Search for file in desktop
        if (fileSystem.home.children.desktop.children[filename]) {
            fileContent = fileSystem.home.children.desktop.children[filename].content;
        }
        
        // Create text editor window
        this.createTextEditor(filename, fileContent);
    }
    
    createTextEditor(filename, content) {
        const editorId = `editor-${Date.now()}`;
        const editorWindow = document.createElement('div');
        editorWindow.className = 'app-window';
        editorWindow.id = editorId;
        editorWindow.style.width = '600px';
        editorWindow.style.height = '500px';
        editorWindow.style.left = '100px';
        editorWindow.style.top = '100px';
        
        editorWindow.innerHTML = `
            <div class="window-titlebar">
                <div class="window-controls">
                    <div class="window-control close"></div>
                    <div class="window-control minimize"></div>
                    <div class="window-control expand"></div>
                </div>
                <div class="window-title">${filename} - TextEdit</div>
            </div>
            <div class="window-content">
                <div class="textedit-toolbar">
                    <button class="textedit-btn"><i class="fas fa-save"></i> Save</button>
                    <button class="textedit-btn"><i class="fas fa-print"></i> Print</button>
                    <button class="textedit-btn"><i class="fas fa-search"></i> Find</button>
                </div>
                <textarea class="textedit-area" placeholder="Type your text here...">${content}</textarea>
                <div class="textedit-status">
                    <span>Characters: ${content.length}</span>
                    <span>Lines: ${content.split('\n').length}</span>
                </div>
            </div>
        `;
        
        document.getElementById('windowsContainer').appendChild(editorWindow);
        
        // Make draggable
        makeWindowDraggable(editorWindow);
        setupWindowControls(editorWindow);
        
        // Add save functionality
        const saveBtn = editorWindow.querySelector('.textedit-btn');
        const textarea = editorWindow.querySelector('.textedit-area');
        
        saveBtn.addEventListener('click', () => {
            const newContent = textarea.value;
            // Update file in database
            const fileSystem = macOSDatabase.getFileSystem();
            if (fileSystem.home.children.desktop.children[filename]) {
                fileSystem.home.children.desktop.children[filename].content = newContent;
                fileSystem.home.children.desktop.children[filename].modified = new Date().toISOString();
                fileSystem.home.children.desktop.children[filename].size = newContent.length;
                macOSDatabase.updateFileSystem(fileSystem);
                
                showNotification('File Saved', `${filename} updated successfully`);
                playSound('click');
            }
        });
        
        // Show window
        editorWindow.style.display = 'block';
        macOSDatabase.addRunningApp('textedit');
    }
    
    // ========== ENHANCED SAFARI ==========
    setupSafari() {
        const safariWindow = document.getElementById('safariWindow');
        if (!safariWindow) return;
        
        const safariContent = safariWindow.querySelector('.safari-content');
        if (!safariContent) return;
        
        // Replace content with enhanced version
        safariContent.innerHTML = `
            <div class="safari-toolbar">
                <div class="safari-nav">
                    <button class="safari-btn"><i class="fas fa-chevron-left"></i></button>
                    <button class="safari-btn"><i class="fas fa-chevron-right"></i></button>
                    <button class="safari-btn"><i class="fas fa-redo"></i></button>
                    <div class="safari-url-bar">
                        <i class="fas fa-lock"></i>
                        <input type="text" value="https://www.apple.com" id="safari-url">
                        <button class="safari-go-btn">Go</button>
                    </div>
                    <button class="safari-btn"><i class="fas fa-share"></i></button>
                </div>
            </div>
            <div class="safari-view">
                <div class="safari-favorites">
                    <h4>Favorites</h4>
                    <div class="favorite-sites">
                        <div class="favorite-site" data-url="https://www.apple.com">
                            <i class="fab fa-apple"></i>
                            <span>Apple</span>
                        </div>
                        <div class="favorite-site" data-url="https://www.google.com">
                            <i class="fab fa-google"></i>
                            <span>Google</span>
                        </div>
                        <div class="favorite-site" data-url="https://github.com">
                            <i class="fab fa-github"></i>
                            <span>GitHub</span>
                        </div>
                        <div class="favorite-site" data-url="https://vercel.com">
                            <i class="fas fa-cloud"></i>
                            <span>Vercel</span>
                        </div>
                    </div>
                </div>
                <div class="safari-webview">
                    <div class="webview-placeholder">
                        <i class="fab fa-safari"></i>
                        <h3>Safari Browser</h3>
                        <p>Enter a URL or click a favorite to browse</p>
                        <p class="hint">Note: This is a simulated browser. Real browsing requires backend integration.</p>
                    </div>
                </div>
            </div>
        `;
        
        // Setup Safari functionality
        this.setupSafariEvents();
    }
    
    setupSafariEvents() {
        const safariWindow = document.getElementById('safariWindow');
        if (!safariWindow) return;
        
        // Favorite site clicks
        const favoriteSites = safariWindow.querySelectorAll('.favorite-site');
        favoriteSites.forEach(site => {
            site.addEventListener('click', () => {
                const url = site.getAttribute('data-url');
                document.getElementById('safari-url').value = url;
                this.navigateSafari(url);
                playSound('click');
            });
        });
        
        // Go button
        const goBtn = safariWindow.querySelector('.safari-go-btn');
        const urlInput = document.getElementById('safari-url');
        
        goBtn.addEventListener('click', () => {
            const url = urlInput.value;
            this.navigateSafari(url);
        });
        
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const url = urlInput.value;
                this.navigateSafari(url);
            }
        });
    }
    
    navigateSafari(url) {
        const safariWindow = document.getElementById('safariWindow');
        if (!safariWindow) return;
        
        const webview = safariWindow.querySelector('.safari-webview');
        const placeholder = safariWindow.querySelector('.webview-placeholder');
        
        // Show loading
        placeholder.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <h3>Loading...</h3>
            <p>${url}</p>
        `;
        
        // Simulate navigation
        setTimeout(() => {
            if (url.includes('apple.com')) {
                placeholder.innerHTML = `
                    <div class="website-preview apple">
                        <h3><i class="fab fa-apple"></i> Apple</h3>
                        <p>Welcome to Apple.com simulation</p>
                        <p>This is a simulated view. In a real implementation, this would show the actual website.</p>
                    </div>
                `;
            } else if (url.includes('google.com')) {
                placeholder.innerHTML = `
                    <div class="website-preview google">
                        <h3><i class="fab fa-google"></i> Google</h3>
                        <div class="google-search">
                            <div class="google-logo">Google</div>
                            <input type="text" placeholder="Search Google or type a URL">
                        </div>
                    </div>
                `;
            } else {
                placeholder.innerHTML = `
                    <div class="website-preview">
                        <h3>Website Preview</h3>
                        <p>${url}</p>
                        <p class="hint">This is a simulated browser view. Real websites cannot be loaded without backend integration.</p>
                    </div>
                `;
            }
            
            showNotification('Safari', `Navigated to ${url}`);
            playSound('click');
        }, 1000);
    }
    
    // ========== ENHANCED MISSION CONTROL ==========
    setupMissionControl() {
        const missionControl = document.getElementById('missionControl');
        if (!missionControl) return;
        
        // Add more desktops
        const desktopsContainer = missionControl.querySelector('.desktops-container');
        if (!desktopsContainer) return;
        
        // Clear existing (keep first two)
        const existingDesktops = desktopsContainer.querySelectorAll('.desktop-space');
        if (existingDesktops.length > 2) {
            for (let i = 2; i < existingDesktops.length; i++) {
                existingDesktops[i].remove();
            }
        }
        
        // Add more desktop spaces
        for (let i = 3; i <= 4; i++) {
            const desktopSpace = document.createElement('div');
            desktopSpace.className = 'desktop-space';
            desktopSpace.setAttribute('data-desktop', i.toString());
            desktopSpace.innerHTML = `
                <div class="desktop-label">Desktop ${i}</div>
                <div class="add-desktop">+</div>
            `;
            
            desktopSpace.addEventListener('click', () => {
                if (desktopSpace.querySelector('.add-desktop')) {
                    this.addWindowsToDesktop(desktopSpace);
                }
            });
            
            desktopsContainer.appendChild(desktopSpace);
        }
    }
    
    addWindowsToDesktop(desktopSpace) {
        const windowsPreview = document.createElement('div');
        windowsPreview.className = 'windows-preview';
        
        // Add some window previews
        const windowPreviews = [
            { app: 'Finder', icon: 'fas fa-compass', color: '#007aff' },
            { app: 'Safari', icon: 'fas fa-globe', color: '#34c759' },
            { app: 'Music', icon: 'fas fa-music', color: '#ff2d55' }
        ];
        
        windowPreviews.forEach(preview => {
            const windowPreview = document.createElement('div');
            windowPreview.className = 'window-preview';
            windowPreview.innerHTML = `
                <div class="window-preview-header" style="background: ${preview.color}">
                    <i class="${preview.icon}"></i>
                </div>
                <div class="window-preview-title">${preview.app}</div>
            `;
            windowsPreview.appendChild(windowPreview);
        });
        
        desktopSpace.innerHTML = `
            <div class="desktop-label">${desktopSpace.querySelector('.desktop-label').textContent}</div>
        `;
        desktopSpace.appendChild(windowsPreview);
    }
    
    // ========== ENHANCED LAUNCHPAD ==========
    setupLaunchpad() {
        const launchpad = document.getElementById('launchpad');
        if (!launchpad) return;
        
        const appGrid = launchpad.querySelector('.app-grid');
        if (!appGrid) return;
        
        // Clear existing
        appGrid.innerHTML = '';
        
        // Add apps
        const apps = [
            { name: 'Finder', icon: 'fas fa-compass', color: '#007aff' },
            { name: 'Safari', icon: 'fas fa-globe', color: '#34c759' },
            { name: 'Music', icon: 'fas fa-music', color: '#ff2d55' },
            { name: 'Calculator', icon: 'fas fa-calculator', color: '#ff9500' },
            { name: 'Terminal', icon: 'fas fa-terminal', color: '#1d1d1f' },
            { name: 'System Preferences', icon: 'fas fa-sliders-h', color: '#8e8e93' },
            { name: 'App Store', icon: 'fab fa-app-store', color: '#007aff' },
            { name: 'Messages', icon: 'fas fa-comment', color: '#34c759' },
            { name: 'Mail', icon: 'fas fa-envelope', color: '#ff9500' },
            { name: 'Calendar', icon: 'fas fa-calendar', color: '#ff2d55' },
            { name: 'Photos', icon: 'fas fa-images', color: '#5856d6' },
            { name: 'Notes', icon: 'fas fa-sticky-note', color: '#ffcc00' }
        ];
        
        apps.forEach(app => {
            const appItem = document.createElement('div');
            appItem.className = 'launchpad-app';
            appItem.innerHTML = `
                <div class="launchpad-app-icon" style="background: ${app.color}">
                    <i class="${app.icon}"></i>
                </div>
                <span class="launchpad-app-name">${app.name}</span>
            `;
            
            appItem.addEventListener('click', () => {
                if (app.name === 'System Preferences') {
                    openApp('preferences');
                } else if (app.name === 'App Store') {
                    this.openAppStore();
                } else if (app.name === 'Messages') {
                    this.openMessages();
                } else if (app.name === 'Mail') {
                    this.openMail();
                } else if (app.name === 'Calendar') {
                    this.openCalendar();
                } else if (app.name === 'Photos') {
                    this.openPhotos();
                } else if (app.name === 'Notes') {
                    this.openNotes();
                } else {
                    // Default apps
                    const appName = app.name.toLowerCase().replace(/\s+/g, '');
                    if (document.getElementById(appName + 'Window')) {
                        openApp(appName);
                    }
                }
                
                hideLaunchpad();
                playSound('click');
            });
            
            appGrid.appendChild(appItem);
        });
    }
    
    openAppStore() {
        macOSDatabase.addNotification('App Store', 'App Store requires backend integration for real functionality', 'info', 'fab fa-app-store');
        showNotification('App Store', 'Simulated App Store opened');
    }
    
    openMessages() {
        macOSDatabase.addNotification('Messages', 'Messaging requires backend integration', 'info', 'fas fa-comment');
        showNotification('Messages', 'Simulated Messages app opened');
    }
    
    openMail() {
        macOSDatabase.addNotification('Mail', 'Email functionality requires backend server', 'info', 'fas fa-envelope');
        showNotification('Mail', 'Simulated Mail app opened');
    }
    
    openCalendar() {
        macOSDatabase.addNotification('Calendar', 'Calendar data saved locally', 'info', 'fas fa-calendar');
        showNotification('Calendar', 'Simulated Calendar opened');
    }
    
    openPhotos() {
        macOSDatabase.addNotification('Photos', 'Photo gallery saved in browser storage', 'info', 'fas fa-images');
        showNotification('Photos', 'Simulated Photos app opened');
    }
    
    openNotes() {
        macOSDatabase.addNotification('Notes', 'Notes are saved in your browser', 'info', 'fas fa-sticky-note');
        showNotification('Notes', 'Simulated Notes app opened');
        
        // Create a notes window
        this.createTextEditor('Untitled Note.txt', '');
    }
}

// Initialize enhanced apps
document.addEventListener('DOMContentLoaded', () => {
    window.macOSApps = new MacOSApps();
    console.log('🚀 Enhanced apps loaded!');
});