new Splide( '.splide', {
  type: 'loop',
  perpage: 1,
  autoWidth: true,
  gap: '8%',
  trimSpace: false,
  padding: { left: '18%', right: '20%' }
} ).mount();

var overlayElement = document.getElementById("overlay")

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
}

/*
function loadFrame(frame) {
    overlayOn()
    const iframe = document.createElement("iframe")
    iframe.id = "frame"
    iframe.src = "https://wasworld.xyz/projects/" + frame
    iframe.scrolling = "no"
    document.getElementById("overlay").appendChild(iframe)
}
*/

function startSlideshow(slideshow) {
  //var slideshow = createSlideshowElement(slideshow);
  //slideshow.id = "slideshow";
  overlayOn();
}

function overlayOn() {
    overlayElement.style.display = "block";
    document.body.style.overflow = "hidden";
}

function overlayOff() {
  overlayElement.style.display = "none";
  document.body.style.overflow = "";
}
