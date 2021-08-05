




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


    */




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