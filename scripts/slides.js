(() => {
  'use strict';

  let splideInstance = null;
  const overlayElement = document.getElementById('overlay');
  const slideshowWrapper = document.querySelector('.slideshow-wrapper');
  const splideList = document.querySelector('.splide__list');
  const descriptionElement = document.querySelector('.click-overrider');

  let detectedFormats = [];

  function createPictureMarkup(imgSrc, altText) {
    if (imgSrc.endsWith('.svg')) {
      return `<img src="${imgSrc}" alt="${altText}">`;
    }
    const base = imgSrc.substring(0, imgSrc.lastIndexOf('.'));
    let markup = '\n      <picture>';
    detectedFormats.forEach((f) => {
      markup += `\n        <source srcset="${base}${f.ext}" type="${f.type}">`;
    });
    markup += `\n        <img src="${imgSrc}" alt="${altText}">\n      </picture>\n    `;
    return markup;
  }

  function overlayOn() {
    if (overlayElement) {
      overlayElement.classList.add('active');
      overlayElement.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('overlay-active');
  }

  function overlayOff() {
    if (overlayElement) {
      overlayElement.classList.remove('active');
      overlayElement.setAttribute('aria-hidden', 'true');
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
        ${createPictureMarkup(imgSrc, `${title} screenshot`)}
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
      focus: 'center',
      autoWidth: true,
      gap: '8%',
      trimSpace: false,
      padding: hasMultiple ? { left: '10%', right: '10%' } : 0,
      breakpoints: {
        768: {
          padding: 0,
          gap: '1rem'
        }
      }
    });

    overlayOn();
    splideInstance.mount();
  }

  // Prevent clicks on interactive slideshow elements from closing the overlay
  if (slideshowWrapper) {
    slideshowWrapper.addEventListener('click', (event) => {
      // Only stop propagation if clicking interactive components:
      // individual slide elements, control arrows, pagination dots, or the description box.
      const isInteractive =
        event.target.closest('.splide__slide') ||
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

  // Close overlay on Escape key press
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlayElement && overlayElement.classList.contains('active')) {
      overlayOff();
    }
  });

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

      // Extract formats from the main image's parent <picture> element if it exists
      detectedFormats = [];
      const parentPicture = img.parentElement;
      if (parentPicture && parentPicture.tagName.toLowerCase() === 'picture') {
        parentPicture.querySelectorAll('source').forEach((source) => {
          const type = source.getAttribute('type');
          const srcset = source.getAttribute('srcset');
          if (type && srcset) {
            const ext = srcset.substring(srcset.lastIndexOf('.'));
            detectedFormats.push({ type, ext });
          }
        });
      }

      // Extract images: read data-images (comma separated), or fallback to the src
      const dataImages = img.getAttribute('data-images');
      const images = dataImages
        ? dataImages.split(',').map((src) => src.trim())
        : [img.getAttribute('src')];

      startSlideshow(title, description, images);
    });
  });
})();
