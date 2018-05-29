import tinycolor from 'tinycolor2';

export default class ColorSpectrum {
    constructor(canvas, outerDiameter, innerDiameter) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.radius = outerDiameter / 2;
        this.innerRadius = innerDiameter / 2;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw 360 lines to make the coloured circle
        for (let x = 0; x < 360; x++) {
            this.ctx.save();

            // Move to the centre
            this.ctx.translate(this.radius, this.radius);

            // Rotate by x degrees
            this.ctx.rotate(x * Math.PI / 180);

            // Create the white->colour gradient
            let grad = this.ctx.createLinearGradient(this.innerRadius, 0, this.radius, 0);
            grad.addColorStop(0, '#FFFFFF');
            grad.addColorStop(1, `hsl(${x}, 100%, 50%)`);
            this.ctx.fillStyle = grad;

            this.ctx.fillRect(
                // If this is zero, it will start from the middle. A positive innerRadius will move it along the
                // x-axis to create a hole in the middle.
                this.innerRadius,

                // No need to move in the y-axis
                0,

                // This is the length, so account for the offset on the start of the rectangle.
                this.radius - this.innerRadius,

                // We want this to be a thin line, but not too thin. Dividing the radius by 50 seems to work.
                this.radius / 50
            );

            this.ctx.restore();
        }
    }

    getColorOfPosition({x, y}) {
        const imageData = this.ctx.getImageData(x, y, 1, 1).data;
        return tinycolor({r: imageData[0], g: imageData[1], b: imageData[2]});
    }

    getPositionOfColor(color) {
        // Convert the RGB colour to HSL so we can map it to the spectrum
        const {h, l} = color.toHsl();

        // Let theta be the angle in radians of the given hue
        const theta = h * Math.PI / 180;

        // Let c be the vector from the centre of the circle to circumference, along the line of the given hue.
        const c = {
            x: this.radius * Math.cos(theta),
            y: this.radius * Math.sin(theta),
        };

        // The spectrum displays lightness values between 1 and 0.5 (from the centre outwards)
        // Normalise l to get the ratio of the point along the radius that displays this lightness value
        // We must subtract it from 1 because the centre of the circle shows the highest lightness value
        const ratio = 1 - Math.max(0, 2 * (l - 0.5));

        // Let d be the distance along the radius that this lightness value sits.
        const d = ratio * (this.radius - this.innerRadius) + this.innerRadius;

        // Let o be a vector representing the centre of the circle
        const o = {x: this.radius, y: this.radius};

        return {
            x: o.x + d * (c.x / this.radius),
            y: o.y + d * (c.y / this.radius),
        };
    }
}





