import './style.css';
import { Sparkler } from './Sparkler.js';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
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

window.addEventListener('mousedown', () => {
    if (!sparkler.isLit) sparkler.ignite();
});
window.addEventListener('touchstart', () => {
    if (!sparkler.isLit) sparkler.ignite();
}, { passive: false });


// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Clear Screen with Motion Blur Trail effect (optional)
  // For "Black screen" user request, we keep it simple or use slight fade for trails
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fade out effect
  ctx.fillRect(0, 0, width, height);

  // Update & Draw Sparkler
  // If user hasn't interacted, maybe keep sparkler in center or let it sit?
  // We'll update it with last known mouse pos.
  sparkler.update(mouse.x, mouse.y);
  sparkler.draw(ctx);
  

  
  // Instructions if not lit
  if (!sparkler.isLit && sparkler.burntLength === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 1.0)'; // Full opacity for test
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Touch / Click to Ignite', width / 2, height / 2);
  } else if (!sparkler.isLit && sparkler.burntLength >= sparkler.length) {
       ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Touch / Click to New Sparkler', width / 2, height / 2);
  }
}

function resetSparkler() {
    sparkler.burntLength = 0;
    sparkler.isLit = true;
    sparkler.sparks = [];
    sparkler.x = mouse.x;
    sparkler.y = mouse.y;
}

window.addEventListener('mousedown', () => {
    if (!sparkler.isLit) {
        if (sparkler.burntLength >= sparkler.length) {
            resetSparkler();
        } else {
            sparkler.ignite();
        }
    }
});
window.addEventListener('touchstart', (e) => {
    if (!sparkler.isLit) {
         if (sparkler.burntLength >= sparkler.length) {
            resetSparkler();
        } else {
            sparkler.ignite();
        }
    }
}, { passive: false });

animate();
