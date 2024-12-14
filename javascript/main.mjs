function generateBreadcrumbs() {
  const breadcrumbsContainer = document.querySelector('.breadcrumbs-container');
  if (!breadcrumbsContainer) return;
  
  breadcrumbsContainer.innerHTML = `
      <a href="/" class="breadcrumb-item">Početna</a>
  `;
  
  const pathSegments = window.location.pathname
    .split('/')
    .filter(segment => segment && segment !== 'index.html');
  
  if (pathSegments.length === 0) return;

  let currentPath = '';
  
  const breadcrumbsMap = {
      'tehnika': { name: 'Tehnika', path: '/tehnika/tehnika.html' },
      'teorija': { name: 'Teorija', path: '/teorija/teorija.html' },
      'harmonija': { name: 'Harmonija', path: '/teorija/harmonija.html' },
      'intervali': { name: 'Intervali', path: '/teorija/intervali.html' },
      'skale': { name: 'Skale', path: '/teorija/skale.html' },
      'pesme': { name: 'Pesme', path: '/pesme.html' },
      'o-meni': { name: 'O Meni', path: '/o-meni.html' },
      'alternate-picking': { name: 'Alternate Picking', path: '/tehnika/alternate-picking.html' },
      'sweep-picking': { name: 'Sweep Picking', path: '/tehnika/sweep-picking.html' },
      'legato': { name: 'Legato', path: '/tehnika/legato.html' }
  };

  pathSegments.forEach((segment, index) => {
      const separator = document.createElement('span');
      separator.className = 'breadcrumb-separator';
      separator.innerHTML = '<i class="fas fa-chevron-right"></i>';
      breadcrumbsContainer.appendChild(separator);

      const segmentName = segment.replace('.html', '');
      const breadcrumbItem = document.createElement('a');
      breadcrumbItem.className = 'breadcrumb-item';
      
      const mappedItem = breadcrumbsMap[segmentName];
      const displayName = mappedItem ? mappedItem.name : 
          segmentName.charAt(0).toUpperCase() + segmentName.slice(1).replace(/-/g, ' ');
      
      if (index === pathSegments.length - 1) {
          breadcrumbItem.classList.add('active');
          breadcrumbItem.style.pointerEvents = 'none';
          breadcrumbItem.textContent = displayName;
      } else {
          breadcrumbItem.href = mappedItem ? mappedItem.path : '/' + pathSegments.slice(0, index + 1).join('/');
          breadcrumbItem.textContent = displayName;
      }
      
      breadcrumbsContainer.appendChild(breadcrumbItem);
  });
}

generateBreadcrumbs();


document.querySelectorAll('.dropdown > .nav-link').forEach(dropdownLink => {
  dropdownLink.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
          e.preventDefault();
          const dropdown = dropdownLink.parentElement;
          dropdown.classList.toggle('active');
      }
  });
});

// Hamburger menu toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Only close mobile menu when clicking non-dropdown links
document.querySelectorAll(".nav-link:not(.dropdown > .nav-link)").forEach((link) =>
  link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
  })
);


