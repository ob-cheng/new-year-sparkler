import './style.css';
import { Sparkler } from './Sparkler.js';
import { SnowSystem } from './Snow.js';
import { HandTracker } from './HandTracker.js';

const canvasStick = document.createElement('canvas');
canvasStick.id = 'canvas-stick';
document.body.appendChild(canvasStick);

const canvasSparks = document.createElement('canvas');
canvasSparks.id = 'canvas-sparks';
document.body.appendChild(canvasSparks);

// -- UI Container --
const uiContainer = document.createElement('div');
uiContainer.style.position = 'absolute';
uiContainer.style.top = '10px';
uiContainer.style.right = '10px';
uiContainer.style.zIndex = '100';
uiContainer.style.display = 'flex';
uiContainer.style.gap = '10px';
document.body.appendChild(uiContainer);

// -- Snow Toggle UI --
const snowButton = document.createElement('button');
snowButton.className = 'ui-button';
snowButton.textContent = 'Let it Snow ❄️';
uiContainer.appendChild(snowButton);

// -- AR Toggle UI --
const arButton = document.createElement('button');
arButton.className = 'ui-button';
arButton.textContent = 'Enable AR 🪄';
uiContainer.appendChild(arButton);

const ctxStick = canvasStick.getContext('2d');
const ctxSparks = canvasSparks.getContext('2d');

let width, height;
// Create Systems
const sparkler = new Sparkler(0, 0); // Pos updated in resize/init
const snow = new SnowSystem(window.innerWidth, window.innerHeight);
const handTracker = new HandTracker();
let arMode = false;
let handPresent = false; 
let lastGesture = ''; // Debug 

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvasStick.width = width;
  canvasStick.height = height;
  canvasSparks.width = width;
  canvasSparks.height = height;
  snow.resize(width, height);
}
window.addEventListener('resize', resize);
resize();

// Interaction State
const mouse = { x: width / 2, y: height * 0.8 };
// Input Listeners
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

// Update initial sparkler pos
sparkler.x = mouse.x;
sparkler.y = mouse.y;

// AR Handler
handTracker.onLandmarks = (data) => {
    handPresent = true;
    // Smooth follow
    const dx = data.x - sparkler.x;
    const dy = data.y - sparkler.y;
    sparkler.x += dx * 0.2;
    sparkler.y += dy * 0.2;
    
    // Auto-ignite on Thumb Up
    if (data.isThumbUp) lastGesture = 'Thumb Up 👍';
    else if (data.isOpenHand) lastGesture = 'Open Hand 🖐';
    else lastGesture = 'Tracking...';

    if (data.isThumbUp && !sparkler.isLit) {
        sparkler.ignite();
    }
    
    // Drop / New Sparkler on Open Hand
    // Debounce/Check state to prevent spam
    if (data.isOpenHand && sparkler.state === 'IDLE') {
        // Only if burnt or explicitly wanting to drop?
        // Let's allow drop anytime for "toss away" feel, 
        // BUT we need to make sure we don't pick it up immediately.
        // resetSparkler() calls drop(), then main loop triggers pickup if off screen.
        // We need a cooldown or check.
        resetSparkler();
    }
    
    // Hide Ghost Hand in AR mode
    sparkler.useGhostHand = false;
};

// Button Listeners
snowButton.addEventListener('click', (e) => {
    e.stopPropagation(); 
    snow.active = !snow.active;
    snowButton.classList.toggle('active', snow.active);
    snowButton.textContent = snow.active ? 'Stop Snowing 🚫' : 'Let it Snow ❄️';
});

arButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    arMode = !arMode;
    arButton.classList.toggle('active', arMode);
    
    if (arMode) {
        arButton.textContent = 'Loading Camera... 📷';
        try {
            await handTracker.start((data) => {
                // Determine logic
                handPresent = true;
                // Direct mapping for responsiveness in AR
                sparkler.x = data.x;
                sparkler.y = data.y;
                 if (data.isThumbUp && !sparkler.isLit) {
                    sparkler.ignite();
                }
                sparkler.useGhostHand = false;
            });
             arButton.textContent = 'Disable AR ❌';
        } catch (err) {
            console.error(err);
            arButton.textContent = 'Camera Failed ⚠️';
            arMode = false;
        }
    } else {
        handTracker.stop();
        handPresent = false;
        sparkler.useGhostHand = true; 
        arButton.textContent = 'Enable AR 🪄';
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

window.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    igniteOrReset();
});
window.addEventListener('touchstart', (e) => {
     if (e.target.tagName === 'BUTTON') return;
     igniteOrReset();
}, { passive: false });


// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Layer 1: Stick (Bottom) - Clear completely
  ctxStick.clearRect(0, 0, width, height);
  
  // Layer 2: Sparks (Top) - Fade out effect
  ctxSparks.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
  ctxSparks.globalCompositeOperation = 'destination-out';
  ctxSparks.fillRect(0, 0, width, height);
  ctxSparks.globalCompositeOperation = 'source-over';

  // Update logic
  // Trigger pickup if dropped off screen
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
  
  // Draw logic
  snow.draw(ctxStick);
  
  sparkler.drawStick(ctxStick);
  sparkler.drawSparks(ctxSparks);
  
  // Instructions
  ctxStick.fillStyle = 'rgba(255, 255, 255, 1.0)';
  ctxStick.font = '30px Arial';
  ctxStick.textAlign = 'center';
  
  if (!sparkler.isLit && sparkler.burntLength === 0 && sparkler.state !== 'PICKING_UP' && sparkler.state !== 'DROPPING') {
      if (arMode) {
           ctxStick.font = '30px Arial';
           ctxStick.fillText('Thumbs Up to Light 👍', width / 2, height / 2 - 20);
           ctxStick.font = '20px Arial';
           ctxStick.fillText('Open Hand to Drop 🖐', width / 2, height / 2 + 20);
           
           // Debug Gesture State
           ctxStick.font = '16px monospace';
           ctxStick.fillStyle = 'rgba(200, 255, 200, 0.8)';
           if (lastGesture) {
                ctxStick.fillText(`Gesture: ${lastGesture}`, width / 2, height - 50);
           }
      } else {
           ctxStick.font = '30px Arial';
           ctxStick.fillText('Tap to Light! ✨', width / 2, height / 2);
           
           ctxStick.font = '20px Arial';
           ctxStick.fillText('Зажигай! ✨', width / 2, height / 2 + 35); // RU
           ctxStick.fillText('Zapal! ✨', width / 2, height / 2 + 65); // PL
      }
      
  } else if (!sparkler.isLit && sparkler.burntLength >= sparkler.length - 1 && sparkler.state !== 'PICKING_UP' && sparkler.state !== 'DROPPING') {
      ctxStick.font = '30px Arial';
      ctxStick.fillText('New Sparkler! 🎆', width / 2, height / 2);
      
      ctxStick.font = '20px Arial';
      ctxStick.fillText('Ещё одну! 🎆', width / 2, height / 2 + 35); // RU
      ctxStick.fillText('Jeszcze jedną! 🎆', width / 2, height / 2 + 65); // PL
  }
}

function resetSparkler() {
    sparkler.drop();
}

function triggerPickup() {
    // Start pickup from center bottom
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

// ... inside animate loop logic above covers this ...

animate();
