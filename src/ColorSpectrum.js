export default class ColorSpectrum {
    constructor(canvas, centerRadius, diameter) {
        if (isNaN(centerRadius)) throw new Error('centerRadius must be a number, received: ' + diameter);
        if (isNaN(diameter)) throw new Error('diameter must be a number, received: ' + diameter);

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.centerRadius = centerRadius;
        this.diameter = diameter;
        this.radius = diameter / 2;
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
            let grad = this.ctx.createLinearGradient(0, 0, this.radius, 0);
            grad.addColorStop(0, '#FFFFFF');
            grad.addColorStop(0.3, '#FFFFFF');
            grad.addColorStop(1, 'hsl(' + x + ', 100%, 50%');
            this.ctx.fillStyle = grad;

            this.ctx.fillRect(
                // If this is zero, it will start from the middle. A positive centerRadius will move it along the
                // x-axis to create a hole in the middle.
                this.centerRadius,

                // No need to move in the y-axis
                0,

                // This is the length, so account for the offset on the start of the rectangle.
                this.radius - this.centerRadius,

                // We want this to be a thin line, but not too thin. Dividing the diameter by 100 seems to work.
                this.diameter / 100
            );

            this.ctx.restore();
        }
    }


}





