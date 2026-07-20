(() => {
  'use strict';

  const navbar = document.getElementById('navbar');
  const navToggleBtn = document.getElementById('nav-toggle');
  const navLinks = document.querySelectorAll('nav ul.nav-links li a[data-target]');
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('nav ul.nav-links li');

  let isScrollingProgrammatically = false;
  let scrollTimeout = null;

  // Smooth Scroll to Anchor with Navbar Offset
  function scrollToAnchor(targetId) {
    const style = window.getComputedStyle(document.body);
    const navbarHeight = parseInt(style.getPropertyValue('--navbar-height'), 10);
    const element = document.getElementById(targetId);
    if (!element) return;

    const position = element.getBoundingClientRect().top + window.scrollY;
    const offset = targetId === 'projects' ? 66 : 0;
    const scrollDistance = navbarHeight - offset;

    // Immediately highlight correct navigation item and lock scroll-spy updates
    isScrollingProgrammatically = true;
    navItems.forEach((item) => {
      const link = item.querySelector('a');
      if (link && link.getAttribute('data-target') === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    window.scrollTo({
      top: position - scrollDistance,
      behavior: 'smooth'
    });

    closeNav();

    // Reset lock after smooth scrolling completes
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = setTimeout(() => {
      isScrollingProgrammatically = false;
    }, 800);
  }

  // Navigation menu toggling
  function toggleNav() {
    if (window.innerWidth <= 992 && navbar) {
      navbar.classList.toggle('responsive');
    }
  }

  function closeNav() {
    if (window.innerWidth <= 992 && navbar) {
      navbar.classList.remove('responsive');
    }
  }

  // Attach toggle navigation event listener
  if (navToggleBtn) {
    navToggleBtn.addEventListener('click', toggleNav);
  }

  // Navigation link click event listeners
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('data-target');
      if (targetId) {
        scrollToAnchor(targetId);
      }
    });
  });

  // Intersection Observer for scroll-spy functionality
  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger when section occupies the middle of viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    // Skip updates during programmatic smooth scrolls to prevent flashing animations on intermediate links
    if (isScrollingProgrammatically) return;

    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navItems.forEach((item) => {
          const link = item.querySelector('a');
          if (link && link.getAttribute('data-target') === activeId) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  // Parallax Background Effect
  const heroParallax = document.querySelector('.hero-parallax');
  const parallaxLayers = document.querySelectorAll('.parallax-layer');
  const parallaxToggleBtn = document.getElementById('parallax-toggle');

  if (heroParallax && parallaxLayers.length > 0) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    let scrollY = window.scrollY;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let isMouseActive = false;
    let heroHeight = 0;
    let scaleFactor = 1;
    let isAnimating = false;

    let isParallaxUserDisabled = false;
    try {
      isParallaxUserDisabled = localStorage.getItem('parallax-disabled') === 'true';
    } catch {
      isParallaxUserDisabled = false;
    }

    // Depth and fade configurations for layers 1 (sky) through 6 (foreground)
    const layersConfig = [
      { scrollFactor: 0.02, mouseFactorX: -2, mouseFactorY: -1, fadeDist: 1300 },
      { scrollFactor: 0.05, mouseFactorX: -4, mouseFactorY: -2, fadeDist: 1150 },
      { scrollFactor: 0.15, mouseFactorX: -10, mouseFactorY: -5, fadeDist: 1000 },
      { scrollFactor: 0.3, mouseFactorX: -20, mouseFactorY: -10, fadeDist: 850 },
      { scrollFactor: 0.5, mouseFactorX: -35, mouseFactorY: -18, fadeDist: 700 },
      { scrollFactor: 0.75, mouseFactorX: -55, mouseFactorY: -28, fadeDist: 600 }
    ];

    function updateToggleButtonUI() {
      if (!parallaxToggleBtn) return;
      if (isParallaxUserDisabled) {
        parallaxToggleBtn.classList.add('disabled');
        parallaxToggleBtn.setAttribute('aria-checked', 'false');
      } else {
        parallaxToggleBtn.classList.remove('disabled');
        parallaxToggleBtn.setAttribute('aria-checked', 'true');
      }
    }

    updateToggleButtonUI();

    if (parallaxToggleBtn) {
      parallaxToggleBtn.addEventListener('click', () => {
        isParallaxUserDisabled = !isParallaxUserDisabled;
        try {
          localStorage.setItem('parallax-disabled', isParallaxUserDisabled ? 'true' : 'false');
        } catch {
          // Fallback if localStorage is restricted
        }
        updateToggleButtonUI();

        if (isParallaxUserDisabled) {
          stopLoop();
          resetParallax();
        } else {
          startLoop();
        }
      });
    }

    function updateDimensions() {
      const parent = heroParallax.parentElement;
      heroHeight = parent ? parent.offsetHeight : window.innerHeight;
      scaleFactor = Math.min(1, window.innerWidth / 1440);
    }

    updateDimensions();

    function resetParallax() {
      parallaxLayers.forEach((layer) => {
        layer.style.transform = '';
        layer.style.opacity = '';
      });
    }

    function startLoop() {
      if (!isAnimating && !prefersReducedMotion.matches && !isParallaxUserDisabled) {
        isAnimating = true;
        requestAnimationFrame(updateParallax);
      }
    }

    function stopLoop() {
      isAnimating = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        scrollY = window.scrollY;
        if (scrollY <= heroHeight) {
          startLoop();
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'mousemove',
      (e) => {
        isMouseActive = true;
        // Normalize coordinate offsets to range [-1, 1] relative to viewport center
        targetMouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        targetMouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        if (scrollY <= heroHeight) {
          startLoop();
        }
      },
      { passive: true }
    );

    window.addEventListener(
      'resize',
      () => {
        updateDimensions();
        if (scrollY <= heroHeight) {
          startLoop();
        }
      },
      { passive: true }
    );

    // Smoothly return layers to center when cursor leaves viewport
    document.addEventListener('mouseleave', () => {
      targetMouseX = 0;
      targetMouseY = 0;
    });

    if (prefersReducedMotion.addEventListener) {
      prefersReducedMotion.addEventListener('change', (e) => {
        if (e.matches) {
          stopLoop();
          resetParallax();
        } else {
          startLoop();
        }
      });
    }

    function updateParallax() {
      if (!isAnimating) return;

      if (prefersReducedMotion.matches || isParallaxUserDisabled) {
        resetParallax();
        stopLoop();
        return;
      }

      if (scrollY > heroHeight) {
        stopLoop();
        return;
      }

      // Lerp mouse coordinates to introduce organic damping/fluidity
      if (isMouseActive) {
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;
      }

      parallaxLayers.forEach((layer, index) => {
        const config = layersConfig[index];
        if (!config) return;

        const transY = -scrollY * config.scrollFactor + mouseY * config.mouseFactorY * scaleFactor;
        const transX = mouseX * config.mouseFactorX * scaleFactor;

        // Calculate individual fade opacity based on scroll position
        const opacity = Math.max(0, 1 - scrollY / config.fadeDist);

        layer.style.transform = `translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0)`;
        layer.style.opacity = opacity.toFixed(2);
      });

      requestAnimationFrame(updateParallax);
    }

    if (!prefersReducedMotion.matches && !isParallaxUserDisabled && scrollY <= heroHeight) {
      startLoop();
    } else if (prefersReducedMotion.matches || isParallaxUserDisabled) {
      resetParallax();
    }
  }
})();
