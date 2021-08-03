
//Create words window local vars
////////////////////////
var canvasCTX;
var canvasW;
var canvasH;
var canvas;
var prevX;
var currX;
var prevY;
var currY;
var dot_flag = false;
var flag = false;
///////////////////////////



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

var windowLayout = new Object();

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

    currentPage = "setupPage1";

    setTimeout( renderLoop, 500 );

}

function renderLoop() {

    var win = windowLayout[currentPage];

    drawBackground(win.title, false);
    drawWindow(win.controls);
    renderMainContext();

    setTimeout( renderLoop, 100 );

}

function drawWindow (controls) {

    for ( var i = 0; i < controls.length; i++) {
        var control = controls[i];
        if (control.type == "label")
            drawLabel (control);
        else if (control.type == "textbox")
            drawTextbox (control);
        else if (control.type == "button")
            drawButton (control);
    }
    
}

function drawLabel (control) {
    mainContext.font = control.fontsize + 'px serif';
    mainContext.fillStyle = control.color;
    mainContext.textAlign = control.align;
    mainContext.fillText (control.text, control.x, control.y );
}


function drawTextbox ( control ) {
    mainContext.strokeStyle = "rgb(128, 128, 128)";
    mainContext.lineWidth = 5;
    mainContext.fillStyle = "rgb(200, 200, 200)";
    roundRect(mainContext, control.x - (control.maxlen * 50) / 2, control.y, control.maxlen * 50, 150, 30, true, false);
}


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


    /*
    setupMenu();
    
    if (passwordExists())
        loadWindow('win_enter_password.html');
    else
        loadWindow('win_create_password.html');


    localStorage.clear();

        /*
    alert(localStorage.getItem("fred"));

    localStorage.setItem("fred", "frank");
    */


        /*
    var x = CryptoJS.SHA256('test');
    alert(x);
    */

    /*
    const wif = 'KwDieuoz4S9kHeGCgjhw3L9G6EqbS3knZgn5XLSKCmpeDqnp5ozH';
    const keyPair = Bitcoin.ECPair.fromWIF(wif);
    
    var address_p2wpkh = null;
    var address_segwit_p2sh = null;
    
    {
      const { address } = Bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey })
      address_p2wpkh = address;
    }

    alert(address_p2wpkh);
    */



function passwordExists() {
    return false;
}
 


function loadWindowLayout() {

    windowLayout['setupPage1'] = {
        "title" : "Dynamo Coin Wallet Setup",
        "controls" : [
            { type : "label", x : 1000, y: 450, fontsize : "128", color : "white", align : "center", text : "Create Wallet Password"},
            { type : "label", x : 1000, y: 600, fontsize : "80", color : "white", align : "center", text : "Enter a password that is easy to remember,"},
            { type: "label", x : 1000, y: 700, fontsize : "80", color : "white", align : "center", text : "but hard to guess.  This password will be used"},
            { type : "label", x : 1000, y: 800, fontsize : "80", color : "white", align : "center", text : "to unlock your wallet.  If you lose your password,"},
            { type : "label", x : 1000, y: 900, fontsize : "80", color : "white", align : "center", text : "it cannot be recovered by any means."},
            { type : "label", x : 1000, y: 1200, fontsize : "80", color : "white", align : "center", text : "Enter password"},
            { type : "label", x : 1000, y: 1600, fontsize : "80", color : "white", align : "center", text : "Re-enter password"},

            { type : "textbox", id: "txtPassword1", x : 1000, y: 1300, maxlen: 16, mask: true, value: "" },
            { type : "textbox", id: "txtPassword2", x : 1000, y: 1700, maxlen: 16, mask: true, value: "" },

            { type : "button", id: "cmdNext", x: 1000, y: 2100, w: 400, h: 150, fontsize: 96, fontcolor: "black", textvertoffset: 25, caption: "Next"}            
            
        ]
    };

}






/*
async function loadWindow(windowName) {
    var url = chrome.runtime.getURL(windowName);
    document.getElementById("mainWindow").innerHTML = await (await fetch(url)).text();

    if (windowName == 'win_create_password.html') {
        $('input').addClass("ui-corner-all");
        $('button').button();
        $("#cmdEnterPassword").click(win_create_password_cmdEnterPassword_click);
    }

    else if (windowName == 'win_create_words.html') {
        initCreateWordsCanvas();
        $("#cmdWinCreatePhraseCreate").click(win_create_phrase_cmdWinCreatePhraseCreate_click);
    }

    else if (windowName == 'win_view_recovery_words.html') {
        canvas = document.getElementById('wordCanvas');
        canvasCTX = canvas.getContext("2d");
        canvasCTX.fillStyle = "#101010";
        canvasCTX.fillRect(0, 0, 300, 200);
        $("#cmdWinViewRecoveryReveal").click(win_view_phrase_cmdWinViewRecoveryReveal_click);
        $("#cmdWinViewRecoveryProceed").click(win_view_phrase_cmdWinViewRecoveryProceed_click);
    }

    else if (windowName == "win_verify_words.html") {
        $("#cmdVerifyProceed").click(win_verify_phrase_cmdVerifyProceed_click);
    }

    else if (windowName == "win_summary.html") {
        loadSummaryData();
    }

    

}

function win_create_password_cmdEnterPassword_click() {
    loadWindow('win_create_words.html');
}

function win_create_phrase_cmdWinCreatePhraseCreate_click() {
    loadWindow('win_view_recovery_words.html');
}

function win_view_phrase_cmdWinViewRecoveryReveal_click() {
    canvas = document.getElementById('wordCanvas');
    canvasCTX = canvas.getContext("2d");

    canvasCTX.fillStyle = "#FEFEFE";
    canvasCTX.font = "20px Arial";
    for ( var i = 0; i < 12; i++) {
        var x, y;
        if (i < 6)
            x = 10;
        else
            x = 150;
        y = (i % 6) * 30 + 30;
        canvasCTX.fillText("Word1", x, y);
    }


}

function win_view_phrase_cmdWinViewRecoveryProceed_click() {
    loadWindow('win_verify_words.html');
}


function win_verify_phrase_cmdVerifyProceed_click() {
    loadWindow('win_summary.html');
}

function initCreateWordsCanvas() {
    canvas = document.getElementById('entropyCanvas');
    canvasCTX = canvas.getContext("2d");
    canvasW = canvas.width;
    canvasH = canvas.height;
    dot_flag = false;
    flag = false;

    canvas.addEventListener("mousemove", function (e) {
        findxyCreateWordsCanvas('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxyCreateWordsCanvas('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxyCreateWordsCanvas('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxyCreateWordsCanvas('out', e)
    }, false);
}

function drawCreateWordsCanvas() {
    canvasCTX.beginPath();
    canvasCTX.moveTo(prevX, prevY);
    canvasCTX.lineTo(currX, currY);
    canvasCTX.strokeStyle = 'black';
    canvasCTX.lineWidth = 3;
    canvasCTX.stroke();
    canvasCTX.closePath();
}

function findxyCreateWordsCanvas(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            canvasCTX.beginPath();
            canvasCTX.fillStyle = 2;
            canvasCTX.fillRect(currX, currY, 2, 2);
            canvasCTX.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            drawCreateWordsCanvas();
        }
    }
}


function loadSummaryData() {
    var transactions = [
        { "Date": "2021-07-04 13:45:10", "Address": "dy10000000002300000000", "Action": "Send", "Amount": 1.23456 },
        { "Date": "2021-07-04 13:45:10", "Address": "dy10000000002300000000", "Action": "Send", "Amount": 1.23456 },
        { "Date": "2021-07-04 13:45:10", "Address": "dy10000000002300000000", "Action": "Send", "Amount": 1.23456 },
        { "Date": "2021-07-04 13:45:10", "Address": "dy10000000002300000000", "Action": "Send", "Amount": 1.23456 },
        { "Date": "2021-07-04 13:45:10", "Address": "dy10000000002300000000", "Action": "Send", "Amount": 1.23456 },
        { "Date": "2021-07-04 13:45:10", "Address": "dy10000000002300000000", "Action": "Send", "Amount": 1.23456 },
        { "Date": "2021-07-04 13:45:10", "Address": "dy10000000002300000000", "Action": "Send", "Amount": 1.23456 },
        { "Date": "2021-07-04 13:45:10", "Address": "dy10000000002300000000", "Action": "Send", "Amount": 1.23456 },
        { "Date": "2021-07-04 13:45:10", "Address": "dy10000000002300000000", "Action": "Send", "Amount": 1.23456 }
    ];
 
 
    $("#summaryTransactionGrid").jsGrid({
        width: "100%",
        height: "300px",
 
        inserting: false,
        editing: false,
        sorting: true,
        paging: true,
 
        data: transactions,
 
        fields: [
            { name: "Date", type: "text", width: 50  },
            { name: "Address", type: "text", width: 100 },
            { name: "Action", type: "text", width: 50 },
            { name: "Amount", type: "number", width: 50 }
        ]
    });
}


function setupMenu() {

    $( ".cross" ).hide();
    $( ".menu" ).hide();
    $( ".hamburger" ).click(function() {
    $( ".menu" ).slideToggle( "slow", function() {
    $( ".hamburger" ).hide();
    $( ".cross" ).show();
    });
    });
    
    $( ".cross" ).click(function() {
    $( ".menu" ).slideToggle( "slow", function() {
    $( ".cross" ).hide();
    $( ".hamburger" ).show();
    });
    });
    
}

function x() {

    
    chrome.storage.sync.get(['data'], (result) => {
        this.data.innerHTML = result.data;
    });


    chrome.runtime.onInstalled.addListener(() => {
        chrome.storage.sync.set (
            {
                data : "hi"
            },
            () => {} 
        );
    });
    
    data = "hi";
    
    chrome.storage.sync.get([
        'data'
    ], (result) => {
        data = result.data;
    });
    

}
*/