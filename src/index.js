import ColorWheel from './ColorWheel';

document.addEventListener("DOMContentLoaded", function(e) {
    let elements = document.getElementsByClassName('color-wheel');

    Array.from(elements).forEach(function(element) {
        console.log("Element", element);
        const colorWheel = new ColorWheel(element, '#000000', 30, 400);
        colorWheel.draw();
    });
});


