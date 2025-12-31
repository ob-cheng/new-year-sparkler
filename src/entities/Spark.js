export class Spark {
  constructor(x, y, velocityX, velocityY, size, life) {
    this.reset(x, y, velocityX, velocityY, size, life);
  }

  reset(x, y, velocityX, velocityY, size, life) {
    this.x = x;
    this.y = y;
    this.prevX = x; // Track previous position for motion blur
    this.prevY = y;
    this.vx = velocityX;
    this.vy = velocityY;
    // this.color is now dynamic based on heat
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.decay = Math.random() * 0.01 + 0.015; // Faster decay for snappiness
    this.gravity = 0.1;
    this.friction = 0.95;
  }

  update() {
    this.prevX = this.x;
    this.prevY = this.y;
    
    // Thermal turbulence (Jitter)
    // Random tiny push simulating chaotic hot air
    this.vx += (Math.random() - 0.5) * 0.5;
    this.vy += (Math.random() - 0.5) * 0.5;

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    
    // Calculate Color based on Life (Heat)
    // Life 1.0 -> 0.7: White Hot
    // Life 0.7 -> 0.3: Gold/Yellow
    // Life 0.3 -> 0.0: Red/Orange
    
    const progress = this.life / this.maxLife;
    let r, g, b, alpha;
    
    if (progress > 0.8) {
        // White to Yellow
        r = 255;
        g = 255;
        b = Math.floor(255 * (progress - 0.8) * 5); // Fade out blue
        alpha = 1;
    } else if (progress > 0.4) {
        // Yellow to Orange
        r = 255;
        g = Math.floor(200 + 55 * ((progress - 0.4) * 2.5));
        b = 50;
        alpha = 1;
    } else {
        // Orange to Red
        r = 255;
        g = Math.floor(100 * (progress * 2.5));
        b = 0;
        alpha = progress * 2.5; // Fade out
    }
    
    const color = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    
    // Motion Blur Check
    // If moving fast, draw a line segment
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    
    if (speed > 2) {
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
  }
}
