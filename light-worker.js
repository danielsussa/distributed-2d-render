var canvasWidth = 1920;
var canvasHeight = 1080;

function distance(v1, v2){
    return Math.sqrt(Math.pow(v1.x-v2.x, 2) + Math.pow(v1.y-v2.y, 2));
}

function Objects(){
    this.objects = [];
    this.addObjects = function(obj){
        obj.render();
        this.objects.push(obj);
    }
    this.getVectorOfCollider = function(line){
        var closeDistance = 10000;
        var vector = null;
        for (var obj of this.objects) {
            const v = obj.pointOfIntersection(line);
            if (v !== null){
                const d = distance(v, line.v1);
                if (d < closeDistance){
                    vector = v;
                    closeDistance = d;
                }
            }
        }
        return vector;
    }
}

var photons = [];

var raytraces = [];

function slope(v1, v2){
    return (v2.y - v1.y) / (v2.x - v1.x);
}


function Raytrace(line, color, distance){
    this.line = line;
    this.color = color;
    this.distance = distance;
}
function Photon(v, c, p, d){
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
        const vectorOfCollider = objects.getVectorOfCollider(line);
        if (vectorOfCollider !== null){
            line = new Line(this.vector, vectorOfCollider);
        }
    
        const raytrace = new Raytrace(line, this.color, this.distance);
        raytraces.push(raytrace);
        self.postMessage({kind: 'raytrace', raytrace: {line: raytrace.line}});
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
    console.log(l1, l2)
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

    const px = x1 + t * (x2 - x1);
    const py = y1 + t * (y2 - y1);


    if (t < 0 || t > 1){
        return null;
    }

    return new Vector2D(px, py);

}

function Shade(color, roughness, refraction){

}


function PlaneCollider(line, shade){
    this.line = line;
    this.shade = shade;
    this.pointOfIntersection = function(line){
        return getLinesIntercection(this.line, line);
    }
    this.render = function(){
        self.postMessage({kind: 'planeCollider', planeCollider: {v1: this.line.v1, v2: this.line.v2}});
    }
}

function SphereLight(vector, radius, color){
    this.vector = vector;
    this.radius = radius;
    this.color = color;

    this.emmitPhoton = function(){
        const rndAngle = 310;
        const radians = rndAngle * Math.PI / 180;
        const x = vector.x + (radius * Math.cos(radians));
        const y = vector.y + (radius * Math.sin(radians));
        const rndDirection = rndAngle + ((Math.random() * 180) - 90);
        const photon = new Photon(new Vector2D(x, y), color, 1, rndAngle);
        photons.push(photon);
    }

    this.render = function(){
        self.postMessage({kind: 'sphere', sphere: {vector: this.vector, radius: this.radius}});
    }
    this.pointOfIntersection = function(line){
        return null;
    }
}

var objects = new Objects();


const lightSphere = new SphereLight(new Vector2D(400,400), 30, new Color(200,200,200))
lightSphere.emmitPhoton();
// self.postMessage(JSON.stringify(lightSphere));

objects.addObjects(lightSphere);

const pc1 = new PlaneCollider(new Line(new Vector2D(200,100), new Vector2D(500,150)), new Shade(new Color(200,200,200), 0.0, 0.0));
const pc2 = new PlaneCollider(new Line(new Vector2D(200,200), new Vector2D(400,220)), new Shade(new Color(200,200,200), 0.0, 0.0));
objects.addObjects(pc1);
objects.addObjects(pc2);




self.addEventListener('message', function(e) {
    // if (photons.length < 1){
    //     lightSphere.emmitPhoton();
    // }
    const p = photons.pop();
    if (p !== undefined){
        p.raytrace();
    }
    
    //photons[Math.floor(Math.random() * photons.length)].raytrace();

}, false);