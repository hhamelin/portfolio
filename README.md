# Haven Hamelin's Developer Portfolio

A responsive, professional portfolio website showcasing game design, web development, and XR projects. Built with semantic HTML5, Sass (SCSS) styling, and dynamic Vanilla JavaScript.

## Features

- **Responsive Design**: Adapts beautifully to mobile, tablet, and desktop viewports.
- **Dynamic Slideshow Showcase**: Populates screenshots, links, and detailed project captions dynamically using Splide.js.
- **Scroll Spy & Smooth Scroll**: Highlights the active navigation menu item as you scroll through page sections.
- **Accessible & Semantically Structured**: Improved markup for search engine optimization (SEO) and screen readers.
- **Contact Form Validation & Confirmation**: Interactive validation and user confirmation logic in Vanilla JS.

## Tech Stack

- **Core**: HTML5, Vanilla JavaScript (ES6)
- **Styling**: Sass (SCSS) compiled to CSS
- **Libraries**: [Splide.js](https://splidejs.com/) (loaded via CDN)

## Directory Structure

```text
├── css/             # Compiled CSS sheets and source maps
├── fonts/           # Local font assets (Roboto, Pixelify Sans, Avenixel)
├── img/             # Images and project screenshot assets
│   └── icons/       # Skills, tools, and social SVG/PNG icons
├── scripts/         # JS logic files (index.js, slides.js)
├── scss/            # Raw Sass source files (index.scss, _navbar.scss, _global.scss, _themes.scss, etc.)
├── index.html       # Primary webpage markup entry
├── package.json     # Node/npm dependency tracking and scripts
└── README.md        # Documentation
```

## Local Development & Styling

To run the site locally and compile Sass style updates, follow these steps:

1. **Install Dependencies**:
   Ensure you have [Node.js](https://nodejs.org/) installed, then run:
   ```bash
   npm install
   ```

2. **Compile Sass**:
   Compile the `.scss` files into optimized CSS inside the `css/` directory:
   ```bash
   npm run build:css
   ```

3. **Watch SCSS (Live Updates)**:
   Keep Sass running in the background to automatically compile CSS on file change:
   ```bash
   npm run watch:css
   ```
