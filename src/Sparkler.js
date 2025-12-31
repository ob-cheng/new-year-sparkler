import { Spark } from './Spark.js';

export class Sparkler {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    // Physical properties
    this.length = 150; // Length of the burnt part + unburnt part
    this.handleLength = 50;
    this.burnRate = 0.25; // Pixels per frame approx (150 / 0.25 / 60fps = 10s)
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
    this.useGhostHand = true; // Flag to toggle it
    
    // Sparks
    this.sparks = []; // Active sparks
    this.pool = [];   // Inactive sparks
    
    // Pre-allocate pool
    for (let i = 0; i < 1000; i++) {
        this.pool.push(new Spark(0, 0, 0, 0, 0, 0));
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
       // Tip position
       const localTipY = -this.handleLength - this.length + this.burntLength;
       const tipX = this.x - localTipY * Math.sin(this.angle);
       const tipY = this.y + localTipY * Math.cos(this.angle);

      // Create new sparks (Sputtering effect)
      // Burstiness: Randomly spawn MANY or FEW
      // 10% chance of a big burst (pop)
      let sparkCount = Math.floor(Math.random() * 5); 
      if (Math.random() < 0.1) sparkCount = 20 + Math.floor(Math.random() * 20); 
      
      for (let i = 0; i < sparkCount; i++) {
        if (this.pool.length > 0) {
            // Ejection physics
            // High velocity, radial + distinct directional bias
            const speed = Math.random() * 6 + 2;
            const angle = Math.random() * Math.PI * 2;
            
            // Add momentum from movement
            const vx = Math.cos(angle) * speed + dx * 0.4; 
            const vy = Math.sin(angle) * speed + dy * 0.4;
            
            // Note: color is now handled inside Spark based on heat
            const size = Math.random() * 2 + 1.0;
            const life = Math.random() * 1.0 + 0.3;
            
            const spark = this.pool.pop();
            spark.reset(tipX, tipY, vx, vy, size, life);
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

    // [Draw Hand logic remains same, hidden for brevity here if unchanged]
    if (this.useGhostHand && this.handImg.complete && this.handImg.naturalWidth > 0 && this.state !== 'DROPPING') {
         ctx.save();
         ctx.globalAlpha = 0.5;
         const scale = 0.3;
         const w = this.handImg.width * scale;
         const h = this.handImg.height * scale;
         ctx.drawImage(this.handImg, -w/2, -h/2 - 25, w, h);
         ctx.restore();
    }
    
    // Draw Sparkler Stick
    
    // Handle (Bottom)
    ctx.lineCap = 'round';
    
    const handleTopY = -this.handleLength;
    const fuelTopY = handleTopY - this.length;
    
    // 1. Draw Stick (Metal Wire) - Metallic Gradient
    const wireGrad = ctx.createLinearGradient(-2, 0, 2, 0); // Horizontal gradient for cylinder
    wireGrad.addColorStop(0, '#555');
    wireGrad.addColorStop(0.4, '#aaa'); // Highlight
    wireGrad.addColorStop(1, '#444');
    
    ctx.strokeStyle = wireGrad;
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, fuelTopY); // Wire goes all the way up through the fuel
    ctx.stroke();

    // 2. Draw Unburnt Fuel (Textured)
    if (this.burntLength < this.length) {
        // Create Fuel Gradient (Dark gray bumpy)
        const fuelGrad = ctx.createLinearGradient(-3, 0, 3, 0);
        fuelGrad.addColorStop(0, '#333');
        fuelGrad.addColorStop(0.3, '#555');
        fuelGrad.addColorStop(0.5, '#444');
        fuelGrad.addColorStop(1, '#222');
        
        ctx.strokeStyle = fuelGrad;
        ctx.lineWidth = this.thickness + 3; // Thicker fuel
        ctx.beginPath();
        
        // Draw segment from unburnt top to bottom of fuel part
        // start: fuelTopY + burntLength (top of unburnt)
        // end: handleTopY (bottom of fuel)
        ctx.moveTo(0, fuelTopY + this.burntLength);
        ctx.lineTo(0, handleTopY);
        ctx.stroke();
    }
    
    // 3. Draw Hot Tip (Intense Core)
    if (this.isLit) {
        const tipY = fuelTopY + this.burntLength;
        
        // Inner intense white hot
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, tipY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer glow
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(0, tipY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
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
