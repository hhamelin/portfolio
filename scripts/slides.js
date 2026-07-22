(() => {
  'use strict';

  let splideInstance = null;
  const overlayElement = document.getElementById('overlay');
  const slideshowWrapper = document.querySelector('.slideshow-wrapper');
  const splideList = document.querySelector('.splide__list');
  const slideshowLinksElement = document.querySelector('.slideshow-links');
  const slideshowDescElement = document.querySelector('.slideshow-description');

  let detectedFormats = [];

  function createMediaMarkup(mediaSrc, altText) {
    const ext = mediaSrc.substring(mediaSrc.lastIndexOf('.')).toLowerCase();
    if (ext === '.webm' || ext === '.mp4' || ext === '.ogg' || ext === '.mov') {
      let mimeType = 'video/mp4';
      if (ext === '.webm') mimeType = 'video/webm';
      else if (ext === '.ogg') mimeType = 'video/ogg';
      else if (ext === '.mov') mimeType = 'video/quicktime';

      return `<video controls autoplay muted playsinline preload="auto">
        <source src="${mediaSrc}" type="${mimeType}">
        Your browser does not support the video tag.
      </video>`;
    }

    if (ext === '.svg') {
      return `<img src="${mediaSrc}" alt="${altText}">`;
    }

    const base = mediaSrc.substring(0, mediaSrc.lastIndexOf('.'));
    let markup = '\n      <picture>';
    detectedFormats.forEach((f) => {
      markup += `\n        <source srcset="${base}${f.ext}" type="${f.type}">`;
    });
    markup += `\n        <img src="${mediaSrc}" alt="${altText}">\n      </picture>\n    `;
    return markup;
  }

  function pauseAllVideos() {
    if (splideList) {
      splideList.querySelectorAll('video').forEach((v) => {
        v.pause();
      });
    }
  }

  function playActiveSlideVideo() {
    if (!splideInstance) return;
    const slideObj = splideInstance.Components.Slides.getAt(splideInstance.index);
    if (slideObj && slideObj.slide) {
      const video = slideObj.slide.querySelector('video');
      if (video) {
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silently handle autoplay prevention if any
          });
        }
      }
    }
  }

  function overlayOn() {
    if (overlayElement) {
      overlayElement.classList.add('active');
      overlayElement.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('overlay-active');
  }

  function overlayOff() {
    pauseAllVideos();
    if (overlayElement) {
      overlayElement.classList.remove('active');
      overlayElement.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('overlay-active');
    if (splideInstance) {
      splideInstance.destroy();
      splideInstance = null;
    }
    if (splideList) {
      splideList.innerHTML = '';
    }
    if (slideshowLinksElement) {
      slideshowLinksElement.innerHTML = '';
    }
    if (slideshowDescElement) {
      slideshowDescElement.textContent = '';
    }
  }

  function startSlideshow(title, description, linksHTML, images) {
    if (!splideList || !slideshowDescElement) return;

    // Populate slides
    splideList.innerHTML = images
      .map(
        (imgSrc) => `
      <li class="splide__slide">
        ${createMediaMarkup(imgSrc, `${title} media`)}
      </li>
    `
      )
      .join('');

    // Populate links
    if (slideshowLinksElement) {
      slideshowLinksElement.innerHTML = linksHTML;
      slideshowLinksElement.querySelectorAll('a').forEach((a) => {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      });
    }

    // Populate description
    slideshowDescElement.textContent = description;

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
      gap: '3%',
      trimSpace: false,
      padding: hasMultiple ? { left: '4%', right: '4%' } : 0,
      breakpoints: {
        768: {
          padding: 0,
          gap: '1rem'
        }
      }
    });

    splideInstance.on('move', () => {
      pauseAllVideos();
    });

    splideInstance.on('mounted moved', () => {
      playActiveSlideVideo();
    });

    overlayOn();
    splideInstance.mount();
  }

  // Prevent clicks on interactive slideshow elements from closing the overlay
  if (slideshowWrapper) {
    slideshowWrapper.addEventListener('click', (event) => {
      // Prevent overlay close on interactive slideshow elements
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

  // Close overlay on X button click
  const closeBtn = document.getElementById('slideshow-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      overlayOff();
    });
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

      // Extract links HTML from .links
      const linksEl = projectContainer.querySelector('.links');
      const linksHTML = linksEl ? linksEl.innerHTML : '';

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

      startSlideshow(title, description, linksHTML, images);
    });
  });
})();
