const canvasWidth = 1920;
const canvasHeight = 1080;

Array.prototype.shuffle = function() {
    var i = this.length, j, temp;
    if ( i == 0 ) return this;
    while ( --i ) {
       j = Math.floor( Math.random() * ( i + 1 ) );
       temp = this[i];
       this[i] = this[j];
       this[j] = temp;
    }
    return this;
  }

var sceneInfo = {
    surfaces:[],
    lights:[],
    vectors: [],
    vectorMap: new Map(),
    toRender: null
}

function transformAllVectorsInMap(){
    sceneInfo.vectorMap = new Map();
    for (v of sceneInfo.vectors){
        sceneInfo.vectorMap.set(`${v.x}_${v.y}`, v);
    }
}

function drawCircle(c){
    ctx.beginPath();
    ctx.arc(c.center.x, c.center.y, c.radius, 0, 2 * Math.PI, true);
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();
}

function debugDrawPixel(v){
    ctx.fillStyle = "#FF0000";
    ctx.fillRect( v.x, v.y, 1, 1 );
}

function debugLineRender(line){
    ctx.beginPath();
    const x1 = line.v1.x;
    const y1 = line.v1.y;
    const x2 = line.v2.x;
    const y2 = line.v2.y;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#FF0000";
    ctx.stroke();
}

function drawLine(raytrace){
    ctx.beginPath();
    const x1 = raytrace.line.v1.x;
    const y1 = raytrace.line.v1.y;
    const x2 = raytrace.line.v2.x;
    const y2 = raytrace.line.v2.y;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = 1;

    const max = 0.01;
    const min = 0.004;

    // newvalue= (max-min)*(value-1)+max

    const nStart = (max-min)*(raytrace.startPower-1)+max;
    const nEnd = (max-min)*(raytrace.endPower-1)+max;
    const middle  = (nStart - nEnd) / 2 + nEnd;
    let gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${nStart})`);
    gradient.addColorStop(0.1, `rgba(255, 255, 255, ${middle})`);
    gradient.addColorStop(1, `rgba(255, 255, 255, ${nEnd})`);
    ctx.strokeStyle = gradient;


    ctx.stroke();
}


//////////////// END OF CANVAS /////////////

function distance(v1, v2){
    return Math.sqrt(Math.pow(v1.x-v2.x, 2) + Math.pow(v1.y-v2.y, 2));
}

function getNewDirection(traceDir, colliderDirection){
    const n1 = (colliderDirection + 90) % 360;
    const n2 = (colliderDirection + 270) % 360;
    const normal = Math.abs(traceDir - n1) > Math.abs(traceDir - n2) ? n1 : n2;
    const inverseTrace = (traceDir + 180) % 360;
    return (inverseTrace + (normal - inverseTrace) * 2) % 360;
}


function Vector2D(x, y){
    this.x = x;
    this.y = y;
}

function Color(r, g, b, a){
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

function Line(v1, v2) {
    this.v1 = v1;
    this.v2 = v2;

}

function distanceFromVector(l,v){
    
    function getDistance(v1, v2){
        return Math.pow(v1.x - v2.x,2) + Math.pow(v1.y - v2.y, 2);
    }
    const d = getDistance(l.v1, l.v2);
    const x0 = v.x;
    const y0 = v.y;
    const x1 = l.v1.x;
    const y1 = l.v1.y;
    const x2 = l.v2.x;
    const y2 = l.v2.y;
    var t = ((x0 - x1) * (x2 - x1) + (y0 - y1) * (y2 - y1)) / d;
    t = Math.max(0, Math.min(1, t));
    const vt = new Vector2D(x1 + t * (x2 - x1),y1 + t * (y2 - y1));
    const distance = Math.sqrt(getDistance(v, vt));
    return distance;
}



function render(){
    // render lights
    sceneInfo.lights.forEach(x => {
        drawCircle(x);
    });
    const collidersVector = sceneInfo.vectors.filter(x => x.kind === 'surface' || x.kind === 'light');
    if (sceneInfo.toRender === null){
        // find all pixels that represent light
        const emmiterVector = sceneInfo.vectors.filter(x => x.kind === 'emmiter').shuffle();
        emmiterVector.forEach(emmiter => {
            function rayTrace(vStart, direction, power){   
                // end of line
                var x = vStart.x + (3000 * Math.cos(direction * Math.PI / 180));
                var y = vStart.y + (3000 * Math.sin(direction * Math.PI / 180));
                var vEnd = new Vector2D(x, y);
                var line = new Line(vStart, vEnd);
                
                // check if collide
                var minDistance = 10000;
                var colliderDirection = null;
                var colliderIsLight = false;
                var hasCollision = false;
                collidersVector
                    .filter(c => distanceFromVector(line, new Vector2D(c.x, c.y)) < 1)
                    .forEach(collider => {
                        // if the collider is the emmiter
                        const newDistance = distance(vStart, new Vector2D(collider.x, collider.y));
                        if (collider.x === emmiter.x && collider.y === emmiter.y && newDistance < 5){
                            return;
                        }
                        if (collider.kind === 'light'){
                            colliderIsLight = true;
                        }
                        hasCollision = true;
                        if (collider.direction !== undefined){
                            colliderDirection = collider.direction;
                        }
                        
                        if (newDistance < minDistance){
                            vEnd = new Vector2D(collider.x, collider.y);
                            line = new Line(vStart, vEnd);
                            minDistance = newDistance;
        
                        }
                })
                if (hasCollision && !colliderIsLight){
                    // force colliderDirection in case of fail
                    if (colliderDirection === null){
                        collidersVector.filter(s => distanceFromVector(line, new Vector2D(s.x, s.y)) < 5).forEach(s => {
                            if (s.direction !== undefined){
                                colliderDirection = s.direction;
                            }
                        });
                    }


                    function walkThrowCollider(vEnd, direction, isTransparent){
                        if (isTransparent === undefined){
                            isTransparent = true;
                        }
                        const vMap = sceneInfo.vectorMap.get(`${Math.floor(vEnd.x)}_${Math.floor(vEnd.y)}`);

                        if (vMap === undefined){
                            const finalVector = new Vector2D(Math.floor(vEnd.x), Math.floor(vEnd.y))
                            return {isTransparent: isTransparent, vEnd: finalVector, direction: direction};
                        }

                        const surface = sceneInfo.surfaces[vMap.index];
                        const transparency = surface.color.a / 255;

                        // this surface is solid
                        if (transparency > 0.8 && isTransparent){
                            direction = getNewDirection(direction, colliderDirection);
                            isTransparent = false;

                        }
                        return walkThrowCollider(move(vEnd, 0.1, direction), direction, isTransparent);
                    }
                    const rayTraceInfo = walkThrowCollider(vEnd, direction);

                     function calculatePower(line, currentPower){
                        const dist = distance(line.v1, line.v2);
                        const steps = dist / 50 < 1 ? 1 :  dist / 50;
                        for (var i = 0 ; i < steps ; i++){
                            currentPower = currentPower / 1.03;
                        } 
                        return currentPower;
                    }
                    line.v2 = rayTraceInfo.vEnd;
                    const newPower = calculatePower(line, power);
                    debugLineRender(line);
                    rayTrace(rayTraceInfo.vEnd, rayTraceInfo.direction, newPower);
                    return;
                }
                debugLineRender(line);
            }
            rayTrace(new Vector2D(emmiter.x, emmiter.y), emmiter.direction, 255);
        })
    }

    
}

function move(vector, distance, angle){
    const newX = vector.x + distance * Math.cos(angle * Math.PI / 180)
    const newY = vector.y + distance * Math.sin(angle * Math.PI / 180)
    return new Vector2D(newX, newY);
}


function extractDataFromSphereDOM(light){
    sceneInfo.lights.push(light);
    const idx = sceneInfo.lights.length - 1;


    // get all pixels
    for (var i = 0; i < 360; i+= 0.1){
        const direction = i;
        const radians = direction * Math.PI / 180;
        const x = light.center.x + (light.radius * Math.cos(radians));
        const y = light.center.y + (light.radius * Math.sin(radians));
        const v = {x: Math.floor(x), y: Math.floor(y),direction: direction , index: idx, kind: 'light'};
        if (i === 0){
            const e = {x: Math.floor(x), y: Math.floor(y),direction: direction , index: idx, kind: 'emmiter'};
            sceneInfo.vectors.push(e);
            sceneInfo.vectorMap.set(`${x}_${y}`, e);
        }
        sceneInfo.vectors.push(v);
        sceneInfo.vectorMap.set(`${x}_${y}`, v);
    }
}

function extractDataFromDrawDOM(drawMap){
    drawMap.forEach((values, key) => {
        const keySpl = key.split("/");
        const color = new Color(keySpl[0],keySpl[1], keySpl[2], keySpl[3]);
        sceneInfo.surfaces.push({color: color, kind: 'surface'});
        const idx = sceneInfo.surfaces.length - 1;
        for (value of values){
            var v = {x: value.x, y: value.y, index: idx, kind: 'surface'};
            if (value.direction !== undefined){
                v.direction = value.direction;
            }
            sceneInfo.vectors.push(v);
            sceneInfo.vectorMap.set(`${value.x}_${value.y}`, v);
        }
    })
}


onmessage = function(e) {
    if (e.data.canvas !== undefined){
        canvas = e.data.canvas;
        canvas.width = 1920;
        canvas.height = 1080;
        ctx = canvas.getContext("2d");
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        return;
    }
    if (e.data.lightSphere !== undefined){
        extractDataFromSphereDOM(e.data.lightSphere);
    }
    if (e.data.action === 'prepare'){
        extractDataFromDrawDOM(e.data.colliders);
        self.postMessage({action: 'send_data', data: sceneInfo});
    }
    if (e.data.action === 'loadJson'){
        sceneInfo = e.data.data;
        transformAllVectorsInMap();
        render();
    }
    if (e.data.action === 'render'){
        // this.console.log(JSON.stringify(sceneInfo))
        render();
    }
}