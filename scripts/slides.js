(() => {
  'use strict';

  let splideInstance = null;
  const overlayElement = document.getElementById('overlay');
  const slideshowWrapper = document.querySelector('.slideshow-wrapper');
  const slideshowTitleElement = document.querySelector('.slideshow-title');
  const splideList = document.querySelector('.splide__list');
  const slideshowLinksElement = document.querySelector('.slideshow-links');
  const slideshowDescElement = document.querySelector('.slideshow-description');

  let detectedFormats = [];

  // prettier-ignore
  const projectAliases = {
    'silly-sanctuary': 'pets',
    'sillysanctuary': 'pets',
    'myworkspace': 'workspace',
    'jester-jabs': 'jester',
    'snatching-sorcerers': 'sorcerers',
    'ghools-and-gunkheads': 'ghools-gunkheads',
    'the-corn-popper': 'corn-popper'
  };

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

    if (ext === '.svg' || ext === '.gif') {
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

  function overlayOff(fromHistory = false) {
    pauseAllVideos();
    const isAlreadyInactive = !overlayElement || !overlayElement.classList.contains('active');

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
    if (slideshowTitleElement) {
      slideshowTitleElement.textContent = '';
    }
    if (slideshowLinksElement) {
      slideshowLinksElement.innerHTML = '';
    }
    if (slideshowDescElement) {
      slideshowDescElement.textContent = '';
    }

    if (!fromHistory && !isAlreadyInactive) {
      const currentProjectId = getProjectIdFromUrl();
      if (currentProjectId) {
        history.replaceState(null, '', '#projects');
      }
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

    // Populate title
    if (slideshowTitleElement) {
      slideshowTitleElement.textContent = title;
    }

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
      gap: '2rem',
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

  function getProjectIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    let rawParam = params.get('project') || params.get('p') || params.get('slideshow');
    let id = null;

    if (rawParam) {
      id = rawParam.trim().toLowerCase();
      if (id.startsWith('project-')) {
        id = id.substring(8);
      }
    } else if (window.location.hash) {
      let hash = window.location.hash.substring(1).trim().toLowerCase();
      // Must explicitly start with 'project-' format (e.g. #project-multitimer)
      if (hash.startsWith('project-') && hash !== 'projects') {
        id = hash.substring(8);
      }
    }

    if (!id) return null;

    if (projectAliases[id]) {
      id = projectAliases[id];
    }

    return id;
  }

  function findProjectImage(projectId) {
    if (!projectId) return null;

    let img = document.querySelector(`.project img.image[data-project="${projectId}"]`);
    if (img) return img;

    const projectDiv = document.getElementById(`project-${projectId}`);
    if (projectDiv) {
      img = projectDiv.querySelector('img.image[data-project]');
      if (img) return img;
    }

    const allImgs = document.querySelectorAll('.project img.image[data-project]');
    for (const el of allImgs) {
      const dp = el.getAttribute('data-project').toLowerCase();
      if (dp === projectId || dp.replace(/-/g, '') === projectId.replace(/-/g, '')) {
        return el;
      }
    }

    return null;
  }

  function openSlideshowForImage(img, updateUrl = true) {
    const projectContainer = img.closest('.project');
    if (!projectContainer) return;

    let projectId = img.getAttribute('data-project');
    if (!projectId && projectContainer.id && projectContainer.id.startsWith('project-')) {
      projectId = projectContainer.id.substring(8);
    }

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

    if (updateUrl && projectId) {
      const currentTargetHash = `#project-${projectId}`;
      if (window.location.hash !== currentTargetHash) {
        history.pushState({ projectId }, '', currentTargetHash);
      }
    }
  }

  function cleanUrlQueryParamsAndSetHash(projectId) {
    const url = new URL(window.location.href);
    let searchChanged = false;

    if (url.searchParams.has('project')) {
      url.searchParams.delete('project');
      searchChanged = true;
    }
    if (url.searchParams.has('p')) {
      url.searchParams.delete('p');
      searchChanged = true;
    }
    if (url.searchParams.has('slideshow')) {
      url.searchParams.delete('slideshow');
      searchChanged = true;
    }

    const targetHash = `#project-${projectId}`;
    if (searchChanged || url.hash !== targetHash) {
      url.hash = targetHash;
      history.replaceState({ projectId }, '', url.toString());
    }
  }

  function checkUrlForProjectSlideshow(isInitialLoad = false) {
    const params = new URLSearchParams(window.location.search);
    const hasQueryParam = params.has('project') || params.has('p') || params.has('slideshow');

    const projectId = getProjectIdFromUrl();
    if (!projectId) return;

    if (hasQueryParam) {
      cleanUrlQueryParamsAndSetHash(projectId);
    }

    const img = findProjectImage(projectId);
    if (img) {
      const container = img.closest('.project');
      if (container) {
        const style = window.getComputedStyle(document.body);
        const navbarHeight = parseInt(style.getPropertyValue('--navbar-height'), 10) || 70;
        const position = container.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
          top: Math.max(0, position - navbarHeight - 20),
          behavior: isInitialLoad ? 'auto' : 'smooth'
        });
      }

      openSlideshowForImage(img, false);
    }
  }

  // Prevent clicks on interactive slideshow elements from closing the overlay
  if (slideshowWrapper) {
    slideshowWrapper.addEventListener('click', (event) => {
      const isInteractive =
        event.target.closest('img, video, picture') ||
        event.target.closest('.splide__arrow') ||
        event.target.closest('.splide__pagination') ||
        event.target.closest('.slideshow-title') ||
        event.target.closest('.slideshow-description') ||
        event.target.closest('.slideshow-links');

      if (isInteractive) {
        event.stopPropagation();
      }
    });
  }

  // Close overlay on background click
  if (overlayElement) {
    overlayElement.addEventListener('click', () => overlayOff(false));
  }

  // Close overlay on X button click
  const closeBtn = document.getElementById('slideshow-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      overlayOff(false);
    });
  }

  // Close overlay on Escape key press
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlayElement && overlayElement.classList.contains('active')) {
      overlayOff(false);
    }
  });

  // Bind project image clicks to launch the slideshow
  document.querySelectorAll('.project img.image[data-project]').forEach((img) => {
    img.addEventListener('click', () => {
      openSlideshowForImage(img, true);
    });
  });

  // Listen to popstate and hashchange for deep-linked direct open / navigation
  window.addEventListener('hashchange', () => {
    const projectId = getProjectIdFromUrl();
    if (projectId) {
      checkUrlForProjectSlideshow(false);
    } else if (overlayElement && overlayElement.classList.contains('active')) {
      overlayOff(true);
    }
  });

  window.addEventListener('popstate', () => {
    const projectId = getProjectIdFromUrl();
    if (projectId) {
      checkUrlForProjectSlideshow(false);
    } else if (overlayElement && overlayElement.classList.contains('active')) {
      overlayOff(true);
    }
  });

  // Check URL on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => checkUrlForProjectSlideshow(true));
  } else {
    setTimeout(() => checkUrlForProjectSlideshow(true), 50);
  }
})();
