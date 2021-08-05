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

    currentWindow = windowLayout["setupPage1"];

    setTimeout( renderLoop, 500 );

}

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

        if (!found)
            i++;

    }

    if (found)
        return currentWindow.controls[i];
    else
        return null;
}

function pointInRect (px, py, x, y, w, h) {
    console.log ( px +", " + py +", " + x +", " + y +", " + w +", " + h);
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

    renderMainContext();

    setTimeout( renderLoop, 100 );
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
    mainContext.strokeStyle = "rgb(128, 128, 128)";
    mainContext.lineWidth = 5;
    mainContext.fillStyle = "rgb(200, 200, 200)";
    roundRect(mainContext, control.x - control.w / 2, control.y, control.w, control.h, 30, true, false);

    var textboxData = control.value;

    //if this textbox has focus, blink the cursor
    if (control.id == currentWindow.focus) {
        if (Date.now() % 1000 < 500) {
            textboxData = control.value + "|";
        }
    }

    mainContext.font = control.fontsize + 'px serif';
    mainContext.fillStyle = control.fontcolor;
    mainContext.textAlign = "left";
    mainContext.fillText ( textboxData, control.x - (control.w / 2) + control.texthorizoffset, control.y + control.textvertoffset );        

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
        alert(key);
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
        ['1234567890','-/:;()$&@"',".,?!'"]
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
        [0, 0, 200],        
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
    var symChar = '1234567890-/:;()$&@"' + "',.,?!";

    var found = false;
    var i = 0;
    while ((!found) && (i < keyboardButtonLocations.length))
        if (pointInRect (x, y, keyboardButtonLocations[i].x, keyboardButtonLocations[i].y, keyboardButtonLocations[i].w, keyboardButtonLocations[i].h))
            found = true;
        else
            i++;

    alert(found);
    if (found) {
        var t = keyboardButtonLocations[i].text;
        if (t == "shift") {

        }
        else if (t == "mode") {

        }
        else if (t == "enter") {

        }
        else if (t == "backspace") {

        }
        else {
            var control = findControlByID ("keyboard");
            if (control.mode == 1) {
                var j = textChar.indexOf(t);
                if (j != -1)
                    t = symChar.charAt(j);
            }
            if (control.shift)
                t = t.toUpperCase();

        }


        console.log(t);

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
    mainContext.restore();

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

    windowLayout['setupPage1'] = {
        title: "Dynamo Coin Wallet Setup",
        focus: "txtPassword1",
        allowVirtKeyboard: true,
        keyboardVisible: false,
        id: "winSetupPage1",
        controls : [
            { type : "label", x : 1000, y: 450, fontsize : "128", fontcolor : "white", align : "center", text : "Create Wallet Password"},
            { type : "label", x : 1000, y: 600, fontsize : "80", fontcolor : "white", align : "center", text : "Enter a password that is easy to remember,"},
            { type: "label", x : 1000, y: 700, fontsize : "80", fontcolor : "white", align : "center", text : "but hard to guess.  This password will be used"},
            { type : "label", x : 1000, y: 800, fontsize : "80", fontcolor : "white", align : "center", text : "to unlock your wallet.  If you lose your password,"},
            { type : "label", x : 1000, y: 900, fontsize : "80", fontcolor : "white", align : "center", text : "it cannot be recovered by any means."},
            { type : "label", x : 1000, y: 1200, fontsize : "80", fontcolor : "white", align : "center", text : "Enter password"},
            { type : "label", x : 1000, y: 1600, fontsize : "80", fontcolor : "white", align : "center", text : "Re-enter password"},

            { type : "textbox", id: "txtPassword1", x : 1000, y: 1300, w: 640, h: 150, fontsize : "80", fontcolor : "black", texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: true, value: "" },
            { type : "textbox", id: "txtPassword2", x : 1000, y: 1700, w: 640, h: 150, fontsize : "80", fontcolor : "black", texthorizoffset: 25, textvertoffset: 100, maxlen: 16, mask: true, value: "" },

            { type : "button", id: "cmdNext", x: 1000, y: 1900, w: 400, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Next"},

            { type: "keyboard", id: "keyboard", mode: 0, shift: false }
            
        ]
    };

}


function winSetupPage1_cmdNext_click() {
}