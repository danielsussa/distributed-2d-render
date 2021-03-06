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


var readyTraces = [];

function render(){
    // render lights
    sceneInfo.lights.forEach(x => {
        self.postMessage({action: 'drawSphereLight', data: x});
    });
    const collidersVector = sceneInfo.vectors.filter(x => x.kind === 'surface' || x.kind === 'light');
    if (sceneInfo.toRender === null){
        // find all pixels that represent light
        const emmiterVector = sceneInfo.vectors.filter(x => x.kind === 'emmiter' && x.status === 'waiting').shuffle().slice(0, 1000);
        emmiterVector.forEach(emmiter => {
            emmiter.status = 'finish';
            function rayTrace(vStart, direction, power, color){   
                // end of line
                var x = vStart.x + (3000 * Math.cos(direction * Math.PI / 180));
                var y = vStart.y + (3000 * Math.sin(direction * Math.PI / 180));
                var vEnd = new Vector2D(x, y);
                var line = new Line(vStart, vEnd);
                
                // check if collide
                var minDistance = 10000;
                var colliderDirection = null;
                var colliderIsLight = false;
                var newColor = color;
                var hasCollision = false;
                collidersVector
                    .filter(c => distanceFromVector(line, new Vector2D(c.x, c.y)) < 1)
                    .forEach(collider => {
                        // if the collider is the emmiter
                        const newDistance = distance(vStart, new Vector2D(collider.x, collider.y));
                        if (newDistance < 5){
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
                            const objColor = sceneInfo.surfaces[collider.index].color;
                            newColor = new Color(color.r * objColor.r / 255, color.g * objColor.g / 255, color.b * objColor.b /255, objColor.a);
                            vEnd = new Vector2D(collider.x, collider.y);
                            line = new Line(vStart, vEnd);
                            minDistance = newDistance;
        
                        }
                })

                function calculatePower(line, currentPower){
                    const dist = distance(line.v1, line.v2);
                    const steps = dist / 50 < 1 ? 1 :  dist / 50;
                    for (var i = 0 ; i < steps ; i++){
                        currentPower = currentPower / 1.03;
                    } 
                    return currentPower;
                }

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

                    var rayTraceInfo = null;
                    try{
                        rayTraceInfo = walkThrowCollider(vEnd, direction);
                    }catch(e){
                        console.log(e)
                        return;
                    }
                    line.v2 = rayTraceInfo.vEnd;
                    const newPower = calculatePower(line, power);
                    // self.postMessage({action: 'debugLineRender', data: line});
                    readyTraces.push({
                        line:line, 
                        color: color, 
                        startPower: power, 
                        endPower: newPower
                    })
                    rayTrace(rayTraceInfo.vEnd, rayTraceInfo.direction, newPower, newColor);
                    return;
                }
                const newPower = calculatePower(line, power);
                // self.postMessage({action: 'debugLineRender', data: line});
                readyTraces.push({
                    line:line, 
                    color: color, 
                    startPower: power, 
                    endPower: newPower
                })
            }
            rayTrace(new Vector2D(emmiter.x, emmiter.y), emmiter.direction, 1.0, sceneInfo.lights[emmiter.index].color);
        })
        self.postMessage({action: 'counter', data: {counter: readyTraces.length, total: emmiterVector.length}});
        self.postMessage({action: 'drawRaytrace', data: readyTraces});
        readyTraces = [];
    }

    
}

function move(vector, distance, angle){
    const newX = vector.x + distance * Math.cos(angle * Math.PI / 180)
    const newY = vector.y + distance * Math.sin(angle * Math.PI / 180)
    return new Vector2D(newX, newY);
}





var renderWorker = null;

onmessage = function(e) {
    if (e.data.action === 'loadJson'){
        sceneInfo = e.data.data;
        transformAllVectorsInMap();
        render();
    }
    if (e.data.action === 'preview-render'){
        sceneInfo = e.data.data;
        self.postMessage({action: 'ready'});
        render();
    }
    if (e.data.action === 'continue'){
        render();
    }
    if (e.data.action === 'interrupt'){
        toInterrupt = true;
    }
}