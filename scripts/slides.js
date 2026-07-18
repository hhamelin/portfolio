(() => {
  'use strict';

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

  function startSlideshow(title, description, images) {
    if (!splideList || !descriptionElement) return;

    // Populate slides
    splideList.innerHTML = images
      .map(
        (imgSrc) => `
      <li class="splide__slide">
        <img src="${imgSrc}" alt="${title} screenshot">
      </li>
    `
      )
      .join('');

    // Populate description
    descriptionElement.textContent = description;

    // Mount/remount Splide
    if (splideInstance) {
      splideInstance.destroy();
    }

    const hasMultiple = images.length > 1;
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
      const projectContainer = img.closest('.project');
      if (!projectContainer) return;

      // Extract title from h3
      const titleEl = projectContainer.querySelector('h3');
      const title = titleEl ? titleEl.textContent.trim() : '';

      // Extract description from the .description paragraph
      const descEl = projectContainer.querySelector('.description');
      const description = descEl ? descEl.textContent.trim() : '';

      // Extract images: read data-images (comma separated), or fallback to the src
      const dataImages = img.getAttribute('data-images');
      const images = dataImages
        ? dataImages.split(',').map((src) => src.trim())
        : [img.getAttribute('src')];

      startSlideshow(title, description, images);
    });
  });
})();
