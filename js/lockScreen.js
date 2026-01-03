// macOS Web - Lock Screen Module
class LockScreen {
    constructor() {
        this.lockScreen = document.getElementById('lockScreen');
        this.desktop = document.getElementById('desktop');
        this.lockPassword = document.getElementById('lockPassword');
        this.unlockBtn = document.getElementById('unlockBtn');
        this.isLocked = true;
        this.isSleeping = false;
        
        // Time elements
        this.lockTime = document.getElementById('lockTime');
        this.lockDate = document.getElementById('lockDate');
        this.lockTimeSmall = document.getElementById('lockTimeSmall');
        this.lockDateSmall = document.getElementById('lockDateSmall');
        
        this.init();
    }
    
    init() {
        console.log('🔒 Lock Screen Initialized');
        
        // Play startup sound
        this.playStartupSound();
        
        // Set initial time
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Add biometric click handler
        this.setupBiometric();
        
        // Animate in
        this.animateIn();
    }
    
    animateIn() {
        this.lockScreen.style.opacity = '0';
        setTimeout(() => {
            this.lockScreen.style.transition = 'opacity 0.8s ease-out';
            this.lockScreen.style.opacity = '1';
        }, 100);
    }
    
    updateTime() {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const timeString = now.toLocaleTimeString([], timeOptions);
        const dateString = now.toLocaleDateString('en-US', dateOptions);
        
        // Update all time displays
        [this.lockTime, this.lockTimeSmall].forEach(el => {
            if (el) el.textContent = timeString;
        });
        
        [this.lockDate, this.lockDateSmall].forEach(el => {
            if (el) el.textContent = dateString;
        });
    }
    
    setupEventListeners() {
        // Unlock button
        if (this.unlockBtn) {
            this.unlockBtn.addEventListener('click', () => this.unlock());
        }
        
        // Password field enter key
        if (this.lockPassword) {
            this.lockPassword.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.unlock();
                }
            });
            
            // Clear error on input
            this.lockPassword.addEventListener('input', () => {
                this.lockPassword.classList.remove('password-error');
            });
            
            // Auto-focus
            setTimeout(() => {
                if (this.isLocked && this.lockPassword) {
                    this.lockPassword.focus();
                }
            }, 1000);
        }
        
        // Click anywhere to focus password
        this.lockScreen.addEventListener('click', (e) => {
            if (e.target === this.lockScreen || 
                e.target.classList.contains('lock-screen-content') ||
                e.target.classList.contains('time-display') ||
                e.target.classList.contains('user-profile')) {
                if (this.lockPassword) {
                    this.lockPassword.focus();
                }
            }
        });
        
        // Power buttons
        const powerButtons = {
            lockSleepBtn: () => this.sleep(),
            lockRestartBtn: () => this.showRestartModal(),
            lockShutdownBtn: () => this.showShutdownModal()
        };
        
        Object.entries(powerButtons).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });
        
        // Quick actions
        const quickActions = {
            quickNotifications: () => this.showNotifications(),
            quickFlashlight: () => this.toggleFlashlight(),
            quickCamera: () => this.openCamera()
        };
        
        Object.entries(quickActions).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });
        
        // Emergency SOS
        const sosBtn = document.getElementById('emergencySOS');
        if (sosBtn) {
            sosBtn.addEventListener('click', () => this.emergencySOS());
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (!this.isLocked) return;
            
            // Escape to cancel input
            if (e.key === 'Escape' && this.lockPassword) {
                this.lockPassword.value = '';
                this.lockPassword.blur();
            }
            
            // Space to wake from sleep
            if (this.isSleeping && e.key === ' ') {
                this.wakeUp();
            }
        });
    }
    
    setupBiometric() {
        const biometric = document.querySelector('.biometric-indicator');
        if (biometric) {
            biometric.addEventListener('click', () => {
                this.attemptBiometricUnlock();
            });
        }
    }
    
    async attemptBiometricUnlock() {
        console.log('🖐️ Attempting biometric unlock...');
        
        // Simulate Touch ID/Face ID
        const biometricIcon = document.querySelector('.biometric-icon');
        if (biometricIcon) {
            biometricIcon.style.background = 'rgba(52, 199, 89, 0.3)';
            biometricIcon.style.color = '#ffffff';
            
            // Show scanning animation
            biometricIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            // Simulate scan delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simulate successful scan (80% success rate)
            if (Math.random() < 0.8) {
                biometricIcon.innerHTML = '<i class="fas fa-check"></i>';
                biometricIcon.style.background = 'rgba(52, 199, 89, 0.5)';
                
                // Auto-unlock after successful scan
                setTimeout(() => {
                    this.unlock();
                }, 500);
            } else {
                biometricIcon.innerHTML = '<i class="fas fa-times"></i>';
                biometricIcon.style.background = 'rgba(255, 59, 48, 0.3)';
                biometricIcon.style.color = '#ff3b30';
                
                // Reset after 2 seconds
                setTimeout(() => {
                    biometricIcon.innerHTML = '<i class="fas fa-fingerprint"></i>';
                    biometricIcon.style.background = 'rgba(255, 255, 255, 0.1)';
                    biometricIcon.style.color = '#34c759';
                }, 2000);
            }
        }
    }
    
    unlock() {
        console.log('🔓 Unlock attempt...');
        
        const password = this.lockPassword ? this.lockPassword.value : '';
        const validPasswords = ['macos', 'neel', 'macosweb', 'admin', ''];
        
        if (validPasswords.includes(password.toLowerCase())) {
            console.log('✅ Unlock successful');
            this.playUnlockSound();
            
            // Add unlock animation
            this.lockScreen.classList.add('unlock-animation');
            
            // Switch to desktop after animation
            setTimeout(() => {
                this.lockScreen.classList.remove('active');
                this.lockScreen.style.display = 'none';
                
                // Show desktop with animation
                this.desktop.classList.add('active', 'desktop-fade-in');
                this.desktop.style.display = 'block';
                
                this.isLocked = false;
                
                // Clear password
                if (this.lockPassword) {
                    this.lockPassword.value = '';
                }
                
                // Show welcome notification
                setTimeout(() => {
                    if (window.showNotification) {
                        window.showNotification(
                            'Welcome to macOS Web', 
                            'Created by Neel Patel 🚀'
                        );
                    }
                }, 1000);
                
                // Focus desktop
                this.desktop.focus();
                
            }, 1000);
            
        } else {
            console.log('❌ Unlock failed');
            this.showPasswordError();
        }
    }
    
    showPasswordError() {
        if (this.lockPassword) {
            // Add error animation
            this.lockPassword.classList.add('password-error');
            
            // Shake the whole password field
            const passwordField = this.lockPassword.parentElement;
            if (passwordField) {
                passwordField.style.animation = 'shakeError 0.5s ease-in-out';
                setTimeout(() => {
                    passwordField.style.animation = '';
                }, 500);
            }
            
            // Clear password
            this.lockPassword.value = '';
            
            // Play error sound
            if (window.playSound) {
                window.playSound('error');
            }
        }
    }
    
    sleep() {
        console.log('💤 Entering sleep mode...');
        this.isSleeping = true;
        
        // Add sleep animation
        this.lockScreen.classList.add('screen-sleep');
        
        // Play lock sound
        this.playLockSound();
        
        // Show sleep notification
        if (window.showNotification) {
            window.showNotification('Sleep Mode', 'Click or press Space to wake');
        }
        
        // Wake up on click
        const wakeUpHandler = () => {
            if (this.isSleeping) {
                this.wakeUp();
                this.lockScreen.removeEventListener('click', wakeUpHandler);
            }
        };
        
        this.lockScreen.addEventListener('click', wakeUpHandler);
        
        // Also wake up on space key
        document.addEventListener('keydown', (e) => {
            if (this.isSleeping && e.key === ' ') {
                this.wakeUp();
            }
        });
    }
    
    wakeUp() {
        console.log('☀️ Waking up...');
        this.isSleeping = false;
        
        // Remove sleep animation and add wake up animation
        this.lockScreen.classList.remove('screen-sleep');
        this.lockScreen.classList.add('wake-up');
        
        // Play unlock sound
        this.playUnlockSound();
        
        // Focus password field
        setTimeout(() => {
            if (this.lockPassword) {
                this.lockPassword.focus();
            }
            this.lockScreen.classList.remove('wake-up');
        }, 500);
    }
    
    showRestartModal() {
        console.log('🔄 Showing restart modal...');
        const modal = document.getElementById('restartModal');
        if (modal) {
            modal.style.display = 'flex';
            if (window.playSound) {
                window.playSound('click');
            }
        }
    }
    
    showShutdownModal() {
        console.log('⏻ Showing shutdown modal...');
        const modal = document.getElementById('shutdownModal');
        if (modal) {
            modal.style.display = 'flex';
            if (window.playSound) {
                window.playSound('click');
            }
        }
    }
    
    showNotifications() {
        console.log('🔔 Showing notifications from lock screen...');
        if (window.showNotification) {
            window.showNotification(
                'Lock Screen Notifications',
                'Notifications are limited on lock screen'
            );
        }
    }
    
    toggleFlashlight() {
        console.log('🔦 Toggling flashlight...');
        // Toggle screen brightness
        const currentBrightness = this.lockScreen.style.filter || 'brightness(1)';
        const newBrightness = currentBrightness.includes('brightness(3)') 
            ? 'brightness(1)' 
            : 'brightness(3)';
        
        this.lockScreen.style.transition = 'filter 0.3s ease';
        this.lockScreen.style.filter = newBrightness;
        
        if (window.playSound) {
            window.playSound('click');
        }
    }
    
    openCamera() {
        console.log('📸 Opening camera from lock screen...');
        if (window.showNotification) {
            window.showNotification(
                'Camera Access',
                'Camera is not available in web version'
            );
        }
    }
    
    emergencySOS() {
        console.log('🚨 Emergency SOS activated!');
        
        // Visual emergency effect
        this.lockScreen.style.animation = 'none';
        setTimeout(() => {
            this.lockScreen.style.animation = 'emergencyPulse 0.5s infinite alternate';
        }, 10);
        
        // Play emergency sound
        if (window.playSound) {
            window.playSound('error');
        }
        
        // Show emergency message
        if (window.showNotification) {
            window.showNotification(
                'EMERGENCY SOS',
                'Emergency services would be contacted in real macOS'
            );
        }
        
        // Reset after 5 seconds
        setTimeout(() => {
            this.lockScreen.style.animation = '';
        }, 5000);
    }
    
    // Audio methods
    playStartupSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // macOS M1-like startup sound (chime)
            oscillator.type = 'sine';
            
            const now = audioContext.currentTime;
            
            // First chime - C5
            oscillator.frequency.setValueAtTime(523.25, now);
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1);
            
            // Second chime - E5 (delayed)
            oscillator.frequency.setValueAtTime(659.25, now + 0.1);
            gainNode.gain.setValueAtTime(0, now + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.15);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            
            // Third chime - G5 (delayed)
            oscillator.frequency.setValueAtTime(783.99, now + 0.2);
            gainNode.gain.setValueAtTime(0, now + 0.2);
            gainNode.gain.linearRampToValueAtTime(0.15, now + 0.25);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            
            oscillator.start(now);
            oscillator.stop(now + 1.5);
            
        } catch (error) {
            console.log('Web Audio API error:', error);
        }
    }
    
    playUnlockSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Unlock sound (smooth ascending tone)
            oscillator.type = 'sine';
            
            const now = audioContext.currentTime;
            oscillator.frequency.setValueAtTime(440, now);
            oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.3);
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            oscillator.start(now);
            oscillator.stop(now + 0.5);
            
        } catch (error) {
            console.log('Audio error:', error);
        }
    }
    
    playLockSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Lock sound (descending tone)
            oscillator.type = 'sine';
            
            const now = audioContext.currentTime;
            oscillator.frequency.setValueAtTime(880, now);
            oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.3);
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            
            oscillator.start(now);
            oscillator.stop(now + 0.4);
            
        } catch (error) {
            console.log('Audio error:', error);
        }
    }
    
    // Public method to lock the screen
    lock() {
        console.log('🔒 Locking screen...');
        
        this.isLocked = true;
        
        // Play lock sound
        this.playLockSound();
        
        // Hide desktop
        this.desktop.classList.remove('active');
        this.desktop.style.display = 'none';
        
        // Show lock screen with animation
        this.lockScreen.style.display = 'block';
        this.lockScreen.classList.add('active', 'wake-up');
        
        // Reset animation
        setTimeout(() => {
            this.lockScreen.classList.remove('wake-up');
        }, 500);
        
        // Focus password field
        setTimeout(() => {
            if (this.lockPassword) {
                this.lockPassword.focus();
            }
        }, 1000);
    }
}

// Initialize lock screen when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.lockScreen = new LockScreen();
    
    // Make lock method globally available
    window.lockMac = () => {
        if (window.lockScreen) {
            window.lockScreen.lock();
        }
    };
    
    // Make sleep method globally available
    window.sleepMac = () => {
        if (window.lockScreen) {
            window.lockScreen.sleep();
        }
    };
});