import { Spark } from './Spark.js';

export class Sparkler {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    // Physical properties
    this.length = 150; // Length of the burnt part + unburnt part
    this.handleLength = 50;
    this.burnRate = 0.3; // Pixels per frame approx
    this.burntLength = 0; // How much has burned
    this.isLit = false;
    
    // Visuals
    this.thickness = 4;
    this.angle = -10 * (Math.PI / 180); // Tilt left 10 degrees
    this.baseAngle = -10 * (Math.PI / 180);
    this.prevX = x;
    this.prevY = y;
    
    // Animation State
    this.state = 'IDLE'; // IDLE, DROPPING, PICKING_UP, HOLDING
    this.vy = 0; // Vertical velocity for dropping
    this.vr = 0; // Rotational velocity for dropping
    
    // Hand Image
    this.handImg = new Image();
    this.handImg.src = '/hand.png'; // Hand asset
    
    // Sparks
    this.sparks = []; // Active sparks
    this.pool = [];   // Inactive sparks
    
    // Pre-allocate pool
    for (let i = 0; i < 1000; i++) {
        this.pool.push(new Spark(0, 0, 0, 0, '#000', 0, 0));
    }
  }

  ignite() {
    this.isLit = true;
  }

  drop() {
    this.state = 'DROPPING';
    // Throw effect:
    // Toss up (-10) and to the side (random -5 to 5)
    this.vy = -10; 
    this.vx = (Math.random() - 0.5) * 10; 
    this.vr = (Math.random() - 0.5) * 0.4; // Faster spin for the toss
  }

  pickup(startX, startY, targetX, targetY) {
    this.state = 'PICKING_UP';
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.pickupProgress = 0;
    
    // Reset sparkler internals
    this.burntLength = 0;
    this.isLit = false;
    this.angle = this.baseAngle; // Reset angle
    
    // Return sparks to pool (clean up old ones)
    while (this.sparks.length > 0) {
        this.pool.push(this.sparks.pop());
    }
  }

  update(mouseX, mouseY) {
    this.prevX = this.x;
    this.prevY = this.y;

    if (this.state === 'DROPPING') {
        this.vy += 0.5; // Gravity
        this.y += this.vy;
        this.x += this.vx; // Horizontal movement
        this.angle += this.vr;
        // Don't follow mouse
    } else if (this.state === 'PICKING_UP') {
        this.pickupProgress += 0.05; // Animation speed
        if (this.pickupProgress >= 1) {
            this.state = 'IDLE';
            this.pickupProgress = 1;
        }
        
        // Lerp position
        // Simple Ease-out
        const t = 1 - Math.pow(1 - this.pickupProgress, 3);
        
        this.x = this.x + (mouseX - this.x) * 0.1; // Soft follow for X
        this.y = window.innerHeight + (mouseY - window.innerHeight) * t; // Rise from bottom
        
    } else {
        // IDLE / HOLDING
        // Follow mouse
        this.x = mouseX;
        this.y = mouseY;
    }

    // Calculate movement velocity for spark direction
    const dx = this.x - this.prevX;
    const dy = this.y - this.prevY;
    
    // Burn logic
    if (this.isLit && this.burntLength < this.length) {
      this.burntLength += this.burnRate;
    } else if (this.burntLength >= this.length) {
      this.isLit = false; // Burnt out
    }
    
    // Generate sparks if lit
    if (this.isLit) {
       // Tip position needs to respect rotation now!
       // Center of rotation is (this.x, this.y) which is bottom of handle.
       // The tip is at local coordinates (0, -handleLength - length + getBurntLength)
       // We need to rotate that local vector.
       
       const localTipY = -this.handleLength - this.length + this.burntLength;
       
       // Rotate local point (0, localTipY) by this.angle
       // x' = x*cos - y*sin
       // y' = x*sin + y*cos
       const tipX = this.x - localTipY * Math.sin(this.angle);
       const tipY = this.y + localTipY * Math.cos(this.angle);

      // Create new sparks
      const sparkCount = Math.floor(Math.random() * 10) + 5; // MORE sparks
      for (let i = 0; i < sparkCount; i++) {
        if (this.pool.length > 0) {
            const speed = Math.random() * 4 + 1;
            const angle = Math.random() * Math.PI * 2;
            // Add momentum from movement
            const vx = Math.cos(angle) * speed + dx * 0.2; 
            const vy = Math.sin(angle) * speed + dy * 0.2;
            
            const color = `hsl(${40 + Math.random() * 20}, 100%, 80%)`; // Gold/Yellow
            const size = Math.random() * 2 + 0.5;
            const life = Math.random() * 1.5 + 0.5;
            
            const spark = this.pool.pop();
            spark.reset(tipX, tipY, vx, vy, color, size, life);
            this.sparks.push(spark);
        }
      }
    }

    // Update existing sparks (Optimized loop)
    for (let i = this.sparks.length - 1; i >= 0; i--) {
        const spark = this.sparks[i];
        spark.update();
        if (spark.life <= 0) {
            // Return to pool
            this.pool.push(spark);
            // Fast remove (swap with last)
            const last = this.sparks[this.sparks.length - 1];
            this.sparks[i] = last;
            this.sparks.pop();
        }
    }
  }

  drawStick(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Draw Hand (Behind Stick) - Optional, depends on look. 
    // Let's draw it behind.
    if (this.handImg.complete && this.handImg.naturalWidth > 0 && this.state !== 'DROPPING') {
         ctx.save();
         ctx.globalAlpha = 0.5; // Transparent ghost hand
         // Adjust scale and position to look like it's holding the handle
         // Assuming handle bottom is at (0,0)
         const scale = 0.3;
         const w = this.handImg.width * scale;
         const h = this.handImg.height * scale;
         
         // Position hand so the "grip" area aligns with (0, -handleLength/2) approx
         ctx.drawImage(this.handImg, -w/2, -h/2 - 25, w, h);
         ctx.restore();
    }
    
    // Draw Sparkler Stick
    // Everything is relative to (0,0) now because we translated/rotated
    
    // Handle (Bottom)
    ctx.lineWidth = this.thickness;
    ctx.lineCap = 'round';
    
    // Handle goes from (0,0) to (0, -handleLength)
    const handleTopY = -this.handleLength;
    const fuelTopY = handleTopY - this.length;
    
    // Draw Handle (Metal/Stick)
    ctx.strokeStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, handleTopY);
    ctx.stroke();

    // Draw Core Wire
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(0, handleTopY);
    ctx.lineTo(0, fuelTopY);
    ctx.stroke();

    // Draw Unburnt Fuel (Gray)
    if (this.burntLength < this.length) {
        ctx.strokeStyle = '#777';
        ctx.lineWidth = this.thickness + 2; // Fuel is thicker
        ctx.beginPath();
        ctx.moveTo(0, fuelTopY + this.burntLength);
        ctx.lineTo(0, handleTopY);
        ctx.stroke();
    }
    
    // Draw Hot Tip (Glowing Red)
    if (this.isLit) {
        const tipY = fuelTopY + this.burntLength;
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.arc(0, tipY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }
    
    ctx.restore();
  }

  drawSparks(ctx) {
    // Draw Sparks
    // Use lighter composite for additive color mixing (fire effect)
    ctx.globalCompositeOperation = 'lighter';
    this.sparks.forEach(spark => spark.draw(ctx));
    ctx.globalCompositeOperation = 'source-over';
  }
}
