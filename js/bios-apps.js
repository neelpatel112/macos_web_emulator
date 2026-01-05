// In your macOS project, create bios-app.js
class BIOSLauncher {
    static open() {
        // Create a fake BIOS interface within macOS
        const biosWindow = document.createElement('div');
        biosWindow.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 800px; height: 500px; background: #000a14; color: #90ee90;
            border: 2px solid #333; z-index: 10000; font-family: monospace;
            padding: 20px; border-radius: 8px; box-shadow: 0 0 50px rgba(0,0,0,0.9);
        `;
        
        biosWindow.innerHTML = `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 10px;">
                <div style="font-weight: bold;">BIOS Configuration</div>
                <div style="color: #aaa;">v1.0.0</div>
            </div>
            <div style="margin: 20px 0; text-align: center;">
                <div style="font-size: 2em; margin-bottom: 20px;">⚙️</div>
                <h3>System BIOS Interface</h3>
                <p style="color: #aaa; margin: 20px 0;">
                    This would launch the full Web BIOS Simulator.<br>
                    For now, opening in new tab...
                </p>
                <button id="launch-bios-btn" style="
                    background: rgba(144, 238, 144, 0.2);
                    border: 1px solid #90ee90;
                    color: #90ee90;
                    padding: 10px 30px;
                    margin: 10px;
                    cursor: pointer;
                    font-family: monospace;
                    border-radius: 3px;
                ">Launch Full BIOS</button>
                <button id="close-bios-btn" style="
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid #666;
                    color: #aaa;
                    padding: 10px 30px;
                    margin: 10px;
                    cursor: pointer;
                    font-family: monospace;
                    border-radius: 3px;
                ">Close</button>
            </div>
            <div style="position: absolute; bottom: 20px; width: calc(100% - 40px); text-align: center; color: #666; font-size: 0.9em;">
                Web OS Laboratory • Neel Patel
            </div>
        `;
        
        document.body.appendChild(biosWindow);
        
        document.getElementById('launch-bios-btn').onclick = () => {
            window.open('https://phantombios.vercel.app/', '_blank');
            document.body.removeChild(biosWindow);
        };
        
        document.getElementById('close-bios-btn').onclick = () => {
            document.body.removeChild(biosWindow);
        };
    }
}

// Add to your macOS app launcher
// Example: In System Preferences or create new "BIOS Settings" app 