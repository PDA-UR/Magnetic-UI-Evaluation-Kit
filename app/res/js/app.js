/* jshint esversion: 6 */

let DISTANCE_SENSITIVITY = 300;
let rectConfig = {
    id: "div-test",
    width: 100,
    height: 150,
    color: "red",
    x_pos: 400,
    y_pos: 200
};

createRect(rectConfig);

let lastMousePositionX = null,
    lastMousePositionY = null;

document.body.addEventListener('mousemove', event => {
    // clientX/clientY: Returns the horizontal/vertical coordinate of the mouse pointer,
    // relative to the current window, when the mouse event was triggered

    if (lastMousePositionX == null || lastMousePositionY == null) {
        lastMousePositionX = event.clientX;
        lastMousePositionY = event.clientY;
    } else {
        moveRect(event.clientX, event.clientY);
    }

});

function moveRect(mouseX, mouseY) {
    let div = document.getElementById(rectConfig.id),
        currentPositionX = mouseX,
        currentPositionY = mouseY,
        divTop = parseInt(div.style.top),
        divLeft = parseInt(div.style.left),
        distance = Math.sqrt((divTop - currentPositionY) * (divTop - currentPositionY) + (divLeft - currentPositionX) * (divLeft - currentPositionX));

    let dx = currentPositionX - lastMousePositionX;
    let dy = currentPositionY - lastMousePositionY;

    if (div.matches(":hover")) {
        //Mouse is inside element
        console.log("inside element");
    } else if (distance > DISTANCE_SENSITIVITY) {
        // do nothing
    } else {
        div.style.top = divTop + (-1 * dy) + 'px';
        div.style.left = divLeft + (-1 * dx) + 'px';
    }

    lastMousePositionX = currentPositionX;
    lastMousePositionY = currentPositionY;
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
    div.style.transition = '0.1s';

    document.body.appendChild(div);
}



