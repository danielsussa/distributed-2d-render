raycast = function(){
    const minAngle = angle - 40;
    const maxAngle = angle + 40;

    for (var i = minAngle ; i < maxAngle ; i += 1){
        this.makeLine(i);
    }
}

makeLine = function(angle){
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

console.log(photons)

self.addEventListener('message', function(e) {

}, false);