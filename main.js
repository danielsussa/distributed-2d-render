const offscreen = document.querySelector('canvas').transferControlToOffscreen();
offscreen.width = 1920;
offscreen.height = 1024;

var renderWorker = new Worker('render-worker.js');
var lightWorker = new Worker('light-worker.js');

renderWorker.postMessage({canvas: offscreen}, [offscreen]);


var pixelsToRender = [];

lightWorker.addEventListener('message', function(e) {
    // worker.postMessage("start");
    // pixelsToRender.push(e.data);
    renderWorker.postMessage(e.data);

}, false);

renderWorker.addEventListener('message', function(e) {
    lightWorker.postMessage("start");
}, false);

lightWorker.postMessage("start");

