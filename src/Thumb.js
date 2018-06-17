export default class Thumb {
    constructor(element, position, diameter, fill) {
        this.element = element;
        this.fill = fill;
        this.position = position;
        this.diameter = diameter;

        const border = 2;
        element.style.boxSizing = 'border-box';
        element.style.position = 'absolute';
        element.style.border = border + 'px solid white';
        element.style.boxShadow = "0px 0px 10px 5px rgba(0, 0, 0, 0.1)";
        element.style.pointerEvents = 'none';

        // Setup transitions
        const growDuration = '100ms';
        element.style.transition = `
            width ${growDuration},
            height ${growDuration},
            border-radius ${growDuration},
            margin-left ${growDuration},
            margin-top ${growDuration}
        `;

        this._unzoomedDiameter = undefined;
    }

    set position({ x, y }) {
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
    }

    get fill() {
        return this._fill;
    }

    set fill(color) {
        this._fill = color;
        this.element.style.backgroundColor = color.toHexString();
    }

    get diameter() {
        return this._diameter;
    }

    set diameter(diameter) {
        this._diameter = diameter;
        const radius = diameter / 2;
        this.element.style.width = diameter + 'px';
        this.element.style.height = diameter + 'px';
        this.element.style.borderRadius = radius + 'px';

        this.element.style.marginTop = -1 * radius + 'px';
        this.element.style.marginLeft = -1 * radius + 'px';
    }

    zoom(nudge) {
        this._unzoomedDiameter = this._unzoomedDiameter === undefined ? this.diameter : this._unzoomedDiameter;
        const zoomedDiameter = this._unzoomedDiameter * 1.2;
        this.diameter = zoomedDiameter;

        // Bump the margin a bit more than normal to raise the thumb up
        if (nudge) this.element.style.marginTop = -1 * zoomedDiameter + 'px';
    }

    unzoom() {
        if (this._unzoomedDiameter === undefined) return;
        this.diameter = this._unzoomedDiameter;
        this._unzoomedDiameter = undefined;
    }

}
