/* jshint esversion: 6 */

//One Chunk equals 10 runs
let NUMBER_OF_CHUNKS_TO_BE_SENT = 20;
let NUMBER_OF_WARMUP_CHUNKS_TO_BE_SENT = 10;

let timeAtLastSuccessfulClick,
    frame = document.getElementById('frame'),
    timeAtLoadingComplete,
    UI_SPEED_X,
    UI_SPEED_Y,
    CURSOR_SPEED_X = 1,
    CURSOR_SPEED_Y = 1,
    rectConfig,
    startScreenIsActive = true,
    hasAlreadyParticipated = false,
    conditionsCompleted = 0,
    conditionsList = [],
    languageIsEN = true,
    warmupModeIsOn = true;

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
    csvContentSize = 0,
    dataHasBeenSentToServer = false,
    nrOfChunksToSend;

//Locking
let csvQueueCheckpoint = 0;
    csvQueue = [];

//setupScene();
setupStartScreen();

function setupScene() {
        setConditionsList();
        condition_id = conditionsList[conditionsCompleted];
        setConfigurationParameters();
        createFrame();
        createCurrentLevelText();
        createRect();
        createCustomCursor(100, 100);
        timeAtLoadingComplete = performance.now();
        logAllData(timeAtLoadingComplete);
    
}

function setupStartScreen() {
    startScreenIsActive = true;
    createFrame();
    createStartScreenText();
}

function setConfigurationParameters() {
    switch (condition_id) {
        case -1:
            warmupModeIsOn = true;
            nrOfChunksToSend = NUMBER_OF_WARMUP_CHUNKS_TO_BE_SENT;
            UI_SPEED_X = 0;
            UI_SPEED_Y = 0;
            CURSOR_SPEED_X = 1;
            CURSOR_SPEED_Y = 1;
            break;
        case 0:
            warmupModeIsOn = false;
            nrOfChunksToSend = NUMBER_OF_CHUNKS_TO_BE_SENT;
            UI_SPEED_X = 0;
            UI_SPEED_Y = 0;
            CURSOR_SPEED_X = 1;
            CURSOR_SPEED_Y = 1;
            break;
        case 1:
            warmupModeIsOn = false;
            nrOfChunksToSend = NUMBER_OF_CHUNKS_TO_BE_SENT;
            UI_SPEED_X = 0.25;
            UI_SPEED_Y = 0.25;
            CURSOR_SPEED_X = 1;
            CURSOR_SPEED_Y = 1;
            break;
        case 2:
            warmupModeIsOn = false;
            nrOfChunksToSend = NUMBER_OF_CHUNKS_TO_BE_SENT;
            UI_SPEED_X = 0.5;
            UI_SPEED_Y = 0.5;
            CURSOR_SPEED_X = 1;
            CURSOR_SPEED_Y = 1;
            break;
        case 3:
            warmupModeIsOn = false;
            nrOfChunksToSend = NUMBER_OF_CHUNKS_TO_BE_SENT;
            UI_SPEED_X = 0.75;
            UI_SPEED_Y = 0.75;
            CURSOR_SPEED_X = 1;
            CURSOR_SPEED_Y = 1;
            break;
        case 4:
            warmupModeIsOn = false;
            nrOfChunksToSend = NUMBER_OF_CHUNKS_TO_BE_SENT;
            UI_SPEED_X = 1;
            UI_SPEED_Y = 1;
            CURSOR_SPEED_X = 1;
            CURSOR_SPEED_Y = 1;
            break;
        case 5:
            warmupModeIsOn = false;
            nrOfChunksToSend = NUMBER_OF_CHUNKS_TO_BE_SENT;
            UI_SPEED_X = 0;
            UI_SPEED_Y = 0;
            CURSOR_SPEED_X = 1.5;
            CURSOR_SPEED_Y = 1.5;
            break;
        case 6:
            warmupModeIsOn = true;
            nrOfChunksToSend = NUMBER_OF_WARMUP_CHUNKS_TO_BE_SENT;
            UI_SPEED_X = 0;
            UI_SPEED_Y = 0;
            CURSOR_SPEED_X = 1;
            CURSOR_SPEED_Y = 1;
            break;
        case 7:
            postRunsComplete();
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

                timestamp = performance.now();
                logAllData(timestamp);

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
    
        timestamp = performance.now();
        timestampClick = timestamp;
        if (cursorIsInsideOfElement(targetElement)) {
            //clicked element
            cursorInside = true;
            logAllData(timestamp);
            sendCsvContentToServer();
            setupNewScene();
        } else {
            //clicked canvas
            cursorInside = false;
            logAllData(timestamp);
        }
    }
});


//General movement logic
function moveCursor(mouseMovementX, mouseMovementY) {
    customCursorTop = parseInt(customCursor.style.top);
        customCursorLeft = parseInt(customCursor.style.left);

        cursorX = limitNumberWithinRange((customCursorLeft + mouseMovementX * CURSOR_SPEED_X), 0, 1000 - 10);
        cursorY = limitNumberWithinRange((customCursorTop + mouseMovementY * CURSOR_SPEED_X), 0, 750 - 10);

    customCursor.style.left = cursorX + 'px';
        customCursor.style.top = cursorY + 'px';
}

function moveUI(mouseMovementX, mouseMovementY) {
    let xMovement,
        yMovement;

    //Don't move UI in x or y direction if the cursor is at the left/right or top/bottom edge
    if (cursorX >= (parseInt(frame.style.width) - parseInt(customCursor.style.width)) || cursorX <= 0) {
        xMovement = 0;
            yMovement = mouseMovementY;
    } else if (cursorY >= (parseInt(frame.style.height) - parseInt(customCursor.style.height)) || cursorY <= 0) {
        xMovement = mouseMovementX,
            yMovement = 0;
    } else {
        xMovement = mouseMovementX;
            yMovement = mouseMovementY;
    }

    let targetElementTop = parseInt(targetElement.style.top),
        targetElementLeft = parseInt(targetElement.style.left);

    if (cursorIsInsideOfElement(targetElement)) {
        //Cursor is inside element
        if (!cursorInside) {
            //Cursor entered element just now
            cursorInside = true;
            timestampCollision = performance.now();
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
    frame.style.top  = 50 + "%";
    frame.style.left  = 50 + "%";
    frame.style.transform = "translate(-50%, -50%)";
}


function createStartScreenText() {
    var div = document.createElement("div");
    div.id = "startTextContainer";
    div.style.background = "white";
    div.style.marginLeft = "auto";
    div.style.marginRight = "auto";
    div.style.marginTop = 50 + 'px';
    div.style.alignItems = "center";
    div.style.height = 80 + "%";
    div.style.width = 90 + "%";
    div.style.paddingTop = 10 + "px";

    var h3 = document.createElement("h3");
    h3.style.textAlign = "center";
    var t = document.createTextNode("Magnetic UI"); 
    h3.appendChild(t);
    div.appendChild(h3);

    var p = document.createElement("textarea");
    p.style.width = 80+ "%";
    p.style.height = 450 + "px";
    p.style.marginLeft = "auto";
    p.style.marginRight = "auto";
    p.style.display = "block";
    p.style.textAlign = "center";
    p.disabled = "true";
    var introTextEN = "Hello and thank you for participating in our survey!\n\nThis study is a part of an ongoing research project of the BIDT junior research group ‘Physical Digital Affordances’ (https:\/\/hci.ur.de\/). By participating, you will help us to develop new user interfaces which make your work easier.\n\nIn this study, we want to investigate whether and how your click behaviour changes once an user interface moves in the opposite direction of your movements of the mouse cursor. \n\nWe will log your age, gender, and occupation information.\nDuring the study, your mouse movements and clicks, as well as your operating system, are automatically logged and stored by us. The data is collected completely anonymously and stored on a server at the University of Regensburg. It will not be possible to discern whether you participated in this study with the data we intend to log.\n\nIt  takes a maximum of 15 minutes to finish the study. Please make sure that  you are not interrupted during this time.\nPlease try to always click the given target as quickly and accurately as possible!\n\nIf you have any questions about the study or the research project, you can contact us via the following email addresses:\nmarie.sautmann@stud.uni-regensburg.de, alexander.weichart@stud.uni-regensburg.de and juergen.hahn@ur.de.\n";
    var introTextDE = "Hallo und vielen Dank für Ihre Teilnahme an unserer Studie!\n\nDiese Studie gliedert sich in ein laufendes Forschungsprojekt der BIDT-Nachwuchsforschungsgruppe ‘Physical Digital Affordances’ (https:\/\/hci.ur.de\/) ein. Ihre Teilnahme hilft uns dabei neue Benutzerschnittstellen zu entwickeln, die Ihnen Ihre Arbeit erleichtern sollen.\n\nMit dieser Studie wollen wir untersuchen, ob und wie sich Ihr Klickverhalten ändert, sobald eine Benutzeroberfläche sich entgegen Ihrer Bewegungen des Mauszeigers bewegt.\n\nIm Folgenden speichern wir Ihre Angaben zu Alter, Geschlecht und Beruf.\nWährend der Studie werden Ihre Mausbewegungen und Klicks, sowie ihr Betriebssystem automatisch gespeichert. Dies geschieht völlig anonym auf einem Server der Universität Regensburg. Ein Rückschluss auf Ihre Person ist zu keinem Zeitpunkt möglich.\n\nDie Teilnahme an der Studie dauert maximal 15 Minuten. Bitte stellen Sie sicher, dass Sie während dieser Zeit die Studie konzentriert und ohne Unterbrechungen durchführen können.\nBitte klicken Sie das vorgegebene Ziel immer so schnell und genau an wie möglich!\n\nHaben Sie weitere Fragen zur Umfrage oder zum Forschungsprojekt können Sie die Durchführenden der Studie unter folgenden Emailadressen kontaktieren: marie.sautmann@stud.uni-regensburg.de, alexander.weichart@stud.uni-regensburg.de und juergen.hahn@ur.de.\n";
    var t2 = document.createTextNode(introTextEN); 
    p.appendChild(t2);
    div.appendChild(p);

    var buttonContainer = document.createElement("div");
    buttonContainer.style.left = 50 + "%";
    buttonContainer.style.top = 50 + "%"
    buttonContainer.style.textAlign = "center";

    var startButton = document.createElement("button");
    startButton.style.background = "#00cc66";
    startButton.style.margin = 15 + "px";
    startButton.style.padding = 10 + "px";
    startButton.textContent = "Ready!";
    var startButtonHasBeenClicked = false;
    startButton.onclick = function(){
        if(startButtonHasBeenClicked){
            var w = window.innerWidth;
            var h = window.innerHeight;
            if (w < parseInt(frame.style.width) || h < parseInt(frame.style.height)){
                if(languageIsEN){
                    alert("Please resize the browser window so that the entire black area can be seen!");
                }   else {
                    alert("Bitte passen Sie das Browser Fenster so an, dass die komplette schwarze Fläche zu sehen ist!");
                }
            }   else{
                div.remove();
                setLanguageStrings();
                createStartScreenUi();
            }
        } else {
            startButtonHasBeenClicked = true;
            setLanguageStrings();
            t2.nodeValue = introTextSetupRules;
            if(languageIsEN){
                startButton.textContent = "Start now!";
            } else {
                startButton.textContent = "Jetzt Beginnen!";
            }
             
        }
        
    }

    var switchLanguageButton = document.createElement("button");
    switchLanguageButton.style.margin = 15 + "px";
    switchLanguageButton.style.padding = 10 + "px";
    switchLanguageButton.textContent = "Change language to German";
    switchLanguageButton.onclick = function(){
        if (languageIsEN && !startButtonHasBeenClicked){
            languageIsEN = false;
            setLanguageStrings();
            t2.nodeValue = introTextDE;
            switchLanguageButton.textContent = "Sprache zu Englisch wechseln";
            startButton.textContent = "Bereit!";
        }   else if (!languageIsEN && !startButtonHasBeenClicked){
            languageIsEN = true;
            setLanguageStrings();
            t2.nodeValue = introTextEN;
            switchLanguageButton.textContent = "Change language to German";
            startButton.textContent = "Ready!";
            languageIsEN = true;
        }   else if (!languageIsEN && startButtonHasBeenClicked){
            languageIsEN = true;
            setLanguageStrings();
            t2.nodeValue = introTextSetupRules;
            switchLanguageButton.textContent = "Change language to German";
            startButton.textContent = "Start now!";
        }   else if (languageIsEN && startButtonHasBeenClicked){
            languageIsEN = false;
            setLanguageStrings();
            t2.nodeValue = introTextSetupRules;
            switchLanguageButton.textContent = "Sprache zu Englisch wechseln";
            startButton.textContent = "Jetzt beginnen!";
        }


    }

    buttonContainer.appendChild(switchLanguageButton);
    buttonContainer.appendChild(startButton);
    div.appendChild(buttonContainer);
    frame.appendChild(div);
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

    createTextInput(form, "Beruf", 0, formJobString);
    createDataListInput(form);
    //createTextInput(form, "Geschlecht", 0);
    createTextInput(form, "Alter", 1, formAgeString);

    createButton(form, formStartTestButtonString);
}

function createButton(form, nameOfButton) {
    var btn = document.createElement("BUTTON");
    btn.type = "button";
    btn.innerHTML = nameOfButton;
    btn.style.id = nameOfButton;
    btn.style.marginTop = 25 + "px";
    btn.onclick = getPID;
    form.appendChild(btn);
}


function createDataListInput(form){
    var textInputPara = document.createElement("p");
    textInputPara.style.color = "white";
    var textInputNode = document.createTextNode(formGenderString);
    textInputPara.appendChild(textInputNode);
    form.appendChild(textInputPara);

    var optionList = ["Männlich", "Weiblich", "Divers"];
    i = 0,
    len = optionList.length

    var container = document.createElement("select");
    for (i; i < len; i += 1) {
        var option = document.createElement('option');
        option.value = optionList[i];
        option.text = formGenderChoices[i];
        container.appendChild(option);
    }
    form.appendChild(container);
    
}

function getPID() {
    if (!isMobileDevice()){
        let formCsvDataWithUniqueID = getCsvDataFromForm() + "," + getUniqueBrowserID() + "," + getOS();
        getPidCall(formCsvDataWithUniqueID);
    } else{
        if(languageIsEN){
            alert("Smartphones and tablets are not supported, please use a laptop or desktop pc.");
        } else{
            alert("Smartphones und Tablets werden nicht unterstützt, bitte nutzen Sie einen Laptop oder Desktop Pc.");
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

function createTextInput(form, nameOfInput, isAge, titleText) {
    var textInputPara = document.createElement("p");
    textInputPara.style.color = "white";
    var textInputNode = document.createTextNode(titleText + ":");
    textInputPara.appendChild(textInputNode);
    form.appendChild(textInputPara);

    var textInput = document.createElement("input");
    textInput.style.name = nameOfInput;
    textInput.type = "text";
    textInput.className = "registerForm"; // set the CSS class

    if (isAge) {
        textInput.addEventListener('input', restrictNumber);
        textInput.maxLength = "3";
        function restrictNumber(e) {
            var newValue = this.value.replace(new RegExp(/[^\d]/, 'ig'), "");
            this.value = newValue;
        }
    } else {
        textInput.maxLength = "24";
    }
    textInput.style.id = nameOfInput;
    form.appendChild(textInput); // put it into the DOM
}

function createCustomCursor(x, y) {
    customCursor = document.createElement('targetElement');
    customCursor.id = "customCursor";
    let customCursorTexture = document.createElement('IMG');
    customCursorTexture.src = "/res/customCursorTexture.cur";
    customCursor.appendChild(customCursorTexture);
    customCursor.style.width = 10 + 'px';
    customCursor.style.height = 10 + 'px';
    customCursor.style.position = 'absolute';
    customCursor.display = 'inline';
    customCursor.background = 'white';
    cursorX = x;
    cursorY = y;
    customCursor.style.left = x + "px";
    customCursor.style.top = y + "px";
    frame.appendChild(customCursor);
}

function createCurrentLevelText(){
    var h3 = document.createElement("h3");
    h3.style.textAlign = "center";
    h3.id = "currentLevelText";
    var nodeText = "Level: " + (conditionsCompleted + 1).toString() + levelOf + (conditionsList.length - 1).toString();
    var t = document.createTextNode(nodeText); 
    t.id = "currentLevelText";
    h3.style.color = "white";
    h3.appendChild(t);
    frame.appendChild(h3);
}

function updateCurrentLevelText(){
    var t = document.getElementById("currentLevelText").firstChild;
    if(conditionsCompleted < 8){
        t.nodeValue = "Level: " + (conditionsCompleted + 1).toString() + levelOf + (conditionsList.length - 1).toString();
    } else{
        t.nodeValue = "";
    }
    
}

function showFinishedHash(hash){
    removeElement(targetElement.id);
    removeElement(customCursor.id);
    document.exitPointerLock();
    startScreenIsActive = true;

    container = document.createElement("div");
    container.style.background = "white";
    container.style.width = 80+ "%";
    container.style.marginLeft = "auto";
    container.style.marginRight = "auto";
    container.style.top =  50 + "%";
    container.style.marginTop = 25 + "%";
    container.style.display = "block";
    container.style.textAlign = "center";
    container.style.padding = 25 + "px";
    

    var h2 = document.createElement("h2");
    h2.style.textAlign = "center";
    h2.id = "finishedHeader";
    var t = document.createTextNode(finishedHeaderString); 
    h2.style.color = "black";
    h2.appendChild(t);
    container.appendChild(h2);

    var pExplain = document.createElement("p");
    pExplain.disabled = "true";
    pExplain.style.textAlign = "center";
    pExplain.style.width = 60+ "%";


    textContainer = document.createElement("div");
    textContainer.style.marginLeft = "auto";
    textContainer.style.marginRight = "auto";
    textContainer.style.background = "Gainsboro";
    textContainer.style.textAlign = "center";
    textContainer.style.width = 60 + "%";
    textContainer.style.padding = 10 + "px";
    
    var pExplainText = document.createTextNode(finishedExplainString); 
    pExplain.style.color = "black";
    pExplain.style.marginLeft = "auto";
    pExplain.style.marginRight = "auto";
    pExplain.appendChild(pExplainText);
    textContainer.appendChild(pExplain);

    var pHash = document.createElement("h3");
    pHash.style.textAlign = "center";
    pHash.style.background = "#ff6961";
    pHash.style.width = 250 + "px";
    pHash.style.marginLeft = "auto";
    pHash.style.marginRight = "auto";
    var pHashText = document.createTextNode(hash); 
    pHash.style.color = "black";
    pHash.appendChild(pHashText);
    textContainer.appendChild(pHash);

    container.appendChild(textContainer);

    frame.appendChild(container);
}

function createRect() {
    targetElement = document.createElement('targetElement');
    targetElement.id = "rect1";
    targetElement.name = "rectangleRed";
    targetWidth = 150;
    targetHeight = 50;
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

    if (run_id % (nrOfChunksToSend * 5 + 1) == 0 && run_id != 0){
        console.log("new condtition")
        csvContent = "timestampLog,pid,condition_id,run_id,timestampConditionStart,timestampCollision,timestampClick,mouseIsInsideElement,targetX,targetY,targetWidth,targetHeight,cursorX,cursorY";
        conditionsCompleted++;
        condition_id = conditionsList[conditionsCompleted];
        run_id = 0;
        updateCurrentLevelText()
        setConfigurationParameters();
    }

    removeElement(targetElement.id);
    removeElement(customCursor.id);
    createRect();
    let newCursorCoords = getNewCursorCoordinates(document.getElementById("rect1"));
    createCustomCursor(newCursorCoords[0], newCursorCoords[1]);
    cursorInside = false;

    timestampConditionStart = performance.now();
    logAllData(timestampConditionStart)
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
function logAllData(timestamp) {

    let timestampLogEntry = timestamp,
    targetWidth = targetElement.style.width,
    targetHeight = targetElement.style.height;

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

        csvQueue.push(logString);
        console.log("appended")
    }
}

async function sendCsvContentToServer(){
    //Number of log entries to be recorded
    if ((run_id % 5 == 0) && run_id != 0) {  
        console.log("sending to server");
        fillCsvContentWithQueue();
        post(csvContent);
        csvContent = "";
    }
}

function fillCsvContentWithQueue(){
    i = 0;
    for (csvQueueCheckpoint; csvQueueCheckpoint < csvQueue.length; csvQueueCheckpoint++){
        csvContent = csvContent + "\n" + csvQueue[csvQueueCheckpoint];
        i++;
    }
    console.log("read " + i.toString() + "from queue, queue length " + csvQueue.length.toString());
}

function removeStartScreeen() {
    $('#inputForm').remove();
}

async function post(logData) {
    if (!hasAlreadyParticipated) {
        $.ajax({
            url: "http://localhost:7000/log/",
            type: "POST",
            data: logData,
            async: true,
            contentType: "text",
            dataType: "text",
            success: function (response) {
                console.log("send sucessful")
            }
        });
    } else{
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
        url: "http://localhost:7000/registerPID/",
        type: "POST",
        data: formCsvData,
        contentType: "text",
        dataType: "text",
        async: true,
        success: function (response) {
            pid = response;
            if (isNaN(response)) {
                hasAlreadyParticipated = true;
                pid = 0;
            }
            removeStartScreeen();
            startScreenIsActive = false;
            setupScene();
            requestLock();
        }
    });

}

function postRunsComplete() {
    if (!hasAlreadyParticipated) {
        $.ajax({
            url: "http://localhost:7000/logFinish/",
            type: "POST",
            data: pid,
            contentType: "text",
            dataType: "text",
            success: function (response) {
                finishedHash = response;
                showFinishedHash(finishedHash);
            }
        });
    } else {
        hash = getRndInteger(1000000000000000, 9999999999999999);
        showFinishedHash(hash.toString());
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
    const parsed = parseInt(num);
    return Math.min(Math.max(parsed, MIN), MAX);
}

function cursorIsInsideOfElement(elementToCheck) {
    cursor = document.getElementById("customCursor");

    let targetHeightCurrent = parseInt(elementToCheck.style.height),
        targetWidthCurrent = parseInt(elementToCheck.style.width);

    if ((cursorX > newX && cursorY > newY) && (cursorX < newX + targetWidthCurrent && cursorY < newY + targetHeightCurrent)) {
        return true;
    } else {
        return false;
    }
}

function getUniqueBrowserID() {
    let magneticUiLocalStorageKey = "uniqueMuiBrowserID";
    if (localStorage.getItem(magneticUiLocalStorageKey) === null) {
        let newUniqueID = Math.random().toString(36).substr(2, 9);
        localStorage.setItem(magneticUiLocalStorageKey, newUniqueID);
        return newUniqueID;
    } else {
        return localStorage.getItem(magneticUiLocalStorageKey);
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
        return true;
    } else{
        return false;
    }
}

  function setConditionsList() {
    switch (pid%6){
        case 0:
            conditionsList = [-1,0,1,5,2,4,3,6,7];
            break;
        case 1:
            conditionsList = [-1,1,2,0,3,5,4,6,7];
            break;
        case 2:
            conditionsList = [-1,2,3,1,4,0,5,6,7];
            break;
        case 3:
            conditionsList = [-1,3,4,2,5,1,0,6,7];
            break;
        case 4:
            conditionsList = [-1,4,5,3,0,2,1,6,7];
            break;
        case 5:
            conditionsList = [-1,5,0,4,1,3,2,6,7];
            break;
    }
  }

function setLanguageStrings(){
    if(languageIsEN){
        levelOf = " of ";
        levelsCompleted = "All levels completed";
        formAgeString = "Age";
        formGenderString = "Gender";
        formJobString = "Job";
        formGenderChoices = ["Female", "Male", "Diverse"];
        formStartTestButtonString = "Start test";
        finishedHeaderString = "Thank you for participating <3";
        finishedExplainString = "If you are a student at the University of Regensburg, please send this code to marie.sautmann@stud.uni-regensburg.de in order to recieve your VP:";
        introTextSetupRules = "\nBefore you start:\n- Make sure you are using a laptop or desktop pc\n- Resize your browser window so that the entire black background area can be seen\n- Make sure your browser zoom is at exactly 100%, don't zoom in or out";
    } else{
        levelOf = " von ";
        levelsCompleted = "Alle Level vollendet";
        formAgeString = "Alter";
        formGenderString = "Geschlecht";
        formJobString = "Beruf";
        formGenderChoices = ["Männlich", "Weiblich", "Divers"];
        formStartTestButtonString = "Test beginnen";
        finishedHeaderString = "Vielen Dank für Ihre Teilnahme <3";
        finishedExplainString = "Wenn Sie ein(e) Student(in) der Universität Regensburg sind, dann schicken Sie bitte folgenden Code an marie.sautmann@stud.uni-regensburg.de um Ihre Versuchspersonenstunden zu erhalten:";
        introTextSetupRules = "\nBevor Sie die Studie starten:\n- Wechseln Sie zu einem Laptop oder Desktop Pc\n- Passen Sie das Browser Fenster so an, dass die komplette schwarze Hintergrundfläche zu sehen ist\n- Setzen Sie ihren Browser Zoom auf genau 100%, zoomen Sie nicht hinein oder heraus";
    } 
}

var levelOf,
levelsCompleted,
formAgeString,
formGenderString,
formJobString,
formGenderChoices,
formStartTestButtonString,
finishedHeaderString,
finishedExplainString,
introTextSetupRules;


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
