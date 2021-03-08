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
    hasAlreadyParticipated = false,
    conditionsCompleted = 0,
    conditionsList = [],
    languageIsEN = true;

//Cursor and Target element
let customCursor,
    targetElement;

//Loged Data    
let csvContent = "timestampLog,pid,condition_id,run_id,timestampConditionStart,timestampCollision,timestampClick,mouseIsInsideElement,targetX,targetY,targetWidth,targetHeight,cursorX,cursorY",
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
let NUMBER_OF_CHUNKS_TO_BE_SENT = 1;


//setupScene();
setupStartScreen();

function setupScene() {
        setConditionsList();
        condition_id = conditionsList[conditionsCompleted]
        console.log(condition_id)
        setConfigurationParameters();
        createFrame();
        createRect();
        createCustomCursor(100, 100);
        timeAtLoadingComplete = Date.now();
    
}

function setupStartScreen() {
    startScreenIsActive = true;
    createFrame();
    createStartScreenText();
}

function setConfigurationParameters() {
    switch (condition_id) {
        case 0:
            UI_SPEED_X = 0;
            UI_SPEED_Y = 0;
            break;
        case 1:
            UI_SPEED_X = 0.25;
            UI_SPEED_Y = 0.25;
            break;
        case 2:
            UI_SPEED_X = 0.5;
            UI_SPEED_Y = 0.5;
            break;
        case 3:
            UI_SPEED_X = 0.75;
            UI_SPEED_Y = 0.75;
            break;
        case 4:
            UI_SPEED_X = 1;
            UI_SPEED_Y = 1;
            break;
        case 5:
            UI_SPEED_X = 0;
            UI_SPEED_Y = 0;
            CURSOR_SPEED_X = 1.5;
            CURSOR_SPEED_Y = 1.5;
            break;

        case 6:
            postRunsComplete();
            if(languageIsEN){
                alert("All runs completed, you can leave this website now!");
            } else {
                alert("Alle Durchläufe vollendet, Sie können die Website nun verlassen!");
            } 
            
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
    frame.style.background = "black";
    frame.style.position = 'fixed';
    frame.style.display = 'inline';
}


function createStartScreenText() {
    var div = document.createElement("div");
    div.id = "startTextContainer"
    div.style.background = "white"
    div.style.marginLeft = "auto";
    div.style.marginRight = "auto";
    div.style.marginTop = 50 + 'px';
    div.style.alignItems = "center";
    div.style.height = 80 + "%"
    div.style.width = 90 + "%"
    div.style.paddingTop = 10 + "px"

    var h3 = document.createElement("h3")
    h3.style.textAlign = "center"
    var t = document.createTextNode("Magnetic UI"); 
    h3.appendChild(t)
    div.appendChild(h3)

    var p = document.createElement("textarea")
    p.style.width = 80+ "%"
    p.style.height = 450 + "px"
    p.style.marginLeft = "auto";
    p.style.marginRight = "auto";
    p.style.display = "block"
    p.style.textAlign = "center"
    p.disabled = "true"
    var introTextEN = "Hello and thank you for participating in our survey!\n\nThis study is a part of an ongoing research project of the BIDT junior research group ‘Physical Digital Affordances’ (https:\/\/hci.ur.de\/). By participating, you will help us to develop new user interfaces which make your work easier.\n\nIn this study, we want to investigate whether and how your click behaviour changes once an user interface moves in the opposite direction of your movements of the mouse cursor. \n\nWe will log your age, gender, and occupation information.\nDuring the study, your mouse movements and clicks, as well as your operating system, are automatically logged and stored by us. The data is collected completely anonymously and stored on a server at the University of Regensburg. It will not be possible to discern whether you participated in this study with the data we intend to log.\n\nIt  takes a maximum of 15 minutes to finish the study. Please make sure that  you are not interrupted during this time.\nPlease try to always click the given target as quickly and accurately as possible!\n\nBefore you start:\n- Make sure you are using a laptop or desktop pc\n- Resize your browser window so that the entire black background area can be seen\n\nIf you have any questions about the study or the research project, you can contact us via the following email addresses:\nmarie.sautmann@stud.uni-regensburg.de, alexander.weichart@stud.uni-regensburg.de and juergen.hahn@ur.de.\n";
    var introTextDE = "Hallo und vielen Dank für Ihre Teilnahme an unserer Studie!\n\nDiese Studie gliedert sich in ein laufendes Forschungsprojekt der BIDT-Nachwuchsforschungsgruppe ‘Physical Digital Affordances’ (https:\/\/hci.ur.de\/) ein. Ihre Teilnahme hilft uns dabei neue Benutzerschnittstellen zu entwickeln, die Ihnen Ihre Arbeit erleichtern sollen.\n\nMit dieser Studie wollen wir untersuchen, ob und wie sich Ihr Klickverhalten ändert, sobald eine Benutzeroberfläche sich entgegen Ihrer Bewegungen des Mauszeigers bewegt.\n\nIm Folgenden speichern wir Ihre Angaben zu Alter, Geschlecht und Beruf.\nWährend der Studie werden Ihre Mausbewegungen und Klicks, sowie ihr Betriebssystem automatisch gespeichert. Dies geschieht völlig anonym auf einem Server der Universität Regensburg. Ein Rückschluss auf Ihre Person ist zu keinem Zeitpunkt möglich.\n\nDie Teilnahme an der Studie dauert maximal 15 Minuten. Bitte stellen Sie sicher, dass Sie während dieser Zeit die Studie konzentriert und ohne Unterbrechungen durchführen können.\nBitte klicken Sie das vorgegebene Ziel immer so schnell und genau an wie möglich!\n\nBevor Sie die Studie starten:\n- Wechseln Sie zu einem Laptop oder Desktop Pc\n- Passen Sie das Browser Fenster so an, dass die komplette schwarze Hintergrundfläche zu sehen ist\n\nHaben Sie weitere Fragen zur Umfrage oder zum Forschungsprojekt können Sie die Durchführenden der Studie unter folgenden Emailadressen kontaktieren: marie.sautmann@stud.uni-regensburg.de, alexander.weichart@stud.uni-regensburg.de und juergen.hahn@ur.de.\n";
    var t2 = document.createTextNode(introTextEN); 
    p.appendChild(t2)
    div.appendChild(p)

    var buttonContainer = document.createElement("div");
    buttonContainer.style.left = 50 + "%"
    buttonContainer.style.top = 50 + "%"
    buttonContainer.style.textAlign = "center"

    var startButton = document.createElement("button");
    startButton.style.background = "#00cc66"
    startButton.style.margin = 15 + "px"
    startButton.style.padding = 10 + "px"
    startButton.textContent = "Start now!"
    startButton.onclick = function(){
        var w = window.innerWidth;
        var h = window.innerHeight;
        if (w < parseInt(frame.style.width) || h < parseInt(frame.style.height)){
            if(languageIsEN){
                alert("Please resize the browser window so that the entire black area can be seen!")
            }   else {
                alert("Bitte passen Sie das Browser Fenster so an, dass die komplette schwarze Fläche zu sehen ist!")
            }
        }   else{
            div.remove()
            createStartScreenUi()
        }
    }

    var switchLanguageButton = document.createElement("button");
    switchLanguageButton.style.margin = 15 + "px"
    switchLanguageButton.style.padding = 10 + "px"
    switchLanguageButton.textContent = "Change language to German"
    switchLanguageButton.onclick = function(){
        if (languageIsEN){
            t2.nodeValue = introTextDE
            switchLanguageButton.textContent = "Sprache zu Englisch wechseln"
            startButton.textContent = "Jetzt beginnen!"
            languageIsEN = false
        }   else {
            t2.nodeValue = introTextEN
            switchLanguageButton.textContent = "Change language to German"
            startButton.textContent = "Start now!"
            languageIsEN = true
        }
    }

    buttonContainer.appendChild(switchLanguageButton)
    buttonContainer.appendChild(startButton)
    div.appendChild(buttonContainer)
    frame.appendChild(div)
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

    createTextInput(form, "Beruf", 0);
    createTextInput(form, "Geschlecht", 0);
    createTextInput(form, "Alter", 1);

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
    if (!isMobileDevice()){
        let formCsvDataWithUniqueID = getCsvDataFromForm() + "," + getUniqueBrowserID() + "," + getOS();
        getPidCall(formCsvDataWithUniqueID)
    } else{
        if(languageIsEN){
            alert("Smartphones and tablets are not supported, please use a laptop or desktop pc.")
        } else{
            alert("Smartphones und Tablets werden nicht unterstützt, bitte nutzen Sie einen Laptop oder Desktop Pc.")
        }
    }
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

function createTextInput(form, nameOfInput, isAge) {
    var textInputPara = document.createElement("p");
    textInputPara.style.color = "white";
    var textInputNode = document.createTextNode(nameOfInput + ":");
    textInputPara.appendChild(textInputNode);
    form.appendChild(textInputPara);

    var textInput = document.createElement("input");
    textInput.style.name = nameOfInput;
    textInput.type = "text";
    textInput.className = "registerForm"; // set the CSS class

    if (isAge) {
        textInput.addEventListener('input', restrictNumber);
        textInput.maxLength = "3"
        function restrictNumber(e) {
            var newValue = this.value.replace(new RegExp(/[^\d]/, 'ig'), "");
            this.value = newValue;
        }
    } else {
        textInput.maxLength = "24"
    }
    textInput.style.id = nameOfInput;
    form.appendChild(textInput); // put it into the DOM
}

function createCustomCursor(x, y) {
    customCursor = document.createElement('targetElement');
    customCursor.id = "customCursor";
    let customCursorTexture = document.createElement('IMG');
    customCursorTexture.src = "http://www.rw-designer.com/cursor-extern.php?id=150274";
    customCursor.appendChild(customCursorTexture)
    customCursor.style.width = 10 + 'px';
    customCursor.style.height = 10 + 'px';
    customCursor.style.position = 'absolute';
    customCursor.display = 'inline';
    customCursor.background = 'white'
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
    run_id = run_id + 1;
    removeElement(targetElement.id);
    removeElement(customCursor.id)
    createRect();
    let newCursorCoords = getNewCursorCoordinates(document.getElementById("rect1"));
    createCustomCursor(newCursorCoords[0], newCursorCoords[1]);
    cursorInside = false;
    
    timestampConditionStart = Date.now();
    logAllData();
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
            chunksSentToServer = chunksSentToServer + 1;
            csvContent = "";
            csvContentSize = 1;
            dataHasBeenSentToServer = true;
        } else if (chunksSentToServer == NUMBER_OF_CHUNKS_TO_BE_SENT) {
            csvContent = "timestampLog,pid,condition_id,run_id,timestampConditionStart,timestampCollision,timestampClick,mouseIsInsideElement,targetX,targetY,targetWidth,targetHeight,cursorX,cursorY";
            conditionsCompleted = conditionsCompleted + 1;
            condition_id = conditionsList[conditionsCompleted]
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
    }
    csvContentSize = csvContentSize + 1;
}

function removeStartScreeen() {
    $('#inputForm').remove();
}

function post(logData) {
    if (!hasAlreadyParticipated) {
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
            pid = response;
            if (isNaN(response)) {
                hasAlreadyParticipated = true
                pid = 0
            }
            removeStartScreeen()
            startScreenIsActive = false
            setupScene()
            requestLock();
        }
    });

}

function postRunsComplete() {
    if (!hasAlreadyParticipated) {
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

function getUniqueBrowserID() {
    let magneticUiLocalStorageKey = "uniqueMuiBrowserID"
    if (localStorage.getItem(magneticUiLocalStorageKey) === null) {
        let newUniqueID = Math.random().toString(36).substr(2, 9);
        localStorage.setItem(magneticUiLocalStorageKey, newUniqueID);
        return newUniqueID
    } else {
        return localStorage.getItem(magneticUiLocalStorageKey)
    }
}


function getOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;
  
    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
      os = 'Linux';
    }
  
    return os;
  }

function isMobileDevice() {
    if(getOS() == 'iOS' || getOS() == 'Android'){
        return true
    } else{
        return false
    }
}

  function setConditionsList() {
    switch (pid%6){
        case 0:
            conditionsList = [0,1,5,2,4,3,6]
            break;
        case 1:
            conditionsList = [1,2,0,3,5,4,6]
            break;
        case 2:
            conditionsList = [2,3,1,4,0,5,6]
            break;
        case 3:
            conditionsList = [3,4,2,5,1,0,6]
            break;
        case 4:
            conditionsList = [4,5,3,0,2,1,6]
            break;
        case 5:
            conditionsList = [5,0,4,1,3,2,6]
            break;
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