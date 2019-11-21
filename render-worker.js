// const canvas = new OffscreenCanvas(100, 1);
// canvas.width  = 1920;
// canvas.height = 1080;
// var canvasWidth = canvas.width;
// var canvasHeight = canvas.height;
// var ctx = canvas.getContext("2d",  { alpha: false });
// var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
// // var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


var ctx;

function drawPixel(pixel){
    ctx.beginPath();
    ctx.arc(pixel.vector.x, pixel.vector.y, 1, 2, 10 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.05
    ctx.fill();
    self.postMessage({data: 'ok'});
}

function drawSphere(sphere){
    ctx.beginPath();
    ctx.arc(sphere.vector.x, sphere.vector.y, sphere.radius, 0, 2 * Math.PI, true);
    ctx.strokeStyle = 'white';
    ctx.stroke();
}

onmessage = function(evt) {
    if (evt.data.canvas !== undefined){
        var canvas = evt.data.canvas;
        ctx = canvas.getContext("2d");
        return;
    }
    if (evt.data.kind === 'photon'){
        drawPixel(evt.data.pixel);
    }
    if (evt.data.kind === 'sphere'){
        drawSphere(evt.data.sphere);
    }
  };