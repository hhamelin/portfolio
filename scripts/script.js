function scrollToAchor(where) {
  var element = document.getElementById(where);
  var position = element.offsetTop;
  window.scrollTo({top:(position-100), behavior: 'smooth'});
}

function loadFrame(which) {
    overlayOn()
    const iframe = document.createElement("iframe")
    iframe.id = "frame"
    iframe.src = "https://wasworld.xyz/projects/" + which
    iframe.scrolling = "no"
    document.getElementById("overlay").appendChild(iframe)
}

function overlayOn() {
    document.getElementById("overlay").style.display = "block";
  }

  function overlayOff() {
    document.getElementById('overlay').style.display = "none";
    document.getElementById('frame').remove()
  }
