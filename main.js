const offscreen = document.querySelector('canvas').transferControlToOffscreen();
offscreen.width = 1920;
offscreen.height = 1024;

var renderWorker = new Worker('render-worker.js');
var worker = new Worker('light-worker.js');

renderWorker.postMessage({canvas: offscreen}, [offscreen]);

worker.addEventListener('message', function(e) {
    // worker.postMessage("start");
    renderWorker.postMessage({pixel: e.data});

}, false);

renderWorker.addEventListener('message', function(e) {
    worker.postMessage("start");
}, false);

worker.postMessage("start");

