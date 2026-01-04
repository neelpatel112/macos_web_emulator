// macOS Web Emulator - Frontend Database (Works on Vercel)
class MacOSDatabase {
    constructor() {
        console.log('💾 Initializing macOS Database (localStorage)');
        this.initializeDatabase();
    }
    
    initializeDatabase() {
        // Create default data structure if it doesn't exist
        if (!localStorage.getItem('macos_system')) {
            this.createDefaultData();
        }
    }
    
    createDefaultData() {
        console.log('📁 Creating default database...');
        
        // System Settings
        const systemSettings = {
            version: '2.0.0',
            desktopWallpaper: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
            theme: 'dark',
            soundEnabled: true,
            startupSound: true,
            notifications: true,
            dockPosition: 'bottom',
            dockSize: 'medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('macos_system', JSON.stringify(systemSettings));
        
        // User Data
        const userData = {
            id: 'user_001',
            username: 'Neel Patel',
            email: 'neel@macosweb.local',
            avatar: 'NP',
            passwordHash: '', // Empty for demo
            createdAt: new Date().toISOString(),
            lastLogin: null,
            preferences: {
                theme: 'auto',
                fontSize: 'medium',
                animations: true
            }
        };
        localStorage.setItem('macos_user', JSON.stringify(userData));
        
        // File System
        const fileSystem = {
            home: {
                name: 'Home',
                type: 'directory',
                path: '/Users/neelpatel',
                children: {
                    desktop: {
                        name: 'Desktop',
                        type: 'directory',
                        path: '/Users/neelpatel/Desktop',
                        children: {
                            'welcome.txt': {
                                name: 'welcome.txt',
                                type: 'file',
                                path: '/Users/neelpatel/Desktop/welcome.txt',
                                content: 'Welcome to macOS Web Emulator!\nCreated by Neel Patel.\n\nThis is your desktop folder.',
                                size: 89,
                                created: new Date().toISOString(),
                                modified: new Date().toISOString()
                            },
                            'readme.md': {
                                name: 'readme.md',
                                type: 'file',
                                path: '/Users/neelpatel/Desktop/readme.md',
                                content: '# macOS Web Emulator\n\nA web-based macOS simulator created by Neel Patel.\n\n## Features\n- Lock screen with Touch ID\n- Functional apps\n- Desktop with icons\n- Dock with running indicators\n- Notifications\n- Mission Control\n\n## How to Use\n1. Password: "macos" or press Enter\n2. Click desktop icons to open apps\n3. Use dock to launch applications',
                                size: 456,
                                created: new Date().toISOString(),
                                modified: new Date().toISOString()
                            }
                        }
                    },
                    documents: {
                        name: 'Documents',
                        type: 'directory',
                        path: '/Users/neelpatel/Documents',
                        children: {
                            'projects.txt': {
                                name: 'projects.txt',
                                type: 'file',
                                path: '/Users/neelpatel/Documents/projects.txt',
                                content: 'My Projects:\n1. macOS Web Emulator\n2. Portfolio Website\n3. AI Assistant\n4. Mobile Apps',
                                size: 89,
                                created: new Date().toISOString(),
                                modified: new Date().toISOString()
                            }
                        }
                    },
                    downloads: {
                        name: 'Downloads',
                        type: 'directory',
                        path: '/Users/neelpatel/Downloads',
                        children: {}
                    },
                    applications: {
                        name: 'Applications',
                        type: 'directory',
                        path: '/Users/neelpatel/Applications',
                        children: {
                            finder: {
                                name: 'Finder.app',
                                type: 'application',
                                path: '/Users/neelpatel/Applications/Finder.app',
                                icon: 'fas fa-compass',
                                description: 'Browse files and folders'
                            },
                            safari: {
                                name: 'Safari.app',
                                type: 'application',
                                path: '/Users/neelpatel/Applications/Safari.app',
                                icon: 'fas fa-globe',
                                description: 'Web browser'
                            },
                            calculator: {
                                name: 'Calculator.app',
                                type: 'application',
                                path: '/Users/neelpatel/Applications/Calculator.app',
                                icon: 'fas fa-calculator',
                                description: 'Scientific calculator'
                            },
                            music: {
                                name: 'Music.app',
                                type: 'application',
                                path: '/Users/neelpatel/Applications/Music.app',
                                icon: 'fas fa-music',
                                description: 'Music player'
                            },
                            terminal: {
                                name: 'Terminal.app',
                                type: 'application',
                                path: '/Users/neelpatel/Applications/Terminal.app',
                                icon: 'fas fa-terminal',
                                description: 'Command line interface'
                            }
                        }
                    }
                }
            }
        };
        localStorage.setItem('macos_files', JSON.stringify(fileSystem));
        
        // Calculator History
        const calculatorData = {
            history: [
                { expression: '2 + 2', result: '4', timestamp: new Date().toISOString() },
                { expression: '10 * 5', result: '50', timestamp: new Date().toISOString() },
                { expression: '100 / 4', result: '25', timestamp: new Date().toISOString() }
            ],
            memory: 0,
            lastResult: 0
        };
        localStorage.setItem('macos_calculator', JSON.stringify(calculatorData));
        
        // Music Library
        const musicLibrary = {
            playlists: {
                default: {
                    id: 'default',
                    name: 'My Playlist',
                    created: new Date().toISOString(),
                    songs: [
                        {
                            id: 'song_001',
                            title: 'Blinding Lights',
                            artist: 'The Weeknd',
                            duration: '3:20',
                            url: 'https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3',
                            cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
                            added: new Date().toISOString(),
                            favorite: true
                        },
                        {
                            id: 'song_002',
                            title: 'Midnight City',
                            artist: 'M83',
                            duration: '4:04',
                            url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
                            cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d',
                            added: new Date().toISOString(),
                            favorite: false
                        },
                        {
                            id: 'song_003',
                            title: 'Summer Vibes',
                            artist: 'Lofi Beats',
                            duration: '2:45',
                            url: 'https://assets.mixkit.co/music/preview/mixkit-summer-vibes-29.mp3',
                            cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b',
                            added: new Date().toISOString(),
                            favorite: true
                        }
                    ]
                }
            },
            recentlyPlayed: [],
            favorites: ['song_001', 'song_003'],
            currentPlaylist: 'default',
            currentSong: null,
            isPlaying: false,
            volume: 70
        };
        localStorage.setItem('macos_music', JSON.stringify(musicLibrary));
        
        // Terminal History
        const terminalData = {
            history: [
                { command: 'help', output: 'Available commands: help, date, time, echo, clear, neel, ls, pwd, whoami', timestamp: new Date().toISOString() },
                { command: 'neel', output: 'Created by Neel Patel - macOS Web Emulator\nGitHub: @neelpatel05\nVersion: 2.0', timestamp: new Date().toISOString() },
                { command: 'date', output: new Date().toDateString(), timestamp: new Date().toISOString() }
            ],
            sessions: [],
            currentDirectory: '/Users/neelpatel'
        };
        localStorage.setItem('macos_terminal', JSON.stringify(terminalData));
        
        // Notifications
        const notifications = {
            notifications: [
                {
                    id: 'notif_001',
                    title: 'Welcome to macOS Web',
                    message: 'Created by Neel Patel - Version 2.0',
                    type: 'info',
                    timestamp: new Date().toISOString(),
                    read: false,
                    icon: 'fas fa-bell'
                },
                {
                    id: 'notif_002',
                    title: 'System Updated',
                    message: 'Database system initialized successfully',
                    type: 'success',
                    timestamp: new Date().toISOString(),
                    read: false,
                    icon: 'fas fa-check-circle'
                }
            ],
            settings: {
                enabled: true,
                sound: true,
                banners: true,
                doNotDisturb: false
            }
        };
        localStorage.setItem('macos_notifications', JSON.stringify(notifications));
        
        // Apps Data
        const appsData = {
            running: [],
            preferences: {},
            windowPositions: {},
            launchHistory: []
        };
        localStorage.setItem('macos_apps', JSON.stringify(appsData));
        
        console.log('✅ Default database created!');
    }
    
    // ========== SYSTEM METHODS ==========
    
    getSystemSettings() {
        const data = localStorage.getItem('macos_system');
        return data ? JSON.parse(data) : null;
    }
    
    updateSystemSettings(settings) {
        const current = this.getSystemSettings();
        const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
        localStorage.setItem('macos_system', JSON.stringify(updated));
        return updated;
    }
    
    // ========== USER METHODS ==========
    
    getUser() {
        const data = localStorage.getItem('macos_user');
        return data ? JSON.parse(data) : null;
    }
    
    updateUser(userData) {
        const current = this.getUser();
        const updated = { ...current, ...userData };
        localStorage.setItem('macos_user', JSON.stringify(updated));
        return updated;
    }
    
    updateLastLogin() {
        const user = this.getUser();
        if (user) {
            user.lastLogin = new Date().toISOString();
            localStorage.setItem('macos_user', JSON.stringify(user));
        }
    }
    
    // ========== FILE SYSTEM METHODS ==========
    
    getFileSystem() {
        const data = localStorage.getItem('macos_files');
        return data ? JSON.parse(data) : null;
    }
    
    updateFileSystem(fileSystem) {
        localStorage.setItem('macos_files', JSON.stringify(fileSystem));
        return fileSystem;
    }
    
    createFolder(path, name) {
        const fileSystem = this.getFileSystem();
        
        // Create folder object
        const newFolder = {
            name: name,
            type: 'directory',
            path: path + '/' + name,
            children: {},
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };
        
        // Simple implementation - add to desktop
        if (fileSystem.home.children.desktop) {
            fileSystem.home.children.desktop.children[name] = newFolder;
        }
        
        this.updateFileSystem(fileSystem);
        return newFolder;
    }
    
    createFile(path, name, content = '') {
        const fileSystem = this.getFileSystem();
        
        const newFile = {
            name: name,
            type: 'file',
            path: path + '/' + name,
            content: content,
            size: content.length,
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };
        
        // Add to desktop
        if (fileSystem.home.children.desktop) {
            fileSystem.home.children.desktop.children[name] = newFile;
        }
        
        this.updateFileSystem(fileSystem);
        return newFile;
    }
    
    // ========== CALCULATOR METHODS ==========
    
    getCalculatorHistory() {
        const data = localStorage.getItem('macos_calculator');
        return data ? JSON.parse(data).history : [];
    }
    
    addCalculation(expression, result) {
        const data = localStorage.getItem('macos_calculator');
        const calculator = data ? JSON.parse(data) : { history: [], memory: 0 };
        
        calculator.history.unshift({
            expression,
            result,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 100 calculations
        calculator.history = calculator.history.slice(0, 100);
        
        localStorage.setItem('macos_calculator', JSON.stringify(calculator));
        return calculator.history;
    }
    
    // ========== MUSIC METHODS ==========
    
    getMusicLibrary() {
        const data = localStorage.getItem('macos_music');
        return data ? JSON.parse(data) : null;
    }
    
    updateMusicLibrary(library) {
        localStorage.setItem('macos_music', JSON.stringify(library));
        return library;
    }
    
    addToRecentlyPlayed(songId) {
        const library = this.getMusicLibrary();
        
        // Find song
        let song = null;
        for (const playlist of Object.values(library.playlists)) {
            const found = playlist.songs.find(s => s.id === songId);
            if (found) {
                song = found;
                break;
            }
        }
        
        if (song) {
            library.recentlyPlayed.unshift({
                ...song,
                playedAt: new Date().toISOString()
            });
            
            // Keep only last 10
            library.recentlyPlayed = library.recentlyPlayed.slice(0, 10);
            
            this.updateMusicLibrary(library);
        }
    }
    
    toggleFavorite(songId) {
        const library = this.getMusicLibrary();
        const index = library.favorites.indexOf(songId);
        
        if (index > -1) {
            // Remove from favorites
            library.favorites.splice(index, 1);
        } else {
            // Add to favorites
            library.favorites.push(songId);
        }
        
        this.updateMusicLibrary(library);
        return library.favorites;
    }
    
    // ========== TERMINAL METHODS ==========
    
    getTerminalHistory() {
        const data = localStorage.getItem('macos_terminal');
        return data ? JSON.parse(data).history : [];
    }
    
    addCommand(command, output) {
        const data = localStorage.getItem('macos_terminal');
        const terminal = data ? JSON.parse(data) : { history: [], sessions: [] };
        
        terminal.history.unshift({
            command,
            output,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 50 commands
        terminal.history = terminal.history.slice(0, 50);
        
        localStorage.setItem('macos_terminal', JSON.stringify(terminal));
        return terminal.history;
    }
    
    // ========== NOTIFICATION METHODS ==========
    
    getNotifications() {
        const data = localStorage.getItem('macos_notifications');
        return data ? JSON.parse(data) : null;
    }
    
    addNotification(title, message, type = 'info', icon = 'fas fa-bell') {
        const data = this.getNotifications();
        
        const newNotification = {
            id: 'notif_' + Date.now(),
            title,
            message,
            type,
            icon,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        data.notifications.unshift(newNotification);
        localStorage.setItem('macos_notifications', JSON.stringify(data));
        
        return newNotification;
    }
    
    markAsRead(notificationId) {
        const data = this.getNotifications();
        const notification = data.notifications.find(n => n.id === notificationId);
        
        if (notification) {
            notification.read = true;
            localStorage.setItem('macos_notifications', JSON.stringify(data));
            return true;
        }
        
        return false;
    }
    
    markAllAsRead() {
        const data = this.getNotifications();
        data.notifications.forEach(n => n.read = true);
        localStorage.setItem('macos_notifications', JSON.stringify(data));
    }
    
    clearNotifications() {
        const data = this.getNotifications();
        data.notifications = [];
        localStorage.setItem('macos_notifications', JSON.stringify(data));
    }
    
    // ========== APPS METHODS ==========
    
    getAppsData() {
        const data = localStorage.getItem('macos_apps');
        return data ? JSON.parse(data) : { running: [], preferences: {} };
    }
    
    updateAppsData(appsData) {
        localStorage.setItem('macos_apps', JSON.stringify(appsData));
        return appsData;
    }
    
    addRunningApp(appName) {
        const appsData = this.getAppsData();
        
        if (!appsData.running.includes(appName)) {
            appsData.running.push(appName);
            this.updateAppsData(appsData);
        }
        
        return appsData.running;
    }
    
    removeRunningApp(appName) {
        const appsData = this.getAppsData();
        const index = appsData.running.indexOf(appName);
        
        if (index > -1) {
            appsData.running.splice(index, 1);
            this.updateAppsData(appsData);
        }
        
        return appsData.running;
    }
    
    // ========== UTILITY METHODS ==========
    
    clearDatabase() {
        localStorage.removeItem('macos_system');
        localStorage.removeItem('macos_user');
        localStorage.removeItem('macos_files');
        localStorage.removeItem('macos_calculator');
        localStorage.removeItem('macos_music');
        localStorage.removeItem('macos_terminal');
        localStorage.removeItem('macos_notifications');
        localStorage.removeItem('macos_apps');
        
        console.log('🗑️ Database cleared!');
        this.createDefaultData();
    }
    
    exportDatabase() {
        const database = {
            system: this.getSystemSettings(),
            user: this.getUser(),
            files: this.getFileSystem(),
            calculator: localStorage.getItem('macos_calculator'),
            music: this.getMusicLibrary(),
            terminal: localStorage.getItem('macos_terminal'),
            notifications: this.getNotifications(),
            apps: this.getAppsData(),
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(database, null, 2);
    }
    
    importDatabase(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.system) localStorage.setItem('macos_system', JSON.stringify(data.system));
            if (data.user) localStorage.setItem('macos_user', JSON.stringify(data.user));
            if (data.files) localStorage.setItem('macos_files', JSON.stringify(data.files));
            if (data.calculator) localStorage.setItem('macos_calculator', data.calculator);
            if (data.music) localStorage.setItem('macos_music', JSON.stringify(data.music));
            if (data.terminal) localStorage.setItem('macos_terminal', data.terminal);
            if (data.notifications) localStorage.setItem('macos_notifications', JSON.stringify(data.notifications));
            if (data.apps) localStorage.setItem('macos_apps', JSON.stringify(data.apps));
            
            console.log('✅ Database imported successfully!');
            return true;
        } catch (error) {
            console.error('❌ Failed to import database:', error);
            return false;
        }
    }
}

// Create global instance
window.macOSDatabase = new MacOSDatabase();

console.log('💾 macOS Database loaded - Ready to use!');