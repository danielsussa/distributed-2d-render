var canvasWidth = 1920;
var canvasHeight = 1080;

function Objects(){
    this.objects = [];
    this.addObjects = function(obj){
        this.objects.push(obj);
    }
    this.getCollider = function(vector){
        this.objects.forEach(obj => {
            if (obj.hasCollision){
                return obj;
            }
        });
        return null;
    }
}

var photons = [];

function Photon(v, c, p, d){
    this.vector = v;
    this.color = c;
    this.power = p;
    this.direction = d;
    this.update = function(){
        this.vector = move(this.vector, 1, this.direction);
        self.postMessage({vector: this.vector, color: this.color});
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

function LightEmitter(vector, color, angle){
    this.vector = vector;
    this.color = color;
    this.angle = angle;
    this.raycast = function(){
        const minAngle = angle - 1;
        const maxAngle = angle + 1;

        for (var i = minAngle ; i < maxAngle ; i += 1){
            this.emmitPhotons(i);
        }
    }
    this.emmitPhotons = function(angle){
        var newVector = Object.assign(new Vector2D, vector);
        var collider = null;

        while (true) {
            var c = objects.getCollider(newVector);
            if (c != null){
                collider = c;
                break; 
            }
            if (newVector.x < 0 || newVector.y < 0 || newVector.x > canvasWidth || newVector.y > canvasHeight){
                break;
            }
            newVector = move(newVector, 1, angle);
            self.postMessage(JSON.stringify(new Photon(newVector, color)));
        }
        if (collider != null){
            console.log("achou")
        }
    }
}

function SphereLight(vector, radius, color){
    this.vector = vector;
    this.radius = radius;
    this.color = color;

    // this.createEmitters = function(){
    //     for (var i = 90 ; i < 181 ; i+=1){
    //         const x = Math.floor(vector.x + (radius * Math.cos(i)));
    //         const y = Math.floor(vector.y + (radius * Math.sin(i)));
    //         const e = new LightEmitter(new Vector2D(x, y), this.color, i);
    //         emmiters.push(e);
    //     }
    // }
    this.emmitPhoton = function(){
        const rndAngle = Math.random() * 360;
        const x = Math.floor(vector.x + (radius * Math.cos(rndAngle)));
        const y = Math.floor(vector.y + (radius * Math.sin(rndAngle)));
        const rndDirection = rndAngle + ((Math.random() * 300) - 150);
        const photon = new Photon(new Vector2D(x, y), color, 1, rndDirection);
        photons.push(photon);
    }

    // this.draw = function(){
    //     ctx.beginPath();
    //     ctx.arc(vector.x, vector.y, radius, 0, 2 * Math.PI, true);
    //     ctx.fillStyle = color.convert();
    //     ctx.fill();
    // }
    this.hasCollision = function(vector){
        return false;
    }
}

var objects = new Objects();


const lightSphere = new SphereLight(new Vector2D(1000,600), 30, new Color(200,200,200))
// lightSphere.draw();
// self.postMessage(JSON.stringify(lightSphere));

objects.addObjects(lightSphere)

console.log(photons)

self.addEventListener('message', function(e) {
    if (photons.length < 1000){
        lightSphere.emmitPhoton();
    }
    photons[Math.floor(Math.random() * photons.length)].update();

}, false);