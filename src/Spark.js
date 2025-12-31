export class Spark {
  constructor(x, y, velocityX, velocityY, color, size, life) {
    this.reset(x, y, velocityX, velocityY, color, size, life);
  }

  reset(x, y, velocityX, velocityY, color, size, life) {
    this.x = x;
    this.y = y;
    this.vx = velocityX;
    this.vy = velocityY;
    this.color = color;
    this.size = size * 2; // Double size for visibility
    this.life = life * 2; // Double life
    this.maxLife = this.life;
    this.decay = Math.random() * 0.01 + 0.005; // Slower decay
    this.gravity = 0.15; // Gravity strength
    this.friction = 0.98; // Less friction
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    
    // Fade out based on life
    const alpha = Math.max(0, this.life / this.maxLife);
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    
    // Draw simple circle for now, maybe add glow via shadowBlur later if performance allows
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}
