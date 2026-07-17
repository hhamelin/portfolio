(() => {
  'use strict';

  const projectData = {
    travellin: {
      title: "travellin' sweet",
      description:
        'Managed a team of 8 recent graduates of varying disciplines to create an enjoyable, unified experience. Paid careful attention to create a game with intentional design for most player enjoyment and retention.',
      images: ['img/placeholder.svg']
    },
    luddyverse: {
      title: 'LUDDYVerse',
      description:
        'Worked diligently within a tight schedule on a demo for an XR experience for our school’s museum. Learned quickly and adapted often to conquer the many hurdles placed in our way. Kept up to date with our client’s expectations.',
      images: ['img/placeholder.svg']
    },
    alchemy: {
      title: 'Alchemy Calculator',
      description:
        'An interesting project, that evolved with me. When I first started it, I was learning this (at the time) new game engine, "Godot". I had a fun time learning the ins and outs of its UI systems. But at some point, I decided I wanted to move it on to the web, where it would be more useful. Godot at that time was not well-equipped to handle web exports, so I decided to rewrite the code in JavaScript. This gave me a chance to dust off my JavaScript skills, and find out how to create this kind of reactive embeddable application in vanilla JS.',
      images: ['img/alchemy.png', 'img/alchemy.png', 'img/alchemy.png']
    },
    jester: {
      title: 'Jester Jabs',
      description:
        'Crafted a social experience using vibrant art and a publicly available dataset. Resolved bugs and merge conflicts in time-sensitive situations.',
      images: ['img/jester_jabs.png']
    },
    sorcerers: {
      title: 'Snatching Sorcerers',
      description:
        'Planned/executed the successful creation of a game with a small team in a short time span. Created an engaging and memorable experience based on a provided theme.',
      images: ['img/sorcerers.png']
    }
  };

  let splideInstance = null;
  const overlayElement = document.getElementById('overlay');
  const slideshowWrapper = document.querySelector('.slideshow-wrapper');
  const splideList = document.querySelector('.splide__list');
  const descriptionElement = document.querySelector('.click-overrider');

  function overlayOn() {
    if (overlayElement) {
      overlayElement.classList.add('active');
    }
    document.body.classList.add('overlay-active');
  }

  function overlayOff() {
    if (overlayElement) {
      overlayElement.classList.remove('active');
    }
    document.body.classList.remove('overlay-active');
  }

  function startSlideshow(projectId) {
    const data = projectData[projectId];
    if (!data || !splideList || !descriptionElement) return;

    // Populate slides
    splideList.innerHTML = data.images
      .map(
        (imgSrc) => `
      <li class="splide__slide">
        <img src="${imgSrc}" alt="${data.title} screenshot">
      </li>
    `
      )
      .join('');

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

  // Prevent clicks on interactive slideshow elements from closing the overlay
  if (slideshowWrapper) {
    slideshowWrapper.addEventListener('click', (event) => {
      // Only stop propagation if clicking interactive components:
      // the slide viewport track, control arrows, pagination dots, or the description box.
      const isInteractive =
        event.target.closest('.splide__track') ||
        event.target.closest('.splide__arrow') ||
        event.target.closest('.splide__pagination') ||
        event.target.closest('.click-overrider');

      if (isInteractive) {
        event.stopPropagation();
      }
    });
  }

  // Close overlay on background click
  if (overlayElement) {
    overlayElement.addEventListener('click', overlayOff);
  }

  // Bind project image clicks to launch the slideshow
  document.querySelectorAll('.project img.image[data-project]').forEach((img) => {
    img.addEventListener('click', () => {
      const projectId = img.getAttribute('data-project');
      if (projectId) {
        startSlideshow(projectId);
      }
    });
  });
})();
