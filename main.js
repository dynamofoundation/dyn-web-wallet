var mainCanvas;
var mainContext;

var stepCanvas;
var stepContext;


var renderCanvas;
var renderContext;

var windowWidth;
var windowHeight;

var canvasWidth;
var canvasHeight;

var aspect = 1.5;

var imgLogo;
var imgKeyboard;

var windowLayout = new Object();
var currentWindow;

var keyboardButtonLocations = [];

var msgboxVisible = false;
var msgboxText;
var msgboxTitle;

var globalVars;

var menuExpanded;
var menuItemLocations = [];

var globalVars = new Object();

jQuery(onLoad);



function onLoad() {



    windowWidth = document.body.clientWidth;
    windowHeight = document.body.clientHeight;

    if (windowWidth > windowHeight) {
        canvasHeight = windowHeight;
        canvasWidth = canvasHeight / aspect;
    }
    else {
        canvasWidth = windowWidth;
        canvasHeight = canvasWidth * aspect;
    }

    if (canvasHeight > windowHeight) {
        canvasHeight = windowHeight;
        canvasWidth = canvasHeight / aspect;
    }

    renderCanvas = document.getElementById('renderCanvas');
    renderCanvas.width = canvasWidth;
    renderCanvas.height = canvasHeight;
    renderContext = renderCanvas.getContext('2d');

    mainCanvas = document.getElementById('mainCanvas');
    mainContext = mainCanvas.getContext('2d');

    stepCanvas = document.getElementById('stepCanvas');
    stepContext = stepCanvas.getContext('2d');

    var leftMargin = (windowWidth - canvasWidth) / 2;
    renderCanvas.style.marginLeft = leftMargin + 'px';

    loadImages();
    loadWindowLayout()
    initEventHandlers();

    currentWindow = windowLayout["welcome"];

    
    var storage = window.localStorage;
    if (storage.getItem ('xprv') === null)
        currentWindow = windowLayout["welcome"];
    else
        currentWindow = windowLayout["login"];


    setTimeout( renderLoop, 500 );

}

$('#renderCanvas').focus().blur(function() {
    var me = this;
    setTimeout(function() {
        me.focus();
    }, 10);
});


function initEventHandlers() {
    window.addEventListener("keyup", event_keypress);
    renderCanvas.addEventListener("mouseup", event_mouseup);
}

function event_keypress(event) {
    processKeyEvent (event.key);
}

function event_mouseup(event) {
    processClickEvent (event.offsetX, event.offsetY);
}



function processKeyEvent (keyCode) {
    if (currentWindow.focus.length > 0) {
        control = findControlByID (currentWindow.focus);
        if (control.type == "textbox")
            processTextboxKeypress (control, keyCode);
    }

}

function processClickEvent ( x, y ) {
    var scaleX = 2000 / canvasWidth;
    var scaleY = 3000 / canvasHeight;
    var px = x * scaleX;
    var py = y * scaleY;

    if (msgboxVisible) {
        if (pointInRect ( px, py, 1000 - 400/2, 1750 - 150/2, 500, 150))
            msgboxVisible = false;
        return;
    }

    var menuX = 80;
    var menuY = 70;
    var menuW = 180;
    var menuH = 180;

    if (currentWindow.hambugerMenu) {
        if (pointInRect (px, py, 80, 70, 180, 180 )) {
            menuExpanded = !menuExpanded;
            return;
        }
        if (menuExpanded) {
            processClickMenu (px, py);
            return;
        }
    }

    var virtKeyClicked = false;
    if (currentWindow.allowVirtKeyboard) {
        if (currentWindow.keyboardVisible) {
            if (py > 2150) {
                virtKeyClicked = true;
                processVirtKeyboardClick (px, py);
            }
        }
    }

    var control = null;
    if (!virtKeyClicked)
        control = findControlByXY ( px, py );

    //if no control clicked, check the virtual keyboard expander
    if (control == null) {
        if (currentWindow.allowVirtKeyboard) {
            if (currentWindow.keyboardVisible) {
                if (pointInRect(px, py, 1630, 2000, imgKeyboard.width, imgKeyboard.height))
                    currentWindow.keyboardVisible = false;
            }
            else {
                if (pointInRect(px, py, 1630, 2800, imgKeyboard.width, imgKeyboard.height))
                    currentWindow.keyboardVisible = true;
            }
        }
    } else {
        if (control.type == "textbox") {
            currentWindow.focus = control.id;
        }
        else if (control.type == "button") {
            functionName = currentWindow.id + "_" + control.id + "_click";
            window[functionName]();
        }
        else if (control.type == "drawing")
            processDrawingClick(control, px, py);
    }

}






function findControlByID ( id ) {
    var found = false;
    var i = 0;
    var result = "";
    while ((!found) && (i < currentWindow.controls.length))
        if (id == currentWindow.controls[i].id) {
            found = true;
            result = currentWindow.controls[i];
        }
        else
            i++;

    return result;

}

function findControlByXY (x, y) {

    var found = false;
    var i = 0;
    while ((!found) && (i < currentWindow.controls.length)) {
        var control = currentWindow.controls[i];

        if (control.type == "textbox")
            found = pointInTextbox (x, y, control);
        else if (control.type == "button")
            found = pointInButton (x, y, control);
        else if (control.type == "drawing")
            found = pointInDrawing (x, y, control);

        if (!found)
            i++;

    }


    if (found)
        return currentWindow.controls[i];
    else
        return null;
}

function pointInRect (px, py, x, y, w, h) {
    //console.log ( px +", " + py +", " + x +", " + y +", " + w +", " + h);
    return ( 
        (px >= x) &&
        (py >= y) && 
        (px < x + w) && 
        (py < y + h)
    );
}


function renderLoop() {


    drawBackground(currentWindow.title, false);
    drawWindow();

    if (currentWindow.allowVirtKeyboard) 
        if (currentWindow.keyboardVisible) {
            var control = findControlByID ("keyboard");            
            drawKeyboard(control);
        }


    if ((msgboxVisible) || (menuExpanded)) {
        mainContext.fillStyle = "rgba(64, 64, 64, 0.6)";
        mainContext.fillRect(50, 50, 1900, 2900);        

        if (msgboxVisible)
            drawMessagebox();
    }

    if (currentWindow.hambugerMenu) {
        drawMenu();
    }

    renderMainContext();

    setTimeout( renderLoop, 100 );
}


function drawMessagebox() {

    var x = 1000;
    var y = 1500;
    var w = 1000;
    var h = 1000;

    mainContext.strokeStyle = "rgb(128, 128, 128)";
    mainContext.lineWidth = 15;
    mainContext.fillStyle = "rgb(200, 200, 200)";
    roundRect(mainContext, x - w / 2, y - h / 2, w, h, 20, true, true);

    mainContext.font = '96px serif bold';
    mainContext.fillStyle = "black";
    mainContext.textAlign = "center";
    mainContext.fillText (msgboxTitle, 1000, y - h/2 + 100 );

    mainContext.font = '80px serif';
    mainContext.fillStyle = "black";
    mainContext.textAlign = "center";

    var textWords = msgboxText.split (" ");
    for ( var i = 0; i < textWords.length - 1; i++)
        textWords[i] += ' ';

    var done = false;
    var i = 0;
    var y = y - h/ 2 + 300;
    while (!done) {
        var tmpLine = textWords[i];
        var lineDone = false;
        while (!lineDone) {
            if (i == textWords.length - 1) {
                done = true;
                lineDone = true;
            }
            else {
                var textWidth = mainContext.measureText(tmpLine + textWords[i+1]).width;
                if (textWidth > w * 0.8) {
                    lineDone = true;
                    i++;
                }
                else {
                    tmpLine += textWords[i+1];
                    i++;
                }
            }
        }
        mainContext.fillText (tmpLine, x, y );
        y += mainContext.measureText(tmpLine).actualBoundingBoxAscent + mainContext.measureText(tmpLine).actualBoundingBoxDescent + 20;

    }

    var button = { type : "button", id: "cmdMsgboxOK", x: 1000, y: 1750, w: 400, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "OK"};

    drawButton (button);
}

function drawMenu() {

    var menuX = 80;
    var menuY = 70;
    var menuW = 180;
    var menuH = 180;

    if (menuExpanded) {
        mainContext.strokeStyle = "rgb(0, 0, 0)";
        mainContext.lineWidth = 10;
        mainContext.fillStyle = "rgb(10, 10, 250)";
        roundRect(mainContext, menuX, menuY, menuW, menuH, 10, false, true);

        mainContext.lineWidth = 10;

        mainContext.beginPath();
        mainContext.moveTo(100, 90);
        mainContext.lineTo(240, 230);
        mainContext.closePath();
        mainContext.stroke();

        mainContext.beginPath();
        mainContext.moveTo(240, 90);
        mainContext.lineTo(100, 230);
        mainContext.closePath();
        mainContext.stroke();

        mainContext.strokeStyle = "rgb(0, 0, 0)";
        mainContext.lineWidth = 10;
        mainContext.fillStyle = "rgb(240, 240, 250)";
        roundRect(mainContext, menuX, menuY + menuH, 1000, menuY + menuH + 1500, 10, true, true);


        var menuItems = ["Summary", "Transactions", "Send", "Receive", "Create NFT", "Send NFT", "Search NFT"];

        for ( var i = 0; i < menuItems.length; i++ ) {
            mainContext.font = '96px serif';
            mainContext.fillStyle = "black";
            mainContext.textAlign = "left";
            mainContext.fillText (menuItems[i], 100, 400 + i * 250);
            mainContext.beginPath();
            mainContext.moveTo(80, 500 + i * 250);
            mainContext.lineTo(1080, 500 + i * 250);
            mainContext.closePath();
            mainContext.stroke();
            var location = new Object();
            location.x = 80;
            location.y = 250 + i * 250;
            location.w = 1000;
            location.h = 250;
            menuItemLocations[i] = location;
        }

    }
    else {
        mainContext.strokeStyle = "rgb(0, 0, 0)";
        mainContext.lineWidth = 10;
        mainContext.fillStyle = "rgb(10, 10, 250)";
        roundRect(mainContext, menuX, menuY, menuW, menuH, 10, false, true);

        mainContext.lineWidth = 20;
        for ( var y = 110; y <= 210; y += 50) {
            mainContext.beginPath();
            mainContext.moveTo(110, y);
            mainContext.lineTo(230, y);
            mainContext.closePath();
            mainContext.stroke();
        }
    }


}


function processClickMenu (px, py) {

    var found = false;
    var i = 0;
    while ((!found) && (i < menuItemLocations.length))
        if (pointInRect(px, py, menuItemLocations[i].x, menuItemLocations[i].y, menuItemLocations[i].w, menuItemLocations[i].h ))
            found = true;
        else
            i++;

    if (found) {
        var windows = ["summary", "transactions", "send", "receive", "createnft", "sendnft", "searchnft"];
        currentWindow = windowLayout[windows[i]];
        menuExpanded = false;
    }

}

function drawWindow () {

    for ( var i = 0; i < currentWindow.controls.length; i++) {
        var control = currentWindow.controls[i];
        if (control.type == "label")
            drawLabel (control);

        else if (control.type == "textbox")
            drawTextbox (control);

        else if (control.type == "button")
            drawButton (control);

        else if (control.type == "drawing")
            drawDrawing (control);
            
        else if (control.type == "panel")
            drawPanel (control);
            
    }

    if (currentWindow.allowVirtKeyboard) {
        if (currentWindow.keyboardVisible) {
            mainContext.drawImage(imgKeyboard, 1630, 2000);
        }
        else {
            mainContext.drawImage(imgKeyboard, 1630, 2800);
        }
    }

}


////////////////////////   Label
function drawLabel (control) {
    mainContext.font = control.fontsize + 'px serif';
    mainContext.fillStyle = control.fontcolor;
    mainContext.textAlign = control.align;
    mainContext.fillText (control.text, control.x, control.y );
}


////////////////////////   Textbox
function drawTextbox ( control ) {

    var x;
    if (control.align == "left")
        x = control.x;
    else
        x = control.x - control.w / 2;

    mainContext.strokeStyle = "rgb(128, 128, 128)";
    mainContext.lineWidth = 5;
    mainContext.fillStyle = "rgb(200, 200, 200)";
    roundRect(mainContext, x, control.y, control.w, control.h, 30, true, false);



    var textboxData = control.value;
    if (control.mask) {
        textboxData = "";
        for ( var i = 0; i < control.value.length; i++)
            textboxData += '.';
    }

    //if this textbox has focus, blink the cursor
    if (control.id == currentWindow.focus) {
        if (Date.now() % 1000 < 500) {
            textboxData = textboxData + "|";
        }
    }

    mainContext.font = control.fontsize + 'px serif';
    mainContext.fillStyle = control.fontcolor;
    mainContext.textAlign = "left";
    mainContext.fillText ( textboxData, x + control.texthorizoffset, control.y + control.textvertoffset );        

}

function processTextboxKeypress (control, key) {

    if (key.length == 1)
        control.value = control.value + key;
    else if ( key == "Backspace" ) {
        if (control.value.length > 0)
            control.value = control.value.substring(0, control.value.length - 1);
    }

    else if ( key == "Enter" ) {
    }

    else {
        //alert(key);
    }

}

function pointInTextbox ( x, y, control ) {
    return pointInRect ( x, y, control.x - control.w / 2, control.y, control.w, control.h);
}



////////////////////////   Button

function drawButton ( control ) {
    mainContext.strokeStyle = "rgb(128, 128, 128)";
    mainContext.lineWidth = 5;
    mainContext.fillStyle = "rgb(240, 240, 240)";
    roundRect(mainContext, control.x - control.w / 2, control.y, control.w, control.h, 20, true, false);
    mainContext.font = control.contsize + 'px serif';
    mainContext.fillStyle = control.fontcolor;
    mainContext.textAlign = "center";
    mainContext.fillText (control.caption, control.x, control.y + control.h / 2 + control.textvertoffset );
}


function pointInButton ( x, y, control ) {
    return pointInRect ( x, y, control.x - control.w / 2, control.y, control.w, control.h);
}


////////////////////////   Keyboard


function drawKeyboard ( control ) {

    var createLocations = false;
    if (keyboardButtonLocations.length == 0)
        createLocations = true;

    const keys = [
        ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'],
        ['1234567890','/:;()$&@"',"-.,?!'*"]
    ];

    width = 1800;
    height = 800;
    keyboardX = (2000 - width) / 2;
    keyboardY = 2950 - height;
    rowSpacing = 100;
    rowHeight = (height - (rowSpacing * 4)) / 4;
    buttonSpacing = 20;
    buttonSize = (width - (buttonSpacing * 10)) / 10;

    const rowXOffset = [
        [0, 100, 290],
        [0, 100, 290],        
    ];


    for ( var row = 0; row < 3; row++ ) {
        var key = keys[control.mode][row];
        var x = keyboardX + rowXOffset[control.mode][row];
        var y = keyboardY + row * (rowHeight + rowSpacing);
        for ( var col = 0; col < key.length; col++) {
            mainContext.strokeStyle = "rgb(0, 0, 0)";
            mainContext.lineWidth = 10;
            mainContext.fillStyle = "rgb(240, 240, 240)";
            roundRect(mainContext, x, y, buttonSize, buttonSize, 20, true, true);

            mainContext.font = '96px serif';
            mainContext.fillStyle = "black"
            mainContext.textAlign = "center";
            var buttonText;
            if (control.shift)
                buttonText = key.substring(col, col+1);
            else
                buttonText = key.substring(col, col+1).toLowerCase();
            mainContext.fillText (buttonText, x + buttonSize / 2, y + buttonSize / 2 + 35 );

            if (createLocations) {
                var b = new Object();
                b.x = x;
                b.y = y;
                b.w = buttonSize;
                b.h = buttonSize;
                b.text = buttonText;
                keyboardButtonLocations.push (b);
            }

            x += buttonSize + buttonSpacing; 
        }
    }


    //space
    mainContext.strokeStyle = "rgb(0, 0, 0)";
    mainContext.lineWidth = 10;
    mainContext.fillStyle = "rgb(240, 240, 240)";
    roundRect(mainContext, 500, keyboardY + 3 * (rowHeight + rowSpacing), 6 * buttonSize, buttonSize, 20, true, true);

    mainContext.font = '96px serif';
    mainContext.fillStyle = "black"
    mainContext.textAlign = "center";
    mainContext.fillText ("Space", 1000, keyboardY + 3 * (rowHeight + rowSpacing) + buttonSize / 2 + 35 );

    var b = new Object();
    b.x = 500;
    b.y = keyboardY + 3 * (rowHeight + rowSpacing);
    b.w = 6 * buttonSize;
    b.h = buttonSize;
    b.text = ' ';
    keyboardButtonLocations.push (b);


    //mode
    mainContext.strokeStyle = "rgb(0, 0, 0)";
    mainContext.lineWidth = 10;
    mainContext.fillStyle = "rgb(90, 90, 90)";
    roundRect(mainContext, keyboardX, keyboardY + 3 * (rowHeight + rowSpacing), buttonSize, buttonSize, 20, true, true);

    mainContext.font = '80px serif';
    mainContext.fillStyle = "white"
    mainContext.textAlign = "center";
    mainContext.fillText ("123", keyboardX + buttonSize / 2, keyboardY + 3 * (rowHeight + rowSpacing) + buttonSize / 2 + 35 );

    var b = new Object();
    b.x = keyboardX;
    b.y = keyboardY + 3 * (rowHeight + rowSpacing);
    b.w = buttonSize;
    b.h = buttonSize;
    b.text = 'mode';
    keyboardButtonLocations.push (b);


    //enter
    mainContext.strokeStyle = "rgb(0, 0, 0)";
    mainContext.lineWidth = 10;
    mainContext.fillStyle = "rgb(64, 64, 255)";
    roundRect(mainContext, keyboardX + width - buttonSize * 2, keyboardY + 3 * (rowHeight + rowSpacing), buttonSize * 2, buttonSize, 20, true, true);

    mainContext.font = '80px serif';
    mainContext.fillStyle = "white"
    mainContext.textAlign = "center";
    mainContext.fillText ("Enter", keyboardX + width - buttonSize, keyboardY + 3 * (rowHeight + rowSpacing) + buttonSize / 2 + 35 );

    var b = new Object();
    b.x = keyboardX + width - buttonSize * 2;
    b.y = keyboardY + 3 * (rowHeight + rowSpacing);
    b.w = buttonSize * 2;
    b.h = buttonSize;
    b.text = 'enter';
    keyboardButtonLocations.push (b);    

    //shift
    if (control.mode == 0) {
        mainContext.strokeStyle = "rgb(0, 0, 0)";
        mainContext.lineWidth = 10;
        mainContext.fillStyle = "rgb(90, 90, 90)";
        roundRect(mainContext, keyboardX, keyboardY + 2 * (rowHeight + rowSpacing), buttonSize, buttonSize, 20, true, true);

        mainContext.font = '64px serif';
        mainContext.fillStyle = "white"
        mainContext.textAlign = "center";
        mainContext.fillText ("shift", keyboardX + buttonSize / 2, keyboardY + 2 * (rowHeight + rowSpacing) + buttonSize / 2 + 35 );

        var b = new Object();
        b.x = keyboardX;
        b.y = keyboardY + 2 * (rowHeight + rowSpacing);
        b.w = buttonSize;
        b.h = buttonSize;
        b.text = 'shift';
        keyboardButtonLocations.push (b);      
    }

    //backspace
    mainContext.strokeStyle = "rgb(0, 0, 0)";
    mainContext.lineWidth = 10;
    mainContext.fillStyle = "rgb(90, 90, 90)";
    roundRect(mainContext, keyboardX + width - buttonSize, keyboardY + 2 * (rowHeight + rowSpacing), buttonSize, buttonSize, 20, true, true);

    mainContext.font = '80px serif';
    mainContext.fillStyle = "white"
    mainContext.textAlign = "center";
    mainContext.fillText ("<-", keyboardX + width - buttonSize + buttonSize / 2, keyboardY + 2 * (rowHeight + rowSpacing) + buttonSize / 2 + 35 );
    
    var b = new Object();
    b.x = keyboardX + width - buttonSize;
    b.y = keyboardY + 2 * (rowHeight + rowSpacing);
    b.w = buttonSize;
    b.h = buttonSize;
    b.text = 'backspace';
    keyboardButtonLocations.push (b);      


}



function processVirtKeyboardClick (x, y) {

    var textChar = 'QWERTYUIOPASDFGHJKLZXCVBNM';
    var symChar = '1234567890/:;()$&@"-' + ".,?!'*";

    var found = false;
    var i = 0;
    while ((!found) && (i < keyboardButtonLocations.length))
        if (pointInRect (x, y, keyboardButtonLocations[i].x, keyboardButtonLocations[i].y, keyboardButtonLocations[i].w, keyboardButtonLocations[i].h))
            found = true;
        else
            i++;

    
    if (found) {
        var kbControl = findControlByID ("keyboard");

        var t = keyboardButtonLocations[i].text;
        if (t == "shift") {
            kbControl.shift = !kbControl.shift;
        }
        else if (t == "mode") {
            if (kbControl.mode == 0)
                kbControl.mode = 1;
            else
                kbControl.mode = 0;
        }
        else if (t == "enter") {
            processKeyEvent("Enter");
        }
        else if (t == "backspace") {
            processKeyEvent("Backspace");
        }
        else {
            if (kbControl.mode == 1) {
                var j = textChar.indexOf(t.toUpperCase());
                if (j != -1)
                    t = symChar.charAt(j);
            }
            if (kbControl.shift)
                t = t.toUpperCase();

            processKeyEvent(t);
        }


        console.log(t);

    }

}


/////////////////////////Drawing area
function drawDrawing(control) {

    mainContext.strokeStyle = "rgb(0, 0, 0)";
    mainContext.lineWidth = 20;
    mainContext.fillStyle = "rgb(250, 250, 250)";
    roundRect(mainContext, control.x, control.y, control.w, control.h, 50, true, true);


    mainContext.lineWidth = 10;
    if (control.points.length > 1) {
        for ( var i = 1; i < control.points.length; i++) {
            mainContext.beginPath();
            mainContext.moveTo(control.points[i-1].x, control.points[i-1].y);
            mainContext.strokeStyle = control.points[i].color;
            mainContext.lineTo(control.points[i].x, control.points[i].y);
            mainContext.closePath();
            mainContext.stroke();
        }
    }


}


function processDrawingClick (control, px, py) {

    var random = new Uint32Array(3);
    window.crypto.getRandomValues(random);

    var r = random[0] % 255;
    var g = random[1] % 255;
    var b = random[2] % 255;

    var point = new Object();
    point.x = px;
    point.y = py;
    point.color = "rgb(" + r + "," + g + "," + b + ")";
    control.points.push(point);


}


function pointInDrawing ( x, y, control ) {
    return pointInRect ( x, y, control.x, control.y, control.w, control.h);
}



///////////////////////////////Panel
function drawPanel ( control ) {

    //if not visible do fade until alpha 0
    if ((!control.visible) && (control.alpha > 0)) {
        control.alpha -= 0.03;        //about 9 seconds because the screen is redrawn 10 times per second
        if (control.alpha < 0)
        control.alpha = 0;
    }

    if (control.alpha > 0) {
        mainContext.fillStyle = "rgba(" + control.colorR + "," + control.colorG + "," + control.colorB + "," + control.alpha + ")";
        roundRect(mainContext, control.x, control.y, control.w, control.h, 10, true, false);
    }
}



function renderMainContext() {
    renderContext.imageSmoothingEnabled = true;
    renderContext.imageSmoothingQuality = "high";

    stepContext.imageSmoothingEnabled = true;
    stepContext.imageSmoothingQuality = "high";

    stepContext.drawImage(mainCanvas, 0, 0, 2000, 3000, 0, 0, 1000, 1500 );

    renderContext.drawImage(stepCanvas, 0, 0, 1000, 1500, 0, 0, canvasWidth, canvasHeight );
}


function drawBackground(windowTitle, enableMenu) {

    mainContext.clearRect (0,0,2000,3000);

    mainContext.strokeStyle = "rgb(128, 128, 128)";
    mainContext.lineWidth = 20;
    mainContext.fillStyle = "rgb(61, 2, 33)";
    roundRect(mainContext, 50, 50, 1900, 2900, 50, true, true);

    mainContext.save();
    mainContext.lineWidth = 0;
    mainContext.fillStyle = "rgb(220, 220, 220)";
    roundRect(mainContext, 62, 62, 1880, 200, 30, true, false);

    mainContext.font = '112px serif';
    mainContext.fillStyle = "black";
    mainContext.textAlign = "center";
    mainContext.fillText (windowTitle, 1000, 195 );

    mainContext.drawImage(imgLogo, 1720, 60 );
}


function Msgbox ( alertTitle, alertText ) {
    msgboxVisible = true;
    msgboxTitle = alertTitle;
    msgboxText = alertText;
}


function loadImages() {
    imgLogo = new Image();
    imgLogo.src = "./images/logo_transparent200.png"

    imgKeyboard = new Image();
    imgKeyboard.src = "./images/keyboard.png"

}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  
}



function loadWindowLayout() {


    windowLayout['login'] = {
        title: "Dynamo Coin Wallet",
        focus: "txtPassword",
        allowVirtKeyboard: true,
        keyboardVisible: false,
        id: "winLogin",
        hambugerMenu: false,
        controls : [
            { type : "label", x : 1000, y: 450, fontsize : "128", fontcolor : "white", align : "center", text : "Enter Wallet Password"},
            { type : "label", x : 1000, y: 600, fontsize : "80", fontcolor : "white", align : "center", text : "Enter your password to unlock the wallet."},

            { type : "textbox", id: "txtPassword", x : 1000, y: 800, w: 800, h: 150, fontsize : "80", fontcolor : "black", align : "center",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: true, value: "" },

            { type : "button", id: "cmdDone", x: 1000, y: 1200, w: 400, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Done"},

            { type: "keyboard", id: "keyboard", mode: 0, shift: false }
            
        ]
    };


    windowLayout['welcome'] = {
        title: "Welcome to Dynamo!",
        focus: "",
        allowVirtKeyboard: false,
        keyboardVisible: false,
        id: "winWelcome",
        hambugerMenu: false,
        controls : [
            { type : "label", x : 1000, y: 450, fontsize : "128", fontcolor : "white", align : "center", text : "Wallet Wizard"},
            { type : "label", x : 1000, y: 600, fontsize : "80", fontcolor : "white", align : "center", text : "You can either setup a new wallet or import"},
            { type: "label", x : 1000, y: 700, fontsize : "80", fontcolor : "white", align : "center", text : "an existing wallet.  Select your choice below."},


            { type : "button", id: "cmdCreate", x: 1000, y: 1000, w: 800, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Create New Wallet"},
            { type : "button", id: "cmdImport", x: 1000, y: 1200, w: 800, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Import Existing Wallet"}

            
        ]
    };

    windowLayout['import'] = {
        title: "Import Dynamo Wallet",
        focus: "",
        allowVirtKeyboard: true,
        keyboardVisible: false,
        id: "winImport",
        hambugerMenu: false,
        controls : [
            { type : "label", x : 1000, y: 450, fontsize : "128", fontcolor : "white", align : "center", text : "Import Wallet"},
            { type : "label", x : 70, y: 600, fontsize : "80", fontcolor : "white", align : "left", text : "Enter 12 word recovery phrase:"},

            { type : "label", x : 70, y: 800, fontsize : "80", fontcolor : "white", align : "left", text : "Words 1 to 6"},

            { type : "textbox", id: "word0", x : 70, y: 830, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },
            { type : "textbox", id: "word1", x : 70, y: 980, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },
            { type : "textbox", id: "word2", x : 70, y: 1130, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },
            { type : "textbox", id: "word3", x : 70, y: 1280, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },
            { type : "textbox", id: "word4", x : 70, y: 1430, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },
            { type : "textbox", id: "word5", x : 70, y: 1580, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },

            { type : "label", x : 1000, y: 800, fontsize : "80", fontcolor : "white", align : "left", text : "Words 7 to 12"},

            { type : "textbox", id: "word6", x : 1000, y: 830, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },
            { type : "textbox", id: "word7", x : 1000, y: 980, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },
            { type : "textbox", id: "word8", x : 1000, y: 1130, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },
            { type : "textbox", id: "word9", x : 1000, y: 1280, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },
            { type : "textbox", id: "word10", x : 1000, y: 1430, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },
            { type : "textbox", id: "word11", x : 1000, y: 1580, w: 900, h: 140, fontsize : "80", fontcolor : "black", align : "left",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },

            { type : "button", id: "cmdDone", x: 1000, y: 1900, w: 400, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Done"},

            { type: "keyboard", id: "keyboard", mode: 0, shift: false }

            
        ]
    };


    windowLayout['setupPage1'] = {
        title: "Dynamo Coin Setup (1 of 4)",
        focus: "txtPassword1",
        allowVirtKeyboard: true,
        keyboardVisible: false,
        id: "winSetupPage1",
        hambugerMenu: false,
        controls : [
            { type : "label", x : 1000, y: 450, fontsize : "128", fontcolor : "white", align : "center", text : "Create Wallet Password"},
            { type : "label", x : 1000, y: 600, fontsize : "80", fontcolor : "white", align : "center", text : "Enter a password that is easy to remember,"},
            { type: "label", x : 1000, y: 700, fontsize : "80", fontcolor : "white", align : "center", text : "but hard to guess.  This password will be used"},
            { type : "label", x : 1000, y: 800, fontsize : "80", fontcolor : "white", align : "center", text : "to unlock your wallet.  If you lose your password,"},
            { type : "label", x : 1000, y: 900, fontsize : "80", fontcolor : "white", align : "center", text : "it cannot be recovered by any means."},
            { type : "label", x : 1000, y: 1200, fontsize : "80", fontcolor : "white", align : "center", text : "Enter password"},
            { type : "label", x : 1000, y: 1600, fontsize : "80", fontcolor : "white", align : "center", text : "Re-enter password"},

            { type : "textbox", id: "txtPassword1", x : 1000, y: 1300, w: 400, h: 150, fontsize : "80", fontcolor : "black", align : "center",  texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: true, value: "" },
            { type : "textbox", id: "txtPassword2", x : 1000, y: 1700, w: 400, h: 150, fontsize : "80", fontcolor : "black", align : "center", texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: true, value: "" },

            { type : "button", id: "cmdNext", x: 1000, y: 1900, w: 400, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Next"},

            { type: "keyboard", id: "keyboard", mode: 0, shift: false }
            
        ]
    };

    windowLayout['setupPage2'] = {
        title: "Dynamo Coin Setup (2 of 4)",
        focus: "",
        allowVirtKeyboard: false,
        keyboardVisible: false,
        id: "winSetupPage2",
        hambugerMenu: false,
        controls : [
            { type : "label", x : 1000, y: 450, fontsize : "128", fontcolor : "white", align : "center", text : "Create Recovery Seed"},
            { type : "label", x : 1000, y: 600, fontsize : "80", fontcolor : "white", align : "center", text : "This screen will generate your recovery seed,"},
            { type : "label", x : 1000, y: 700, fontsize : "80", fontcolor : "white", align : "center", text : "which is 12 words that will be used in the event"},
            { type : "label", x : 1000, y: 800, fontsize : "80", fontcolor : "white", align : "center", text : "that you lose your password or don't have access"},
            { type : "label", x : 1000, y: 900, fontsize : "80", fontcolor : "white", align : "center", text : "to your wallet.  Your 12 word recovery phase"},
            { type : "label", x : 1000, y: 1000, fontsize : "80", fontcolor : "white", align : "center", text : "cannot ever be recreated or restored."},
            { type : "label", x : 1000, y: 1200, fontsize : "80", fontcolor : "white", align : "center", text : "The entropy (randomness) of your recovery phrase"},
            { type : "label", x : 1000, y: 1300, fontsize : "80", fontcolor : "white", align : "center", text : "will be generated from your password, the"},
            { type : "label", x : 1000, y: 1400, fontsize : "80", fontcolor : "white", align : "center", text : "current time and the picture that you draw below."},

            { type : "drawing", id: "drawing", x: 200, y: 1600, w: 1600, h: 800, points: [] },

            { type : "label", x : 1000, y: 2500, fontsize : "80", fontcolor : "white", align : "center", text : "Click or touch to draw lines."},

            { type : "button", id: "cmdNext", x: 1000, y: 2700, w: 400, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Next"}

            
        ]
    };


    windowLayout['setupPage3'] = {
        title: "Dynamo Coin Setup (3 of 4)",
        focus: "",
        allowVirtKeyboard: false,
        keyboardVisible: false,
        id: "winSetupPage3",
        hambugerMenu: false,
        controls : [
            { type : "label", x : 1000, y: 450, fontsize : "128", fontcolor : "white", align : "center", text : "Save Recovery Seed"},
            { type : "label", x : 1000, y: 600, fontsize : "80", fontcolor : "white", align : "center", text : "Your 12 word recovery seed is displayed below."},
            { type : "label", x : 1000, y: 700, fontsize : "80", fontcolor : "white", align : "center", text : "When you are ready to view it, click the button."},
            
            { type : "label", x : 1000, y: 900, fontsize : "80", fontcolor : "white", align : "center", text : "IMPORTANT: STORE YOUR 12 WORD"},
            { type : "label", x : 1000, y: 1000, fontsize : "80", fontcolor : "white", align : "center", text : "RECOVERY PHRASE IN A SAFE PLACE!"},
            { type : "label", x : 1000, y: 1100, fontsize : "80", fontcolor : "white", align : "center", text : "THIS RECOVERY PHRASE ALLOWS ACCESS"},
            { type : "label", x : 1000, y: 1200, fontsize : "80", fontcolor : "white", align : "center", text : "TO ALL OF YOUR COINS!"},

            { type : "label", id: "word0", x : 500, y: 1750, fontsize : "80", fontcolor : "white", align : "center", text : ""},
            { type : "label", id: "word1", x : 500, y: 2000, fontsize : "80", fontcolor : "white", align : "center", text : ""},
            { type : "label", id: "word2", x : 500, y: 2250, fontsize : "80", fontcolor : "white", align : "center", text : ""},
            { type : "label", id: "word3", x : 500, y: 2500, fontsize : "80", fontcolor : "white", align : "center", text : ""},

            { type : "label", id: "word4", x : 1000, y: 1750, fontsize : "80", fontcolor : "white", align : "center", text : ""},
            { type : "label", id: "word5", x : 1000, y: 2000, fontsize : "80", fontcolor : "white", align : "center", text : ""},
            { type : "label", id: "word6", x : 1000, y: 2250, fontsize : "80", fontcolor : "white", align : "center", text : ""},
            { type : "label", id: "word7", x : 1000, y: 2500, fontsize : "80", fontcolor : "white", align : "center", text : ""},

            { type : "label", id: "word8", x : 1500, y: 1750, fontsize : "80", fontcolor : "white", align : "center", text : ""},
            { type : "label", id: "word9", x : 1500, y: 2000, fontsize : "80", fontcolor : "white", align : "center", text : ""},
            { type : "label", id: "word10", x : 1500, y: 2250, fontsize : "80", fontcolor : "white", align : "center", text : ""},
            { type : "label", id: "word11", x : 1500, y: 2500, fontsize : "80", fontcolor : "white", align : "center", text : ""},


            { type : "label", id: "", x : 500, y: 1650, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 1"},
            { type : "label", id: "", x : 500, y: 1900, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 2"},
            { type : "label", id: "", x : 500, y: 2150, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 3"},
            { type : "label", id: "", x : 500, y: 2400, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 4"},

            { type : "label", id: "", x : 1000, y: 1650, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 5"},
            { type : "label", id: "", x : 1000, y: 1900, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 6"},
            { type : "label", id: "", x : 1000, y: 2150, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 7"},
            { type : "label", id: "", x : 1000, y: 2400, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 8"},

            { type : "label", id: "", x : 1500, y: 1650, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 9"},
            { type : "label", id: "", x : 1500, y: 1900, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 10"},
            { type : "label", id: "", x : 1500, y: 2150, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 11"},
            { type : "label", id: "", x : 1500, y: 2400, fontsize : "80", fontcolor : "white", align : "center", text : "WORD 12"},

            { type : "panel", id: "pnlHide", x : 100, y : 1500, w : 1800 , h : 1100 , colorR : 128, colorG: 128, colorB: 128, visible: true, alpha: 1  },

            { type : "button", id: "cmdReveal", x: 1000, y: 1290, w: 400, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Reveal"},

            { type : "button", id: "cmdNext", x: 1000, y: 2700, w: 400, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Next"}

            
        ]
    };


    windowLayout['setupPage4'] = {
        title: "Dynamo Coin Setup (4 of 4)",
        focus: "",
        allowVirtKeyboard: true,
        keyboardVisible: false,
        id: "winSetupPage4",
        hambugerMenu: false,
        controls : [
            { type : "label", x : 1000, y: 450, fontsize : "128", fontcolor : "white", align : "center", text : "Verify Recovery Seed"},
            { type : "label", x : 1000, y: 600, fontsize : "80", fontcolor : "white", align : "center", text : "Please enter the recovery words below"},
            { type : "label", x : 1000, y: 700, fontsize : "80", fontcolor : "white", align : "center", text : "to ensure that you have recorded your"},
            { type : "label", x : 1000, y: 800, fontsize : "80", fontcolor : "white", align : "center", text : "recovery seed correctly."},

            { type : "label", id: "lblQuestion1", x : 400, y: 1100, fontsize : "80", fontcolor : "white", align : "left", text : "Word 2: "},
            { type : "textbox", id: "txtQuestion1", x : 750, y: 1000, w: 800, h: 150, fontsize : "80", align : "left", fontcolor : "black", texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },

            { type : "label", id: "lblQuestion2", x : 400, y: 1300, fontsize : "80", fontcolor : "white", align : "left", text : "Word 5: "},
            { type : "textbox", id: "txtQuestion2", x : 750, y: 1200, w: 800, h: 150, fontsize : "80", align : "left", fontcolor : "black", texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },

            { type : "label", id: "lblQuestion3", x : 400, y: 1500, fontsize : "80", fontcolor : "white", align : "left", text : "Word 8: "},
            { type : "textbox", id: "txtQuestion3", x : 750, y: 1400, w: 800, h: 150, fontsize : "80", align : "left", fontcolor : "black", texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },

            { type : "label", id: "lblQuestion4", x : 400, y: 1700, fontsize : "80", fontcolor : "white", align : "left", text : "Word 11: "},
            { type : "textbox", id: "txtQuestion4", x : 750, y: 1600, w: 800, h: 150, fontsize : "80", align : "left", fontcolor : "black", texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: false, value: "" },


            { type: "keyboard", id: "keyboard", mode: 0, shift: false },

            { type : "button", id: "cmdNext", x: 1000, y: 1900, w: 400, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Done"}

            
        ]
    };


    windowLayout['summary'] = {
        title: "Dynamo Wallet",
        focus: "",
        allowVirtKeyboard: false,
        keyboardVisible: false,
        id: "winSummary",
        hambugerMenu: true,
        controls : [
            { type : "label", id: "address",  x : 100, y: 450, fontsize : "64", fontcolor : "white", align : "left", text : ""},
            { type : "label", id: "balance",  x : 100, y: 750, fontsize : "80", fontcolor : "white", align : "left", text : ""},
            { type : "label", id: "unconfirmed", x : 100, y: 850, fontsize : "80", fontcolor : "white", align : "left", text : ""},
            
            { type : "button", id: "cmdCopyAddress", x: 1700, y: 350, w: 250, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Copy"}

        ]
    };


    windowLayout['transactions'] = {
        title: "Transaction history",
        focus: "",
        allowVirtKeyboard: false,
        keyboardVisible: false,
        id: "winTransactionHistory",
        hambugerMenu: true,
        controls : [
        ]
    };


    windowLayout['send'] = {
        title: "Send Dynamo",
        focus: "",
        allowVirtKeyboard: false,
        keyboardVisible: false,
        id: "winSend",
        hambugerMenu: true,
        controls : [
        ]
    };

    windowLayout['receive'] = {
        title: "Receive Dynamo",
        focus: "",
        allowVirtKeyboard: false,
        keyboardVisible: false,
        id: "winReceive",
        hambugerMenu: true,
        controls : [
        ]
    };


    windowLayout['createnft'] = {
        title: "Create NFT",
        focus: "",
        allowVirtKeyboard: false,
        keyboardVisible: false,
        id: "winCreateNFT",
        hambugerMenu: true,
        controls : [
        ]
    };

    windowLayout['sendnft'] = {
        title: "Send NFT",
        focus: "",
        allowVirtKeyboard: false,
        keyboardVisible: false,
        id: "winSendNFT",
        hambugerMenu: true,
        controls : [
        ]
    };


    windowLayout['searchnft'] = {
        title: "Search For NFT",
        focus: "",
        allowVirtKeyboard: false,
        keyboardVisible: false,
        id: "winSearchNFT",
        hambugerMenu: true,
        controls : [
        ]
    };



}




function winWelcome_cmdCreate_click() {
    currentWindow = windowLayout["setupPage1"];
}

function winWelcome_cmdImport_click() {
    currentWindow = windowLayout["import"];
}

function winImport_cmdDone_click() {
    
    var controls = [];
    for ( var i = 0; i < 12; i++)
        controls[i] = findControlByID("word" + i);
    
    var ok = true;
    for ( var i = 0; i < 12; i++)
        if (controls[i].value.length == 0)    
            ok = false;

    if (!ok) {
        Msgbox ("Validation", "Please enter all 12 words");
        return;
    }

    var mnemonic = "";
    for ( var i = 0; i < 12; i++)
        mnemonic += controls[i].value + " ";
    
    mnemonic = mnemonic.trim();

    if (!DynWallet.bip39.validateMnemonic(mnemonic)) {
        Msgbox ("Validation", "Incorrect 12 word seed phrase");
        return;
    }

    var masterSeed = DynWallet.bip39.mnemonicToSeedSync(mnemonic);
    var node = DynWallet.bip32.fromSeed(masterSeed);
    globalVars.xprv = node.toBase58();

    currentWindow = windowLayout["summary"];
    loadSummary();

}


function winLogin_cmdDone_click() {

    var txtPass = findControlByID("txtPassword").value;

    var localStorage = window.localStorage;
    var encryptedKey = localStorage.getItem("xprv");

    var xprv = "";
    try {
        xprv = decryptAES256 (encryptedKey, txtPass).toString(CryptoJS.enc.Utf8);
    }
    catch(err) {        
    }

    if (xprv.startsWith("xprv")) {
        currentWindow = windowLayout["summary"];
        loadSummary();    
    }
    else 
        Msgbox ("Security", "Incorrect password");


}

function winSetupPage1_cmdNext_click() {

    var txtPass1 = findControlByID("txtPassword1");
    var txtPass2 = findControlByID("txtPassword2");

    if ((txtPass1.value.length == 0) || (txtPass2.value.length == 0))
        Msgbox ("Validation", "Password cannot be empty");
    else if (txtPass1.value != txtPass2.value)
        Msgbox ("Validation", "Passwords do not match");
    else {
        globalVars.plaintextPassword = txtPass1.value;
        globalVars.passwordHash = CryptoJS.SHA256(txtPass1.value);
        currentWindow = windowLayout["setupPage2"];
    }
}

function winSetupPage2_cmdNext_click() {

    var drawing = findControlByID("drawing");
    if (drawing.points.length < 10)
        Msgbox ("Validation", "Please click at least 10 times");
    else {
        var hash1 = CryptoJS.SHA256("a" + Date.now());

        var imgData = mainContext.getImageData(drawing.x, drawing.y, drawing.h, drawing.w);

        var imgStr = "";
        for ( var i = 0; i < imgData.data.length; i++)
            imgStr += imgData.data[i];
        
        var hash2 = CryptoJS.SHA256(imgStr);

        var hash3 = CryptoJS.SHA256(globalVars.plaintextPassword);

        drawEntropy = hash1.words.concat(hash2.words).concat(hash3.words);

        var strEntropy = "";
        for ( var i = 0; i < drawEntropy.length; i++)
            strEntropy += Math.abs(drawEntropy[i]).toString(16);

        var finalHash = CryptoJS.SHA256(strEntropy);            

        var hexFinalHash = "";
        for ( var i = 0; i < 4; i++) {
            var hexStr = Math.abs(finalHash.words[i]).toString(16);
            while (hexStr.length < 8)
                hexStr = '0' + hexStr;
            hexFinalHash += hexStr;
        }

        const mnemonic = DynWallet.bip39.entropyToMnemonic(hexFinalHash);

        var masterSeed = DynWallet.bip39.mnemonicToSeedSync(mnemonic);
        var node = DynWallet.bip32.fromSeed(masterSeed);
        globalVars.xprv = node.toBase58();
    

        globalVars.seedWords = mnemonic.split (" ");
                
        currentWindow = windowLayout["setupPage3"];
    }
}

function winSetupPage3_cmdReveal_click() {
    var panel = findControlByID("pnlHide");
    panel.visible = false;

    for ( var i = 0; i < 12; i++) {
        var lblWord = findControlByID("word" + i);
        lblWord.text = globalVars.seedWords[i];
    }
        
}

function winSetupPage3_cmdNext_click() {
    var panel = findControlByID("pnlHide");
    
    if (panel.visible)
        Msgbox ("Validation", "Please view and save your recovery seed");
    else {
        currentWindow = windowLayout["setupPage4"];
        globalVars.testWords = [];
        var word1 = getRandomInt(3);
        globalVars.testWords.push(word1);
        var word2 = getRandomInt(3) + 3;
        globalVars.testWords.push(word2);
        var word3 = getRandomInt(3) + 6;
        globalVars.testWords.push(word3);
        var word4 = getRandomInt(3) + 9;
        globalVars.testWords.push(word4);

        var lbl1 = findControlByID("lblQuestion1");
        var lbl2 = findControlByID("lblQuestion2");
        var lbl3 = findControlByID("lblQuestion3");
        var lbl4 = findControlByID("lblQuestion4");

        lbl1.text = "Word " + (word1 + 1);
        lbl2.text = "Word " + (word2 + 1);
        lbl3.text = "Word " + (word3 + 1);
        lbl4.text = "Word " + (word4 + 1);


    }

}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

function winSetupPage4_cmdNext_click() {
    var txtQ1 = findControlByID("txtQuestion1");
    var txtQ2 = findControlByID("txtQuestion2");
    var txtQ3 = findControlByID("txtQuestion3");
    var txtQ4 = findControlByID("txtQuestion4");

    if ((txtQ1.value.length == 0) || (txtQ2.value.length == 0) || (txtQ3.value.length == 0) || (txtQ4.value.length == 0))
        Msgbox ("Validation", "Please enter all the recovery words");
    else {
        var ok = true;
        if (txtQ1.value.toLowerCase() != globalVars.seedWords[globalVars.testWords[0]].toLowerCase())
            ok = false;
        if (txtQ2.value.toLowerCase() != globalVars.seedWords[globalVars.testWords[1]].toLowerCase())
            ok = false;
        if (txtQ3.value.toLowerCase() != globalVars.seedWords[globalVars.testWords[2]].toLowerCase())
            ok = false;
        if (txtQ4.value.toLowerCase() != globalVars.seedWords[globalVars.testWords[3]].toLowerCase())
            ok = false;
        if (ok) {
            setupWallet();
            currentWindow = windowLayout["summary"];
            loadSummary();
        }
        else
            Msgbox ("Validation", "Recovery words incorrect");
    }
}

function winSummary_cmdCopyAddress_click() {
    var textArea = document.getElementById("txtClipboard");
    var localStorage = window.localStorage;
    textArea.value = localStorage.getItem("addr0");
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        if (successful)
            Msgbox("Confirm", "Address copied to clipboard");
        else
            Msgbox("Failed", "Address could not be copied to clipboard");
    } catch (err) {
        Msgbox("Failed", "Address could not be copied to clipboard");
    }
}



function loadSummary() {

    var localStorage = window.localStorage;

    var control = findControlByID("address");
    control.text = localStorage.getItem("addr0");

    var request = "/get_balance?addr=dy1qzvx3yfrucqa2ntsw8e7dyzv6u6dl2c2wjvx5jy";

    $.ajax(
        {url: request, success: function(result) {
            var control = findControlByID("balance");
            control.text = "Balance: " + result + " DYN";

        }}
    );


    /*
    { type : "label", id: "address",  x : 100, y: 450, fontsize : "80", fontcolor : "white", align : "left", text : "Address: dy123456789abcdefg"},
    { type : "label", id: "balance",  x : 100, y: 700, fontsize : "80", fontcolor : "white", align : "left", text : "Balance: 2.45000000 DYN"},
    { type : "label", id: "unconfirmed", x : 100, y: 850, fontsize : "80", fontcolor : "white", align : "left", text : "Unconfirmed Balance: 0.30000000 DYN"},
*/

}


////CRYPTO STUFF

function hexFromHash ( data )
 {
     var result = "";
     for ( var i = 0; i < data.length; i++) {
         var hexStr = Math.abs(data[i]).toString(16);
         while (hexStr.length < 8)
             hexStr = '0' + hexStr;
             result += hexStr;
     }

     return result;

}



function setupWallet() {

    //save seed encrypted with plain text password
    //save bech32 of /0/0/0 HD address


    var storage = window.localStorage;

    var encryptedSeed = encryptAES256 (globalVars.xprv, globalVars.plaintextPassword);
    globalVars.plaintextPassword = null;   //might force GC in some browsers, at least we tried

    storage.setItem ('xprv', encryptedSeed);

    var network = DynWallet.bitcoin.networks.bitcoin;
    var root = DynWallet.bip32.fromBase58(globalVars.xprv, network);
    var child = root.derivePath("m/0'/0'/0'");
    var script = DynWallet.bitcoin.payments.p2wpkh( {pubkey: child.publicKey, network});
    var addr = script.address;

    storage.setItem ('addr0', addr);


}


/*
    var network = DynWallet.bitcoin.networks.bitcoin;
    const mnemonic = DynWallet.bip39.entropyToMnemonic("0101010101010101010101010101010101010101010101010101010101010101");
    var seed = DynWallet.bip39.mnemonicToSeedSync(mnemonic);
    var root = DynWallet.bip32.fromSeed(seed, network);
    var child = root.derivePath("m/0'/0'/0'");
    var script = DynWallet.bitcoin.payments.p2wpkh( {pubkey: child.publicKey, network});
    var addr = script.address;




            var network = DynWallet.bitcoin.networks.bitcoin;
        var root = DynWallet.bip32.fromBase58(strPvtKey, network);
        var child = root.derivePath("m/0'/0'/0'");
        var script = DynWallet.bitcoin.payments.p2wpkh( {pubkey: child.publicKey, network});
        var addr = script.address;        


*/


    /*
    var stuff = CryptoJS.SHA256("abcd");

    const mnemonic = DynWallet.bip39.generateMnemonic();
    console.log(mnemonic);
*/


    /*
    var child = node.derivePath("m/0'/0'/0'");

    var network = DynWallet.bitcoin.networks.bitcoin;
    var script = DynWallet.bitcoin.payments.p2wpkh( {pubkey: child.publicKey, network});
    console.log(script);
    var addr = script.address;
    console.log(addr);
*/



/*

    var dest = DynWallet.bech32.bech32.decode('dy1qgvluf2ej6n58e8vpxdzad2cjqw2pkasrghkaef');


    const ecpair = DynWallet.bitcoin.ECPair.fromPublicKey(node.publicKey, { network: network });
    const p2wpkh = DynWallet.bitcoin.payments.p2wpkh({ pubkey: ecpair.publicKey, network: network });

    var script = DynWallet.bitcoin.payments.p2wpkh( {pubkey: node.publicKey, network});
    console.log(script.address);

    const p2sh = DynWallet.bitcoin.payments.p2sh({
        redeem: DynWallet.bitcoin.payments.p2wpkh({ pubkey: node.publicKey, network }),
        network
      });

    var psbt = new DynWallet.bitcoin.Psbt();

    psbt.addOutput ( {address: 'dy1qgvluf2ej6n58e8vpxdzad2cjqw2pkasrghkaef', value : 24000000});

    psbt.addInput ( {
        hash: 'ef3ffe45fbe913c138467b9a101fe5c24682cfbb6ea2c59ddd499e5221e31b0b',
        index: 0,
        //redeemScript: p2sh.redeem.output,
        witnessUtxo: {
          script: p2wpkh.output,
          value: 24316921,
        }
    } );

    psbt.signInput(0, node);
    psbt.validateSignaturesOfInput(0, node.publicKey);
    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction();
    console.log(tx.toHex());
*/





var AESkeySize = 256;
var iterations = 9999;


function encryptAES256 (msg, pass) {
  var salt = CryptoJS.lib.WordArray.random(128/8);
  
  var key = CryptoJS.PBKDF2(pass, salt, {
      keySize: AESkeySize/32,
      iterations: iterations
    });

  var iv = CryptoJS.lib.WordArray.random(128/8);
  
  var encrypted = CryptoJS.AES.encrypt(msg, key, { 
    iv: iv, 
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
    
  });
  
  // salt, iv will be hex 32 in length
  // append them to the ciphertext for use  in decryption
  var transitmessage = salt.toString()+ iv.toString() + encrypted.toString();
  return transitmessage;
}

function decryptAES256 (transitmessage, pass) {
  var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
  var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
  var encrypted = transitmessage.substring(64);
  
  var key = CryptoJS.PBKDF2(pass, salt, {
      keySize: AESkeySize/32,
      iterations: iterations
    });

  var decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
    iv: iv, 
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
    
  })
  return decrypted;
}

