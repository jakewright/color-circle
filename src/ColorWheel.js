import {isHexColor} from './utils/validators';
import ColorSpectrum from './ColorSpectrum';
import Selector from './Selector';

export default class ColorWheel {
    constructor(container, value, centerRadius, diameter) {
        if (typeof diameter === 'undefined') diameter = container.clientWidth;

        if (!isHexColor(value)) throw new Error('value must be valid hex colour string, received: ' + value);
        if (isNaN(centerRadius)) throw new Error('centerRadius must be a number, received: ' + diameter);
        if (isNaN(diameter)) throw new Error('diameter must be a number, received: ' + diameter);

        this.centerRadius = centerRadius;

        // Create spectrumCanvas for colour spectrum
        this.spectrumCanvas = this._createCanvas(diameter, false);
        this.spectrumContext = this.spectrumCanvas.getContext('2d');
        container.appendChild(this.spectrumCanvas);

        // Create the colour spectrum
        this.spectrum = new ColorSpectrum(this.spectrumCanvas, centerRadius, diameter);

        // Create spectrumCanvas for selector
        this.selectorCanvas = this._createCanvas(diameter, true);
        container.appendChild(this.selectorCanvas);

        // Create the selector
        this.selector = new Selector(this.selectorCanvas, { x: 0, y: 0 }, centerRadius, value);

        this.touching = false;
        this.dragging = false;
        this._setupEvents();
    }

    draw() {
        this.spectrum.draw();
        this.selector.draw();
    }

    _createCanvas(diameter, noPointerEvents) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.width = diameter;
        canvas.height = diameter;
        if (noPointerEvents) {
            canvas.style.pointerEvents = 'none';
        }

        return canvas;
    }

    _setupEvents() {
        this.spectrumCanvas.addEventListener('mousedown', (e) => { this._handleStartDrag(e) });
        this.spectrumCanvas.addEventListener('touchstart', (e) => {
            // Only handle single finger touches
            if (e.changedTouches.length !== 1) return;

            e.preventDefault();

            // Cannot pass the mouse event; must get the first touch event which will hold the position.
            const touch = e.changedTouches[0];
            this._handleStartDrag(touch)
        });

        this.spectrumCanvas.addEventListener('mouseup', () => { this._handleStopDrag() });
        this.spectrumCanvas.addEventListener('touchend', () => { this._handleStopDrag() });
        this.spectrumCanvas.addEventListener('touchcancel', () => { this._handleStopDrag() });

        this.spectrumCanvas.addEventListener('mousemove', (e) => {
            this._handleDrag(event)
        });

        this.spectrumCanvas.addEventListener('touchmove', (e) => {
            // Only handle single finger touches
            if (e.changedTouches.length !== 1) return;

            e.preventDefault();

            // Cannot pass the mouse event; must get the first touch event which will hold the position.
            const touch = e.changedTouches[0];
            this._handleDrag(touch)
        });
    }

    _handleStartDrag(event) {
        this.selector.startDraw();
        this.touching = true;

        this._moveSelector(this._getMousePosition(event));
    }

    _handleDrag(event) {
        if (!this.touching) return;

        this._moveSelector(this._getMousePosition(event));

        // Animate to the larger radius if necessary
        if (!this.dragging) {
            this.selector.animateTo({radius: this.centerRadius * 1.2, ms: 100});
        }

        this.dragging = true;
    }

    _handleStopDrag() {
        this.touching = false;
        this.dragging = false;

        this.selector.animateTo({radius: this.centerRadius, ms: 100});
        this.selector.stopDraw();
    }

    /**
     * Given a position, move the selector to that position and set its colour based on the colour of the spectrum at
     * that point.
     * @param {Number} x
     * @param {Number} y
     * @private
     */
    _moveSelector({ x, y }, nudgeUp) {
        const imageData = this.spectrumContext.getImageData(x, y, 1, 1).data;

        const position = nudgeUp ? {x: x + 10, y: y + 10} : {x, y};

        this.selector.position = position;
        this.selector.fill = 'rgb(' + imageData[0] + ', ' + imageData[1] + ', ' + imageData[2] + ')';


    }

    _getMousePosition(event) {
        const rect = this.spectrumCanvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }


}
