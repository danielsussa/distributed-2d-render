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
        const collider = objects.getCollider(this.vector);
        if (collider !== null){
            console.log(collider)
        }
        self.postMessage({kind: 'photon', pixel: {vector: this.vector, color: this.color}});
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

// function LightEmitter(vector, color, angle){
//     this.vector = vector;
//     this.color = color;
//     this.angle = angle;
//     this.raycast = function(){
//         const minAngle = angle - 1;
//         const maxAngle = angle + 1;

//         for (var i = minAngle ; i < maxAngle ; i += 1){
//             this.emmitPhotons(i);
//         }
//     }
//     this.emmitPhotons = function(angle){
//         var newVector = Object.assign(new Vector2D, vector);
//         var collider = null;

//         while (true) {
//             var c = objects.getCollider(newVector);
//             if (c != null){
//                 collider = c;
//                 break; 
//             }
//             if (newVector.x < 0 || newVector.y < 0 || newVector.x > canvasWidth || newVector.y > canvasHeight){
//                 break;
//             }
//             newVector = move(newVector, 1, angle);
//             self.postMessage(JSON.stringify(new Photon(newVector, color)));
//         }
//         if (collider != null){
//             console.log("achou")
//         }
//     }
// }

function Shade(color, roughness, refraction){

}

function PhotonKiller(vector1, vector2){
    this.vector1 = vector1;
    this.vector2 = vector2;
    this.hasCollision = function(vector){
        return onSegment(this.vector1, this.vector2, vector);
    }
}

function Plane(vector1, vector2, shade){
    this.vector1 = vector1;
    this.vector2 = vector2;
    this.shade = shade;
    this.hasCollision = function(vector){
        return false;
    }
}

function SphereLight(vector, radius, color){
    this.vector = vector;
    this.radius = radius;
    this.color = color;

    this.emmitPhoton = function(){
        const rndAngle = Math.random() * 360;
        const radians = rndAngle * Math.PI / 180;
        const x = vector.x + (radius * Math.cos(radians));
        const y = vector.y + (radius * Math.sin(radians));
        const rndDirection = rndAngle + ((Math.random() * 180) - 90);
        const photon = new Photon(new Vector2D(x, y), color, 1, rndDirection);
        photons.push(photon);
    }

    this.render = function(){
        self.postMessage({kind: 'sphere', sphere: {vector: this.vector, radius: this.radius}});
    }
    this.hasCollision = function(vector){
        return false;
    }
}

var objects = new Objects();


const lightSphere = new SphereLight(new Vector2D(800,600), 30, new Color(200,200,200))
lightSphere.render();
// self.postMessage(JSON.stringify(lightSphere));

objects.addObjects(lightSphere);
objects.addObjects(new PhotonKiller(new Vector2D(0,0), new Vector2D(canvasWidth,0)));
objects.addObjects(new PhotonKiller(new Vector2D(canvasWidth,0), new Vector2D(canvasWidth,canvasHeight)));
objects.addObjects(new PhotonKiller(new Vector2D(0,0), new Vector2D(0,canvasHeight)));
objects.addObjects(new PhotonKiller(new Vector2D(0,canvasHeight), new Vector2D(canvasWidth,canvasHeight)));

function onSegment(p, q, r) { 
    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) return true; 
    return false; 
} 


self.addEventListener('message', function(e) {
    if (photons.length < 5){
        lightSphere.emmitPhoton();
    }
    photons[Math.floor(Math.random() * photons.length)].update();

}, false);