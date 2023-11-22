export function scrollFromHeader(target, scrollIconClass) {
    function scrollToTarget() {
        const targetElement = document.querySelector(target);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    const scrollDownIcon = document.querySelector(scrollIconClass);
    if (scrollDownIcon) {
        scrollDownIcon.addEventListener('click', scrollToTarget);
    }
}
