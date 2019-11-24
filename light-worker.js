var canvasWidth = 1920;
var canvasHeight = 1080;
 

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

function Color(r, g, b){
    this.r = r;
    this.g = g;
    this.b = b;
}

function Line(v1, v2) {
    this.v1 = v1;
    this.v2 = v2;

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

var objects = new Objects();


// const lightSphere = new SphereLight(new Vector2D(400,600), 30, new Color(200,200,200))
// lightSphere.emmitPhoton();

// objects.addObjects(lightSphere);

const botton = new PlaneCollider(new Line(new Vector2D(0,0), new Vector2D(1920,0)), new Shade(new Color(200,200,200), 0.5, 0.0));
objects.addObjects(botton);

// const pc1 = new PlaneCollider(new Line(new Vector2D(200,300), new Vector2D(500,350)), new Shade(new Color(200,200,200), 0.3, 0.0));
// const pc2 = new PlaneCollider(new Line(new Vector2D(200,730), new Vector2D(350,710)), new Shade(new Color(200,200,200), 0.2, 0.0));
// objects.addObjects(pc1);
// objects.addObjects(pc2);




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
        const light = e.data.lightSphere;
        const lightSphere = new SphereLight(
            new Vector2D(light.center.x,light.center.y), 
            light.radius, 
            new Color(light.color.r,light.color.g,light.color.b)
        )
        objects.addObjects(lightSphere);
    }
    if (e.data.pixelMap !== undefined){
        // usar algoritmo de distancia entre um vetor e uma linha https://en.m.wikipedia.org/wiki/Distance_from_a_point_to_a_line
        // se ocorrer da distancia ser alta, descartar outros vetores proximos
    }
}