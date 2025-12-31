export class BackgroundSystem {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.lamps = [];
        this.lamplighter = {
            x: -50,
            targetIndex: 0,
            state: 'WALKING', // WALKING, LIGHTING
            timer: 0
        };
        
        // Initialize Lamps
        this.initLamps();
        
        // Stars
        this.stars = [];
        for(let i=0; i<50; i++) {
            this.stars.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.6,
                size: Math.random() * 2,
                alpha: Math.random()
            });
        }
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.initLamps();
        // Re-distribute stars
        this.stars.forEach(s => {
            s.x = Math.random() * width;
            s.y = Math.random() * height * 0.6;
        });
    }

    initLamps() {
        this.lamps = [];
        const lampCount = 4;
        const spacing = this.width / (lampCount + 1);
        
        for (let i = 1; i <= lampCount; i++) {
            this.lamps.push({
                x: spacing * i,
                y: this.height - 50, // Ground level offset
                height: 180 + Math.random() * 20, // Variation
                isLit: false,
                glow: 0
            });
        }
        // Reset walker
        this.lamplighter.x = -50;
        this.lamplighter.targetIndex = 0;
        this.lamplighter.state = 'WALKING';
    }

    update() {
        // Update Lamps (Glow animation)
        this.lamps.forEach(lamp => {
            if (lamp.isLit && lamp.glow < 1) {
                lamp.glow += 0.05;
            }
        });

        // Update Lamplighter
        const walker = this.lamplighter;
        
        if (walker.targetIndex < this.lamps.length) {
            const targetLamp = this.lamps[walker.targetIndex];
            const targetX = targetLamp.x - 20; // Stand slightly left of lamp

            if (walker.state === 'WALKING') {
                const speed = 2; // Pixel per frame
                if (walker.x < targetX) {
                    walker.x += speed;
                } else {
                    walker.x = targetX;
                    walker.state = 'LIGHTING';
                    walker.timer = 0;
                }
            } else if (walker.state === 'LIGHTING') {
                walker.timer++;
                // Animation timing: Reach up (30 frames), Light (onset), Lower (30 frames)
                if (walker.timer === 30) {
                    targetLamp.isLit = true;
                }
                if (walker.timer > 60) {
                    walker.state = 'WALKING';
                    walker.targetIndex++;
                }
            }
        } else {
            // Walk off screen
            walker.x += 2;
            if (walker.x > this.width + 100) {
                // Reset sequence after a delay? Or keep lit?
                // Let's keep them lit for a cozy vibe, maybe reset if desired.
                // For now, he just walks away.
            }
        }
        
        // Twinkle stars
        this.stars.forEach(s => {
            s.alpha += (Math.random() - 0.5) * 0.05;
            if (s.alpha < 0.2) s.alpha = 0.2;
            if (s.alpha > 0.8) s.alpha = 0.8;
        });
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Sky Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, '#0b1026'); // Deep Midnight
        grad.addColorStop(1, '#2b32b2'); // Twilight Blue
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        // 2. Stars
        ctx.fillStyle = 'white';
        this.stars.forEach(s => {
            ctx.globalAlpha = s.alpha;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // 3. Ground
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, this.height - 60, this.width, 100);

        // 4. Lamps
        this.lamps.forEach(lamp => {
            this.drawLamp(ctx, lamp);
        });

        // 5. Lamplighter
        this.drawWalker(ctx);
    }

    drawLamp(ctx, lamp) {
        const x = lamp.x;
        const y = lamp.y; // Base y
        const h = lamp.height;
        
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 4;
        ctx.fillStyle = '#000';

        // Post
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - h);
        ctx.stroke();

        // Base decorations (Curly ironwork)
        ctx.beginPath();
        ctx.moveTo(x, y - h * 0.5);
        ctx.bezierCurveTo(x - 10, y - h * 0.5, x - 10, y - h * 0.4, x, y - h * 0.4);
        ctx.bezierCurveTo(x + 10, y - h * 0.4, x + 10, y - h * 0.5, x, y - h * 0.5);
        ctx.stroke();

        // Lamp Head (Lantern)
        const headY = y - h;
        const headW = 20;
        const headH = 35;
        
        // Glass Cage
        ctx.fillStyle = lamp.isLit ? `rgba(255, 220, 100, ${0.2 + lamp.glow * 0.5})` : 'rgba(200, 200, 255, 0.1)';
        ctx.fillRect(x - headW/2, headY - headH, headW, headH);
        
        // Frame
        ctx.strokeRect(x - headW/2, headY - headH, headW, headH);
        
        // Cap
        ctx.beginPath();
        ctx.moveTo(x - headW/2 - 5, headY - headH);
        ctx.lineTo(x, headY - headH - 15);
        ctx.lineTo(x + headW/2 + 5, headY - headH);
        ctx.fill();
        
        // Glow (Bloom)
        if (lamp.isLit) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const glowGrad = ctx.createRadialGradient(x, headY - headH/2, 5, x, headY - headH/2, 60);
            glowGrad.addColorStop(0, `rgba(255, 200, 50, ${lamp.glow})`);
            glowGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
            ctx.fillStyle = glowGrad;
            ctx.fillRect(x - 60, headY - headH/2 - 60, 120, 120);
            ctx.restore();
        }
    }

    drawWalker(ctx) {
        const walker = this.lamplighter;
        const x = walker.x;
        const y = this.height - 60; // Walking on ground
        
        ctx.fillStyle = '#000'; // Silhouette
        
        // Body (Coat)
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y - 40); // Back
        ctx.lineTo(x + 10, y - 40); // Chest
        ctx.lineTo(x + 8, y); // Front leg area
        ctx.fill();
        
        // Head
        ctx.beginPath();
        ctx.arc(x, y - 50, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Cap (Uniform)
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 52);
        ctx.lineTo(x + 8, y - 52); // Visor
        ctx.lineTo(x + 5, y - 58); // Top
        ctx.lineTo(x - 5, y - 58);
        ctx.fill();

        // Arm / Stick
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (walker.state === 'LIGHTING') {
            // Reaching up with stick
            ctx.moveTo(x + 5, y - 40); // Shoulder
            ctx.lineTo(x + 15, y - 70); // Hand high
            // The lighter stick
            ctx.moveTo(x + 15, y - 65);
            ctx.lineTo(x + 18, y - 180); // Loooong stick reaching lamp
        } else {
            // Carrying stick
            ctx.moveTo(x + 5, y - 40);
            ctx.lineTo(x + 10, y - 25); // Hand low
            // Stick resting
            ctx.moveTo(x + 10, y - 25);
            ctx.lineTo(x - 5, y - 80); // Stick over shoulder
        }
        ctx.stroke();
    }
}
