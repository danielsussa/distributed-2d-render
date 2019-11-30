

export default function NewColorPicker($){
    const canvas = document.getElementById('color-picker-canvas')
    canvas.width = 180;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    ctx.scale(0.75, 0.75);
    var image = new Image();
    image.src = "./img_colormap.gif";
    // var myCanvasElem = $("#canvas").get(0);
    image.onload = function () 
   {
     ctx.drawImage(image, 0, 0, image.width, image.height);
   }



   $( ".color-picker" ).click(function(e) {
        var canvasOffset = $(this).offset();
        var canvasX = Math.floor(e.pageX - canvasOffset.left);
        var canvasY = Math.floor(e.pageY - canvasOffset.top);
        var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
        var pixel = imageData.data;    
        var pixelColor = "rgba("+pixel[0]+", "+pixel[1]+", "+pixel[2]+", "+pixel[3]+")";
        $('.color-selected').css('background-color', pixelColor);
        $( ".color-picker").trigger( "color", pixelColor );
    })

}