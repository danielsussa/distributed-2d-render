var lights = [];
var photons = [];

function createPhotons(light, i){
    for (var angle = 0; angle < 360 ; angle+=0.5){
        const radians = angle * Math.PI / 180;
        const x = light.vector.x + (light.size * Math.cos(radians));
        const y = light.vector.y + (light.size * Math.sin(radians));
        for (var direction = -45; direction < 45 ; direction+=1){
            const finalDirection = (angle + direction).toFixed(2);
            const photon = {vector:{x:x, y:y}, color:light.color, power:1, direction: finalDirection};
            photons.push(photon);
        }
    }
}

onmessage = function(e) {
    if (e.data.kind === 'createLight'){
        lights.push(e.data.light);
        createPhotons(e.data.light, 0);
    }
};