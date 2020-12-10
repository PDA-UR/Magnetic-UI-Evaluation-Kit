/* jshint esversion: 6 */

let rectConfig = {
    width: 100,
    height: 150,
    color: "red",
    x_pos: 10,
    y_pos: 20
};

createRect(rectConfig);

document.body.addEventListener('mousemove', event => {
    // console.log(event.screenX, event.screenY);
    // console.log(event.movementX, event.movementY);
    // The X coordinate of the mouse pointer relative to the position of the last mousemove event.
    moveRect(event.screenX, event.screenY);
});


function moveRect(mouseX, mouseY) {
    let div = document.getElementById('div1'),
        mousePosition = new Vector(mouseX, mouseY),
        rectPosition = new Vector(div.offsetTop, div.offsetLeft),
        connectingVector = mousePosition.subtract(rectPosition),
        distance = connectingVector.length(), // maybe not needed
        normalized = connectingVector.normalize();

    console.log(distance);

    let newPoint = rectPosition.add(normalized.multiply(0.1));

    console.log(newPoint);

    div.style.top = newPoint.x + 'pt';
    div.style.left = newPoint.y + 'pt';


}

function createRect(config) {
    let div = document.createElement("div");
    div.id = "div1";
    div.style.width = config.width + "px";
    div.style.height = config.height + "px";
    div.style.background = config.color;
    div.style.position = "absolute";
    div.style.left = config.x_pos + 'px';
    div.style.top = config.y_pos + 'px';
    div.style.transition = '0.2s';
    // div.style.color = "white";
    // div.innerHTML = "Hello";

    document.body.appendChild(div);
}



