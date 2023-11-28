import { scrollFromHeader } from "./scroll-from-header/_scroll-from-header.mjs";

(() => {
    scrollFromHeader(".scroll-target", '.scroll-down');
    scrollFromHeader(".learning-path", ".scroll-down-learning-path")
    scrollFromHeader(".web-application-section" , ".scroll-down-web-app");
    scrollFromHeader(".scroll-to-path-second", ".scroll-down-to-content");
    scrollFromHeader(".web-app-scroll", ".scroll-down-to-youtube");
    scrollFromHeader(".book-of-shred", ".scroll-down-to-book-of-shred");
})();

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

document.querySelectorAll(".nav-link").forEach((link) =>
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
  })
);
