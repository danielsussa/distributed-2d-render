
var ctx;
var canvas;


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
    const min = 0.004;

    // newvalue= (max-min)*(value-1)+max

    const nStart = (max-min)*(raycast.startPower-1)+max;
    const nEnd = (max-min)*(raycast.endPower-1)+max;
    const middle  = (nStart - nEnd) / 2 + nEnd;
    let gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${nStart})`);
    gradient.addColorStop(0.1, `rgba(255, 255, 255, ${middle})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${nEnd})`);
    ctx.strokeStyle = gradient;


    ctx.stroke();
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

function renderBase64(){
    const blob = canvas.convertToBlob({
        type: "image/jpeg",
        quality: 0.5
      }).then(function(blob){
        self.postMessage({blob: blob});

      });
}

function readImage(data){
    ctx.drawImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAIAAAACDbGyAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oMCRUiMrIBQVkAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAADElEQVQI12NgoC4AAABQAAEiE+h1AAAAAElFTkSuQmCC", 0, 0);
}
onmessage = function(evt) {
    if (evt.data.canvas !== undefined){
        canvas = evt.data.canvas;
        ctx = canvas.getContext("2d");
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        return;
    }

    if (evt.data.kind === 'sphere'){
        drawSphere(evt.data.sphere);
    }
    if (evt.data.kind === 'raytrace'){
        drawLine(evt.data.raytrace);
        self.postMessage({data: 'ok'});
    }
    if (evt.data.kind === 'convert'){
        renderBase64();
    }
    if (evt.data.kind === 'render'){
        readImage(evt.data.file);
    }
    if (evt.data.kind === 'planeCollider'){
        drawPlane(evt.data.planeCollider);
    }
};