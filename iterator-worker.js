self.addEventListener('message', function(e) {
    this.console.log(e.data)
    var i = e.data.i;
    self.postMessage(i++);
}, false);