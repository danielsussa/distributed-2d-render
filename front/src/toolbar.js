var $ = null;

export function start(jquery){
    $ = jquery;

    $(".create-light").click(function () {
        $(".sphere-light-wrapper").removeClass("selectable");
        const selectableSphere = $("<div class='sphere-light-wrapper selectable'><div class='sphere-light'></div></div>");
        $( ".editor-stage" ).append(selectableSphere);
        $(selectableSphere).dblclick(function() {
            if ($(this).hasClass( "selectable" )){
                $(this).removeClass( "selectable" );
            }else{
                $(this).addClass( "selectable" );
            }
        });
    });

    $(".preview-render").click(function () {
        $(".editor-stage").fadeOut(showPreview);
        function showPreview(){
            $( "body").trigger( "prepare-draw-render");
        }
    })

    $( ".color-picker").on("color", function(e, color){
        $( ".selectable > .sphere-light" ).css("background-color", color);
    })
}




interact('.selectable')
  .draggable({
    // enable inertial throwing
    // enable autoScroll
    autoScroll: true,

    // call this function on every dragmove event
    onmove: function(event){
      var target = event.target
      const top = parseInt($(target).css("top").replace('px','')) + event.dy;
      const left = parseInt($(target).css("left").replace('px','')) + event.dx;
      $(target).css("top",top);
      $(target).css("left",left);
    }
})