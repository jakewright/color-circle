import ColorSpectrum from './ColorSpectrum';
import Thumb from './Thumb';
import tinycolor from 'tinycolor2';

export default class ColorCircle {
    /**
     * @param {Object} options
     * @param {HTMLInputElement} options.input The input element that will be updated when the colour is changed
     * @param {Element} options.target The element that will contain the colour picker
     * @param {number} options.diameterRatio The ratio of the inner diameter to the outer diameter
     * @param {number} options.thumbDiameter The diameter of the round selector
     */
    constructor({ input, target, diameterRatio, thumbDiameter }) {
        if (input === undefined) throw new Error('input must be an HTML input element');
        if (target === undefined) throw new Error('target must be an HTML element');
        if (isNaN(diameterRatio) || diameterRatio < 0 || diameterRatio > 1)
            throw new Error('diameterRatio must be a number in the range [0, 1]');

        const outerDiameter = Math.max(target.clientWidth, target.clientHeight);
        const innerDiameter = outerDiameter * diameterRatio;

        const color = tinycolor(input.value);
        if (!color.isValid()) throw new Error(`The value of the input '${value}' is not a valid CSS color`);

        this.input = input;
        this.radius = outerDiameter / 2;
        this.centerRadius = innerDiameter / 2;

        // Create a container for the canvas and the thumb
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = outerDiameter + 'px';
        container.style.height = outerDiameter + 'px';

        // Create the colour spectrum
        this.spectrumCanvas = document.createElement('canvas');
        this.spectrumCanvas.style.position = 'absolute';
        this.spectrumCanvas.width = outerDiameter;
        this.spectrumCanvas.height = outerDiameter;
        this.spectrumCanvas.style.width = '100%';
        this.spectrumCanvas.style.height = '100%';
        container.appendChild(this.spectrumCanvas);
        this.spectrum = new ColorSpectrum(this.spectrumCanvas, outerDiameter, innerDiameter);
        this.spectrum.draw();

        // Create the thumb
        thumbDiameter = thumbDiameter === undefined ? 50 : thumbDiameter;
        const div = document.createElement('div');
        container.appendChild(div);
        const position = this.spectrum.getPositionOfColor(color);
        this.thumb = new Thumb(div, position, thumbDiameter, color);

        // Insert the container into the DOM
        target.appendChild(container);

        // When moving the thumb, keep track of which colour it started on so we know whether the colour was changed
        // at the end. We do not set this variable until the thumb is "picked up" because it is used to know whether
        // the thumb is currently being moved.
        this.startColor = undefined;
        this._setupEvents();
    }

    _setupEvents() {
        this.spectrumCanvas.addEventListener('mousedown', (e) => { this._handleMouseDown(e) });
        this.spectrumCanvas.addEventListener('touchstart', (e) => {
            // Only handle single finger touches
            if (e.changedTouches.length !== 1) return;

            e.preventDefault();

            // Cannot pass the mouse event; must get the first touch event which will hold the position.
            const touch = e.changedTouches[0];
            this._handleMouseDown(touch)
        });

        this.spectrumCanvas.addEventListener('mouseup', () => { this._handleMouseUp() });
        this.spectrumCanvas.addEventListener('touchend', () => { this._handleMouseUp() });
        this.spectrumCanvas.addEventListener('touchcancel', () => { this._handleMouseUp() });

        this.spectrumCanvas.addEventListener('mousemove', (e) => {
            this._handleMouseMove(e)
        });

        this.spectrumCanvas.addEventListener('touchmove', (e) => {
            // Only handle single finger touches
            if (e.changedTouches.length !== 1) return;

            e.preventDefault();

            // Cannot pass the mouse event; must get the first touch event which will hold the position.
            const touch = e.changedTouches[0];
            this._handleMouseMove(touch)
        });
    }

    _handleMouseDown(event) {
        this.startColor = this.thumb.fill;

        this._moveSelector(this._getMousePosition(event));
    }

    _handleMouseMove(event) {
        // Ignore this mouse move event if we're not currently dragging the thumb
        if (!this.startColor) return;

        // Move the thumb to the new position. This will return whether the position was inside the spectrum or not.
        const isInside = this._moveSelector(this._getMousePosition(event));

        // Zoom the thumb while selecting, nudging the position up if the mouse pointer is inside the spectrum.
        this.thumb.zoom(isInside);
    }

    _handleMouseUp() {
        this.thumb.unzoom();

        if (this.thumb.fill.toHex() !== this.startColor.toHex()) {
            const event = new Event('change');
            this.input.dispatchEvent(event);
        }

        this.startColor = false;
    }

    /**
     * Given a position, move the selector to that position and set its colour based on the colour of the spectrum at
     * that point. If the position is outside of the spectrum, then the closest point inside will be found.
     * @private
     */
    _moveSelector(b) {
        const oldColor = this.thumb.fill;

        let inside = true;
        let color = this.spectrum.getColorOfPosition(b);

        // If the colour is black, assume that the pointer is outside of the spectrum and instead find the closest point
        // that is within the doughnut shape.
        if (color.toHex() === '000000') {
            inside = false;
            // Let a be a vector representing the centre of the circle
            const a = {x: this.radius, y: this.radius};

            // Let d be || b - a ||
            const d = Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

            const r = (d > this.radius) ? this.radius - 1 : this.centerRadius + 1;

            // Find the point on the edge of the circle closest to b
            b.x = a.x + r * (b.x - a.y) / d;
            b.y = a.y + r * (b.y - a.y) / d;

            color = this.spectrum.getColorOfPosition(b);
        }

        this.thumb.position = b;
        this.thumb.fill = color;

        if (oldColor.toHex() !== color.toHex()) {
            this.input.value = color.toHexString();
            const event = new Event('input');
            this.input.dispatchEvent(event);
        }

        return inside;
    }

    _getMousePosition(event) {
        const rect = this.spectrumCanvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }
}
