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
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    // Skip updates during smooth scroll
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

    let gyroX = 0;
    let gyroY = 0;
    let targetGyroX = 0;
    let targetGyroY = 0;
    let isGyroActive = false;

    let heroHeight = 0;
    let scaleFactor = 1;
    let isAnimating = false;

    let isParallaxUserDisabled = false;
    try {
      isParallaxUserDisabled = localStorage.getItem('parallax-disabled') === 'true';
    } catch {
      isParallaxUserDisabled = false;
    }

    // Layer depth and fade settings
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

    let smoothedX = null;
    let smoothedY = null;

    // Handle device tilt motion
    function handleMotion(e) {
      const acc = e.accelerationIncludingGravity;
      if (
        !acc ||
        typeof acc.x !== 'number' ||
        typeof acc.y !== 'number' ||
        isNaN(acc.x) ||
        isNaN(acc.y)
      ) {
        return;
      }

      // Device tilt axes
      let rawX = acc.x;
      let rawY = acc.y;

      // Adapt to screen orientation
      const orientation =
        window.orientation || (screen.orientation && screen.orientation.angle) || 0;
      if (orientation === 90) {
        rawX = -acc.y;
        rawY = acc.x;
      } else if (orientation === -90 || orientation === 270) {
        rawX = acc.y;
        rawY = -acc.x;
      } else if (orientation === 180) {
        rawX = -acc.x;
        rawY = -acc.y;
      }

      // Smooth motion data
      if (smoothedX === null || smoothedY === null) {
        smoothedX = rawX;
        smoothedY = rawY;
      } else {
        smoothedX += (rawX - smoothedX) * 0.12;
        smoothedY += (rawY - smoothedY) * 0.12;
      }

      isGyroActive = true;

      // Amplifies the gain
      const diffY = smoothedY - 5.0;
      const normY = diffY > 0 ? (diffY / 3.5) * 4.5 : (diffY / 5.0) * 2.0;

      targetGyroX = (-smoothedX / 5.0) * 5.0;
      targetGyroY = normY;

      if (scrollY <= heroHeight) {
        startLoop();
      }
    }

    // iOS Motion Permission Modal Handling
    const motionPrompt = document.getElementById('motion-prompt');
    const motionEnableBtn = document.getElementById('motion-prompt-enable');
    const motionSkipBtn = document.getElementById('motion-prompt-skip');

    function closeMotionPrompt() {
      if (motionPrompt) {
        motionPrompt.classList.remove('active');
        motionPrompt.setAttribute('aria-hidden', 'true');
      }
    }

    // Testing helper to preview iOS motion permission modal on Android / Desktop
    window.testIOSMotionPrompt = function () {
      if (motionPrompt) {
        motionPrompt.classList.add('active');
        motionPrompt.setAttribute('aria-hidden', 'false');
      }
    };

    function initGyro() {
      if (
        typeof window.DeviceMotionEvent !== 'undefined' ||
        typeof window.DeviceOrientationEvent !== 'undefined'
      ) {
        if (
          typeof window.DeviceOrientationEvent !== 'undefined' &&
          typeof window.DeviceOrientationEvent.requestPermission === 'function'
        ) {
          // Check motion permission
          let motionPermission = null;
          try {
            motionPermission = localStorage.getItem('motion-permission');
          } catch {}

          if (motionPermission === 'granted') {
            window.addEventListener('devicemotion', handleMotion, true);
          } else if (motionPermission !== 'dismissed' && window.innerWidth <= 992) {
            // Show motion prompt
            window.testIOSMotionPrompt();
          }
        } else {
          // Automatic motion support
          window.addEventListener('devicemotion', handleMotion, true);
        }
      }
    }

    if (motionEnableBtn) {
      motionEnableBtn.addEventListener('click', () => {
        closeMotionPrompt();
        if (
          typeof window.DeviceOrientationEvent !== 'undefined' &&
          typeof window.DeviceOrientationEvent.requestPermission === 'function'
        ) {
          window.DeviceOrientationEvent.requestPermission()
            .then((response) => {
              if (response === 'granted') {
                try {
                  localStorage.setItem('motion-permission', 'granted');
                } catch {}
                window.addEventListener('devicemotion', handleMotion, true);
                startLoop();
              } else {
                try {
                  localStorage.setItem('motion-permission', 'dismissed');
                } catch {}
              }
            })
            .catch(() => {
              try {
                localStorage.setItem('motion-permission', 'dismissed');
              } catch {}
            });
        }
      });
    }

    if (motionSkipBtn) {
      motionSkipBtn.addEventListener('click', () => {
        closeMotionPrompt();
        try {
          localStorage.setItem('motion-permission', 'dismissed');
        } catch {}
      });
    }

    initGyro();

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
      'touchmove',
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
        // Normalize viewport coordinates
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

    // Reset coordinates on leave
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

      // Smooth mouse and gyro values
      if (isMouseActive) {
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;
      }

      if (isGyroActive && !isNaN(targetGyroX) && !isNaN(targetGyroY)) {
        gyroX += (targetGyroX - gyroX) * 0.07;
        gyroY += (targetGyroY - gyroY) * 0.07;
      } else {
        gyroX = 0;
        gyroY = 0;
      }

      const combinedX = mouseX + gyroX;
      const combinedY = mouseY + gyroY;

      parallaxLayers.forEach((layer, index) => {
        const config = layersConfig[index];
        if (!config) return;

        const transY =
          -scrollY * config.scrollFactor +
          (mouseY * config.mouseFactorY + gyroY * config.mouseFactorX * 1.1) * scaleFactor;
        const transX =
          (mouseX * config.mouseFactorX + gyroX * config.mouseFactorX * 1.6) * scaleFactor;

        // Calculate layer opacity
        const opacity = Math.max(0, 1 - scrollY / config.fadeDist);

        layer.style.transform = `translate3d(${transX.toFixed(2)}px, ${transY.toFixed(2)}px, 0)`;
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
