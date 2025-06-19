new Splide( '.splide', {
  type: 'loop',
  perpage: 1,
  autoWidth: true,
  gap: '8%',
  trimSpace: false,
  padding: { left: '18%', right: '20%' }
} ).mount();

var overlayElement = document.getElementById("overlay")

function startSlideshow(slideshow) {
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
