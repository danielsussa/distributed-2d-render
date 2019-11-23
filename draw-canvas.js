var canvas = document.getElementById('draw-canvas');
canvas.width = 1920;
canvas.height = 1080;
var ctx = canvas.getContext('2d');

var surfaceInfo = {
  
}

ctx.strokeStyle = "#fff";
ctx.lineWidth = 2;

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function mouseMove(evt) {
  var mousePos = getMousePos(canvas, evt);
  ctx.lineTo(mousePos.x, mousePos.y);
  ctx.stroke();
}

canvas.addEventListener('mousedown', function(evt) {
  var mousePos = getMousePos(canvas, evt);
  ctx.beginPath();
  ctx.moveTo(mousePos.x, mousePos.y);
  evt.preventDefault();
  canvas.addEventListener('mousemove', mouseMove, false);
});

canvas.addEventListener('mouseup', function() {
  canvas.removeEventListener('mousemove', mouseMove, false);
}, false);


var size = [1, 3, 5, 10, 15, 20];
var sizeNames = ['default', 'three', 'five', 'ten'];

$( ".color-slot" ).click(function() {
    $('.color-slot').removeClass('color-slot-selected');
    $(this).addClass('color-slot-selected');
    ctx.strokeStyle = $(this).css('backgroundColor');
});

$( ".line-size" ).click(function() {
  $('.line-size').removeClass('line-size-selected');
  $(this).addClass('line-size-selected');
  ctx.lineWidth = $(this).attr('id').replace('tickness_','')
});