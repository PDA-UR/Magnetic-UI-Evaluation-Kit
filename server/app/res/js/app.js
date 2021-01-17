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
    frame = document.getElementById('frame'),
    timeAtLoadingComplete;

let csvContent = "Loaded scene at; Entered Object after ms; Left Object after ms; Missed Click after ms; Successful click after ms;",
    missedClicks = [],
    enteredObject = [],
    leftObject = [],
    timeUntilSuccessfulClick;
    



//Get JSON config file from Server
$.getJSON('http://localhost:3333/res/jsonConfigFiles/rect1.json', function (jsonData) {
    rectConfig = JSON.parse(JSON.stringify(jsonData));
    createFrame();
    createRect();
    createCustomCursor(100, 100);
    timeAtLoadingComplete = Date.now();
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
    }

});

//click listener to recognize if element is clicked
frame.addEventListener('click', event => {
    let targetRectangle = document.getElementById("rect1"),
        cursor = document.getElementById("customCursor");
    if (cursorIsInsideOfElement(targetRectangle)) {
        //clicked element
        clickTime = Date.now();
        timeUntilSuccessfulClick = clickTime - timeAtLoadingComplete;
        removeElement(targetRectangle.id);
        removeElement(cursor.id)
        createRect();
        let newCursorCoords = getNewCursorCoordinates(document.getElementById("rect1"));
        createCustomCursor(newCursorCoords[0], newCursorCoords[1]);
        mouseIsInsideOfElement = false;
        logAllData();
        
    } else {
        //clicked canvas
        missedClicks.push(Date.now() - timeAtLoadingComplete);
        frame.requestPointerLock = frame.requestPointerLock ||
        element.mozRequestPointerLock ||
        element.webkitRequestPointerLock;
        frame.requestPointerLock();
    
    }

});


function logAllData(){
    console.log("Loaded scene: " + timeAtLoadingComplete);
    console.log("Entered: " + enteredObject);
    console.log("Left: " + leftObject);
    console.log("Click missed: " + missedClicks);
    console.log("Clicked success: " + timeUntilSuccessfulClick);
    
    let timeAtLoadingCompleteString = timeAtLoadingComplete;
        enteredObjectString = "; ",
        leftObjectString = "; ",
        missedClicksString = "; ",
        timeUntilSuccessfulClickString = "; " + timeUntilSuccessfulClick + ";";

    enteredObject.forEach((val, key, enteredObject) => {
        if (Object.is(enteredObject.length - 1, key)) {
            // execute last item logic
            enteredObjectString = enteredObjectString + val
          } else{
            enteredObjectString = enteredObjectString + val + ", "
          }
    });

    missedClicks.forEach((val, key, missedClicks) => {
        if (Object.is(missedClicks.length - 1, key)) {
            // execute last item logic
            missedClicksString = missedClicksString + val
          } else{
            missedClicksString = missedClicksString + val + ", "
          }
    });

    leftObject.forEach((val, key, leftObject) => {
        if (Object.is(leftObject.length - 1, key)) {
            // execute last item logic
            leftObjectString = leftObjectString + val
          } else{
            leftObjectString = leftObjectString + val + ", "
          }
    });

    let logString = timeAtLoadingComplete + enteredObjectString + leftObjectString + missedClicksString + timeUntilSuccessfulClickString;
    csvContent = csvContent + "\n" + logString;
    console.log(csvContent);

    enteredObject = [];
    leftObject = [];
    missedClicks = [];
    timeAtLoadingComplete = Date.now();

    
    
}

function getNewCursorCoordinates(elementToSpawnAround){
    let centerX = parseInt(elementToSpawnAround.style.left) - 5 + parseInt(elementToSpawnAround.style.width)/2,
        centerY = parseInt(elementToSpawnAround.style.top) - 5 + parseInt(elementToSpawnAround.style.height)/2,
  
        cursorStartX = centerX + 300,
        cursorStartY = centerY,
        coords = rotateAroundCenter(centerX, centerY, cursorStartX, cursorStartY);

    while (coords[0] > 1000 || coords[0] < 0 || coords[1] > 750 || coords[1] < 0){
        coords =  rotateAroundCenter(centerX, centerY, cursorStartX, cursorStartY);
    }
    
    return coords;
}

function rotateAroundCenter(centerX, centerY, cursorStartX, cursorStartY){
    let coords = Array.from({length: 2}),
        rad = degreesToRadians(getRndInteger(0, 360)),
        sin = Math.sin(rad),
        cos =  Math.cos(rad);

        coords[0] = cos * (cursorStartX - centerX) - sin * (cursorStartY - centerY) + centerX;
        coords[1] = sin * (cursorStartX - centerX) - cos * (cursorStartY - centerY) + centerY;

    return coords;  
}

function degreesToRadians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function removeElement(elementId) {
    // Removes an element from the document
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}


function moveCustomCursor(mouseMovementX, mouseMovementY){
    let customCursor = document.getElementById("customCursor");
    customCursorTop = parseInt(customCursor.style.top),
    customCursorLeft = parseInt(customCursor.style.left),
    newCursorX = (customCursorLeft + mouseMovementX) + "px",
    newCursorY = (customCursorTop + mouseMovementY) + "px";

    if (parseInt(newCursorX) >= parseInt(1000 - 10) || parseInt(newCursorX) <= parseInt(0)){
        moveRectangle(0, mouseMovementY);
    }   else if(parseInt(newCursorY) >= parseInt(750 - 10) || parseInt(newCursorY) <= parseInt(0)){
        moveRectangle(mouseMovementX, 0);
    }   else {
        moveRectangle(mouseMovementX, mouseMovementY);
    }
    customCursor.style.left = limitNumberWithinRange(newCursorX, 0, 1000 - 10) + 'px',
    customCursor.style.top = limitNumberWithinRange(newCursorY, 0, 750 - 10) + 'px';

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
            enteredObject.push(Date.now() - timeAtLoadingComplete);
            mouseIsInsideOfElement = true;
        }

    } else if (distance > DISTANCE_SENSITIVITY) {
        // do nothing
        console.log('distance too big: ' + distance);
    } else {
        //Check if mouse left the element just now
        if (mouseIsInsideOfElement) {
            leftObject.push(Date.now() - timeAtLoadingComplete)
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

function createCustomCursor(x, y){
    let customCursor = document.createElement('div');
    customCursor.id = "customCursor";
    customCursor.style.width = 10 + 'px';
    customCursor.style.height = 10 + 'px';
    customCursor.style.background = "yellow";
    customCursor.style.position = 'absolute';
    customCursor.display = 'inline';
    customCursor.style.left = x + "px";
    customCursor.style.top = y + "px";
    frame.appendChild(customCursor);
}

function createRect() {
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




