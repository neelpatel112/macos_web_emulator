// macOS Web - Menu Bar Functionality
class MenuBar {
    constructor() {
        console.log('🍎 Initializing Menu Bar...');
        this.currentApp = 'finder'; // Default active app
        this.init();
    }
    
    init() {
        this.setupAppleMenu();
        this.setupAppMenus();
        this.setupStatusIcons();
        this.updateMenuForApp();
        this.setupKeyboardShortcuts();
    }
    
    // Apple Menu Actions
    setupAppleMenu() {
        const appleMenu = document.getElementById('appleMenu');
        const dropdownItems = document.querySelectorAll('.apple-dropdown .dropdown-item');
        
        if (appleMenu) {
            appleMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                playSound('click');
            });
        }
        
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleAppleMenuAction(action);
                playSound('click');
            });
        });
    }
    
    handleAppleMenuAction(action) {
        switch(action) {
            case 'about':
                this.showAboutThisMac();
                break;
                
            case 'preferences':
                openApp('preferences');
                break;
                
            case 'app-store':
                if (window.macOSApps && macOSApps.openAppStore) {
                    macOSApps.openAppStore();
                } else {
                    showNotification('App Store', 'App Store simulation opened', 'info', 'fab fa-app-store');
                }
                break;
                
            case 'force-quit':
                this.showForceQuitMenu();
                break;
                
            case 'sleep':
                if (window.sleepMac) sleepMac();
                break;
                
            case 'restart':
                showRestartModal();
                break;
                
            case 'shutdown':
                showShutdownModal();
                break;
                
            case 'lock':
                if (window.lockMac) lockMac();
                break;
                
            case 'logout':
                this.showLogoutDialog();
                break;
                
            default:
                console.log('Apple menu action:', action);
        }
    }
    
    showAboutThisMac() {
        const aboutWindow = document.createElement('div');
        aboutWindow.className = 'app-window';
        aboutWindow.id = 'aboutWindow';
        aboutWindow.style.width = '500px';
        aboutWindow.style.height = '400px';
        aboutWindow.style.left = '50%';
        aboutWindow.style.top = '50%';
        aboutWindow.style.transform = 'translate(-50%, -50%)';
        
        aboutWindow.innerHTML = `
            <div class="window-titlebar">
                <div class="window-controls">
                    <div class="window-control close"></div>
                    <div class="window-control minimize"></div>
                    <div class="window-control expand"></div>
                </div>
                <div class="window-title">About This Mac</div>
            </div>
            <div class="window-content">
                <div class="about-content">
                    <div class="about-header">
                        <div class="macos-logo"></div>
                        <h1>macOS Web</h1>
                    </div>
                    <div class="about-info">
                        <p><strong>Version:</strong> 2.0 (Neel Patel Edition)</p>
                        <p><strong>Created by:</strong> Neel Patel</p>
                        <p><strong>GitHub:</strong> github.com/neelpatel05</p>
                        <p><strong>Technology:</strong> HTML5, CSS3, JavaScript</p>
                        <p><strong>Storage:</strong> Browser Local Storage</p>
                        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                    <div class="about-actions">
                        <button class="about-btn" id="systemReport">System Report...</button>
                        <button class="about-btn" id="softwareUpdate">Software Update...</button>
                    </div>
                    <div class="about-footer">
                        <p>© ${new Date().getFullYear()} Neel Patel. All rights reserved.</p>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('windowsContainer').appendChild(aboutWindow);
        makeWindowDraggable(aboutWindow);
        setupWindowControls(aboutWindow);
        aboutWindow.style.display = 'block';
        
        // Add to running apps
        if (macOSDatabase) {
            macOSDatabase.addRunningApp('about');
        }
        
        // Button actions
        document.getElementById('systemReport').addEventListener('click', () => {
            this.showSystemReport();
            playSound('click');
        });
        
        document.getElementById('softwareUpdate').addEventListener('click', () => {
            showNotification('Software Update', 'Your macOS Web is up to date!', 'success', 'fas fa-check-circle');
            playSound('click');
        });
    }
    
    showSystemReport() {
        showNotification('System Report', 'Generating system information...', 'info', 'fas fa-file-alt');
        
        // Simulate generating report
        setTimeout(() => {
            const report = `
=== System Information ===
Model: macOS Web Emulator
OS Version: 2.0
Browser: ${navigator.userAgent}
Platform: ${navigator.platform}
Storage Used: ${macOSDatabase ? macOSDatabase.getLocalStorageSize() + ' KB' : 'N/A'}
Apps Installed: 6
Files Created: ${macOSDatabase ? macOSDatabase.getFileCount() : 'N/A'}
Last Login: ${new Date().toLocaleString()}
            `;
            
            // Create report window
            macOSApps.createTextEditor('System_Report.txt', report);
        }, 1000);
    }
    
    showForceQuitMenu() {
        const runningApps = macOSDatabase ? macOSDatabase.getAppsData().running : [];
        
        if (runningApps.length === 0) {
            showNotification('Force Quit', 'No applications are running', 'info', 'fas fa-info-circle');
            return;
        }
        
        const forceQuitWindow = document.createElement('div');
        forceQuitWindow.className = 'modal';
        forceQuitWindow.style.display = 'flex';
        
        let appList = '';
        runningApps.forEach(app => {
            let appName = app.charAt(0).toUpperCase() + app.slice(1);
            if (app === 'preferences') appName = 'System Preferences';
            appList += `
                <div class="force-quit-app">
                    <span>${appName}</span>
                    <button class="force-quit-btn" data-app="${app}">Force Quit</button>
                </div>
            `;
        });
        
        forceQuitWindow.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <h3><i class="fas fa-exclamation-triangle"></i> Force Quit Applications</h3>
                <p>If an application isn't responding, you can force it to quit.</p>
                <div class="force-quit-list">
                    ${appList}
                </div>
                <div class="modal-actions">
                    <button id="cancelForceQuit">Cancel</button>
                    <button id="relaunchFinder" style="background: #007aff; color: white;">Relaunch Finder</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(forceQuitWindow);
        
        // Force quit buttons
        forceQuitWindow.querySelectorAll('.force-quit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const app = e.target.getAttribute('data-app');
                this.forceQuitApp(app);
                forceQuitWindow.remove();
                playSound('click');
            });
        });
        
        // Cancel button
        document.getElementById('cancelForceQuit').addEventListener('click', () => {
            forceQuitWindow.remove();
            playSound('click');
        });
        
        // Relaunch Finder
        document.getElementById('relaunchFinder').addEventListener('click', () => {
            // Close all Finder windows
            document.querySelectorAll('.app-window[style*="display: block"]').forEach(window => {
                if (window.id.includes('finder')) {
                    window.style.display = 'none';
                }
            });
            
            // Remove from running apps
            if (macOSDatabase) {
                macOSDatabase.removeRunningApp('finder');
                updateDockIndicator('finder', false);
            }
            
            // Reopen Finder
            setTimeout(() => {
                openApp('finder');
                showNotification('Finder Relaunched', 'Finder has been restarted', 'success', 'fas fa-redo');
            }, 500);
            
            forceQuitWindow.remove();
            playSound('click');
        });
        
        // Close when clicking outside
        forceQuitWindow.addEventListener('click', (e) => {
            if (e.target === forceQuitWindow) {
                forceQuitWindow.remove();
            }
        });
    }
    
    forceQuitApp(appName) {
        // Close all windows of this app
        document.querySelectorAll('.app-window[style*="display: block"]').forEach(window => {
            if (window.id.includes(appName)) {
                window.style.display = 'none';
            }
        });
        
        // Remove from running apps
        if (macOSDatabase) {
            macOSDatabase.removeRunningApp(appName);
            updateDockIndicator(appName, false);
        }
        
        showNotification('Application Quit', `${appName} has been force quit`, 'warning', 'fas fa-exclamation-triangle');
    }
    
    showLogoutDialog() {
        const logoutWindow = document.createElement('div');
        logoutWindow.className = 'modal';
        logoutWindow.style.display = 'flex';
        
        logoutWindow.innerHTML = `
            <div class="modal-content" style="max-width: 350px; text-align: center;">
                <div class="logout-icon">
                    <i class="fas fa-sign-out-alt"></i>
                </div>
                <h3>Log Out Neel Patel?</h3>
                <p>Your apps and windows will close. Make sure your work is saved.</p>
                <div class="logout-options">
                    <label>
                        <input type="checkbox" id="reopenWindows">
                        Reopen windows when logging back in
                    </label>
                </div>
                <div class="modal-actions">
                    <button id="cancelLogout">Cancel</button>
                    <button id="confirmLogout" style="background: #007aff; color: white;">Log Out</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(logoutWindow);
        
        // Cancel
        document.getElementById('cancelLogout').addEventListener('click', () => {
            logoutWindow.remove();
            playSound('click');
        });
        
        // Confirm logout
        document.getElementById('confirmLogout').addEventListener('click', () => {
            const reopenWindows = document.getElementById('reopenWindows').checked;
            
            // Save window state if requested
            if (reopenWindows && macOSDatabase) {
                const windowStates = [];
                document.querySelectorAll('.app-window[style*="display: block"]').forEach(window => {
                    windowStates.push({
                        id: window.id,
                        left: window.style.left,
                        top: window.style.top
                    });
                });
                localStorage.setItem('macos_window_states', JSON.stringify(windowStates));
            }
            
            // Close all windows
            document.querySelectorAll('.app-window[style*="display: block"]').forEach(window => {
                window.style.display = 'none';
                const appName = window.id.replace('Window', '');
                if (macOSDatabase) {
                    macOSDatabase.removeRunningApp(appName);
                    updateDockIndicator(appName, false);
                }
            });
            
            // Lock screen
            if (window.lockMac) {
                lockMac();
            }
            
            logoutWindow.remove();
            playSound('click');
            
            showNotification('Logged Out', 'Successfully logged out', 'info', 'fas fa-sign-out-alt');
        });
        
        // Close when clicking outside
        logoutWindow.addEventListener('click', (e) => {
            if (e.target === logoutWindow) {
                logoutWindow.remove();
            }
        });
    }
    
    // App-specific Menus
    setupAppMenus() {
        // Setup all dropdown items
        const dropdownItems = document.querySelectorAll('.app-menu .dropdown-item');
        
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.currentTarget.classList.contains('disabled')) return;
                
                const action = e.currentTarget.getAttribute('data-action');
                this.handleMenuAction(action);
                playSound('click');
                
                // Close dropdown
                e.currentTarget.closest('.dropdown').style.display = 'none';
            });
        });
        
        // Handle submenu items
        const submenuItems = document.querySelectorAll('.submenu-item');
        submenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const text = e.target.textContent;
                this.handleSubmenuAction(text);
                playSound('click');
            });
        });
    }
    
    handleMenuAction(action) {
        console.log('Menu action:', action);
        
        switch(action) {
            // Finder menu
            case 'about-finder':
                this.showAboutThisMac();
                break;
                
            case 'preferences-finder':
                openApp('preferences');
                break;
                
            case 'empty-trash':
                this.emptyTrash();
                break;
                
            case 'hide-finder':
                this.hideApplication('finder');
                break;
                
            case 'hide-others':
                this.hideOtherApplications();
                break;
                
            case 'show-all':
                this.showAllApplications();
                break;
                
            // File menu
            case 'new-finder-window':
                if (window.macOSUtilities && macOSUtilities.createNewFinderWindow) {
                    macOSUtilities.createNewFinderWindow();
                } else {
                    openApp('finder');
                }
                break;
                
            case 'new-folder':
                this.createNewFolder();
                break;
                
            case 'new-tab':
                showNotification('New Tab', 'New tab created', 'info', 'fas fa-plus');
                break;
                
            case 'open':
                this.openFileDialog();
                break;
                
            case 'close-window':
                if (window.macOSUtilities && macOSUtilities.closeActiveWindow) {
                    macOSUtilities.closeActiveWindow();
                }
                break;
                
            case 'get-info':
                this.showFileInfo();
                break;
                
            case 'duplicate':
                this.duplicateFile();
                break;
                
            // Edit menu
            case 'undo':
                showNotification('Edit', 'Undo last action', 'info', 'fas fa-undo');
                break;
                
            case 'redo':
                showNotification('Edit', 'Redo last action', 'info', 'fas fa-redo');
                break;
                
            case 'cut':
            case 'copy':
            case 'paste':
                showNotification('Edit', `${action.charAt(0).toUpperCase() + action.slice(1)} operation`, 'info', 'fas fa-clipboard');
                break;
                
            case 'select-all':
                showNotification('Edit', 'All items selected', 'info', 'fas fa-mouse-pointer');
                break;
                
            case 'emoji':
                this.showEmojiPicker();
                break;
                
            // View menu
            case 'as-icons':
            case 'as-list':
            case 'as-columns':
            case 'as-gallery':
                this.changeViewMode(action.replace('as-', ''));
                break;
                
            case 'use-stacks':
                this.toggleStacks();
                break;
                
            case 'clean-up':
                this.cleanUpDesktop();
                break;
                
            case 'enter-full-screen':
                this.toggleFullScreen();
                break;
                
            // Window menu
            case 'minimize':
                if (window.macOSUtilities && macOSUtilities.showDesktop) {
                    macOSUtilities.showDesktop();
                }
                break;
                
            case 'zoom':
                this.zoomWindow();
                break;
                
            case 'cycle-through-windows':
                if (window.macOSUtilities && macOSUtilities.showAppSwitcher) {
                    macOSUtilities.showAppSwitcher();
                }
                break;
                
            case 'bring-all-to-front':
                this.bringAllToFront();
                break;
                
            // Help menu
            case 'help-finder':
                this.showHelp();
                break;
                
            case 'send-feedback':
                this.sendFeedback();
                break;
                
            case 'keyboard-shortcuts':
                this.showKeyboardShortcuts();
                break;
                
            case 'visit-website':
                window.open('https://github.com/neelpatel05', '_blank');
                break;
                
            default:
                showNotification('Menu Action', `"${action}" executed`, 'info', 'fas fa-check');
        }
    }
    
    handleSubmenuAction(action) {
        switch(action) {
            case 'Applications':
                showNotification('Recent Items', 'Showing recent applications', 'info', 'fas fa-rocket');
                break;
                
            case 'Documents':
                showNotification('Recent Items', 'Showing recent documents', 'info', 'fas fa-file');
                break;
                
            case 'Clear Menu':
                showNotification('Recent Items', 'Recent items cleared', 'success', 'fas fa-trash');
                break;
                
            default:
                console.log('Submenu action:', action);
        }
    }
    
    // Menu Actions Implementation
    emptyTrash() {
        if (confirm('Are you sure you want to permanently erase the items in the Trash?')) {
            showNotification('Trash Emptied', 'All items in Trash have been permanently deleted', 'warning', 'fas fa-trash');
            playSound('trash');
        }
    }
    
    hideApplication(appName) {
        document.querySelectorAll('.app-window[style*="display: block"]').forEach(window => {
            if (window.id.includes(appName)) {
                window.style.display = 'none';
            }
        });
        showNotification('Application Hidden', `${appName} is now hidden`, 'info', 'fas fa-eye-slash');
    }
    
    hideOtherApplications() {
        const activeApp = this.currentApp;
        document.querySelectorAll('.app-window[style*="display: block"]').forEach(window => {
            if (!window.id.includes(activeApp)) {
                window.style.display = 'none';
            }
        });
        showNotification('Hide Others', 'All other applications are now hidden', 'info', 'fas fa-eye-slash');
    }
    
    showAllApplications() {
        // This would show all hidden windows
        showNotification('Show All', 'All applications are now visible', 'info', 'fas fa-eye');
    }
    
    createNewFolder() {
        const folderName = prompt('Enter folder name:', 'Untitled Folder');
        if (folderName && folderName.trim()) {
            if (macOSDatabase) {
                macOSDatabase.createFolder('/Users/neelpatel/Desktop', folderName.trim());
                showNotification('New Folder', `Created "${folderName}"`, 'success', 'fas fa-folder-plus');
            }
        }
    }
    
    openFileDialog() {
        showNotification('Open File', 'File dialog opened (simulated)', 'info', 'fas fa-folder-open');
        // In a real implementation, you would use <input type="file">
    }
    
    showFileInfo() {
        const infoWindow = document.createElement('div');
        infoWindow.className = 'app-window';
        infoWindow.id = 'infoWindow';
        infoWindow.style.width = '400px';
        infoWindow.style.height = '500px';
        
        infoWindow.innerHTML = `
            <div class="window-titlebar">
                <div class="window-controls">
                    <div class="window-control close"></div>
                    <div class="window-control minimize"></div>
                    <div class="window-control expand"></div>
                </div>
                <div class="window-title">Get Info</div>
            </div>
            <div class="window-content">
                <div class="info-content">
                    <div class="info-header">
                        <div class="info-icon">
                            <i class="fas fa-file"></i>
                        </div>
                        <div class="info-name">
                            <h3>Untitled</h3>
                            <p>Document</p>
                        </div>
                    </div>
                    <div class="info-details">
                        <div class="info-section">
                            <h4>General:</h4>
                            <p><strong>Kind:</strong> Document</p>
                            <p><strong>Size:</strong> Zero KB on disk (zero bytes)</p>
                            <p><strong>Created:</strong> Today, ${new Date().toLocaleTimeString()}</p>
                            <p><strong>Modified:</strong> Today, ${new Date().toLocaleTimeString()}</p>
                        </div>
                        <div class="info-section">
                            <h4>More Info:</h4>
                            <p><strong>Version:</strong> --</p>
                            <p><strong>Comments:</strong> --</p>
                        </div>
                        <div class="info-section">
                            <h4>Sharing & Permissions:</h4>
                            <p>You have custom access</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('windowsContainer').appendChild(infoWindow);
        makeWindowDraggable(infoWindow);
        setupWindowControls(infoWindow);
        infoWindow.style.display = 'block';
        
        if (macOSDatabase) {
            macOSDatabase.addRunningApp('info');
        }
    }
    
    duplicateFile() {
        showNotification('Duplicate', 'File duplicated successfully', 'success', 'fas fa-copy');
    }
    
    showEmojiPicker() {
        const emojiWindow = document.createElement('div');
        emojiWindow.className = 'app-window';
        emojiWindow.id = 'emojiWindow';
        emojiWindow.style.width = '350px';
        emojiWindow.style.height = '450px';
        
        const emojis = ['😀', '😂', '🥰', '😎', '🤔', '😱', '🎉', '🚀', '💻', '🍎', '📱', '💾'];
        
        let emojiGrid = '';
        emojis.forEach(emoji => {
            emojiGrid += `<span class="emoji-item">${emoji}</span>`;
        });
        
        emojiWindow.innerHTML = `
            <div class="window-titlebar">
                <div class="window-controls">
                    <div class="window-control close"></div>
                    <div class="window-control minimize"></div>
                    <div class="window-control expand"></div>
                </div>
                <div class="window-title">Emoji & Symbols</div>
            </div>
            <div class="window-content">
                <div class="emoji-content">
                    <div class="emoji-search">
                        <input type="text" placeholder="Search emoji..." id="emojiSearch">
                    </div>
                    <div class="emoji-categories">
                        <button class="emoji-cat active">Frequently Used</button>
                        <button class="emoji-cat">Smileys</button>
                        <button class="emoji-cat">Objects</button>
                    </div>
                    <div class="emoji-grid">
                        ${emojiGrid}
                    </div>
                    <div class="emoji-preview">
                        <span id="selectedEmoji">😀</span>
                        <span id="emojiName">Grinning Face</span>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('windowsContainer').appendChild(emojiWindow);
        makeWindowDraggable(emojiWindow);
        setupWindowControls(emojiWindow);
        emojiWindow.style.display = 'block';
        
        if (macOSDatabase) {
            macOSDatabase.addRunningApp('emoji');
        }
        
        // Emoji click handler
        emojiWindow.querySelectorAll('.emoji-item').forEach(emoji => {
            emoji.addEventListener('click', (e) => {
                const selected = e.target.textContent;
                document.getElementById('selectedEmoji').textContent = selected;
                showNotification('Emoji Selected', `Emoji ${selected} copied to clipboard`, 'success', 'fas fa-smile');
                playSound('click');
            });
        });
    }
    
    changeViewMode(mode) {
        showNotification('View Mode', `Changed to ${mode} view`, 'info', 'fas fa-th-large');
        // Update checkmarks in menu
        document.querySelectorAll('.view-menu .check').forEach(check => {
            check.style.display = 'none';
        });
        const activeItem = document.querySelector(`[data-action="as-${mode}"] .check`);
        if (activeItem) {
            activeItem.style.display = 'inline';
        }
    }
    
    toggleStacks() {
        showNotification('Stacks', 'Desktop stacks toggled', 'info', 'fas fa-layer-group');
    }
    
    cleanUpDesktop() {
        showNotification('Clean Up', 'Desktop icons organized', 'success', 'fas fa-broom');
    }
    
    toggleFullScreen() {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            }
            showNotification('Full Screen', 'Entered full screen mode', 'info', 'fas fa-expand');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            showNotification('Full Screen', 'Exited full screen mode', 'info', 'fas fa-compress');
        }
    }
    
    zoomWindow() {
        const windows = Array.from(document.querySelectorAll('.app-window[style*="display: block"]'))
            .sort((a, b) => parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0));
        
        if (windows.length > 0) {
            const activeWindow = windows[0];
            if (activeWindow.classList.contains('maximized')) {
                activeWindow.classList.remove('maximized');
                activeWindow.style.width = '400px';
                activeWindow.style.height = '300px';
                activeWindow.style.left = '100px';
                activeWindow.style.top = '100px';
            } else {
                activeWindow.classList.add('maximized');
                activeWindow.style.width = '80%';
                activeWindow.style.height = '80%';
                activeWindow.style.left = '10%';
                activeWindow.style.top = '10%';
            }
            playSound('click');
        }
    }
    
    bringAllToFront() {
        let zIndex = 1000;
        document.querySelectorAll('.app-window[style*="display: block"]').forEach(window => {
            window.style.zIndex = zIndex++;
        });
        showNotification('Windows', 'All windows brought to front', 'info', 'fas fa-window-restore');
    }
    
    showHelp() {
        window.open('https://github.com/neelpatel05/macos-web#readme', '_blank');
    }
    
    sendFeedback() {
        showNotification('Feedback', 'Thank you for your feedback!', 'success', 'fas fa-comment');
        // In real implementation, open email or form
    }
    
    showKeyboardShortcuts() {
        const shortcutsWindow = document.createElement('div');
        shortcutsWindow.className = 'app-window';
        shortcutsWindow.id = 'shortcutsWindow';
        shortcutsWindow.style.width = '500px';
        shortcutsWindow.style.height = '600px';
        
        shortcutsWindow.innerHTML = `
            <div class="window-titlebar">
                <div class="window-controls">
                    <div class="window-control close"></div>
                    <div class="window-control minimize"></div>
                    <div class="window-control expand"></div>
                </div>
                <div class="window-title">Keyboard Shortcuts</div>
            </div>
            <div class="window-content">
                <div class="shortcuts-content">
                    <h3>System Shortcuts</h3>
                    <div class="shortcuts-list">
                        <div class="shortcut-item">
                            <span class="shortcut-keys">⌘ Space</span>
                            <span class="shortcut-desc">Spotlight Search</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys">⌃⌘ Q</span>
                            <span class="shortcut-desc">Lock Screen</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys">⌘ Tab</span>
                            <span class="shortcut-desc">App Switcher</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys">F11</span>
                            <span class="shortcut-desc">Show Desktop</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys">F12</span>
                            <span class="shortcut-desc">Developer Tools</span>
                        </div>
                    </div>
                    
                    <h3>Application Shortcuts</h3>
                    <div class="shortcuts-list">
                        <div class="shortcut-item">
                            <span class="shortcut-keys">⌘ N</span>
                            <span class="shortcut-desc">New Window</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys">⌘ W</span>
                            <span class="shortcut-desc">Close Window</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys">⌘ Q</span>
                            <span class="shortcut-desc">Quit App</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys">⌘ M</span>
                            <span class="shortcut-desc">Minimize</span>
                        </div>
                    </div>
                    
                    <h3>Finder Shortcuts</h3>
                    <div class="shortcuts-list">
                        <div class="shortcut-item">
                            <span class="shortcut-keys">⇧⌘ N</span>
                            <span class="shortcut-desc">New Folder</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys">⌘ I</span>
                            <span class="shortcut-desc">Get Info</span>
                        </div>
                        <div class="shortcut-keys">
                            <span class="shortcut-keys">⌘ D</span>
                            <span class="shortcut-desc">Duplicate</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('windowsContainer').appendChild(shortcutsWindow);
        makeWindowDraggable(shortcutsWindow);
        setupWindowControls(shortcutsWindow);
        shortcutsWindow.style.display = 'block';
        
        if (macOSDatabase) {
            macOSDatabase.addRunningApp('shortcuts');
        }
    }
    
    // Status Icons
    setupStatusIcons() {
        // WiFi icon
        const wifiIcon = document.getElementById('wifiStatus');
        if (wifiIcon) {
            wifiIcon.addEventListener('click', () => {
                this.showNetworkMenu();
                playSound('click');
            });
        }
        
        // Battery icon
        const batteryIcon = document.getElementById('batteryStatus');
        if (batteryIcon) {
            // Simulate battery drain/charge
            setInterval(() => {
                this.updateBatteryIcon(batteryIcon);
            }, 60000); // Update every minute
        }
        
        // Time click
        const timeElement = document.getElementById('desktopTime');
        if (timeElement) {
            timeElement.addEventListener('click', () => {
                this.showDateTimeMenu();
                playSound('click');
            });
        }
    }
    
    showNetworkMenu() {
        const networkMenu = document.createElement('div');
        networkMenu.className = 'context-menu';
        networkMenu.style.position = 'fixed';
        networkMenu.style.right = '20px';
        networkMenu.style.top = '30px';
        
        networkMenu.innerHTML = `
            <div class="context-item">
                <i class="fas fa-wifi" style="color: #34c759;"></i>
                <span>Wi-Fi: Connected</span>
            </div>
            <div class="context-divider"></div>
            <div class="context-item">
                <i class="fas fa-wifi"></i>
                <span>Home Network</span>
                <span class="check">✓</span>
            </div>
            <div class="context-item">
                <i class="fas fa-wifi"></i>
                <span>Office Wi-Fi</span>
            </div>
            <div class="context-item">
                <i class="fas fa-wifi"></i>
                <span>Guest Network</span>
            </div>
            <div class="context-divider"></div>
            <div class="context-item">
                <i class="fas fa-network-wired"></i>
                <span>Network Preferences...</span>
            </div>
        `;
        
        document.body.appendChild(networkMenu);
        
        // Remove menu on click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                networkMenu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 10);
    }
    
    updateBatteryIcon(icon) {
        // Simulate random battery changes for demo
        const levels = [
            { class: 'fa-battery-empty', percent: '10%' },
            { class: 'fa-battery-quarter', percent: '25%' },
            { class: 'fa-battery-half', percent: '50%' },
            { class: 'fa-battery-three-quarters', percent: '75%' },
            { class: 'fa-battery-full', percent: '100%' }
        ];
        
        const randomLevel = levels[Math.floor(Math.random() * levels.length)];
        icon.className = `fas ${randomLevel.class}`;
        icon.title = `Battery: ${randomLevel.percent}`;
    }
    
    showDateTimeMenu() {
        const dateTimeMenu = document.createElement('div');
        dateTimeMenu.className = 'context-menu';
        dateTimeMenu.style.position = 'fixed';
        dateTimeMenu.style.right = '20px';
        dateTimeMenu.style.top = '30px';
        dateTimeMenu.style.minWidth = '200px';
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const dateString = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        dateTimeMenu.innerHTML = `
            <div class="context-item" style="flex-direction: column; align-items: flex-start;">
                <div style="font-size: 1.2rem; font-weight: 500;">${timeString}</div>
                <div style="font-size: 0.8rem; opacity: 0.8;">${dateString}</div>
            </div>
            <div class="context-divider"></div>
            <div class="context-item">
                <i class="fas fa-clock"></i>
                <span>Open Date & Time Preferences...</span>
            </div>
        `;
        
        document.body.appendChild(dateTimeMenu);
        
        // Remove menu on click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                dateTimeMenu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 10);
    }
    
    // Update menu for active app
    updateMenuForApp(appName = 'finder') {
        this.currentApp = appName;
        
        // Hide all app menus
        document.querySelectorAll('.app-menu').forEach(menu => {
            menu.classList.remove('active');
        });
        
        // Show active app menu
        const activeMenu = document.querySelector(`.app-menu[data-app="${appName}"]`);
        if (activeMenu) {
            activeMenu.classList.add('active');
        }
        
        // If no specific app menu, show Finder menu
        if (!activeMenu) {
            const finderMenu = document.querySelector('.app-menu[data-app="finder"]');
            if (finderMenu) {
                finderMenu.classList.add('active');
            }
        }
    }
    
    // Keyboard shortcuts for menu items
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Command key combinations
            if (e.metaKey || e.ctrlKey) {
                switch(e.key.toLowerCase()) {
                    case ',':
                        e.preventDefault();
                        openApp('preferences');
                        playSound('click');
                        break;
                        
                    case 'h':
                        e.preventDefault();
                        this.hideApplication(this.currentApp);
                        playSound('click');
                        break;
                        
                    case 'm':
                        e.preventDefault();
                        if (window.macOSUtilities && macOSUtilities.showDesktop) {
                            macOSUtilities.showDesktop();
                        }
                        playSound('click');
                        break;
                        
                    case 'q':
                        e.preventDefault();
                        if (window.macOSUtilities && macOSUtilities.quitActiveApp) {
                            macOSUtilities.quitActiveApp();
                        }
                        playSound('click');
                        break;
                        
                    case 'i':
                        e.preventDefault();
                        this.showFileInfo();
                        playSound('click');
                        break;
                }
            }
        });
    }
}

// Initialize menu bar
document.addEventListener('DOMContentLoaded', () => {
    window.menuBar = new MenuBar();
    console.log('🍎 Menu Bar initialized!');
    
    // Update menu when app opens
    const originalOpenApp = window.openApp;
    window.openApp = function(appName) {
        const result = originalOpenApp(appName);
        if (window.menuBar) {
            menuBar.updateMenuForApp(appName);
        }
        return result;
    };
});