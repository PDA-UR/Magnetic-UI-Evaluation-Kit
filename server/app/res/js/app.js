/* jshint esversion: 6 */

let DISTANCE_SENSITIVITY = 800;
// configure the movement speed of the elements here (0-1)
let UI_SPEED_X = 0.2;
let UI_SPEED_Y = 0.2;
let rectConfig;



//Get JSON config file from Server
$.getJSON('http://localhost:3333/res/jsonConfigFiles/rect1.json', function (jsonData) {
    rectConfig = JSON.parse(JSON.stringify(jsonData));
    createRect(rectConfig);
    createRect2(rectConfig);
    createRect3(rectConfig);
});


/*
Dieser Monitor:
2560 × 1600 (16∶10), 227dpi
*/

let realDpi = 227,
    realScreenWidth = 2560,
    realScreenHeight = 1600;

console.log(pxToMM(1600, realDpi))

function pxToMM (px, dpi) {
    let mm = ((px * (realScreenWidth/screen.width)) * 25.4 ) / dpi;
    return mm
}
console.log(mmToPX(179, realDpi));
console.log(pxToMM(mmToPX(179, realDpi), realDpi))

function mmToPX (mm, dpi) {
    let px = ((mm * dpi) / 25.4) / (realScreenWidth/screen.width);
    return px
}

let lastMousePositionX = null,
    lastMousePositionY = null;
    mouseIsInsideOfElement = false;
    timeAtLastSuccessfulClick = Date.now();




frame.addEventListener('mousemove', event => {
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
        console.log('clicked no target element (' + event.target.id + ')');
    
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


window.getDevicePixelRatio = function () {
    var ratio = 1;
    // To account for zoom, change to use deviceXDPI instead of systemXDPI
    if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI       !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
        // Only allow for values > 1
        ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
    }
    else if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
    }
    return ratio;
};

function createRect(config) {
    let div = document.createElement('div');
    div.id = "rect1";
    div.name = config.name;
    div.style.width = mmToPX(25, realDpi)+ 'px';
    div.style.height = mmToPX(25, realDpi)+ 'px';
    div.style.background = config.color;
    div.style.position = 'absolute';
    div.style.display = 'inline';
    div.style.left = 0 + 'px';
    div.style.top = 100 + 'px';
    div.style.transition = '0.1s';
    document.getElementById('frame').appendChild(div);

}

function createRect2(config) {
    let div = document.createElement('div');
    div.id = "rect2";
    div.name = config.name;
    div.style.width = config.width + "px";
    div.style.height = config.height + "px";
    div.style.background = config.color;
    div.style.position = 'absolute';
    div.style.display = 'inline';
    div.style.left = 500 + 'px';
    div.style.top = 100 + 'px';
    div.style.transition = '0.1s';
    document.getElementById('frame').appendChild(div);
}


function createRect3(config) {
    let div = document.createElement('div');
    div.id = "rect1";
    div.name = config.name;
    div.style.width = ((25 * realDpi) / 25.4) / window.devicePixelRatio + 'px';
    div.style.height = ((25 * realDpi) / 25.4) / window.devicePixelRatio + 'px';
    div.style.background = config.color;
    div.style.position = 'absolute';
    div.style.display = 'inline';
    div.style.left = 250 + 'px';
    div.style.top = 100 + 'px';
    div.style.transition = '0.1s';
    document.getElementById('frame').appendChild(div);
}



