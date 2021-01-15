/* jshint esversion: 6 */

let DISTANCE_SENSITIVITY = 2000;
// configure the movement speed of the elements here (0-1)
let UI_SPEED_X = 0.5;
let UI_SPEED_Y = 0.5;
let rectConfig;

let lastMousePositionX = null,
    lastMousePositionY = null,
    mouseIsInsideOfElement = false,
    timeAtLastSuccessfulClick = Date.now(),
    frame = document.getElementById('frame');



//Get JSON config file from Server
$.getJSON('http://localhost:3333/res/jsonConfigFiles/rect1.json', function (jsonData) {
    rectConfig = JSON.parse(JSON.stringify(jsonData));
    createFrame();
    createRect(rectConfig);
    createCustomCursor();
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






frame.addEventListener('mousemove', event => {
    // clientX/clientY: Returns the horizontal/vertical coordinate of the mouse pointer,
    // relative to the current window, when the mouse event was triggered

    if (lastMousePositionX == null || lastMousePositionY == null) {
        lastMousePositionX = event.clientX;
        lastMousePositionY = event.clientY;

        
    } else {
        moveCustomCursor(event.movementX, event.movementY);
        moveRectangle(event.movementX, event.movementY);
    }

});

//click listener to recognize if element is clicked
frame.addEventListener('click', event => {
    let targetRectangle = document.getElementById("rect1");
    if (cursorIsInsideOfElement(targetRectangle)) {
        clickTime = Date.now();
        let timeSinceLastSuccessfulClick = clickTime - timeAtLastSuccessfulClick;
        console.log('clicked element ' + targetRectangle.name + ' in ' + timeSinceLastSuccessfulClick);
        timeAtLastSuccessfulClick = clickTime;
    } else {
        console.log('clicked canvas');

        
        frame.requestPointerLock = frame.requestPointerLock ||
        element.mozRequestPointerLock ||
        element.webkitRequestPointerLock;
        frame.requestPointerLock();
    
    }

});


function moveCustomCursor(mouseMovementX, mouseMovementY){
    let customCursor = document.getElementById("customCursor");
    customCursorTop = parseInt(customCursor.style.top),
    customCursorLeft = parseInt(customCursor.style.left),
    customCursor.style.left = (customCursorLeft + mouseMovementX) + "px";
    customCursor.style.top = (customCursorTop + mouseMovementY) + "px";

}

function moveRectangle(mouseMovementX, mouseMovementY){

    let div = document.getElementById("rect1"),
        customCursor = document.getElementById("customCursor"),
        divTop = parseInt(div.style.top),
        divLeft = parseInt(div.style.left),
        distance = Math.sqrt((divTop - customCursor.style.top) * (divTop - customCursor.style.top) + (divLeft - customCursor.style.left) * (divLeft - customCursor.style.left));

    if (cursorIsInsideOfElement(div)) {
        //Mouse is inside element
        //Check if mouse entered the element just now
        if (!mouseIsInsideOfElement) {
            console.log('moved inside of element');
            mouseIsInsideOfElement = true;
        }

    } else if (distance > DISTANCE_SENSITIVITY) {
        // do nothing
        console.log('distance too big: ' + distance);
    } else {
        //Check if mouse left the element just now
        if (mouseIsInsideOfElement) {
            console.log('moved outside of element');
            mouseIsInsideOfElement = false;
        }

        mouseIsInsideOfElement = false;
        newY = divTop + (-1 * mouseMovementY);
        newX = divLeft + (-1 * mouseMovementX);

        div.style.top = limitNumberWithinRange(newY, 0, 650) + 'px';
        div.style.left = limitNumberWithinRange(newX, 0, 900) + 'px';
    }
}

function cursorIsInsideOfElement(elementToCheck){
    cursor = document.getElementById("customCursor");
    rect1 = cursor.getBoundingClientRect();
    rect2 = elementToCheck.getBoundingClientRect();

    if(!(rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom)){
        return true;
        
    }   else {
        return false;
    }
}

function limitNumberWithinRange(num, min, max){
    const MIN = min || 1;
    const MAX = max || 20;
    const parsed = parseInt(num)
    return Math.min(Math.max(parsed, MIN), MAX)
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

function createFrame(){
    frame.style.width = 1000 + 'px';
    frame.style.height = 750 + 'px';
    frame.style.background = "blue";
    frame.style.position = 'fixed';
    frame.style.display = 'inline';
}

function createCustomCursor(){
    let customCursor = document.createElement('div');
    customCursor.id = "customCursor";
    customCursor.style.width = 10 + 'px';
    customCursor.style.height = 10 + 'px';
    customCursor.style.background = "yellow";
    customCursor.style.position = 'absolute';
    customCursor.display = 'inline';
    customCursor.style.left = 0;
    customCursor.style.top = 0;
    frame.appendChild(customCursor);
}

function createRect(config) {
    let div = document.createElement('div');
    div.id = "rect1";
    div.name = "rectangleRed";
    div.style.width = 100 + 'px';
    div.style.height = 100 + 'px';
    div.style.background = "red";
    div.style.position = 'absolute';
    div.style.display = 'inline';
    let xCoord = getRndInteger(0, parseInt(frame.style.width) - parseInt(div.style.width));
    let yCoord = getRndInteger(0, parseInt(frame.style.height) - parseInt(div.style.height));
    div.style.left = xCoord + "px";
    div.style.top = yCoord + "px";
    div.style.transition = '0.1s';
    frame.appendChild(div);
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }




