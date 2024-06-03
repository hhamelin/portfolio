function loadFrame(elem) {
    overlayOn()
    const iframe = document.createElement("iframe")
    iframe.className = "frame"
    iframe.src = "https://wasworld.xyz/projects/SburbAlchemy"
    iframe.scrolling = "no"
    document.getElementById("overlay").appendChild(iframe)
}

function overlayOn() {
    document.getElementById("overlay").style.display = "block";
  }

  function overlayOff() {
    document.getElementById("overlay").style.display = "none";
  }
