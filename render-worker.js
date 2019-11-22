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
    const x1 = raycast.v1.x;
    const y1 = raycast.v1.y;
    const x2 = raycast.v2.x;
    const y2 = raycast.v2.y;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 1;

    const max = 0.01;
    const min = 0.002;

    // newvalue= (max-min)*(value-1)+max

    const nStart = (max-min)*(raycast.startPower-1)+max;
    const nEnd = (max-min)*(raycast.endPower-1)+max;
    let gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${nStart})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${nEnd})`);
    ctx.strokeStyle = gradient;


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
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
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