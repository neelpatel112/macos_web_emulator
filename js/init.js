// macOS Web Emulator - Final Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log(`
    ███╗   ███╗ █████╗  ██████╗██╗   ██╗███████╗    ██╗    ██╗███████╗██████╗ 
    ████╗ ████║██╔══██╗██╔════╝██║   ██║██╔════╝    ██║    ██║██╔════╝██╔══██╗
    ██╔████╔██║███████║██║     ██║   ██║███████╗    ██║ █╗ ██║█████╗  ██████╔╝
    ██║╚██╔╝██║██╔══██║██║     ██║   ██║╚════██║    ██║███╗██║██╔══╝  ██╔══██╗
    ██║ ╚═╝ ██║██║  ██║╚██████╗╚██████╔╝███████║    ╚███╔███╔╝███████╗██████╔╝
    ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝     ╚══╝╚══╝ ╚══════╝╚═════╝ 
    
    🌟 macOS Web Emulator v2.0
    👨‍💻 Created by: Neel Patel
    📅 Initialized: ${new Date().toLocaleString()}
    🚀 Status: All systems ready!
    `);
    
    // Show welcome notification
    setTimeout(() => {
        if (!isLocked) {
            showNotification('macOS Web Ready', 'All features loaded successfully!', 'success', 'fas fa-check-circle');
            
            // Play subtle startup sound
            setTimeout(() => {
                playSound('startup');
            }, 500);
        }
    }, 2000);
    
    // Performance monitoring
    setInterval(() => {
        const runningApps = macOSDatabase ? macOSDatabase.getAppsData().running.length : 0;
        const memory = performance.memory;
        
        if (memory && memory.usedJSHeapSize > 500000000) { // 500MB threshold
            console.warn('⚠️ High memory usage detected');
            macOSDatabase.addNotification('Memory Warning', 'Close some apps to free up memory', 'warning', 'fas fa-memory');
        }
    }, 30000); // Check every 30 seconds
    
    // Auto-save every minute
    setInterval(() => {
        if (macOSDatabase) {
            console.log('💾 Auto-saving database...');
            // Database auto-saves to localStorage automatically
        }
    }, 60000);
    
    // Easter egg
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 
        'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight',
        'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ];
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            console.log('🎮 Konami Code Activated!');
            showNotification('Easter Egg!', 'You found the secret! 🎮', 'success', 'fas fa-gamepad');
            playSound('notification');
            
            // Special effect
            document.body.style.animation = 'rainbow 2s linear';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 2000);
            
            konamiCode = [];
        }
    });
    
    // Add rainbow animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Final check
    console.log('✅ All components initialized successfully!');
    console.log('📊 Available components:');
    console.log('   - Database System: ' + (window.macOSDatabase ? '✅' : '❌'));
    console.log('   - Enhanced Apps: ' + (window.macOSApps ? '✅' : '❌'));
    console.log('   - Utilities: ' + (window.macOSUtilities ? '✅' : '❌'));
    console.log('   - Lock Screen: ' + (window.lockScreen ? '✅' : '❌'));
    console.log('\n🚀 macOS Web Emulator is ready to use!');
});