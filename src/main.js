import './style.css';
import { Sparkler } from './Sparkler.js';

const canvasStick = document.createElement('canvas');
canvasStick.id = 'canvas-stick';
document.body.appendChild(canvasStick);

const canvasSparks = document.createElement('canvas');
canvasSparks.id = 'canvas-sparks';
document.body.appendChild(canvasSparks);

const ctxStick = canvasStick.getContext('2d');
const ctxSparks = canvasSparks.getContext('2d');

let width, height;
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvasStick.width = width;
  canvasStick.height = height;
  canvasSparks.width = width;
  canvasSparks.height = height;
}
window.addEventListener('resize', resize);
resize();

// Interaction State
const mouse = { x: width / 2, y: height * 0.8 };
let isInteracting = false;

// Create Sparkler
const sparkler = new Sparkler(mouse.x, mouse.y);

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

window.addEventListener('mousedown', igniteOrReset);
window.addEventListener('touchstart', (e) => {
     // Prevent default to avoid double-firing with mousedown on some devices if needed, but 'passive: false' usually handles scrolling.
     // We'll call igniteOrReset directly.
     igniteOrReset();
}, { passive: false });


// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Layer 1: Stick (Bottom) - Clear completely to avoid trails/barcode effect
  ctxStick.clearRect(0, 0, width, height);
  
  // Layer 2: Sparks (Top) - Fade out effect for trails
  ctxSparks.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Increased fade speed for shorter trails
  ctxSparks.globalCompositeOperation = 'destination-out';
  ctxSparks.fillRect(0, 0, width, height);
  ctxSparks.globalCompositeOperation = 'source-over';

  // Update logic
  sparkler.update(mouse.x, mouse.y);
  
  // Draw logic
  sparkler.drawStick(ctxStick);
  sparkler.drawSparks(ctxSparks);
  
  // Instructions (Draw on Sparks layer so it fades nicely, or Stick layer for crispness? Let's use Stick layer for crispness)
  ctxStick.fillStyle = 'rgba(255, 255, 255, 1.0)';
  ctxStick.font = '30px Arial';
  ctxStick.textAlign = 'center';
  
  if (!sparkler.isLit && sparkler.burntLength === 0) {
      ctxStick.fillText('Touch / Click to Ignite', width / 2, height / 2);
  } else if (!sparkler.isLit && sparkler.burntLength >= sparkler.length - 1) {
      ctxStick.fillText('Touch / Click to New Sparkler', width / 2, height / 2);
  }
}

function resetSparkler() {
    sparkler.burntLength = 0;
    sparkler.isLit = true;
    
    // Return all active sparks to pool
    while (sparkler.sparks.length > 0) {
        sparkler.pool.push(sparkler.sparks.pop());
    }
    
    sparkler.x = mouse.x;
    sparkler.y = mouse.y;
    
    // Clear any existing sparks/trails immediately
    ctxSparks.clearRect(0, 0, width, height);
}

animate();
