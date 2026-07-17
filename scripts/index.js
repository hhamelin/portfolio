// Prevent clicks on interactive slideshow elements from closing the overlay
const slideshowWrapper = document.querySelector('.slideshow-wrapper');
if (slideshowWrapper) {
  slideshowWrapper.addEventListener('click', (event) => {
    // Only stop propagation if clicking interactive components:
    // the slide viewport track, control arrows, pagination dots, or the description box.
    const isInteractive = event.target.closest('.splide__track') ||
                          event.target.closest('.splide__arrow') ||
                          event.target.closest('.splide__pagination') ||
                          event.target.closest('.click-overrider');
                          
    if (isInteractive) {
      event.stopPropagation();
    }
  });
}

// Smooth Scroll to Anchor with Navbar Offset
function scrollToAnchor(targetId) {
  const style = window.getComputedStyle(document.body);
  const navbarHeight = parseInt(style.getPropertyValue('--navbar-height'), 10);
  const element = document.getElementById(targetId);
  if (!element) return;

  const position = element.offsetTop;
  const offset = targetId === 'projects' ? 66 : 0;
  const scrollDistance = navbarHeight - offset;

  window.scrollTo({
    top: position - scrollDistance,
    behavior: 'smooth'
  });

  closeNav();
}

// Navigation event listeners
document.querySelectorAll('nav ul li a[data-target]').forEach(link => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const targetId = link.getAttribute('data-target');
    scrollToAnchor(targetId);
  });
});

// Responsive navigation menu toggling
function toggleNav() {
  const navbar = document.getElementById("navbar");
  if (window.innerWidth <= 992) {
    navbar.classList.toggle("responsive");
  }
}

function closeNav() {
  const navbar = document.getElementById("navbar");
  if (window.innerWidth <= 992) {
    navbar.classList.remove("responsive");
  }
}

// Intersection Observer for scroll-spy functionality
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('nav ul li');

const observerOptions = {
  root: null,
  rootMargin: '-50% 0px -50% 0px', // Trigger when section occupies the middle of viewport
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const activeId = entry.target.getAttribute('id');
      navItems.forEach(item => {
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

sections.forEach(section => observer.observe(section));

// Contact Form submission handling
const contactForm = document.querySelector('section.contact form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Get fields
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    
    // Create a neat toast/alert for confirmation
    const originalSubmitBtn = contactForm.querySelector('input.submit');
    const prevValue = originalSubmitBtn.value;
    originalSubmitBtn.value = "Sending...";
    originalSubmitBtn.disabled = true;

    // Simulate sending email
    setTimeout(() => {
      originalSubmitBtn.value = "Sent!";
      originalSubmitBtn.style.backgroundColor = "#2b7c46"; // Green success color
      
      const successMsg = document.createElement('p');
      successMsg.className = "success-message";
      successMsg.textContent = `Thank you, ${name}! Your message has been sent.`;
      successMsg.style.color = "#76ff76";
      successMsg.style.marginTop = "15px";
      successMsg.style.textAlign = "center";
      successMsg.style.fontWeight = "bold";
      
      contactForm.appendChild(successMsg);
      contactForm.reset();
      
      setTimeout(() => {
        successMsg.remove();
        originalSubmitBtn.value = prevValue;
        originalSubmitBtn.disabled = false;
        originalSubmitBtn.style.backgroundColor = ""; // Reset style
      }, 5000);
    }, 1000);
  });
}