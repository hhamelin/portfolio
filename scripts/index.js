var clickOverrides = []
clickOverrides = clickOverrides.concat([].slice.call(document.getElementsByClassName("click-overrider")), [].slice.call(document.getElementsByClassName("is-active")), [].slice.call(document.getElementsByClassName("splide__arrow"))) ;

Array.from(clickOverrides).forEach(element => {
  console.log(element)
  element.onclick = function(event) {
    event.stopPropagation();
  };
});

function scrollToAchor(where) {
  var style = window.getComputedStyle(document.body)
  var navbarHeight = parseInt(style.getPropertyValue('--navbar-height'), 10);
  var element = document.getElementById(where);
  var position = element.offsetTop;
  var offset
  where == 'projects' ? offset = 66 : offset = 0;
  var scrollDistance = navbarHeight - offset
  window.scrollTo({top:(position-scrollDistance), behavior: 'smooth'});
  toggleNav();
}

function toggleNav() {
    var x = document.getElementById("navbar");
    if (x.className === "") {
        x.className += "responsive";
    } else {
        x.className = "";
    }
}