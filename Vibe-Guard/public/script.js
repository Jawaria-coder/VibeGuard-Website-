// to get current year
function getYear() {
  var currentDate = new Date();
  var currentYear = currentDate.getFullYear();
  document.querySelector("#displayYear").innerHTML = currentYear;
}

getYear();


// client section owl carousel
$(".client_owl-carousel").owlCarousel({
  loop: true,
  margin: 20,
  dots: false,
  nav: true,
  navText: [],
  autoplay: true,
  autoplayHoverPause: true,
  navText: [
      '<i class="fa fa-angle-left" aria-hidden="true"></i>',
      '<i class="fa fa-angle-right" aria-hidden="true"></i>'
  ],
  responsive: {
      0: {
          items: 1
      },
      600: {
          items: 2
      },
      1000: {
          items: 2
      }
  }
});



/* google_map js */
function myMap() {
  var mapProp = {
      center: new google.maps.LatLng(40.712775, -74.005973),
      zoom: 18,
  };
  var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}

$(document).ready(function() {
  $("#doctorSlideshow").owlCarousel({
    items: 3, // Number of items to show
    loop: true, // Loop the items
    margin: 30, // Space between items
    autoplay: true, // Enable autoplay
    autoplayTimeout: 3000, // Autoplay timeout (in ms)
    nav: false, // Disable navigation arrows
    dots: true, // Enable dots pagination
  });
});

//   funfact
$(document).ready(function () {
  $('.counter').each(function () {
      var $this = $(this);
      $this.prop('Counter', 0).animate({
          Counter: $this.data('count')
      }, {
          duration: 6000, // Increased duration (6 seconds)
          easing: 'swing',
          step: function (now) {
              $this.text(Math.ceil(now));
          }
      });
  });
});

//scrolling effect 
// Add 'scrolled' class to navbar on scroll
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

$(document).ready(function(){
  $('#doctorSlideshow').owlCarousel({
    loop: true,
    margin: 10,
    responsiveClass: true,
    responsive: {
      0: {
        items: 1,
        nav: true
      },
      600: {
        items: 3,
        nav: false
      },
      1000: {
        items: 4,
        nav: true,
        loop: false
      }
    }
  });
});

// script.js