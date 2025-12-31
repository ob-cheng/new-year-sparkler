export class SnowSystem {
  constructor(width, height) {
    this.flakes = [];
    this.width = width;
    this.height = height;
    this.count = 150; 
    this.active = false;

    for (let i = 0; i < this.count; i++) {
      this.flakes.push(this.createFlake(true));
    }
  }

  createFlake(isInitial = false) {
    return {
      x: Math.random() * this.width,
      y: isInitial ? Math.random() * this.height : -10,
      vy: Math.random() * 1.5 + 0.5, // Fall speed
      radius: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.3,
      swayOffset: Math.random() * 100,
      swaySpeed: Math.random() * 0.02 + 0.01
    };
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  update() {
    if (!this.active) return;

    this.flakes.forEach(f => {
      f.y += f.vy;
      // Simple sway
      f.x += Math.sin((f.y + f.swayOffset) * f.swaySpeed) * 0.5;

      // Wrap around
      if (f.y > this.height) {
        Object.assign(f, this.createFlake(false));
      }
      if (f.x > this.width) f.x = 0;
      if (f.x < 0) f.x = this.width;
    });
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.fillStyle = 'white';
    ctx.beginPath();
    this.flakes.forEach(f => {
      // Move to center of next circle to avoid connecting lines if we were stroking, 
      // but for fill it's fine to just add sub-paths.
      // Actually strictly correct is moveTo(x+r, y) then arc, but arc moves automatically.
      ctx.moveTo(f.x + f.radius, f.y); 
      ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    });
    ctx.fill();
  }
}
