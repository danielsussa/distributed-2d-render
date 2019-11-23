const canvasOffscreen = document.getElementById('light-canvas').transferControlToOffscreen();

const canvasHeight = 1080;

canvasOffscreen.width = 1920;
canvasOffscreen.height = canvasHeight;

var lightWorker = new Worker('light-worker.js');

lightWorker.postMessage({canvas: canvasOffscreen}, [canvasOffscreen]);


var rayCounter = 0;

$( ".render-wrapper" ).click(function() {
    // hide canvas

    var spheres = [];
    // collect all lights
    var sphereLightsDOM = $( ".wireframe-sphere-light");
    for (let sphereDOM of sphereLightsDOM) {
        const sphere = {
            id: $(sphereDOM).attr('id'), 
            radius: getSphereRadius(sphereDOM), 
            color: convertColor(sphereDOM), 
            center: getCenterOfSphere(sphereDOM)
        }
        lightWorker.postMessage({lightSphere:sphere})
    } 
    $(".frame-draw").fadeOut();
    $(".light-element").fadeOut();
})

function convertColor(dom){
    const bg = $(dom).css("background-color");
    const arr = bg.replace(/^(rgb|rgba)\(/,'').replace(/\)$/,'').replace(/\s/g,'').split(',');
    return {r: arr[0], g: arr[1], b: arr[2]}
}

function getSphereRadius(dom){
    const diameter = parseInt($(dom).css("width").replace('px',''));
    return diameter/2;
}
function getCenterOfSphere(dom){
    const top = parseInt($(dom).css("top").replace('px',''));
    const left = parseInt($(dom).css("left").replace('px',''));
    const diameter = parseInt($(dom).css("width").replace('px',''));
    const x = left + diameter / 2;
    const y = canvasHeight - top - diameter / 2;
    return {x: x, y: y};
}

lightWorker.addEventListener('message', function(e) {
    if (e.data.kind == 'raytrace'){
        $("#ray_counter").html(`<b>${rayCounter}</b>`)
        rayCounter = e.data.total;
    }

}, false);


