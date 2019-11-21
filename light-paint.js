var canvas = document.getElementById("canvas");
canvas.width  = 1920;
canvas.height = 1080;
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d",  { alpha: false });
var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var worker = new Worker('worker.js');


worker.addEventListener('message', function(e) {
    drawPixel(e.data);
    worker.postMessage("start");
}, false);

worker.postMessage("start");



function drawPixel(pixel){
    ctx.beginPath();
    ctx.arc(pixel.vector.x, pixel.vector.y, 1, 2, 10 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.1
    ctx.fill();
}
