var canvas = document.getElementById("canvas");
canvas.width  = 5000;
canvas.height = 5000;
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var ctx = canvas.getContext("2d");
var canvasData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

function Objects(){
    this.objects = [];
    this.add = function(obj){
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

var objects = new Objects();

function Vector2D(x, y){
    this.x = x;
    this.y = y;
}

function Color(r, g, b, a){
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a === undefined ? a = 255 : a = a;

    this.convert = function(){
        return `rgb(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}


function Photon(vector, angle, power){

}


function LightEmitter(vector, color, angle){
    this.raycast = function(){
        const minAngle = angle - 40;
        const maxAngle = angle + 40;

        for (var i = minAngle ; i < maxAngle ; i += 1){
            this.makeLine(i);
        }
    }
    this.makeLine = function(angle){
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
        }
        if (collider != null){
            console.log("achou")
        }
        new drawLine(vector, newVector, color);
    }
    this.draw = function(){
        drawPixel(vector, new Color(255,0,0));
    }
}


function drawPixel(vector, color){
    ctx.beginPath();
    ctx.arc(vector.x, vector.y, 1, 2, 20 * Math.PI);
    ctx.fillStyle = color.convert();
    ctx.fill();
}

function SphereLight(vector, radius, color){
    this.vector = vector;
    this.radius = radius;
    this.color = color;

    this.createEmitters = function(){
        // X = r * cosine(angle)  
        // Y = r * sine(angle)
        for (var i = 0 ; i < 1 ; i+=1){
            const x = Math.floor(vector.x + (radius * Math.cos(i)));
            const y = Math.floor(vector.y + (radius * Math.sin(i)));
            const e = new LightEmitter(new Vector2D(x, y), this.color, i);
            e.raycast();
        }
        
    }

    this.draw = function(){
        ctx.beginPath();
        ctx.arc(vector.x, vector.y, radius, 0, 2 * Math.PI, true);
        ctx.fillStyle = color.convert();
        ctx.fill();
    }
    this.hasCollision = function(vector){
        return false;
    }
}

function makeDot(){    
    for (var i = 0; i< 1000; i++){
        const vector = new Vector2D(Math.floor(Math.random() * 5000) , Math.floor(Math.random() * 5000));
        const color = new Color(200,200,200,0.3)
        drawPixel(vector, color)
    }
    requestAnimationFrame(makeDot);
}
// makeDot()


const lightSphere = new SphereLight(new Vector2D(1000,1000), 100, new Color(200,200,200))
lightSphere.draw();
lightSphere.createEmitters();

objects.add(lightSphere)




function move(vector, distance, angle){
    const newX = vector.x + distance * Math.cos(angle * Math.PI / 180)
    const newY = vector.y + distance * Math.sin(angle * Math.PI / 180)
    return new Vector2D(newX, newY);
}


function drawLine(v1, v2, color){
    const c1 = color;
    const c2 = Object.assign({}, color);
    c2.a = 0.0;
    ctx.lineWidth = 1;
    var grad= ctx.createLinearGradient(v1.x, v1.y, v2.x, v2.y);
    grad.addColorStop(0, c1.convert());
    grad.addColorStop(1, c2.convert());

    ctx.strokeStyle = grad;

    ctx.beginPath();
    ctx.moveTo(v1.x,v1.y);
    ctx.lineTo(v2.x,v2.y);

    ctx.stroke();
}

new drawLine(new Vector2D(50,50), new Vector2D(300, 300), new Color(200,200,190))
