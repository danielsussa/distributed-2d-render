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

function drawLine(raycast){
    ctx.beginPath();
    const x1 = raycast.line.v1.x;
    const y1 = raycast.line.v1.y;
    const x2 = raycast.line.v2.x;
    const y2 = raycast.line.v2.y;
    var grd = ctx.createLinearGradient(x1, y1, x2, y2);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    grd.addColorStop(0, "white");
    grd.addColorStop(1, "black");
    ctx.lineWidth = 1;
    ctx.strokeStyle = grd;
    ctx.stroke();
    self.postMessage({data: 'ok'});
}

function drawPlane(line){
    ctx.beginPath();
    const x1 = line.v1.x;
    const y1 = line.v1.y;
    const x2 = line.v2.x;
    const y2 = line.v2.y;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 1;
    ctx.stroke();
    self.postMessage({data: 'ok'});
}

function drawSphere(sphere){
    ctx.beginPath();
    ctx.arc(sphere.vector.x, sphere.vector.y, sphere.radius, 0, 2 * Math.PI, true);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.fill();
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
    if (evt.data.kind === 'raytrace'){
        drawLine(evt.data.raytrace);
    }
    if (evt.data.kind === 'planeCollider'){
        drawPlane(evt.data.planeCollider);
    }
  };