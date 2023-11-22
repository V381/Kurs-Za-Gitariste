import { scrollFromHeader } from "./scroll-from-header/_scroll-from-header.mjs";

(() => {
    scrollFromHeader(".scroll-target", '.scroll-down');
    scrollFromHeader(".learning-path", ".scroll-down-learning-path")
    scrollFromHeader(".web-application-section" , ".scroll-down-web-app");
    scrollFromHeader(".scroll-to-path-second", ".scroll-down-to-content");
    scrollFromHeader(".web-app-scroll", ".scroll-down-to-youtube");
})();