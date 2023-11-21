export function scrollFromHeader() {
    function scrollToTarget() {
        const targetElement = document.querySelector('.scroll-target');
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const scrollDownIcon = document.querySelector('.scroll-down');
    if (scrollDownIcon) {
        scrollDownIcon.addEventListener('click', scrollToTarget);
    }
}
