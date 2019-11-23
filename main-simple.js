const offscreen = document.querySelector('canvas').transferControlToOffscreen();
offscreen.width = 1920;
offscreen.height = 1024;

var renderWorker = new Worker('render-worker.js');
var lightWorker = new Worker('light-worker.js');
var backendWorker = new Worker('backend-worker.js');

renderWorker.postMessage({canvas: offscreen}, [offscreen]);


var pixelsToRender = [];

var rayCounter = 0;

$( ".fa-sun" ).click(function() {
    $( ".wireframe-sphere-light" ).clone().appendTo("body").show();
})

lightWorker.addEventListener('message', function(e) {
    
    if (e.data.kind == 'raytrace'){
        $("#ray_counter").html(`<b>${rayCounter}</b>`)
        rayCounter = e.data.total;
    }
    renderWorker.postMessage(e.data);

}, false);

renderWorker.addEventListener('message', function(e) {
    lightWorker.postMessage("start");
}, false);

lightWorker.postMessage("start");

