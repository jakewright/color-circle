import { isHexColor } from './utils/validators';

export default class Selector {
    constructor(canvas, { x, y }, radius, fill) {
        if (isNaN(x)) throw new Error('x must be a number, received: ' + x);
        if (isNaN(y)) throw new Error('y must be a number, received: ' + y);
        if (isNaN(radius)) throw new Error('radius must be a number, received: ' + radius);
        if (!isHexColor(fill)) throw new Error('fill must be valid hex colour string, received: ' + fill);

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.position = {x, y};
        this.radius = radius;
        this.fill = fill;

        this.drawIntervalId = undefined;
        this.animateTimeoutId = undefined;

        this.refreshRate = 30;
    }

    draw() {
        // Clear the whole canvas before drawing the selector again
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = this.fill;
        this.ctx.beginPath();
        this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    startDraw() {
        this.drawIntervalId = setInterval(() => {
            this.draw();
        }, this.refreshRate);
    }

    stopDraw() {
        // If currently animating, wait and try again.
        if (this.animateTimeoutId) {
            setTimeout(() => {
                this.stopDraw();
            }, this.refreshRate);
            return;
        }

        clearInterval(this.drawIntervalId);
    }

    animateTo(options) {
        // Cancel any previous animations
        clearTimeout(this.animateTimeoutId);
        this.animateTimeoutId = undefined;

        // Start the new animation
        this._animateTo(options);
    }

    _animateTo({ radius, ms }) {

        if (ms <= 0) {
            clearTimeout(this.animateTimeoutId);
            this.animateTimeoutId = undefined;
            return;
        }

        // Round up so we never get zero steps
        const steps = Math.ceil(ms / this.refreshRate);

        const radiusChange = radius - this.radius;

        this.radius += Math.round(radiusChange / steps);

        // Recursively call this function again after the next refresh
        this.animateTimeoutId = setTimeout(() => {
            this._animateTo({radius: radius, ms: ms - this.refreshRate})
        }, this.refreshRate);
    }
}
