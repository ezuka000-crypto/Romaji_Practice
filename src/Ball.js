export class Ball {
    constructor(x, y, vx, vy, radius, color, text, id) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.id = id;
        this.isShaking = false;
        this.shakeStartTime = 0;
    }

    update(width, height, balls) {
        if (this.isShaking) {
            if (Date.now() - this.shakeStartTime > 500) {
                this.isShaking = false;
            }
            return; // Stop moving while shaking? Or keep moving? Let's stop moving to emphasize the mistake.
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wall collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -1;
        } else if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx *= -1;
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -1;
        } else if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy *= -1;
        }

        // Ball collision
        for (let other of balls) {
            if (other.id === this.id) continue;
            this.checkCollision(other);
        }
    }

    checkCollision(other) {
        const dx = other.x - this.x;
        const dy = other.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.radius + other.radius) {
            // Collision detected
            // Resolve overlap
            const overlap = (this.radius + other.radius - distance) / 2;
            const nx = dx / distance;
            const ny = dy / distance;

            this.x -= nx * overlap;
            this.y -= ny * overlap;
            other.x += nx * overlap;
            other.y += ny * overlap;

            // Elastic collision
            // Normal velocity components
            const v1n = this.vx * nx + this.vy * ny;
            const v2n = other.vx * nx + other.vy * ny;

            // Tangential velocity components (unchanged)
            // We only need to swap the normal components for equal mass
            const v1nFinal = v2n;
            const v2nFinal = v1n;

            // Update velocities
            // v = v_tangential + v_normal_final * normal_vector
            // Actually easier: v_final = v_initial - (v_initial_normal - v_final_normal) * normal_vector
            // v1_final = v1 - (v1n - v2n) * n

            const dv1 = (v1n - v1nFinal);
            const dv2 = (v2n - v2nFinal);

            this.vx -= dv1 * nx;
            this.vy -= dv1 * ny;
            other.vx -= dv2 * nx;
            other.vy -= dv2 * ny;
        }
    }

    draw(ctx) {
        ctx.save();
        let drawX = this.x;
        let drawY = this.y;

        if (this.isShaking) {
            drawX += (Math.random() - 0.5) * 10;
            drawY += (Math.random() - 0.5) * 10;
        }

        ctx.beginPath();
        ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = '#333';
        ctx.font = `bold ${this.radius}px sans-serif`; // Adjust font size relative to radius
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, drawX, drawY);
        ctx.restore();
    }

    shake() {
        this.isShaking = true;
        this.shakeStartTime = Date.now();
    }
}
