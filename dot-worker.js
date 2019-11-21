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

function makeDot(){
    const vector = new Vector2D(Math.floor(Math.random() * 5000) , Math.floor(Math.random() * 5000));
    const color = new Color(200,200,200,0.3)
    self.postMessage(vector);
}

self.addEventListener('message', function(e) {
    makeDot();
    
  }, false);

