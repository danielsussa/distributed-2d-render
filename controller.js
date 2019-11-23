// A $( document ).ready() block.

$( document ).ready(function() {
    var isMenuHidden = false;
    $( ".menu-hide-btn" ).click(function() {
        if (isMenuHidden === false){
            $('.menu-container').animate({ 'margin-left': -400 + 'px'}, 600);
            $('.menu-hide').animate({ 'margin-left': -400 + 'px'}, 600);
            isMenuHidden = true;
        }else{
            $('.menu-container').animate({ 'margin-left': 0 + 'px'}, 600);
            $('.menu-hide').animate({ 'margin-left': 0 + 'px'}, 600);
            isMenuHidden = false;
        }

    });
});