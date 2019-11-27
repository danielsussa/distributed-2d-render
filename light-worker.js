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

function Objects(){
    this.objects = [];
    this.addObjects = function(obj){
        obj.render();
        this.objects.push(obj);
    }
    this.getCollider = function(line){
        var closeDistance = 10000;
        var colliderInfo = null;
        for (var obj of this.objects) {
            const vector = obj.pointOfIntersection(line);
            if (vector !== null){
                const d = distance(vector, line.v1);
                if (d < closeDistance && d > 0.1){
                    closeDistance = d;
                    colliderInfo = new ColliderInfo(obj, vector);
                }
            }
        }
        return colliderInfo;
    }
}

function ColliderInfo(obj, vector){
    this.object = obj;
    this.vector = vector;
}

var photons = [];

var raytraces = [];

function slope(v1, v2){
    return (v2.y - v1.y) / (v2.x - v1.x);
}

function getNewDirection(traceDir, colliderDirection){
    const n1 = (colliderDirection + 90) % 360;
    const n2 = (colliderDirection + 270) % 360;
    const normal = Math.abs(traceDir - n1) > Math.abs(traceDir - n2) ? n1 : n2;
    const inverseTrace = (traceDir + 180) % 360;
    return (inverseTrace + (normal - inverseTrace) * 2) % 360;
}

function reflectLine(line, currentDir){
    function degrees_to_radians(degrees){
        var pi = Math.PI;
        return degrees * (pi/180);
    }
    function radians_to_degrees(radians){
        var pi = Math.PI;
        return radians / (pi/180);
    }

    const tg = (line.v1.y - line.v2.y) / (line.v1.x - line.v2.x);
    const lineAngle = radians_to_degrees(Math.atan(tg)); // 45 graus
    const normal = lineAngle + radians_to_degrees(degrees_to_radians(90));
    const normalInv = lineAngle + radians_to_degrees(degrees_to_radians(270));
    const inversdeDir = radians_to_degrees(degrees_to_radians(currentDir) + degrees_to_radians(180)); //
    if (Math.abs(inversdeDir - normal) > Math.abs(inversdeDir - normalInv)){
        return inversdeDir - (inversdeDir - normalInv) * 2;
    }
    return (inversdeDir - normal) * 2 + inversdeDir;
}

function Raytrace(line, color, startPower, endPower){
    this.line = line;
    this.color = color;
    this.startPower = startPower;
    this.endPower = endPower;
} 

function Photon(v, c, p, d){
    this.id = JSON.stringify({v: v, d: d});
    this.vector = v;
    this.color = c;
    this.power = p;
    this.direction = d;
    this.raytrace = function(){
        var newVector = Object.assign(new Vector2D, this.vector);
        while(true){
            newVector = move(newVector, 20, this.direction);
            if (newVector.x < 0 || newVector.y < 0 || newVector.x > canvasWidth || newVector.y > canvasHeight){
                break;
            }
        }

        var line = new Line(this.vector, newVector);
        const colliderInfo = objects.getCollider(line);
        if (colliderInfo !== null){
            line = new Line(this.vector, colliderInfo.vector);
        }
        const startPower = this.power;
        this.power = this.calculatePower(this.vector, newVector, this.power);
        const raytrace = new Raytrace(line, this.color, startPower ,this.power);
        self.postMessage({kind: 'raytrace', raytrace: raytrace, total: photonId.length});

        if (colliderInfo !== null){
            this.direction = colliderInfo.object.reflectAngle(this.direction);
            this.power = colliderInfo.object.shade.absorption(this.power);
            this.vector = colliderInfo.vector;
            this.raytrace();
        }

    }
    this.calculatePower = function(v1, v2, currentPower){
        const dist = distance(v1, v2);
        const steps = dist / 50 < 1 ? 1 :  dist / 50;
        for (var i = 0 ; i < steps ; i++){
            currentPower = currentPower / 1.003;
        } 
        return currentPower;
    }
    function move(vector, distance, angle){
        const newX = vector.x + distance * Math.cos(angle * Math.PI / 180)
        const newY = vector.y + distance * Math.sin(angle * Math.PI / 180)
        return new Vector2D(newX, newY);
    }
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

function getLinesIntercection(l1, l2){
    const x1 = l1.v1.x;
    const y1 = l1.v1.y;
    const x2 = l1.v2.x;
    const y2 = l1.v2.y;

    const x3 = l2.v1.x;
    const y3 = l2.v1.y;
    const x4 = l2.v2.x;
    const y4 = l2.v2.y;

    const divisor = ((x1 - x2) * (y3 - y4)) - (y1 - y2) * (x3 - x4);

    const t = (((x1 - x3) * (y3 - y4)) - ((y1 - y3) * (x3 - x4))) / divisor;
    const u = (((x1 - x2) * (y1 - y3)) - ((y1 - y2) * (x1 - x3))) / divisor;

    const px = x1 + t * (x2 - x1);
    const py = y1 + t * (y2 - y1);


    if (t < 0 || t > 1 || u < -1 || u > 0){
        return null;
    }

    return new Vector2D(px, py);

}



function Shade(color, roughness, refraction){
    this.color = color;
    this.roughness = roughness;
    this.refraction = refraction;
    this.roughnessDeviation = function(){
        return (Math.random() * 300 - 150) * this.roughness;
    }
    this.absorption = function(power){
        return power - this.roughness;
    }
}


function PlaneCollider(line, shade){
    this.line = line;
    this.shade = shade;
    this.pointOfIntersection = function(line){
        return getLinesIntercection(this.line, line);
    }
    this.reflectAngle = function(direction){
        const newDirection = reflectLine(this.line, direction);
        return newDirection + this.shade.roughnessDeviation();
    }
    this.render = function(){
    }
}

var photonId = [];

function SphereLight(vector, radius, color){
    this.vector = vector;
    this.radius = radius;
    this.color = color;

    this.emmitPhoton = function(i){
        if (i == undefined){
            i = 0;
        }
        const rndAngle = (Math.random() * 360);
        // const rndAngle = 270;
        const radians = rndAngle * Math.PI / 180;
        const x = vector.x + (radius * Math.cos(radians));
        const y = vector.y + (radius * Math.sin(radians));
        const rndDirection = (rndAngle + ((Math.random() * 90) - 45)).toFixed(2);
        const photon = new Photon(new Vector2D(x, y), color, 1, rndDirection);

        if (photonId.indexOf(photon.id) !== -1){
            if (i > 10){
                return;
            }
            this.emmitPhoton(++i);
            return;
        }
        photonId.push(photon.id);
        photons.push(photon);
    }

    this.render = function(){
        ctx.beginPath();
        ctx.arc(this.vector.x, this.vector.y, this.radius, 0, 2 * Math.PI, true);
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.stroke();
    }
    this.reflectAngle = function(direction){
        return 90;
    }
    this.pointOfIntersection = function(line){
        return null;
    }
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