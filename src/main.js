import './styles/style.css';
import { Sparkler } from './entities/Sparkler.js';
import { SnowSystem } from './systems/SnowSystem.js';
import { HandTracker } from './systems/HandTracker.js';
import { BackgroundSystem } from './systems/BackgroundSystem.js';

// 1. Background Canvas (Bottom)
const canvasBg = document.createElement('canvas');
canvasBg.id = 'canvas-bg';
document.body.appendChild(canvasBg);

// 2. Stick Canvas (Middle)
const canvasStick = document.createElement('canvas'); // ... existing code ...
canvasStick.id = 'canvas-stick';
document.body.appendChild(canvasStick);

// 3. Sparks Canvas (Top)
const canvasSparks = document.createElement('canvas'); // ... existing code ...
canvasSparks.id = 'canvas-sparks';
document.body.appendChild(canvasSparks);

// ... UI Code ...

const ctxBg = canvasBg.getContext('2d');
const ctxStick = canvasStick.getContext('2d');
const ctxSparks = canvasSparks.getContext('2d');

let width, height;
// Detect Mobile (Simple width check or User Agent)
const isMobile = window.innerWidth < 600 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Create Systems
// Pass quality settings
const sparkler = new Sparkler(0, 0, isMobile); 
const snow = new SnowSystem(window.innerWidth, window.innerHeight);
const bgSystem = new BackgroundSystem(window.innerWidth, window.innerHeight, isMobile);
const handTracker = new HandTracker();
let arMode = false;
let handPresent = false; 
let lastGesture = ''; 

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvasBg.width = width; // Resize Bg
  canvasBg.height = height;
  canvasStick.width = width;
  canvasStick.height = height;
  canvasSparks.width = width;
  canvasSparks.height = height;
  snow.resize(width, height);
  bgSystem.resize(width, height);
}
window.addEventListener('resize', resize);
resize();

const uiOverlay = document.createElement('div');
uiOverlay.id = 'ui-overlay';
uiOverlay.innerHTML = `
    <div id="instructions">
        <div class="headline" id="main-text"></div>
        <div class="subtext" id="sub-text"></div>
    </div>
    <div id="debug-text"></div>
    <div id="ui-dock">
        <button id="btn-snow" class="dock-button">
            <span class="icon">❄️</span> Snow
        </button>
        <button id="btn-ar" class="dock-button">
            <span class="icon">🪄</span> AR Mode
        </button>
    </div>
`;
document.body.appendChild(uiOverlay);

const snowButton = document.getElementById('btn-snow');
const arButton = document.getElementById('btn-ar');
const mainText = document.getElementById('main-text');
const subText = document.getElementById('sub-text');
const debugText = document.getElementById('debug-text');


// Interaction State
const mouse = { x: width / 2, y: height * 0.8 };
let isInteracting = false; 

window.addEventListener('mousemove', (e) => {
    isInteracting = true;
    if (arMode && handPresent) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('touchmove', (e) => {
    isInteracting = true;
    if (arMode && handPresent) return;
    e.preventDefault();
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
}, { passive: false });

sparkler.x = mouse.x;
sparkler.y = mouse.y;

// AR Handler
handTracker.onLandmarks = (data) => {
    handPresent = true;
    
    if (sparkler.state === 'IDLE') {
        const dx = data.x - sparkler.x;
        const dy = data.y - sparkler.y;
        sparkler.x += dx * 0.3; 
        sparkler.y += dy * 0.3;
    }
    
    if (data.isThumbUp) lastGesture = 'Thumb Up 👍';
    else if (data.isOpenHand) lastGesture = 'Open Hand 🖐';
    else lastGesture = 'Holding ✊';
    
    // Auto-ignite
    if (data.isThumbUp && !sparkler.isLit && sparkler.state === 'IDLE') {
        sparkler.ignite();
    }
    
    sparkler.useGhostHand = false;
};

// Button Listeners
snowButton.addEventListener('click', (e) => {
    e.stopPropagation(); 
    snow.active = !snow.active;
    snowButton.classList.toggle('active', snow.active);
});

arButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    arMode = !arMode;
    arButton.classList.toggle('active', arMode);
    
    if (arMode) {
        mainText.textContent = '';
        subText.textContent = 'Loading Camera...';
        document.body.style.backgroundImage = 'none'; // Hide BG for AR
        try {
            await handTracker.start((data) => {
                handPresent = true;
                sparkler.x = data.x;
                sparkler.y = data.y;
                 if (data.isThumbUp && !sparkler.isLit) {
                    sparkler.ignite();
                }
                sparkler.useGhostHand = false;
            });
             arButton.innerHTML = '<span class="icon">❌</span> Disable AR';
        } catch (err) {
            console.error(err);
            subText.textContent = 'Camera Failed ⚠️';
            arMode = false;
            arButton.classList.remove('active');
        }
    } else {
        handTracker.stop();
        handPresent = false;
        sparkler.useGhostHand = true; 
        arButton.innerHTML = '<span class="icon">🪄</span> AR Mode';
        lastGesture = '';
        document.body.style.backgroundImage = ''; // Restore CSS default
    }
});

function igniteOrReset() {
    if (!sparkler.isLit) {
        if (sparkler.burntLength >= sparkler.length - 1) {
             resetSparkler();
        } else {
             sparkler.ignite();
        }
    }
}

const uiDock = document.getElementById('ui-dock'); // Helper to check containment

window.addEventListener('mousedown', (e) => {
    if (e.target.closest('.dock-button')) return;
    
    // Check Background Handler first (only if not in AR)
    if (!arMode) {
        if (bgSystem.handleClick(e.clientX, e.clientY)) {
            return; // If lamp clicked, don't ignite sparkler
        }
    }
    
    igniteOrReset();
});
window.addEventListener('touchstart', (e) => {
     if (e.target.closest('.dock-button')) return;
     
     if (!arMode) {
        const touch = e.touches[0];
        if (bgSystem.handleClick(touch.clientX, touch.clientY)) {
            return; 
        }
    }
     
     igniteOrReset();
}, { passive: false });


// UI Update Helper
function updateUI() {
    // Debug Text
    debugText.textContent = (arMode && lastGesture) ? `Gesture: ${lastGesture}` : '';
    
    // Instructions
    // Clear by default
    let h = '';
    let s = '';
    
    if (sparkler.state === 'PICKING_UP' || sparkler.state === 'DROPPING') {
        mainText.style.opacity = '0';
        return;
    }
    mainText.style.opacity = '1';

    if (arMode) {
          if (sparkler.state === 'IDLE') {
              if (sparkler.burntLength >= sparkler.length - 1) {
                  h = 'Tap to Drop 👆';
                  s = 'Get a new sparkler';
              } else if (!sparkler.isLit) {
                  h = 'Thumbs Up 👍';
                  s = 'to Light the Sparkler';
              }
          }
    } else {
        if (!sparkler.isLit) {
             if (sparkler.burntLength >= sparkler.length - 1) {
                 h = 'New Sparkler? 🎆';
                 s = 'Tap anywhere';
             } else if (sparkler.burntLength === 0) {
                 h = 'Tap to Light! ✨';
                 s = 'Зажигай! / Zapal!';
             }
        }
    }
    
    // Only update if changed to prevent DOM thrashing
    if (mainText.textContent !== h) mainText.textContent = h;
    if (subText.textContent !== s) subText.textContent = s;
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Layer 0: Background (Deep Blue + Lamps)
  // Only draw if NOT in AR mode
  if (!arMode) {
     bgSystem.update();
     bgSystem.draw(ctxBg);
  } else {
     ctxBg.clearRect(0, 0, width, height); // Clear BG for Camera
  }

  // Layer 1: Stick (Bottom) - Clear completely (transparent)
  ctxStick.clearRect(0, 0, width, height);
  
  // Layer 2: Sparks
  ctxSparks.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
  ctxSparks.globalCompositeOperation = 'destination-out';
  ctxSparks.fillRect(0, 0, width, height);
  ctxSparks.globalCompositeOperation = 'source-over';
  // ... rest of loop ...

  if (sparkler.state === 'DROPPING' && sparkler.y > height + 200) {
     triggerPickup();
  }
  
  let targetX = mouse.x;
  let targetY = mouse.y;
  if (arMode && handPresent) {
      targetX = sparkler.x; 
      targetY = sparkler.y;
  }
  
  sparkler.update(targetX, targetY);
  snow.update();
  
  snow.draw(ctxStick);
  sparkler.drawStick(ctxStick);
  sparkler.drawSparks(ctxSparks);
  
  updateUI();
}

function resetSparkler() {
    sparkler.drop();
}

function triggerPickup() {
    const startX = width / 2;
    const startY = height + 200; 
    let tx = mouse.x;
    let ty = mouse.y;
    if (arMode && handPresent) {
        tx = sparkler.x; 
        ty = sparkler.y; 
    }
    sparkler.pickup(startX, startY, tx, ty);
}

animate();
