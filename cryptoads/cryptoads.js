
var ctx;
var screenWidth;
var screenHeight;
var images = [];
var frame = 0;
var frameDir = 1;

var frame1 = 0;
var frameDir1 = 1;

function startup() {

    ctx = document.getElementById("drawArea").getContext("2d");

    screenWidth = document.getElementById("drawArea").clientWidth;
    screenHeight = document.getElementById("drawArea").clientHeight;

    loadImage("./pond.png", "pond");
    loadImage("./toad1-idle.png", "toad1-idle");
    loadImage("./toad2-idle.png", "toad2-idle");

    setTimeout(renderLoop, 50);

}


function renderLoop() {

    frame += frameDir;
    if ((frameDir == 1) && (frame == 9)) {
        frameDir = -1;
        frame = 7;
    }

    if ((frameDir == -1) && (frame == -1)) {
        frameDir = 1;
        frame = 1;
    }



    frame1 += frameDir1;
    if ((frameDir1 == 1) && (frame1 == 5)) {
        frameDir1 = -1;
        frame1 = 3;
    }

    if ((frameDir1 == -1) && (frame1 == -1)) {
        frameDir1 = 1;
        frame1 = 1;
    }


    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    if (images.hasOwnProperty('pond')) {
        ctx.drawImage(images["pond"].image, 0, 0, screenWidth, screenHeight);
    }

    if (images.hasOwnProperty('toad1-idle')) {
        var frameW = 256;
        var frameH = 256;
        var x = (frame % 4) * frameW;
        var y = Math.floor(frame / 4) * frameH;

        ctx.drawImage(images["toad1-idle"].image, x, y, frameW, frameH, 475, 200, frameW, frameH);
    }

    if (images.hasOwnProperty('toad2-idle')) {
        var frameW = 256;
        var frameH = 256;
        var x = (frame1 % 4) * frameW;
        var y = Math.floor(frame1 / 4) * frameH;

        ctx.drawImage(images["toad2-idle"].image, x, y, frameW, frameH, 120, 260, frameW, frameH);
    }


    setTimeout(renderLoop, 130);
    
}

function loadImage(source, name) {


    var img = new Object();
    img.image = new Image();
    img.image.src = source;
    images[name] = img;

}