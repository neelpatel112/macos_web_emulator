// ========== DOM ELEMENTS ==========
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
const spotlightBtn = document.getElementById('spotlightBtn');

// ========== STATE MANAGEMENT ==========
let systemState = {
    notifications: [],
    openWindows: [],
    activeApp: null,
    soundEnabled: true,
    volume: 0.7,
    gameScores: {
        snake: 0,
        snakeHigh: 0,
        pacman: 0,
        pacmanHigh: 0
    }
};

// ========== LOCK SCREEN FIX ==========
// Force lock screen on load
window.addEventListener('load', () => {
    lockScreen.classList.add('active');
    desktop.classList.remove('active');
    updateTime();
    
    // Auto-focus password field
    setTimeout(() => {
        lockPassword.focus();
    }, 500);
});

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

setInterval(updateTime, 60000);

// ========== SOUND SYSTEM ==========
function playSound(type) {
    if (!systemState.soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        let frequency = 440;
        let duration = 200;
        
        switch(type) {
            case 'login':
                frequency = 523.25;
                duration = 1000;
                oscillator.type = 'sine';
                break;
            case 'click':
                frequency = 400;
                duration = 50;
                oscillator.type = 'triangle';
                break;
            case 'game':
                frequency = 659.25;
                duration = 100;
                oscillator.type = 'square';
                break;
            case 'success':
                frequency = 523.25;
                duration = 300;
                oscillator.type = 'sine';
                break;
            case 'error':
                frequency = 220;
                duration = 500;
                oscillator.type = 'sawtooth';
                break;
        }
        
        oscillator.frequency.value = frequency;
        
        const volume = systemState.volume * 0.3;
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration/1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration/1000);
    } catch (e) {
        console.log('Sound error:', e);
    }
}

// ========== UNLOCK SYSTEM ==========
function unlockMac() {
    const password = lockPassword.value.trim();
    
    if(password === 'macos' || password === '') {
        playSound('login');
        
        // Show unlocking animation
        lockScreen.style.animation = 'fadeOut 0.5s ease forwards';
        
        setTimeout(() => {
            lockScreen.classList.remove('active');
            desktop.classList.add('active');
            desktop.style.animation = 'fadeIn 0.5s ease';
            
            // Show welcome notification
            showNotification('Welcome to macOS Web', 'Created by Neel Patel', 'success');
            
            // Update game high scores from localStorage
            loadGameScores();
        }, 500);
    } else {
        // Wrong password animation
        lockPassword.style.animation = 'shake 0.5s';
        lockPassword.value = '';
        setTimeout(() => {
            lockPassword.style.animation = '';
        }, 500);
        
        showNotification('Wrong Password', 'Try "macos" or leave empty', 'error');
    }
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(title, message, type = 'info') {
    if (type === 'error') {
        playSound('error');
    } else if (type === 'success') {
        playSound('success');
    }
    
    const notification = {
        id: Date.now(),
        title,
        message,
        type,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    systemState.notifications.unshift(notification);
    
    const notificationEl = document.createElement('div');
    notificationEl.className = `notification-item ${type}`;
    notificationEl.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-time">${notification.time}</div>
    `;
    
    const notificationsList = document.querySelector('.notifications-list');
    notificationsList.insertBefore(notificationEl, notificationsList.firstChild);
    
    // Show toast notification
    showToast(title, message, type);
    
    // Limit notifications
    if(systemState.notifications.length > 20) {
        systemState.notifications.pop();
        if(notificationsList.lastChild) {
            notificationsList.lastChild.remove();
        }
    }
}

function showToast(title, message, type) {
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
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
    }, 3000);
}

// ========== APP WINDOW SYSTEM ==========
function createAppWindow(appName) {
    playSound('click');
    
    // Check if window already exists
    const existingWindow = document.getElementById(`${appName}Window`);
    if (existingWindow) {
        existingWindow.style.display = 'block';
        existingWindow.style.zIndex = getHighestZIndex() + 1;
        systemState.activeApp = appName;
        updateDockIndicators();
        
        // Make draggable if not already
        if (!existingWindow.classList.contains('draggable-setup')) {
            makeWindowDraggable(existingWindow);
            setupWindowControls(existingWindow);
            existingWindow.classList.add('draggable-setup');
        }
        
        // Position window
        positionWindow(existingWindow);
        return existingWindow;
    }
    
    // Create new window
    const windowId = `${appName}_${Date.now()}`;
    const windowHTML = createWindowHTML(appName, windowId);
    
    const container = document.getElementById('windowsContainer');
    container.insertAdjacentHTML('beforeend', windowHTML);
    
    const newWindow = document.getElementById(windowId);
    systemState.openWindows.push(newWindow);
    systemState.activeApp = appName;
    
    updateDockIndicators();
    makeWindowDraggable(newWindow);
    setupWindowControls(newWindow);
    positionWindow(newWindow);
    
    // Initialize app-specific functionality
    initializeApp(appName, newWindow);
    
    return newWindow;
}

function createWindowHTML(appName, id) {
    const title = appName.charAt(0).toUpperCase() + appName.slice(1);
    
    switch(appName) {
        case 'finder':
            return `
                <div class="app-window" id="${id}" data-app="${appName}">
                    <div class="window-titlebar">
                        <div class="window-controls">
                            <div class="window-control close"></div>
                            <div class="window-control minimize"></div>
                            <div class="window-control expand"></div>
                        </div>
                        <div class="window-title">Finder</div>
                    </div>
                    <div class="window-content">
                        <h3>Finder</h3>
                        <p>Browse your files and folders.</p>
                        <p>Created by Neel Patel</p>
                    </div>
                </div>
            `;
        default:
            return `
                <div class="app-window" id="${id}" data-app="${appName}">
                    <div class="window-titlebar">
                        <div class="window-controls">
                            <div class="window-control close"></div>
                            <div class="window-control minimize"></div>
                            <div class="window-control expand"></div>
                        </div>
                        <div class="window-title">${title}</div>
                    </div>
                    <div class="window-content">
                        <h3>Welcome to ${title}</h3>
                        <p>This is a macOS web application.</p>
                        <p>Created by Neel Patel</p>
                    </div>
                </div>
            `;
    }
}

function positionWindow(windowElement) {
    const maxX = window.innerWidth - 400;
    const maxY = window.innerHeight - 300;
    windowElement.style.left = Math.max(50, Math.random() * maxX) + 'px';
    windowElement.style.top = Math.max(50, Math.random() * maxY) + 'px';
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

// ========== WINDOW CONTROLS ==========
function makeWindowDraggable(windowElement) {
    const titlebar = windowElement.querySelector('.window-titlebar');
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    titlebar.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    function startDrag(e) {
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
        playSound('click');
        windowElement.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            windowElement.remove();
            systemState.openWindows = systemState.openWindows.filter(w => w !== windowElement);
            updateDockIndicators();
        }, 300);
    });
    
    minimizeBtn.addEventListener('click', () => {
        playSound('click');
        windowElement.style.display = 'none';
    });
    
    expandBtn.addEventListener('click', () => {
        playSound('click');
        if(windowElement.classList.contains('maximized')) {
            windowElement.classList.remove('maximized');
            windowElement.style.width = '400px';
            windowElement.style.height = '300px';
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

// ========== PRE-BUILT APPS ==========
function initializeApp(appName, windowElement) {
    switch(appName) {
        case 'safari':
            setupSafari();
            break;
        case 'music':
            setupMusic();
            break;
        case 'calculator':
            setupCalculator();
            break;
        case 'terminal':
            setupTerminal();
            break;
        case 'snake':
            setupSnakeGame();
            break;
        case 'pacman':
            setupPacmanGame();
            break;
        case 'preferences':
            setupPreferences();
            break;
    }
}

// Safari
function setupSafari() {
    const backBtn = document.getElementById('safariBack');
    const forwardBtn = document.getElementById('safariForward');
    const reloadBtn = document.getElementById('safariReload');
    
    if (backBtn) backBtn.addEventListener('click', () => showNotification('Safari', 'Going back', 'info'));
    if (forwardBtn) forwardBtn.addEventListener('click', () => showNotification('Safari', 'Going forward', 'info'));
    if (reloadBtn) reloadBtn.addEventListener('click', () => showNotification('Safari', 'Reloading page', 'info'));
}

// Music
function setupMusic() {
    const musicCards = document.querySelectorAll('.music-card');
    const playBtn = document.querySelector('.play-btn');
    
    musicCards.forEach(card => {
        card.addEventListener('click', () => {
            const song = card.querySelector('h4').textContent;
            const artist = card.querySelector('p').textContent;
            
            document.querySelector('.np-info h3').textContent = song;
            document.querySelector('.np-info p').textContent = artist;
            
            if (playBtn) {
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                playBtn.classList.add('playing');
            }
            
            showNotification('Music', `Now playing: ${song}`, 'success');
        });
    });
    
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            if (this.classList.contains('playing')) {
                this.innerHTML = '<i class="fas fa-play"></i>';
                this.classList.remove('playing');
                showNotification('Music', 'Playback paused', 'info');
            } else {
                this.innerHTML = '<i class="fas fa-pause"></i>';
                this.classList.add('playing');
                showNotification('Music', 'Playback started', 'success');
            }
        });
    }
}

// Calculator
function setupCalculator() {
    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    
    const display = document.querySelector('.calc-current');
    const buttons = document.querySelectorAll('.calc-btn');
    
    function updateDisplay() {
        display.textContent = currentInput;
    }
    
    function appendNumber(num) {
        if (currentInput === '0' || currentInput === 'Error') {
            currentInput = num;
        } else {
            currentInput += num;
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
        
        if (isNaN(prev) || isNaN(current)) {
            currentInput = 'Error';
            return;
        }
        
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
                if (current === 0) {
                    currentInput = 'Error';
                    return;
                }
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
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;
            
            if (button.classList.contains('function')) {
                switch(value) {
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

// Terminal
function setupTerminal() {
    const terminalInput = document.getElementById('terminalInput');
    const terminalOutput = document.querySelector('.terminal-output');
    
    const commands = {
        'help': 'Available commands: help, clear, date, time, echo [text], ls, about, games, neel',
        'clear': function() {
            terminalOutput.innerHTML = '';
            return '';
        },
        'date': () => new Date().toLocaleDateString(),
        'time': () => new Date().toLocaleTimeString(),
        'echo': (args) => args.join(' '),
        'ls': 'Desktop    Documents    Applications    Games',
        'about': 'macOS Web v1.0 by Neel Patel - A complete macOS simulation in browser',
        'games': 'Available games: Snake and Pac-Man. Open from desktop!',
        'neel': 'Creator: Neel Patel - Web Developer & Designer'
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
    
    if (terminalInput) {
        terminalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
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
    }
}

// ========== GAME SYSTEM ==========
let snakeGame = null;
let pacmanGame = null;

function loadGameScores() {
    const snakeHigh = localStorage.getItem('snakeHighScore') || 0;
    const pacmanHigh = localStorage.getItem('pacmanHighScore') || 0;
    
    systemState.gameScores.snakeHigh = parseInt(snakeHigh);
    systemState.gameScores.pacmanHigh = parseInt(pacmanHigh);
    
    document.getElementById('snakeHighScore').textContent = snakeHigh;
    document.getElementById('pacmanHighScore').textContent = pacmanHigh;
}

function saveGameScore(game, score) {
    if (score > systemState.gameScores[`${game}High`]) {
        systemState.gameScores[`${game}High`] = score;
        localStorage.setItem(`${game}HighScore`, score);
        
        document.getElementById(`${game}HighScore`).textContent = score;
        showNotification('New High Score!', `${score} points in ${game}`, 'success');
    }
}

// Snake Game
function setupSnakeGame() {
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('snakeStart');
    const pauseBtn = document.getElementById('snakePause');
    const resetBtn = document.getElementById('snakeReset');
    const scoreElement = document.getElementById('snakeScore');
    const highScoreElement = document.getElementById('snakeHighScore');
    
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    let snake = [
        {x: 10, y: 10}
    ];
    let food = {};
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameRunning = false;
    let gameLoop;
    
    function randomTile() {
        return Math.floor(Math.random() * tileCount);
    }
    
    function generateFood() {
        food = {
            x: randomTile(),
            y: randomTile()
        };
        
        // Make sure food doesn't spawn on snake
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                generateFood();
                break;
            }
        }
    }
    
    function drawGame() {
        // Clear canvas
        ctx.fillStyle = '#1d1d1f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        ctx.fillStyle = '#34c759';
        for (let segment of snake) {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        }
        
        // Draw food
        ctx.fillStyle = '#ff3b30';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }
    }
    
    function updateGame() {
        if (!gameRunning) return;
        
        // Move snake head
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        
        // Wall collision
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }
        
        // Self collision
        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                gameOver();
                return;
            }
        }
        
        // Add new head
        snake.unshift(head);
        
        // Food collision
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;
            playSound('game');
            generateFood();
        } else {
            // Remove tail if no food eaten
            snake.pop();
        }
        
        drawGame();
    }
    
    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);
        
        saveGameScore('snake', score);
        
        // Show game over modal
        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalHighScore').textContent = systemState.gameScores.snakeHigh;
        document.getElementById('gameOverTitle').textContent = 'Snake Game Over!';
        document.getElementById('gameOverModal').classList.add('active');
        
        showNotification('Game Over', `Snake score: ${score}`, 'info');
    }
    
    function resetGame() {
        snake = [{x: 10, y: 10}];
        dx = 0;
        dy = 0;
        score = 0;
        scoreElement.textContent = '0';
        highScoreElement.textContent = systemState.gameScores.snakeHigh;
        generateFood();
        drawGame();
    }
    
    function startGame() {
        if (gameRunning) return;
        gameRunning = true;
        resetGame();
        
        gameLoop = setInterval(updateGame, 150);
        showNotification('Snake Game', 'Game started! Use arrow keys', 'success');
    }
    
    function pauseGame() {
        gameRunning = !gameRunning;
        if (gameRunning) {
            gameLoop = setInterval(updateGame, 150);
            pauseBtn.textContent = '⏸ Pause';
        } else {
            clearInterval(gameLoop);
            pauseBtn.textContent = '▶ Resume';
        }
    }
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    resetBtn.addEventListener('click', resetGame);
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (dy !== 1) { dx = 0; dy = -1; }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (dy !== -1) { dx = 0; dy = 1; }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (dx !== 1) { dx = -1; dy = 0; }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (dx !== -1) { dx = 1; dy = 0; }
                break;
            case ' ':
                pauseGame();
                break;
        }
    });
    
    // Initialize
    generateFood();
    drawGame();
    snakeGame = { startGame, pauseGame, resetGame };
}

// Pac-Man Game (Simplified)
function setupPacmanGame() {
    const canvas = document.getElementById('pacmanCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('pacmanStart');
    const pauseBtn = document.getElementById('pacmanPause');
    const resetBtn = document.getElementById('pacmanReset');
    const scoreElement = document.getElementById('pacmanScore');
    const livesElement = document.getElementById('pacmanLives');
    const levelElement = document.getElementById('pacmanLevel');
    
    const gridSize = 20;
    let pacman = { x: 10, y: 10, dx: 0, dy: 0 };
    let dots = [];
    let ghosts = [];
    let score = 0;
    let lives = 3;
    let level = 1;
    let gameRunning = false;
    let gameLoop;
    
    function initGame() {
        // Create dots
        dots = [];
        for (let x = 2; x < 28; x++) {
            for (let y = 2; y < 18; y++) {
                if (Math.random() > 0.3) { // 70% chance of dot
                    dots.push({ x, y });
                }
            }
        }
        
        // Create ghosts
        ghosts = [
            { x: 5, y: 5, dx: 1, dy: 0, color: '#ff3b30' },
            { x: 25, y: 5, dx: -1, dy: 0, color: '#ff9500' },
            { x: 5, y: 15, dx: 0, dy: 1, color: '#007aff' },
            { x: 25, y: 15, dx: 0, dy: -1, color: '#34c759' }
        ];
        
        pacman = { x: 10, y: 10, dx: 0, dy: 0 };
    }
    
    function drawGame() {
        // Clear canvas
        ctx.fillStyle = '#1d1d1f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw dots
        ctx.fillStyle = '#ffcc00';
        for (let dot of dots) {
            ctx.beginPath();
            ctx.arc(dot.x * gridSize + gridSize/2, dot.y * gridSize + gridSize/2, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw Pac-Man
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(pacman.x * gridSize + gridSize/2, pacman.y * gridSize + gridSize/2, gridSize/2 - 2, 0.2, Math.PI * 2 - 0.2);
        ctx.lineTo(pacman.x * gridSize + gridSize/2, pacman.y * gridSize + gridSize/2);
        ctx.fill();
        
        // Draw ghosts
        for (let ghost of ghosts) {
            ctx.fillStyle = ghost.color;
            ctx.beginPath();
            ctx.arc(ghost.x * gridSize + gridSize/2, ghost.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Ghost eyes
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(ghost.x * gridSize + gridSize/2 - 4, ghost.y * gridSize + gridSize/2 - 4, 3, 0, Math.PI * 2);
            ctx.arc(ghost.x * gridSize + gridSize/2 + 4, ghost.y * gridSize + gridSize/2 - 4, 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#007aff';
            ctx.beginPath();
            ctx.arc(ghost.x * gridSize + gridSize/2 - 4, ghost.y * gridSize + gridSize/2 - 4, 1.5, 0, Math.PI * 2);
            ctx.arc(ghost.x * gridSize + gridSize/2 + 4, ghost.y * gridSize + gridSize/2 - 4, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    function updateGame() {
        if (!gameRunning) return;
        
        // Move Pac-Man
        pacman.x += pacman.dx;
        pacman.y += pacman.dy;
        
        // Wall collision
        if (pacman.x < 0) pacman.x = 0;
        if (pacman.x >= canvas.width / gridSize) pacman.x = canvas.width / gridSize - 1;
        if (pacman.y < 0) pacman.y = 0;
        if (pacman.y >= canvas.height / gridSize) pacman.y = canvas.height / gridSize - 1;
        
        // Collect dots
        dots = dots.filter(dot => {
            if (Math.abs(dot.x - pacman.x) < 0.5 && Math.abs(dot.y - pacman.y) < 0.5) {
                score += 10;
                scoreElement.textContent = score;
                playSound('game');
                return false;
            }
            return true;
        });
        
        // Move ghosts
        for (let ghost of ghosts) {
            ghost.x += ghost.dx;
            ghost.y += ghost.dy;
            
            // Bounce off walls
            if (ghost.x <= 1 || ghost.x >= canvas.width / gridSize - 2) ghost.dx *= -1;
            if (ghost.y <= 1 || ghost.y >= canvas.height / gridSize - 2) ghost.dy *= -1;
            
            // Ghost collision
            if (Math.abs(ghost.x - pacman.x) < 0.8 && Math.abs(ghost.y - pacman.y) < 0.8) {
                lives--;
                livesElement.textContent = lives;
                
                if (lives <= 0) {
                    gameOver();
                    return;
                }
                
                // Reset positions
                pacman.x = 10;
                pacman.y = 10;
                ghost.x = Math.random() > 0.5 ? 5 : 25;
                ghost.y = Math.random() > 0.5 ? 5 : 15;
                
                showNotification('Pac-Man', `Hit by ghost! Lives: ${lives}`, 'error');
            }
        }
        
        // Level complete
        if (dots.length === 0) {
            level++;
            levelElement.textContent = level;
            initGame();
            showNotification('Pac-Man', `Level ${level}!`, 'success');
        }
        
        drawGame();
    }
    
    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);
        
        saveGameScore('pacman', score);
        
        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalHighScore').textContent = systemState.gameScores.pacmanHigh;
        document.getElementById('gameOverTitle').textContent = 'Pac-Man Game Over!';
        document.getElementById('gameOverModal').classList.add('active');
        
        showNotification('Game Over', `Pac-Man score: ${score}`, 'info');
    }
    
    function startGame() {
        if (gameRunning) return;
        gameRunning = true;
        
        gameLoop = setInterval(updateGame, 200);
        showNotification('Pac-Man', 'Game started! Use arrow keys', 'success');
    }
    
    function pauseGame() {
        gameRunning = !gameRunning;
        if (gameRunning) {
            gameLoop = setInterval(updateGame, 200);
            pauseBtn.textContent = '⏸ Pause';
        } else {
            clearInterval(gameLoop);
            pauseBtn.textContent = '▶ Resume';
        }
    }
    
    function resetGame() {
        score = 0;
        lives = 3;
        level = 1;
        scoreElement.textContent = '0';
        livesElement.textContent = '3';
        levelElement.textContent = '1';
        initGame();
        drawGame();
    }
    
    // Event listeners
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    resetBtn.addEventListener('click', resetGame);
    
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
                pacman.dx = 0;
                pacman.dy = -1;
                break;
            case 'ArrowDown':
                pacman.dx = 0;
                pacman.dy = 1;
                break;
            case 'ArrowLeft':
                pacman.dx = -1;
                pacman.dy = 0;
                break;
            case 'ArrowRight':
                pacman.dx = 1;
                pacman.dy = 0;
                break;
            case ' ':
                pauseGame();
                break;
        }
    });
    
    // Initialize
    initGame();
    drawGame();
    pacmanGame = { startGame, pauseGame, resetGame };
}

// System Preferences
function setupPreferences() {
    const panelContainer = document.getElementById('preferencesPanel');
    
    function loadPanel(panelId) {
        let panelHTML = '';
        
        switch(panelId) {
            case 'general':
                panelHTML = `
                    <div class="preference-panel">
                        <h2>General</h2>
                        <div class="preference-item">
                            <label>Appearance</label>
                            <select>
                                <option>Light</option>
                                <option>Dark</option>
                                <option>Auto</option>
                            </select>
                        </div>
                        <div class="preference-item">
                            <label>Accent Color</label>
                            <div class="color-picker">
                                <div class="color-option" style="background: #007aff;"></div>
                                <div class="color-option" style="background: #34c759;"></div>
                                <div class="color-option" style="background: #ff9500;"></div>
                            </div>
                        </div>
                    </div>
                `;
                break;
            case 'sound':
                panelHTML = `
                    <div class="preference-panel">
                        <h2>Sound</h2>
                        <div class="preference-item">
                            <label>Volume</label>
                            <input type="range" min="0" max="100" value="${systemState.volume * 100}">
                        </div>
                        <div class="preference-item">
                            <label>
                                <input type="checkbox" ${systemState.soundEnabled ? 'checked' : ''}>
                                Enable Sounds
                            </label>
                        </div>
                        <button class="game-btn" onclick="document.getElementById('soundTestModal').classList.add('active')">
                            Test Sounds
                        </button>
                    </div>
                `;
                break;
            case 'games':
                panelHTML = `
                    <div class="preference-panel">
                        <h2>Games</h2>
                        <div class="preference-item">
                            <h4>High Scores</h4>
                            <p>Snake: ${systemState.gameScores.snakeHigh}</p>
                            <p>Pac-Man: ${systemState.gameScores.pacmanHigh}</p>
                        </div>
                        <div class="preference-item">
                            <button class="game-btn" onclick="localStorage.clear(); loadGameScores(); showNotification('Games', 'Scores reset', 'info')">
                                Reset Scores
                            </button>
                        </div>
                    </div>
                `;
                break;
        }
        
        panelContainer.innerHTML = panelHTML;
        
        // Update active sidebar item
        document.querySelectorAll('.preferences-sidebar .sidebar-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-pref') === panelId) {
                item.classList.add('active');
            }
        });
    }
    
    // Sidebar click handlers
    document.querySelectorAll('.preferences-sidebar .sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            const panelId = item.getAttribute('data-pref');
            loadPanel(panelId);
        });
    });
    
    // Load default panel
    loadPanel('general');
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', () => {
    // Update time
    updateTime();
    
    // Unlock button
    unlockBtn.addEventListener('click', unlockMac);
    
    // Password field enter key
    lockPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            unlockMac();
        }
    });
    
    // Click anywhere on lock screen to unlock
    lockScreen.addEventListener('click', (e) => {
        if (e.target === lockScreen || e.target.classList.contains('unlock-hint')) {
            unlockMac();
        }
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
        item.addEventListener('click', () => {
            const appName = item.getAttribute('data-app');
            
            if (appName === 'trash') {
                const trashWindow = document.getElementById('trashWindow');
                if (trashWindow.style.display === 'none') {
                    trashWindow.style.display = 'block';
                    trashWindow.style.zIndex = getHighestZIndex() + 1;
                    makeWindowDraggable(trashWindow);
                    setupWindowControls(trashWindow);
                    positionWindow(trashWindow);
                } else {
                    trashWindow.style.display = 'none';
                }
            } else if (appName === 'missioncontrol') {
                showNotification('Mission Control', 'Press F3 to open', 'info');
            } else if (appName === 'launchpad') {
                showNotification('Launchpad', 'Press F4 to open', 'info');
            } else {
                createAppWindow(appName);
            }
        });
    });
    
    // Context menu
    document.addEventListener('contextmenu', (e) => {
        if (!e.target.closest('.app-window')) {
            e.preventDefault();
            contextMenu.style.display = 'block';
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
        }
    });
    
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });
    
    // Context menu actions
    document.querySelectorAll('.context-menu .menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            showNotification('Context Menu', `Action: ${action}`, 'info');
        });
    });
    
    // Notification center
    document.querySelector('.status-icons').addEventListener('click', (e) => {
        if (e.target.closest('.status-icons')) {
            notificationCenter.classList.toggle('active');
        }
    });
    
    closeNotifications.addEventListener('click', () => {
        notificationCenter.classList.remove('active');
    });
    
    // Spotlight
    if (spotlightBtn) {
        spotlightBtn.addEventListener('click', () => {
            document.getElementById('spotlight').style.display = 'block';
            document.getElementById('spotlightInput').focus();
        });
    }
    
    document.getElementById('closeSpotlight').addEventListener('click', () => {
        document.getElementById('spotlight').style.display = 'none';
    });
    
    // Sound test modal
    document.getElementById('closeSoundTest').addEventListener('click', () => {
        document.getElementById('soundTestModal').classList.remove('active');
    });
    
    document.querySelectorAll('.sound-test-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sound = btn.getAttribute('data-sound');
            playSound(sound);
        });
    });
    
    // Game over modal
    document.getElementById('playAgain').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
        if (snakeGame) snakeGame.resetGame();
        if (pacmanGame) pacmanGame.resetGame();
    });
    
    document.getElementById('backToMenu').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('active');
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // F3 for Mission Control
        if (e.key === 'F3') {
            showNotification('Mission Control', 'Feature coming soon!', 'info');
        }
        
        // F4 for Launchpad
        if (e.key === 'F4') {
            showNotification('Launchpad', 'Feature coming soon!', 'info');
        }
        
        // Cmd/Ctrl + Space for Spotlight
        if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
            e.preventDefault();
            document.getElementById('spotlight').style.display = 'block';
            document.getElementById('spotlightInput').focus();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            document.getElementById('spotlight').style.display = 'none';
            document.getElementById('soundTestModal').classList.remove('active');
            document.getElementById('gameOverModal').classList.remove('active');
            notificationCenter.classList.remove('active');
        }
    });
    
    // Auto-show hint
    setTimeout(() => {
        showNotification('Welcome', 'Double-click icons to open apps. Try the games!', 'info');
    }, 2000);
});

// Add notification toast styles
const style = document.createElement('style');
style.textContent = `
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
document.head.appendChild(style);