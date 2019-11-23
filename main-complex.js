const offscreen = document.querySelector('canvas').transferControlToOffscreen();
offscreen.width = 1920;
offscreen.height = 1024;

var renderWorker = new Worker('render-worker.js');
var lightWorker = new Worker('light-worker.js');

renderWorker.postMessage({canvas: offscreen}, [offscreen]);


var pixelsToRender = [];

var rayCounter = 0;

lightWorker.addEventListener('message', function(e) {
    
    if (e.data.kind == 'raytrace'){
        $("#ray_counter").html(`<b>${rayCounter}</b>`)
        rayCounter = e.data.total;
    }

}, false);

renderWorker.addEventListener('message', function(e) {
    lightWorker.postMessage("start");
    if (e.data.blob !== undefined){
        var fd = new FormData();
        fd.append('fname', 'data.jpg');
        fd.append('file', e.data.blob);
        $.ajax({
            type: 'POST',
            url: 'http://localhost:8080/image',
            data: fd,
            processData: false,
            contentType: false
        }).done(function(data) {
            var img = new Image();
            img.onload = function() { 
                renderWorker.postMessage({kind: 'render'});
             };
            img.src = 'https://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png';
            // renderWorker.postMessage({kind: 'render', file: data});
        });
    }
}, false);

lightWorker.postMessage("start");

