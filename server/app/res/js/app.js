/* jshint esversion: 6 */

let rectConfig = {
    id: "div-test",
    width: 100,
    height: 150,
    color: "red",
    x_pos: 400,
    y_pos: 200,
    name: "redFirst"
};

createRect(rectConfig);

let lastMousePositionX = null,
    lastMousePositionY = null;
    mouseIsInsideOfElement = false;
    timeAtLastSuccessfulClick = Date.now();


document.body.addEventListener('mousemove', event => {
    // clientX/clientY: Returns the horizontal/vertical coordinate of the mouse pointer,
    // relative to the current window, when the mouse event was triggered

    if (lastMousePositionX == null || lastMousePositionY == null) {
        lastMousePositionX = event.clientX;
        lastMousePositionY = event.clientY
    } else {
        moveRect(event.clientX, event.clientY);
    }

});

//click listener to recognize if element is clicked
document.body.addEventListener('click', event=> {
    if (event.target.id == rectConfig.id) {
        clickTime = Date.now();
        let timeSinceLastSuccessfulClick = clickTime - timeAtLastSuccessfulClick;
        console.log("clicked element " + event.target.name + " in " + timeSinceLastSuccessfulClick);
        timeAtLastSuccessfulClick = clickTime;
    } else {
        console.log("clicked no element");
    }

});


function moveRect(mouseX, mouseY) {
    let div = document.getElementById(rectConfig.id),
        currentPositionX = mouseX,
        currentPositionY = mouseY;

    // todo: choose reasonable distance and implement
    // if (distance > 300) { return; }


    // configure the movement speed of the elements here (0-1)
    let UiSpeedX = 0.2;
    let UiSpeedY = 0.2;

    let dx = (currentPositionX - lastMousePositionX) * UiSpeedX;
    let dy = (currentPositionY - lastMousePositionY) * UiSpeedY;


    let divTop = parseInt(div.style.top),
        divLeft = parseInt(div.style.left);


    if (div.matches(":hover")) {
        //Mouse is inside element
        //Check if mouse entered the element just now
        if (!mouseIsInsideOfElement){
            console.log("moved inside of element");
            mouseIsInsideOfElement = true;
        }
    
    } else {
        //Check if mouse left the element just now
        if (mouseIsInsideOfElement){
            console.log("moved outside of element");
            mouseIsInsideOfElement = false;
        }
        
        mouseIsInsideOfElement = false;
        div.style.top = divTop + (-1 * dy) + 'px';
        div.style.left = divLeft + (-1 * dx) + 'px';
    }

    lastMousePositionX = currentPositionX;
    lastMousePositionY = currentPositionY;
}

function createRect(config) {
    let div = document.createElement("div");
    div.id = config.id;
    div.name = config.name;
    div.style.width = config.width + "px";
    div.style.height = config.height + "px";
    div.style.background = config.color;
    div.style.position = "absolute";
    div.style.left = config.x_pos + 'px';
    div.style.top = config.y_pos + 'px';
    // div.style.transition = '0.2s';
    document.body.appendChild(div);
}



