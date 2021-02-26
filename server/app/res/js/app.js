/* jshint esversion: 6 */

let timeAtLastSuccessfulClick,
    frame = document.getElementById('frame'),
    timeAtLoadingComplete,
    UI_SPEED_X,
    UI_SPEED_Y,
    CURSOR_SPEED_X = 1,
    CURSOR_SPEED_Y = 1,
    rectConfig
    startScreenIsActive = true,
    hasAlreadyParticipated = false;

//Cursor and Target element
let customCursor,
    targetElement;

//Loged Data    
let csvContent = "timestampLog,pid,condition_id,run_id,timestampConditionStart,timestampCollision,timestampClick,mouseIsInsideElement,targetX,targetY,targetWidth,targetHeight,cursorX,cursorY",
    //pid = prompt("Please enter your PID"),
    pid = 111,
    condition_id = 0,
    run_id = 0,
    timestampConditionStart,
    timestampCollision,
    timestampClick,
    cursorInside = false,
    newX,
    newY,
    targetWidth,
    targetHeight,
    cursorX = null,
    cursorY = null,
    chunksSentToServer = 0,
    csvContentSize = 0,
    dataHasBeenSentToServer = false;
//One Chunk equals 10 runs
let NUMBER_OF_CHUNKS_TO_BE_SENT = 10;


//setupScene();
setupStartScreen();

function setupScene() {
    setConfigurationParameters();
    createFrame();
    createRect();
    createCustomCursor(100, 100);
    timeAtLoadingComplete = Date.now();
}

function setupStartScreen() {
    startScreenIsActive = true;
    createFrame();
    createStartScreenUi();
}

function setConfigurationParameters() {
    switch (condition_id) {
        case 0:
            UI_SPEED_X = 0;
            UI_SPEED_Y = 0;
            break;
        case 1:
            UI_SPEED_X = 0.5;
            UI_SPEED_Y = 0.5;
            break;
        case 2:
            UI_SPEED_X = 1;
            UI_SPEED_Y = 1;
            break;
        case 3:
            UI_SPEED_X = 0;
            UI_SPEED_Y = 0;
            CURSOR_SPEED_X = 1.5;
            CURSOR_SPEED_Y = 1.5;
            break;
        case 4:
            postRunsComplete();
            alert("This is it, you're done!");
            break;
    }
}


//Listeners
frame.addEventListener('mousemove', event => {
    //Initiate cursor at start

    if (!startScreenIsActive) {
        if (cursorX == null || cursorY == null) {
            cursorX = event.clientX;
            cursorY = event.clientY;
        } else {
            if (event.movementX != 0 || event.movementY != 0) {
                moveCursor(event.movementX, event.movementY);

                moveUI(event.movementX, event.movementY);
                logAllData();

            }

        }
    }



});

frame.addEventListener('click', event => {
    if (!startScreenIsActive) {
        //request Pointer Lock
        frame.requestPointerLock = frame.requestPointerLock ||
            element.mozRequestPointerLock ||
            element.webkitRequestPointerLock;
        frame.requestPointerLock();


        if (cursorIsInsideOfElement(targetElement)) {
            //clicked element
            cursorInside = true;
            timestampClick = Date.now();
            logAllData();
            //setup new scene
            setupNewScene();
        } else {
            //clicked canvas
            timestampClick = Date.now();
            cursorInside = false;
            logAllData();
        }
    }
});


//General movement logic
function moveCursor(mouseMovementX, mouseMovementY) {
    customCursorTop = parseInt(customCursor.style.top),
        customCursorLeft = parseInt(customCursor.style.left),

        cursorX = limitNumberWithinRange((customCursorLeft + mouseMovementX * CURSOR_SPEED_X), 0, 1000 - 10),
        cursorY = limitNumberWithinRange((customCursorTop + mouseMovementY * CURSOR_SPEED_X), 0, 750 - 10);

    customCursor.style.left = cursorX + 'px',
        customCursor.style.top = cursorY + 'px';
}

function moveUI(mouseMovementX, mouseMovementY) {
    let xMovement,
        yMovement;

    //Don't move UI in x or y direction if the cursor is at the left/right or top/bottom edge

    if (cursorX >= (parseInt(frame.style.width) - parseInt(customCursor.style.width)) || cursorX <= 0) {
        xMovement = 0,
            yMovement = mouseMovementY;
    } else if (cursorY >= (parseInt(frame.style.height) - parseInt(customCursor.style.height)) || cursorY <= 0) {
        xMovement = mouseMovementX,
            yMovement = 0;
    } else {
        xMovement = mouseMovementX,
            yMovement = mouseMovementY;
    }

    let targetElementTop = parseInt(targetElement.style.top),
        targetElementLeft = parseInt(targetElement.style.left);

    if (cursorIsInsideOfElement(targetElement)) {
        //Cursor is inside element
        if (!cursorInside) {
            //Cursor entered element just now
            cursorInside = true;
            timestampCollision = Date.now();
        }
    } else {
        //Cursor is outside of element
        cursorInside = false;
        newX = limitNumberWithinRange(targetElementLeft + (-1 * xMovement) * UI_SPEED_X, 0, parseInt(frame.style.width) - parseInt(targetElement.style.width));
        newY = limitNumberWithinRange(targetElementTop + (-1 * yMovement) * UI_SPEED_Y, 0, parseInt(frame.style.height) - parseInt(targetElement.style.height));
        targetElement.style.left = newX + 'px';
        targetElement.style.top = newY + 'px';
    }
}

//Functions to create/delete elements
function createFrame() {
    frame.style.width = 1000 + 'px';
    frame.style.height = 750 + 'px';
    frame.style.background = "blue";
    frame.style.position = 'fixed';
    frame.style.display = 'inline';
}


function createStartScreenUi() {
    var form = document.createElement("form");
    form.id = "inputForm";

    form.style.width = 200 + "px";
    form.style.height = 200 + "px";
    form.style.marginLeft = "auto";
    form.style.marginRight = "auto";
    form.style.marginTop = 300 + 'px';
    form.style.alignItems = "center";
    frame.appendChild(form); // put it into the DOM

    createTextInput(form, "Vorname");
    createTextInput(form, "Nachname");
    createTextInput(form, "NDS-Account-Name");

    createButton(form, "StartTest");
}
function createButton(form, nameOfButton) {
    var btn = document.createElement("BUTTON");
    btn.type = "button"
    btn.innerHTML = "Start Test";
    btn.style.id = nameOfButton;
    btn.style.marginTop = 25 + "px";
    btn.onclick = getPID;
    form.appendChild(btn);
}

function getPID() {
    let formCsvData = getCsvDataFromForm();
    getPidCall(formCsvData)
}

function getCsvDataFromForm() {
    let formElements = document.getElementById("inputForm").elements,
        i,
        formDataCsvString = "";
    for (i = 0; i < 3; i++) {
        formDataCsvString = formDataCsvString + formElements[i].value;
        if (i != 2) {
            formDataCsvString = formDataCsvString + ",";
        }
    }
    return formDataCsvString;
}

function createTextInput(form, nameOfInput) {
    var textInputPara = document.createElement("p");
    var textInputNode = document.createTextNode(nameOfInput + ":");
    textInputPara.appendChild(textInputNode);
    form.appendChild(textInputPara);

    var textInput = document.createElement("input");
    textInput.style.name = nameOfInput;
    textInput.type = "text";
    textInput.className = "registerForm"; // set the CSS class
    textInput.style.id = nameOfInput;
    form.appendChild(textInput); // put it into the DOM
}

function createCustomCursor(x, y) {
    customCursor = document.createElement('targetElement');
    customCursor.id = "customCursor";
    customCursor.style.width = 10 + 'px';
    customCursor.style.height = 10 + 'px';
    customCursor.style.background = "yellow";
    customCursor.style.position = 'absolute';
    customCursor.display = 'inline';
    cursorX = x;
    cursorY = y;
    customCursor.style.left = x + "px";
    customCursor.style.top = y + "px";
    frame.appendChild(customCursor);
}

function createRect() {
    targetElement = document.createElement('targetElement');
    targetElement.id = "rect1";
    targetElement.name = "rectangleRed";
    targetWidth = 100;
    targetHeight = 100;
    targetElement.style.width = targetWidth + 'px';
    targetElement.style.height = targetHeight + 'px';
    targetElement.style.background = "red";
    targetElement.style.position = 'absolute';
    targetElement.style.display = 'inline';
    newX = getRndInteger(0, parseInt(frame.style.width) - parseInt(targetElement.style.width));
    newY = getRndInteger(0, parseInt(frame.style.height) - parseInt(targetElement.style.height));
    targetElement.style.left = newX + "px";
    targetElement.style.top = newY + "px";
    targetElement.style.transition = '0.1s';
    frame.appendChild(targetElement);
}

function setupNewScene() {
    removeElement(targetElement.id);
    removeElement(customCursor.id)
    createRect();
    let newCursorCoords = getNewCursorCoordinates(document.getElementById("rect1"));
    createCustomCursor(newCursorCoords[0], newCursorCoords[1]);
    cursorInside = false;
    run_id = run_id + 1;
    timestampConditionStart = Date.now();
    logAllData();
    console.log(run_id);
}

function removeElement(elementId) {
    let element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}


//Functions to calculate coordinates
function getNewCursorCoordinates(elementToSpawnAround) {
    let centerX = parseInt(elementToSpawnAround.style.left) - parseInt(customCursor.style.width) / 2 + parseInt(elementToSpawnAround.style.width) / 2,
        centerY = parseInt(elementToSpawnAround.style.top) - parseInt(customCursor.style.height) / 2 + parseInt(elementToSpawnAround.style.height) / 2,

        cursorStartX = centerX + 300,
        cursorStartY = centerY,
        coords = rotateAroundCenter(centerX, centerY, cursorStartX, cursorStartY);
    return coords;
}

function rotateAroundCenter(centerX, centerY, objectToRotateX, objectToRotateY) {
    let rotatedCoords = Array.from({ length: 2 }),
        rad = degreesToRadians(getRndInteger(0, 360)),
        sin = Math.sin(rad),
        cos = Math.cos(rad);

    rotatedCoords[0] = cos * (objectToRotateX - centerX) - sin * (objectToRotateY - centerY) + centerX;
    rotatedCoords[1] = sin * (objectToRotateX - centerX) - cos * (objectToRotateY - centerY) + centerY;

    //Recalculate, if new coordinates are not on canvas
    while (rotatedCoords[0] > parseInt(frame.style.width) || rotatedCoords[0] < 0 || rotatedCoords[1] > parseInt(frame.style.height) || rotatedCoords[1] < 0) {
        rotatedCoords = rotateAroundCenter(centerX, centerY, objectToRotateX, objectToRotateY);
    }

    return rotatedCoords;
}

//Logging
function logAllData() {
    let timestampLogEntry = Date.now(),
        targetWidth = targetElement.style.width,
        targetHeight = targetElement.style.height;

    //Number of log entries to be recorded
    if ((run_id % 10 == 0) && run_id != 0) {

        if (chunksSentToServer < NUMBER_OF_CHUNKS_TO_BE_SENT && !dataHasBeenSentToServer) {
            post(csvContent);
            console.log(csvContent);
            chunksSentToServer = chunksSentToServer + 1;
            csvContent = "";
            csvContentSize = 1;
            dataHasBeenSentToServer = true;
        } else if (chunksSentToServer == NUMBER_OF_CHUNKS_TO_BE_SENT) {
            csvContent = "timestampLog,pid,condition_id,run_id,timestampConditionStart,timestampCollision,timestampClick,mouseIsInsideElement,targetX,targetY,targetWidth,targetHeight,cursorX,cursorY";
            condition_id = condition_id + 1;
            run_id = 0;
            csvContentSize = 0;
            chunksSentToServer = 0;
            setConfigurationParameters();
        }
    } else {
        dataHasBeenSentToServer = false;
    }

    //Do not log first run, since pointer lock has to be requested first and the run starts immediately after the page loads 
    //TODO: Implement start screen
    if (run_id > 0) {
        let logString = timestampLogEntry + "," +
            pid + "," +
            condition_id + "," +
            run_id + "," +
            timestampConditionStart + "," +
            timestampCollision + "," +
            timestampClick + "," +
            cursorInside + "," +
            newX + "," +
            newY + "," +
            targetWidth + "," +
            targetHeight + "," +
            cursorX + "," +
            cursorY;

        csvContent = csvContent + "\n" + logString;
        console.log(run_id);
    }
    csvContentSize = csvContentSize + 1;
}

function removeStartScreeen() {
    $('#inputForm').remove();
}

function post(logData) {
if(!hasAlreadyParticipated){
    $.ajax({
        url: "http://localhost:3333/log/",
        type: "POST",
        data: logData,
        contentType: "text/csv",
        dataType: "txt",
        success: function (data) {
            alert(data);
        }
    });
} 
}

function requestLock() {
    frame.requestPointerLock = frame.requestPointerLock ||
        element.mozRequestPointerLock ||
        element.webkitRequestPointerLock;
    frame.requestPointerLock();

}

function getPidCall(formCsvData) {
    $.ajax({
        url: "http://localhost:3333/registerPID/",
        type: "POST",
        data: formCsvData,
        contentType: "text",
        dataType: "text",
        async: true,
        success: function (response) {
            if (isNaN(response)){
                hasAlreadyParticipated = true
                console.log(hasAlreadyParticipated)
            }
            pid = response;
            console.log("code: " + response)

            removeStartScreeen()
            startScreenIsActive = false
            setupScene()
            requestLock();
        }
    });

}

function postRunsComplete() {
    if(!hasAlreadyParticipated){
        $.ajax({
            url: "http://localhost:3333/logFinish/",
            type: "POST",
            data: pid,
            contentType: "text/csv",
            dataType: "txt",
            success: function (data) {
                alert(data);
            }
        });
    }
}


//Helper functions
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function degreesToRadians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function limitNumberWithinRange(num, min, max) {
    const MIN = min || 1;
    const MAX = max || 20;
    const parsed = parseInt(num)
    return Math.min(Math.max(parsed, MIN), MAX)
}

function cursorIsInsideOfElement(elementToCheck) {
    cursor = document.getElementById("customCursor");

    let targetHeightCurrent = parseInt(elementToCheck.style.height),
        targetWidthCurrent = parseInt(elementToCheck.style.width);

    if ((cursorX > newX && cursorY > newY) && (cursorX < newX + targetHeightCurrent && cursorY < newY + targetWidthCurrent)) {
        return true;

    } else {
        return false;
    }
}



// PX to cm stuff
/*
This monitor:
2560 × 1600 (16∶10), 227dpi
*/
// Pixel to cm code
/* let realDpi = 227,
    realScreenWidth = 2560,
    realScreenHeight = 1600;

function pxToMM (px, dpi) {
    let mm = ((px * (realScreenWidth/screen.width)) * 25.4 ) / dpi;
    return mm
}
console.log(mmToPX(179, realDpi));
console.log(pxToMM(mmToPX(179, realDpi), realDpi))

function mmToPX (mm, dpi) {
    let px = ((mm * dpi) / 25.4) / (realScreenWidth/screen.width);
    return px

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
} */