export class BackgroundSystem {
    constructor(width, height, isMobile = false) {
        this.width = width;
        this.height = height;
        this.isMobile = isMobile;
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
        const starCount = isMobile ? 30 : 50; // Slight reduction fine
        for(let i=0; i<starCount; i++) {
            this.stars.push({
                x: Math.random() * width,
                y: Math.random() * height * 0.6,
                size: Math.random() * 2,
                alpha: Math.random()
            });
        }
        
        // Cache Lamp Glow
        this.lampGlow = document.createElement('canvas');
        this.lampGlow.width = 120;
        this.lampGlow.height = 120;
        const ctx = this.lampGlow.getContext('2d');
        const glowGrad = ctx.createRadialGradient(60, 60, 5, 60, 60, 60);
        glowGrad.addColorStop(0, 'rgba(255, 200, 50, 1)'); // Base alpha 1, mod later
        glowGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0,0,120,120);
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

    handleClick(x, y) {
        // Check collision with lamp heads
        for (let i = 0; i < this.lamps.length; i++) {
            const lamp = this.lamps[i];
            const headY = lamp.y - lamp.height;
            // Simple hitbox around the light cage
            if (x > lamp.x - 30 && x < lamp.x + 30 && y > headY - 50 && y < headY + 20) {
                if (lamp.isLit) {
                    lamp.isLit = false;
                    lamp.glow = 0;
                    return true; // Handled
                }
            }
        }
        return false;
    }

    update() {
        // Update Lamps (Glow animation)
        let unlitIndex = -1;
        this.lamps.forEach((lamp, index) => {
            if (lamp.isLit && lamp.glow < 1) {
                lamp.glow += 0.05;
            }
            if (!lamp.isLit) {
                // Find priority target (closest unlit lamp preferred, or just first)
                if (unlitIndex === -1) unlitIndex = index;
            }
        });

        // Update Lamplighter
        const walker = this.lamplighter;
        
        // 1. Determine Target
        if (unlitIndex !== -1) {
            // Priority: Light the lamps!
            walker.targetIndex = unlitIndex;
            if (walker.state === 'IDLE' || walker.state === 'LEAVING') {
                walker.state = 'WALKING';
                // If he was leaving/gone, make sure he's visible
                if (walker.x > this.width + 50) {
                    walker.x = this.width + 50; // Come from right
                } else if (walker.x < -50) {
                    walker.x = -50; // Come from left
                }
            }
        } else {
            // All lit? Leave.
            if (walker.state !== 'LIGHTING') {
                 walker.state = 'LEAVING';
            }
        }

        // 2. Move / Act
        if (walker.state === 'WALKING' || walker.state === 'LEAVING') {
            let targetX;
            if (walker.state === 'LEAVING') {
                targetX = this.width + 100; // Walk off right
            } else {
                 // Target specific lamp
                 const targetLamp = this.lamps[walker.targetIndex];
                 targetX = targetLamp.x - 20; 
            }
            
            // Move towards target
            const dx = targetX - walker.x;
            const speed = 3; // Hurry up if fixing!
            
            if (Math.abs(dx) < speed) {
                walker.x = targetX;
                if (walker.state === 'WALKING') {
                    walker.state = 'LIGHTING';
                    walker.timer = 0;
                }
            } else {
                walker.x += Math.sign(dx) * speed;
                // Face direction
                walker.direction = Math.sign(dx);
            }
            
        } else if (walker.state === 'LIGHTING') {
            walker.timer++;
            // Animation timing: Reach up (30 frames), Light (onset), Lower (30 frames)
            if (walker.timer === 30) {
                if (this.lamps[walker.targetIndex]) {
                     this.lamps[walker.targetIndex].isLit = true;
                }
            }
            if (walker.timer > 60) {
                // Job done, check next state in next frame
                walker.state = 'WALKING'; 
                // Note: Next frame's logic will pick up if there are more unlit lamps
                // or switch to LEAVING if all done.
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
            
            // Use cached sprite with alpha
            ctx.globalAlpha = lamp.glow; 
            ctx.drawImage(this.lampGlow, x - 60, headY - headH/2 - 60);
            
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
