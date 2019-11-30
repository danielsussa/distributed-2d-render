

function debugDrawPixel(v){
  ctx.fillStyle = "#FF0000";
  ctx.fillRect( v.x, v.y, 2, 2 );
}

var mousePositions = [];

var canvas = null;
var ctx = null;
var $ = null;


function adjustFrame(){
  const w = window.innerWidth - 40;
  const h = window.innerHeight - 80;
  $(".frame-wrapper").css('width', w);
  $(".frame-wrapper").css('height', h);
  $(".right-up-resize").css('left', w -15);
  $(".left-down-resize").css('top', h - 15);
  $(".right-down-resize").css('top', h - 15);
  $(".right-down-resize").css('left', w - 15);
  $(".frame-wrapper").show();
}


module.exports = {
  adjustFrame: adjustFrame,
  newCanvas: newCanvas
};

function newCanvas(jquery){
  $ = jquery;
  canvas = document.getElementById('draw-canvas');
  canvas.width = window.innerWidth - 40;
  canvas.height = window.innerHeight - 80;
  ctx = canvas.getContext('2d');


  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 6;
  const rect = canvas.getBoundingClientRect();

  canvas.addEventListener('mousedown', function (evt) {
    var mousePos = getMousePos(canvas, evt);
    mousePositions.push(mousePos);
    ctx.beginPath();
    ctx.moveTo(mousePos.x, mousePos.y);
    evt.preventDefault();
    canvas.addEventListener('mousemove', mouseMove, false);
  });
  
  canvas.addEventListener('mouseup', function () {
    calculateNormal();
    canvas.removeEventListener('mousemove', mouseMove, false);
  }, false);
  
  $(".line-size").click(function () {
    $('.line-size').removeClass('line-size-selected');
    $(this).addClass('line-size-selected');
    ctx.lineWidth = $(this).attr('id').replace('tickness_', '')
  });

  $( ".color-picker").on("color", function(e, color){
    ctx.strokeStyle = color;
  })
}



function pushGap(nextVector){
  const currentVector = mousePositions[mousePositions.length - 1];
  const line = {v1: currentVector, v2: nextVector};

  var iter = 0.0;
  while (iter < 1){
    iter += 0.01;
    const currentX = line.v1.x + (line.v2.x - line.v1.x) * iter;
    const currentY = line.v1.y + (line.v2.y - line.v1.y) * iter;
    mousePositions.push({x: Math.floor(currentX), y: Math.floor(currentY)});
  }

  mousePositions.push(nextVector);
}

var mapOfDirection = new Map();

function calculateNormal(){
  const factor = 30;
  for (var i = factor ; i < mousePositions.length - factor ; i++){
    const startVector = mousePositions[i-factor];
    const endVector = mousePositions[i + factor];
    const direction = directionOfLine(startVector, endVector);

    var currentVector = mousePositions[i];
    // debugDrawPixel(currentVector)
    const randonDir = Math.random() * 7 - 3.5;
    mapOfDirection.set(`${currentVector.x}_${currentVector.y}`, direction + randonDir);
  }
  mousePositions = [];
}


function directionOfLine(v1, v2) {
  var dy = v1.y - v2.y;
  var dx = v2.x - v1.x;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}

function getMousePos(canvas, evt) {
  return {
    x: evt.clientX + document.documentElement.scrollLeft - 20,
    y: evt.clientY + document.documentElement.scrollTop - 20
  };
}

function mouseMove(evt) {
  var mousePos = getMousePos(canvas, evt);

    // get the normal from here
  pushGap(mousePos);

  ctx.lineTo(mousePos.x, mousePos.y);
  ctx.stroke();
}




var size = [1, 3, 5, 10, 15, 20];
var sizeNames = ['default', 'three', 'five', 'ten'];



function process() {
  var pixelMap = new Map();
  var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var pix = imgd.data;
  for (var i = 0, n = pix.length; i < n; i += 4) {

    if (pix[i] == 0 && pix[i + 1] == 0 && pix[i + 2] == 0) {
      continue;
    }
    const key = `${pix[i]}/${pix[i + 1]}/${pix[i + 2]}/${pix[i + 3]}`

    const x = (i / 4) % canvas.width;
    const y = Math.floor((i / 4) / canvas.width);

    const yTransformed = y * -1 + canvas.height
    var coord = { x: x, y: yTransformed };
    if (mapOfDirection.has(`${x}_${y}`)){
      coord.direction = mapOfDirection.get(`${x}_${y}`);
    }
    if (pixelMap.has(key)) {
      pixelMap.get(key).push(coord);
    } else {
      pixelMap.set(key, [coord])
    }
  }
  return pixelMap;
}


interact('.resizeable')
  .draggable({
    // enable inertial throwing
    // enable autoScroll
    autoScroll: true,

    // call this function on every dragmove event
    onmove: function(event){
      var target = event.target
      const top = parseInt($(target).css("top").replace('px','')) + event.dy;
      const left = parseInt($(target).css("left").replace('px','')) + event.dx;
      $('.right-up-resize , .right-down-resize').css('left', left);
      $('.left-down-resize , .right-down-resize').css('top', top);

      $('.frame-wrapper').css('width', left + 15);
      $('.frame-wrapper').css('height', top + 15);
      $('.frame-wrapper').css('width', left + 15);


    },
    onend: function (event) {
      const temp = ctx.getImageData(0,0,canvas.width,canvas.height)


      var target = event.target;
      const top = parseInt($(target).css("top").replace('px','')) + event.dy;
      const left = parseInt($(target).css("left").replace('px','')) + event.dx;
      canvas.width = left + 15;
      canvas.height = top + 15;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 6;
      ctx.putImageData(temp,0,0);
    }
  })