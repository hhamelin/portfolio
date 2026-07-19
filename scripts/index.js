(() => {
  'use strict';

  const navbar = document.getElementById('navbar');
  const navToggleBtn = document.getElementById('nav-toggle');
  const navLinks = document.querySelectorAll('nav ul li a[data-target]');
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('nav ul li');
  const contactForm = document.querySelector('section.contact form');

  // Smooth Scroll to Anchor with Navbar Offset
  function scrollToAnchor(targetId) {
    const style = window.getComputedStyle(document.body);
    const navbarHeight = parseInt(style.getPropertyValue('--navbar-height'), 10);
    const element = document.getElementById(targetId);
    if (!element) return;

    const position = element.getBoundingClientRect().top + window.scrollY;
    const offset = targetId === 'projects' ? 66 : 0;
    const scrollDistance = navbarHeight - offset;

    window.scrollTo({
      top: position - scrollDistance,
      behavior: 'smooth'
    });

    closeNav();
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

  // Contact Form submission handling
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      // Get field values
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      // Select submit button and cache original text
      const submitBtn = contactForm.querySelector('input.submit');
      if (!submitBtn) return;

      const originalBtnText = submitBtn.value;
      submitBtn.value = 'Sending...';
      submitBtn.disabled = true;

      // Simulate sending email (async delay)
      setTimeout(() => {
        submitBtn.value = 'Sent!';
        submitBtn.classList.add('sent');

        // Create clean success message element styled purely via CSS
        const successMsg = document.createElement('p');
        successMsg.className = 'success-message';
        successMsg.textContent = `Thank you, ${name}! Your message has been sent.`;

        contactForm.appendChild(successMsg);
        contactForm.reset();

        // Remove message and reset button after 5 seconds
        setTimeout(() => {
          successMsg.remove();
          submitBtn.value = originalBtnText;
          submitBtn.disabled = false;
          submitBtn.classList.remove('sent');
        }, 5000);
      }, 1000);
    });
  }
})();
