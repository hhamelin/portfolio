const projectData = {
  travellin: {
    title: "travellin' sweet",
    description: "Managed a team of 8 recent graduates of varying disciplines to create an enjoyable, unified experience. Paid careful attention to create a game with intentional design for most player enjoyment and retention.",
    images: ["img/placeholder.svg"]
  },
  luddyverse: {
    title: "LUDDYVerse",
    description: "Worked diligently within a tight schedule on a demo for an XR experience for our school’s museum. Learned quickly and adapted often to conquer the many hurdles placed in our way. Kept up to date with our client’s expectations.",
    images: ["img/placeholder.svg"]
  },
  alchemy: {
    title: "Alchemy Calculator",
    description: "An interesting project, that evolved with me. When I first started it, I was learning this (at the time) new game engine, \"Godot\". I had a fun time learning the ins and outs of its UI systems. But at some point, I decided I wanted to move it on to the web, where it would be more useful. Godot at that time was not well-equipped to handle web exports, so I decided to rewrite the code in JavaScript. This gave me a chance to dust off my JavaScript skills, and find out how to create this kind of reactive embeddable application in vanilla JS.",
    images: [
      "img/alchemy.png",
      "img/alchemy.png",
      "img/alchemy.png"
    ]
  },
  jester: {
    title: "Jester Jabs",
    description: "Crafted a social experience using vibrant art and a publicly available dataset. Resolved bugs and merge conflicts in time-sensitive situations.",
    images: ["img/jester_jabs.png"]
  },
  sorcerers: {
    title: "Snatching Sorcerers",
    description: "Planned/executed the successful creation of a game with a small team in a short time span. Created an engaging and memorable experience based on a provided theme.",
    images: ["img/sorcerers.png"]
  }
};

let splideInstance = null;
const overlayElement = document.getElementById("overlay");

function startSlideshow(projectId) {
  const data = projectData[projectId];
  if (!data) return;

  const splideList = document.querySelector('.splide__list');
  const descriptionElement = document.querySelector('.click-overrider');

  // Populate slides
  splideList.innerHTML = data.images.map(imgSrc => `
    <li class="splide__slide">
      <img src="${imgSrc}" alt="${data.title} screenshot">
    </li>
  `).join('');
  
  // Populate description
  descriptionElement.textContent = data.description;

  // Mount/remount Splide
  if (splideInstance) {
    splideInstance.destroy();
  }
  
  const hasMultiple = data.images.length > 1;
  splideInstance = new Splide('.splide', {
    type: hasMultiple ? 'loop' : 'slide',
    arrows: hasMultiple,
    pagination: hasMultiple,
    perPage: 1,
    autoWidth: true,
    gap: '8%',
    trimSpace: false,
    padding: { left: '18%', right: '20%' }
  });
  
  splideInstance.mount();
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
