//
// Initialize all the things
//

(function($) {
  $(document).ready(function(){
    // Navigational Menu ddsmoothmenu
    ddsmoothmenu.init({
      mainmenuid: "menu", //menu DIV id
      orientation: 'h', //Horizontal or vertical menu: Set to "h" or "v"
      classname: 'navigation', //class added to menu's outer DIV
      //customtheme: ["#1c5a80", "#18374a"],
      contentsource: "markup" //"markup" or ["container_id", "path_to_menu_file"]
    });

    // add js class to html tag
    $('html').addClass('js');

    // responsive navigation
    selectnav('nav', {
      label: '- Navigation Menu - ',
      nested: true,
      indent: '-',
      autoselect: false
    });
  });

  // Adding a colortip to any tag with a data-tooltip attribute:
  $('[data-tooltip]').colorTip({color:'white'});


  $(window).load(function() {
    // Flex Slider
    $('.flexslider').flexslider({
      animation: 'fade',
      animationLoop: true,             //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
      slideshow: true,                //Boolean: Animate slider automatically
      slideshowSpeed: 4500,           //Integer: Set the speed of the slideshow cycling, in milliseconds
      animationSpeed: 700,             //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
      pauseOnHover: true,
      pauseOnAction:false,
      controlNav: true,
      directionNav: false,
      controlsContainer: '.flex-container'
    });

    $('.flexslider2').flexslider({
      animation: 'slide',
      animationLoop: true,             //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
      slideshow: true,                //Boolean: Animate slider automatically
      slideshowSpeed: 4500,           //Integer: Set the speed of the slideshow cycling, in milliseconds
      animationSpeed: 700,             //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
      pauseOnHover: true,
      pauseOnAction:false,
      controlNav: false,
      directionNav: true,
      controlsContainer: '.flex-container'
    });

    $('.flexslider3').flexslider({
      animation: 'slide',
      animationLoop: true,             //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
      slideshow: false,                //Boolean: Animate slider automatically
      slideshowSpeed: 4500,           //Integer: Set the speed of the slideshow cycling, in milliseconds
      animationSpeed: 700,             //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
      pauseOnHover: true,
      pauseOnAction:false,
      controlNav: false,
      directionNav: true,
      controlsContainer: '.flex-container'
    });


  });

})(jQuery);


