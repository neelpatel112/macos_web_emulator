// macOS Web Emulator - Advanced Utilities
class MacOSUtilities {
    constructor() {
        console.log('⚙️ Loading macOS Utilities...');
        this.init();
    }
    
    init() {
        this.setupContextMenu();
        this.setupKeyboardShortcuts();
        this.setupFileDragDrop();
        this.setupAnimations();
        this.setupPerformance();
        this.setupAccessibility();
    }
    
    // ========== CONTEXT MENU ==========
    setupContextMenu() {
        // Desktop context menu
        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, 'desktop');
            });
        }
        
        // App window context menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.app-window')) {
                e.preventDefault();
                this.showContextMenu(e, 'window');
            }
        });
        
        // Close context menu on click
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }
    
    showContextMenu(e, type) {
        this.hideContextMenu();
        
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.position = 'fixed';
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        menu.style.zIndex = '100000';
        
        if (type === 'desktop') {
            menu.innerHTML = `
                <div class="context-item" data-action="new-folder">
                    <i class="fas fa-folder-plus"></i>
                    <span>New Folder</span>
                </div>
                <div class="context-item" data-action="new-file">
                    <i class="fas fa-file-alt"></i>
                    <span>New Text File</span>
                </div>
                <div class="context-divider"></div>
                <div class="context-item" data-action="change-wallpaper">
                    <i class="fas fa-image"></i>
                    <span>Change Wallpaper</span>
                </div>
                <div class="context-item" data-action="desktop-settings">
                    <i class="fas fa-sliders-h"></i>
                    <span>Desktop Settings</span>
                </div>
                <div class="context-divider"></div>
                <div class="context-item" data-action="show-desktop">
                    <i class="fas fa-th-large"></i>
                    <span>Show Desktop (F11)</span>
                </div>
            `;
        } else if (type === 'window') {
            menu.innerHTML = `
                <div class="context-item" data-action="bring-to-front">
                    <i class="fas fa-bring-forward"></i>
                    <span>Bring to Front</span>
                </div>
                <div class="context-item" data-action="send-to-back">
                    <i class="fas fa-send-backward"></i>
                    <span>Send to Back</span>
                </div>
                <div class="context-divider"></div>
                <div class="context-item" data-action="minimize-all">
                    <i class="fas fa-window-minimize"></i>
                    <span>Minimize All</span>
                </div>
                <div class="context-item" data-action="close-all">
                    <i class="fas fa-times-circle"></i>
                    <span>Close All Windows</span>
                </div>
            `;
        }
        
        document.body.appendChild(menu);
        
        // Add click handlers
        menu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleContextAction(action);
                this.hideContextMenu();
                playSound('click');
            });
        });
        
        // Prevent clicks on menu from closing it immediately
        menu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    handleContextAction(action) {
        switch(action) {
            case 'new-folder':
                const folderName = prompt('Enter folder name:', 'New Folder');
                if (folderName && folderName.trim()) {
                    macOSDatabase.createFolder('/Users/neelpatel/Desktop', folderName.trim());
                    showNotification('Folder Created', `Created "${folderName}" on Desktop`);
                }
                break;
                
            case 'new-file':
                const fileName = prompt('Enter file name:', 'New File.txt');
                if (fileName && fileName.trim()) {
                    macOSDatabase.createFile('/Users/neelpatel/Desktop', fileName.trim(), '');
                    showNotification('File Created', `Created "${fileName}" on Desktop`);
                }
                break;
                
            case 'change-wallpaper':
                openApp('preferences');
                // Switch to desktop pane
                setTimeout(() => {
                    const desktopTab = document.querySelector('.pref-sidebar-item[data-pane="desktop"]');
                    if (desktopTab) desktopTab.click();
                }, 100);
                break;
                
            case 'desktop-settings':
                openApp('preferences');
                break;
                
            case 'show-desktop':
                this.showDesktop();
                break;
                
            case 'bring-to-front':
                const activeWindow = document.querySelector('.app-window[style*="display: block"]');
                if (activeWindow) {
                    activeWindow.style.zIndex = '10000';
                }
                break;
                
            case 'send-to-back':
                const windows = document.querySelectorAll('.app-window[style*="display: block"]');
                if (windows.length > 0) {
                    windows[0].style.zIndex = '1';
                }
                break;
                
            case 'minimize-all':
                document.querySelectorAll('.app-window[style*="display: block"]').forEach(window => {
                    window.style.display = 'none';
                });
                break;
                
            case 'close-all':
                document.querySelectorAll('.app-window[style*="display: block"]').forEach(window => {
                    window.style.display = 'none';
                    const appName = window.id.replace('Window', '');
                    macOSDatabase.removeRunningApp(appName);
                    updateDockIndicator(appName, false);
                });
                break;
        }
    }
    
    hideContextMenu() {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }
    
    showDesktop() {
        // Minimize all windows
        document.querySelectorAll('.app-window[style*="display: block"]').forEach(window => {
            window.style.animation = 'minimizeToDock 0.3s ease-out forwards';
            setTimeout(() => {
                window.style.display = 'none';
                window.style.animation = '';
            }, 300);
        });
        
        playSound('minimize');
    }
    
    // ========== KEYBOARD SHORTCUTS ==========
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            
            // Cmd/Ctrl + N: New window
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                this.createNewFinderWindow();
            }
            
            // Cmd/Ctrl + W: Close window
            if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
                e.preventDefault();
                this.closeActiveWindow();
            }
            
            // Cmd/Ctrl + Q: Quit app
            if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
                e.preventDefault();
                this.quitActiveApp();
            }
            
            // Cmd/Ctrl + Tab: App switcher
            if ((e.metaKey || e.ctrlKey) && e.key === 'Tab') {
                e.preventDefault();
                this.showAppSwitcher();
            }
            
            // F11: Show desktop
            if (e.key === 'F11') {
                e.preventDefault();
                this.showDesktop();
            }
            
            // F12: Developer tools (simulated)
            if (e.key === 'F12') {
                e.preventDefault();
                this.showDeveloperTools();
            }
            
            // Alt/Option + Space: Spotlight
            if (e.altKey && e.key === ' ') {
                e.preventDefault();
                showSpotlight();
            }
        });
    }
    
    createNewFinderWindow() {
        const newWindow = document.getElementById('finderWindow').cloneNode(true);
        newWindow.id = 'finderWindow-' + Date.now();
        newWindow.style.left = (Math.random() * 200 + 100) + 'px';
        newWindow.style.top = (Math.random() * 200 + 100) + 'px';
        newWindow.style.display = 'block';
        
        document.getElementById('windowsContainer').appendChild(newWindow);
        makeWindowDraggable(newWindow);
        setupWindowControls(newWindow);
        
        macOSDatabase.addRunningApp('finder');
        updateDockIndicator('finder', true);
        
        showNotification('Finder', 'New Finder window opened');
        playSound('window');
    }
    
    closeActiveWindow() {
        const windows = Array.from(document.querySelectorAll('.app-window[style*="display: block"]'))
            .sort((a, b) => parseInt(b.style.zIndex || 0) - parseInt(a.style.zIndex || 0));
        
        if (windows.length > 0) {
            const activeWindow = windows[0];
            activeWindow.style.display = 'none';
            
            const appName = activeWindow.id.replace(/Window-?\d*$/, '').replace('Window', '');
            macOSDatabase.removeRunningApp(appName);
            updateDockIndicator(appName, false);
            
            playSound('window');
        }
    }
    
    quitActiveApp() {
        const windows = document.querySelectorAll('.app-window[style*="display: block"]');
        if (windows.length > 0) {
            windows.forEach(window => {
                const appName = window.id.replace(/Window-?\d*$/, '').replace('Window', '');
                if (appName !== 'finder') { // Don't close all finder windows
                    window.style.display = 'none';
                    macOSDatabase.removeRunningApp(appName);
                    updateDockIndicator(appName, false);
                }
            });
            
            showNotification('App Quit', 'All windows closed');
            playSound('click');
        }
    }
    
    showAppSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'app-switcher';
        switcher.innerHTML = `
            <div class="app-switcher-overlay"></div>
            <div class="app-switcher-container">
                <h3>App Switcher (Cmd+Tab)</h3>
                <div class="app-switcher-list" id="appSwitcherList">
                    <!-- Apps will be added here -->
                </div>
                <div class="app-switcher-hint">Press Tab to cycle, release to switch</div>
            </div>
        `;
        
        document.body.appendChild(switcher);
        
        // Get running apps
        const runningApps = macOSDatabase.getAppsData().running;
        const appSwitcherList = document.getElementById('appSwitcherList');
        
        runningApps.forEach((app, index) => {
            const appItem = document.createElement('div');
            appItem.className = `app-switcher-item ${index === 0 ? 'active' : ''}`;
            appItem.setAttribute('data-app', app);
            
            let icon = 'fas fa-question';
            let name = app;
            
            switch(app) {
                case 'finder': icon = 'fas fa-compass'; name = 'Finder'; break;
                case 'safari': icon = 'fas fa-globe'; name = 'Safari'; break;
                case 'music': icon = 'fas fa-music'; name = 'Music'; break;
                case 'calculator': icon = 'fas fa-calculator'; name = 'Calculator'; break;
                case 'terminal': icon = 'fas fa-terminal'; name = 'Terminal'; break;
                case 'preferences': icon = 'fas fa-sliders-h'; name = 'System Preferences'; break;
            }
            
            appItem.innerHTML = `
                <div class="app-switcher-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="app-switcher-name">${name}</div>
            `;
            
            appSwitcherList.appendChild(appItem);
        });
        
        // Handle keyboard navigation
        let currentIndex = 0;
        const items = appSwitcherList.querySelectorAll('.app-switcher-item');
        
        const keyHandler = (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                
                // Remove active from all
                items.forEach(item => item.classList.remove('active'));
                
                // Move to next
                currentIndex = (currentIndex + 1) % items.length;
                items[currentIndex].classList.add('active');
                
                playSound('click');
            } else if (e.key === 'Escape' || !e.metaKey) {
                // Close switcher
                document.removeEventListener('keydown', keyHandler);
                switcher.remove();
                
                if (e.key !== 'Escape') {
                    // Switch to selected app
                    const selectedApp = items[currentIndex].getAttribute('data-app');
                    this.bringAppToFront(selectedApp);
                }
            }
        };
        
        document.addEventListener('keydown', keyHandler);
        playSound('window');
    }
    
    bringAppToFront(appName) {
        const windows = document.querySelectorAll('.app-window[style*="display: block"]');
        windows.forEach(window => {
            if (window.id.includes(appName)) {
                window.style.display = 'block';
                window.style.zIndex = '10000';
            }
        });
    }
    
    showDeveloperTools() {
        const devTools = document.createElement('div');
        devTools.className = 'dev-tools';
        devTools.innerHTML = `
            <div class="dev-tools-header">
                <h3><i class="fas fa-code"></i> macOS Web Developer Tools</h3>
                <button class="dev-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="dev-tools-tabs">
                <button class="dev-tab active" data-tab="console">Console</button>
                <button class="dev-tab" data-tab="database">Database</button>
                <button class="dev-tab" data-tab="system">System Info</button>
                <button class="dev-tab" data-tab="performance">Performance</button>
            </div>
            <div class="dev-tools-content">
                <div class="dev-tab-content active" id="dev-console">
                    <div class="dev-console-output" id="devConsoleOutput"></div>
                    <div class="dev-console-input">
                        <input type="text" placeholder="Enter JavaScript command..." id="devConsoleInput">
                        <button id="devConsoleExecute">Execute</button>
                    </div>
                </div>
                <div class="dev-tab-content" id="dev-database">
                    <pre id="devDatabaseView"></pre>
                    <div class="dev-db-actions">
                        <button id="devExportDB">Export Database</button>
                        <button id="devImportDB">Import Database</button>
                        <button id="devClearDB">Clear Database</button>
                    </div>
                </div>
                <div class="dev-tab-content" id="dev-system">
                    <div class="dev-system-info" id="devSystemInfo"></div>
                </div>
                <div class="dev-tab-content" id="dev-performance">
                    <div class="dev-performance-info" id="devPerformanceInfo"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(devTools);
        
        // Setup dev tools
        this.setupDevTools(devTools);
        playSound('click');
    }
    
    setupDevTools(devTools) {
        // Close button
        devTools.querySelector('.dev-close').addEventListener('click', () => {
            devTools.remove();
        });
        
        // Tabs
        devTools.querySelectorAll('.dev-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                devTools.querySelectorAll('.dev-tab').forEach(t => t.classList.remove('active'));
                devTools.querySelectorAll('.dev-tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`dev-${tab.getAttribute('data-tab')}`).classList.add('active');
            });
        });
        
        // Console
        const consoleInput = document.getElementById('devConsoleInput');
        const consoleOutput = document.getElementById('devConsoleOutput');
        
        document.getElementById('devConsoleExecute').addEventListener('click', () => {
            const command = consoleInput.value;
            this.executeConsoleCommand(command, consoleOutput);
            consoleInput.value = '';
        });
        
        consoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = consoleInput.value;
                this.executeConsoleCommand(command, consoleOutput);
                consoleInput.value = '';
            }
        });
        
        // Database
        this.updateDatabaseView();
        
        document.getElementById('devExportDB').addEventListener('click', () => {
            const data = macOSDatabase.exportDatabase();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'macos-database-backup.json';
            a.click();
            showNotification('Database Exported', 'Database saved as JSON file');
        });
        
        document.getElementById('devImportDB').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const success = macOSDatabase.importDatabase(e.target.result);
                    if (success) {
                        this.updateDatabaseView();
                        showNotification('Database Imported', 'Database restored from backup');
                    } else {
                        showNotification('Import Failed', 'Invalid database file');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        });
        
        document.getElementById('devClearDB').addEventListener('click', () => {
            if (confirm('Clear ALL database? This cannot be undone!')) {
                macOSDatabase.clearDatabase();
                this.updateDatabaseView();
                showNotification('Database Cleared', 'All data has been reset');
            }
        });
        
        // System Info
        this.updateSystemInfo();
        
        // Performance
        this.updatePerformanceInfo();
    }
    
    executeConsoleCommand(command, outputElement) {
        try {
            const result = eval(command);
            outputElement.innerHTML += `
                <div class="dev-console-command">> ${command}</div>
                <div class="dev-console-result">${JSON.stringify(result, null, 2)}</div>
            `;
            outputElement.scrollTop = outputElement.scrollHeight;
        } catch (error) {
            outputElement.innerHTML += `
                <div class="dev-console-command error">> ${command}</div>
                <div class="dev-console-result error">${error.message}</div>
            `;
            outputElement.scrollTop = outputElement.scrollHeight;
        }
    }
    
    updateDatabaseView() {
        const dbView = document.getElementById('devDatabaseView');
        if (dbView) {
            const data = {
                system: macOSDatabase.getSystemSettings(),
                user: macOSDatabase.getUser(),
                files: macOSDatabase.getFileSystem(),
                calculator: { history: macOSDatabase.getCalculatorHistory() },
                music: macOSDatabase.getMusicLibrary(),
                terminal: { history: macOSDatabase.getTerminalHistory() },
                notifications: macOSDatabase.getNotifications(),
                apps: macOSDatabase.getAppsData()
            };
            dbView.textContent = JSON.stringify(data, null, 2);
        }
    }
    
    updateSystemInfo() {
        const sysInfo = document.getElementById('devSystemInfo');
        if (sysInfo) {
            sysInfo.innerHTML = `
                <h4>Browser Information</h4>
                <p>User Agent: ${navigator.userAgent}</p>
                <p>Platform: ${navigator.platform}</p>
                <p>Language: ${navigator.language}</p>
                <p>Cookies Enabled: ${navigator.cookieEnabled}</p>
                
                <h4>System Storage</h4>
                <p>LocalStorage Used: ${this.getLocalStorageSize()} KB</p>
                <p>Apps Installed: 6</p>
                <p>Files Created: ${this.getFileCount()}</p>
                
                <h4>macOS Web Info</h4>
                <p>Version: 2.0</p>
                <p>Creator: Neel Patel</p>
                <p>Last Updated: ${new Date().toLocaleString()}</p>
            `;
        }
    }
    
    updatePerformanceInfo() {
        const perfInfo = document.getElementById('devPerformanceInfo');
        if (perfInfo) {
            const memory = performance.memory;
            perfInfo.innerHTML = `
                <h4>Performance Metrics</h4>
                <p>Page Load Time: ${Math.round(performance.now())} ms</p>
                <p>DOM Elements: ${document.getElementsByTagName('*').length}</p>
                <p>Running Apps: ${macOSDatabase.getAppsData().running.length}</p>
                <p>Open Windows: ${document.querySelectorAll('.app-window[style*="display: block"]').length}</p>
                
                <h4>Memory Usage</h4>
                ${memory ? `
                    <p>Used JS Heap: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB</p>
                    <p>Total JS Heap: ${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB</p>
                ` : '<p>Memory API not available</p>'}
            `;
        }
    }
    
    getLocalStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // UTF-16 uses 2 bytes per char
            }
        }
        return Math.round(total / 1024);
    }
    
    getFileCount() {
        const fileSystem = macOSDatabase.getFileSystem();
        let count = 0;
        
        function countFiles(obj) {
            if (obj.children) {
                Object.values(obj.children).forEach(child => {
                    if (child.type === 'file') count++;
                    if (child.children) countFiles(child);
                });
            }
        }
        
        if (fileSystem && fileSystem.home) {
            countFiles(fileSystem.home);
        }
        
        return count;
    }
    
    // ========== DRAG & DROP ==========
    setupFileDragDrop() {
        const desktop = document.getElementById('desktop');
        if (!desktop) return;
        
        desktop.addEventListener('dragover', (e) => {
            e.preventDefault();
            desktop.classList.add('drag-over');
        });
        
        desktop.addEventListener('dragleave', () => {
            desktop.classList.remove('drag-over');
        });
        
        desktop.addEventListener('drop', (e) => {
            e.preventDefault();
            desktop.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleDroppedFiles(files);
            }
        });
    }
    
    handleDroppedFiles(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                this.handleImageFile(file);
            } else if (file.type === 'text/plain') {
                this.handleTextFile(file);
            } else {
                this.handleGenericFile(file);
            }
        });
        
        showNotification('Files Dropped', `${files.length} file(s) added to Desktop`);
    }
    
    handleImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Create image file in database
            const fileName = file.name || 'image.png';
            macOSDatabase.createFile('/Users/neelpatel/Desktop', fileName, '');
            
            // Show notification with image preview
            showNotification('Image Added', `${fileName} saved to Desktop`, 'info', 'fas fa-image');
        };
        reader.readAsDataURL(file);
    }
    
    handleTextFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileName = file.name || 'text.txt';
            macOSDatabase.createFile('/Users/neelpatel/Desktop', fileName, e.target.result);
            
            showNotification('Text File Added', `${fileName} saved to Desktop`, 'info', 'fas fa-file-alt');
        };
        reader.readAsText(file);
    }
    
    handleGenericFile(file) {
        const fileName = file.name || 'file';
        macOSDatabase.createFile('/Users/neelpatel/Desktop', fileName, '');
        
        showNotification('File Added', `${fileName} saved to Desktop`, 'info', 'fas fa-file');
    }
    
    // ========== ANIMATIONS ==========
    setupAnimations() {
        // Add smooth transitions
        document.documentElement.style.setProperty('--transition-speed', '0.3s');
        
        // Animate dock items on hover
        const dockItems = document.querySelectorAll('.dock-item');
        dockItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transition = 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
            });
        });
        
        // Window opening animation
        const originalOpenApp = window.openApp;
        window.openApp = function(appName) {
            const result = originalOpenApp(appName);
            
            // Add bounce animation
            const windowElement = document.getElementById(appName + 'Window');
            if (windowElement) {
                windowElement.style.animation = 'bounceIn 0.5s ease-out';
                setTimeout(() => {
                    windowElement.style.animation = '';
                }, 500);
            }
            
            return result;
        };
    }
    
    // ========== PERFORMANCE ==========
    setupPerformance() {
        // Throttle window movements
        let isThrottled = false;
        const originalMakeWindowDraggable = window.makeWindowDraggable;
        
        window.makeWindowDraggable = function(windowElement) {
            originalMakeWindowDraggable(windowElement);
            
            const titlebar = windowElement.querySelector('.window-titlebar');
            if (titlebar) {
                titlebar.addEventListener('mousemove', (e) => {
                    if (isThrottled) return;
                    isThrottled = true;
                    
                    setTimeout(() => {
                        isThrottled = false;
                    }, 16); // ~60fps
                });
            }
        };
        
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // ========== ACCESSIBILITY ==========
    setupAccessibility() {
        // Keyboard navigation for dock
        const dockItems = document.querySelectorAll('.dock-item');
        dockItems.forEach((item, index) => {
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextItem = dockItems[index + 1] || dockItems[0];
                    nextItem.focus();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevItem = dockItems[index - 1] || dockItems[dockItems.length - 1];
                    prevItem.focus();
                }
            });
        });
        
        // High contrast mode
        const highContrastToggle = document.createElement('button');
        highContrastToggle.className = 'accessibility-toggle';
        highContrastToggle.innerHTML = '<i class="fas fa-eye"></i>';
        highContrastToggle.title = 'Toggle High Contrast';
        highContrastToggle.style.position = 'fixed';
        highContrastToggle.style.bottom = '10px';
        highContrastToggle.style.left = '10px';
        highContrastToggle.style.zIndex = '1000';
        highContrastToggle.style.padding = '10px';
        highContrastToggle.style.background = '#007aff';
        highContrastToggle.style.color = 'white';
        highContrastToggle.style.border = 'none';
        highContrastToggle.style.borderRadius = '50%';
        highContrastToggle.style.cursor = 'pointer';
        highContrastToggle.style.display = 'none'; // Hidden by default
        
        highContrastToggle.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
            playSound('click');
        });
        
        document.body.appendChild(highContrastToggle);
        
        // Show toggle after 10 seconds of inactivity
        let activityTimer;
        function showAccessibilityToggle() {
            clearTimeout(activityTimer);
            activityTimer = setTimeout(() => {
                highContrastToggle.style.display = 'block';
            }, 10000);
        }
        
        document.addEventListener('mousemove', showAccessibilityToggle);
        document.addEventListener('keydown', showAccessibilityToggle);
        showAccessibilityToggle();
    }
}

// Initialize utilities
document.addEventListener('DOMContentLoaded', () => {
    window.macOSUtilities = new MacOSUtilities();
    console.log('⚙️ macOS Utilities loaded!');
});