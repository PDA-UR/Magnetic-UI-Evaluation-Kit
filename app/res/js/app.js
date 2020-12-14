/* jshint esversion: 6 */

let rectConfig = {
    id: "div-test",
    width: 100,
    height: 150,
    color: "red",
    x_pos: 10,
    y_pos: 20
};

createRect(rectConfig);

document.body.addEventListener('mousemove', event => {
    // Returns the horizontal/vertical coordinate of the mouse pointer,
    // relative to the current window, when the mouse event was triggered
    moveRect(event.clientX, event.clientY);
});


function moveRect(mouseX, mouseY) {
    let div = document.getElementById(rectConfig.id),
        mousePosition = new Vector(mouseX, mouseY),
        rectPosition = new Vector(div.offsetTop, div.offsetLeft), // top-left point of rect!

        connectingVector = mousePosition.subtract(rectPosition),
        distance = connectingVector.length(),
        normalized = connectingVector.normalize(),
        newPoint = rectPosition.add(normalized.multiply(10));

    console.log(distance);

    // if (distance > 300) { return; }

    if (div.matches(":hover")) {
        //Mouse is inside element
        return;
    }


    div.style.top = newPoint.x + 'px';
    div.style.left = newPoint.y + 'px';
}


function createRect(config) {
    let div = document.createElement("div");
    div.id = config.id;
    div.style.width = config.width + "px";
    div.style.height = config.height + "px";
    div.style.background = config.color;
    div.style.position = "absolute";
    div.style.left = config.x_pos + 'px';
    div.style.top = config.y_pos + 'px';
    div.style.transition = '0.2s';

    document.body.appendChild(div);
}



