import './style.css';
import { Sparkler } from './Sparkler.js';
import { SnowSystem } from './Snow.js';

const canvasStick = document.createElement('canvas');
canvasStick.id = 'canvas-stick';
document.body.appendChild(canvasStick);

const canvasSparks = document.createElement('canvas');
canvasSparks.id = 'canvas-sparks';
document.body.appendChild(canvasSparks);

// -- Snow Toggle UI --
const snowButton = document.createElement('button');
snowButton.className = 'snow-toggle';
snowButton.textContent = 'Let it Snow ❄️';
document.body.appendChild(snowButton);

const ctxStick = canvasStick.getContext('2d');
const ctxSparks = canvasSparks.getContext('2d');

let width, height;
// Create Systems
const sparkler = new Sparkler(0, 0); // Pos updated in resize/init
const snow = new SnowSystem(window.innerWidth, window.innerHeight);

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
let isInteracting = false;

// Update initial sparkler pos
sparkler.x = mouse.x;
sparkler.y = mouse.y;

// Button Listener
snowButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Don't ignite sparkler
    snow.active = !snow.active;
    snowButton.classList.toggle('active', snow.active);
    snowButton.textContent = snow.active ? 'Stop Snowing 🚫' : 'Let it Snow ❄️';
});

// Input Listeners
window.addEventListener('mousemove', (e) => {
    isInteracting = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
window.addEventListener('touchmove', (e) => {
    isInteracting = true;
    e.preventDefault();
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
}, { passive: false });

function igniteOrReset() {
    if (!sparkler.isLit) {
        // If it hasn't even started or is fully burnt out (allowing small margin for error)
        if (sparkler.burntLength >= sparkler.length - 1) {
             resetSparkler();
        } else {
             sparkler.ignite();
        }
    }
}

window.addEventListener('mousedown', (e) => {
    if (e.target === snowButton) return;
    igniteOrReset();
});
window.addEventListener('touchstart', (e) => {
     if (e.target === snowButton) return;
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
  
  sparkler.update(mouse.x, mouse.y);
  snow.update();
  
  // Draw logic
  
  // Draw Snow on stick layer (crisp, behind sparks hopefully if z-index is right? 
  // Wait, stick is z-index 1, sparks is 2. So snow on stick layer is behind sparks. Good.)
  snow.draw(ctxStick);
  
  sparkler.drawStick(ctxStick);
  sparkler.drawSparks(ctxSparks);
  
  // Instructions
  ctxStick.fillStyle = 'rgba(255, 255, 255, 1.0)';
  ctxStick.font = '30px Arial';
  ctxStick.textAlign = 'center';
  
  if (!sparkler.isLit && sparkler.burntLength === 0 && sparkler.state !== 'PICKING_UP' && sparkler.state !== 'DROPPING') {
      ctxStick.font = '30px Arial';
      ctxStick.fillText('Tap to Light! ✨', width / 2, height / 2);
      
      ctxStick.font = '20px Arial';
      ctxStick.fillText('Зажигай! ✨', width / 2, height / 2 + 35); // RU
      ctxStick.fillText('Zapal! ✨', width / 2, height / 2 + 65); // PL
      
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
    sparkler.pickup(startX, startY, mouse.x, mouse.y);
}

// ... inside animate loop, after sparkler.update ...
// Add check for pickup trigger
// If dropping and out of screen, pickup a new one
if (sparkler.state === 'DROPPING' && sparkler.y > height + 200) {
    triggerPickup();
}

animate();
