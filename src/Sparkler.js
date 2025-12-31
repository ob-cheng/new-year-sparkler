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
    this.angle = 0; // Rotation angle (optional, maybe based on movement)
    this.prevX = x;
    this.prevY = y;
    
    // Sparks
    this.sparks = [];
  }

  ignite() {
    this.isLit = true;
  }

  update(mouseX, mouseY) {
    // Follow mouse with some smoothing (or direct 1:1 for responsiveness)
    // Direct 1:1 is better for "holding" feel unless we want physics delay.
    this.prevX = this.x;
    this.prevY = this.y;
    this.x = mouseX;
    this.y = mouseY;

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
      const burnX = this.x;
      const burnY = this.y - (this.length / 2) + this.burntLength; // Calculate tip position relative to center/handle
      // Actually, let's make (x,y) the handle position.
      // So the sparkler extends UP from (x,y).
      // Tip is at (x, y - handleLength - length + burntLength)
      
      const tipX = this.x;
      const tipY = this.y - this.handleLength - this.length + this.burntLength;

      // Create new sparks
      const sparkCount = Math.floor(Math.random() * 10) + 5; // MORE sparks
      for (let i = 0; i < sparkCount; i++) {
        const speed = Math.random() * 4 + 1;
        const angle = Math.random() * Math.PI * 2;
        // Add momentum from movement
        const vx = Math.cos(angle) * speed + dx * 0.2; 
        const vy = Math.sin(angle) * speed + dy * 0.2;
        
        const color = `hsl(${40 + Math.random() * 20}, 100%, 80%)`; // Gold/Yellow
        const size = Math.random() * 2 + 0.5;
        const life = Math.random() * 1.5 + 0.5;
        
        this.sparks.push(new Spark(tipX, tipY, vx, vy, color, size, life));
      }
    }

    // Update existing sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
        this.sparks[i].update();
        if (this.sparks[i].life <= 0) {
            this.sparks.splice(i, 1);
        }
    }
  }

  draw(ctx) {
    // Draw Sparkler Stick
    // Handle (Bottom)
    ctx.lineWidth = this.thickness;
    ctx.lineCap = 'round';
    
    // We assume (this.x, this.y) is where the user "holds" it (bottom of handle)
    const handleTopY = this.y - this.handleLength;
    const fuelTopY = handleTopY - this.length;
    
    // Draw Handle (Metal/Stick)
    ctx.strokeStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x, handleTopY);
    ctx.stroke();

    // Draw Core Wire (entire length of fuel part, visible if burnt)
    // Actually standard sparklers have a wire core.
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(this.x, handleTopY);
    ctx.lineTo(this.x, fuelTopY);
    ctx.stroke();

    // Draw Unburnt Fuel (Gray)
    // From fuelTopY down to fuelTopY + (length - burntLength)
    // Actually it burns from top down. 
    // Top is fuelTopY. Bottom of fuel is handleTopY.
    // If burntLength is 0, full fuel.
    // We draw from (fuelTopY + burntLength) to handleTopY
    if (this.burntLength < this.length) {
        ctx.strokeStyle = '#777';
        ctx.lineWidth = this.thickness + 2; // Fuel is thicker
        ctx.beginPath();
        ctx.moveTo(this.x, fuelTopY + this.burntLength);
        ctx.lineTo(this.x, handleTopY);
        ctx.stroke();
    }
    
    // Draw Hot Tip (Glowing Red)
    if (this.isLit) {
        const tipY = fuelTopY + this.burntLength;
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.arc(this.x, tipY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset
    }

    // Draw Sparks
    // Use lighter composite for additive color mixing (fire effect)
    ctx.globalCompositeOperation = 'lighter';
    this.sparks.forEach(spark => spark.draw(ctx));
    ctx.globalCompositeOperation = 'source-over';
  }
}
