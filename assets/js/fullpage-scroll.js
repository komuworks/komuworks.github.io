(() => {
  const sectionSelector = '.home-sections .section-anchor';
  const sections = Array.from(document.querySelectorAll(sectionSelector));
  if (sections.length < 2) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  let isAnimating = false;
  let wheelAccumulator = 0;
  let activeSectionIndex = 0;

  const clampIndex = (index) => Math.max(0, Math.min(sections.length - 1, index));

  const canSnapFromSection = (sectionIndex, direction) => {
    const section = sections[sectionIndex];
    if (!section) {
      return false;
    }

    const viewportTop = window.scrollY;
    const viewportBottom = viewportTop + window.innerHeight;
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    const scrollTolerance = 2;

    if (direction > 0) {
      return sectionBottom - viewportBottom <= scrollTolerance;
    }

    return viewportTop - sectionTop <= scrollTolerance;
  };

  const getCurrentSectionIndex = () => {
    const viewportCenter = window.scrollY + window.innerHeight / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    sections.forEach((section, index) => {
      const sectionCenter = section.offsetTop + section.offsetHeight / 2;
      const distance = Math.abs(viewportCenter - sectionCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const animateScrollTo = (targetY) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 580;
    let startTime = null;

    const easeOutQuint = (t) => 1 - (1 - t) ** 5;

    const step = (timestamp) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const nextY = startY + distance * easeOutQuint(progress);
      window.scrollTo(0, nextY);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetY);
        isAnimating = false;
      }
    };

    window.requestAnimationFrame(step);
  };

  const getSectionScrollTop = (sectionIndex, direction) => {
    const target = sections[sectionIndex];
    if (!target) {
      return 0;
    }

    if (direction < 0) {
      const sectionBottom = target.offsetTop + target.offsetHeight;
      return Math.max(0, sectionBottom - window.innerHeight + 8);
    }

    return sectionIndex === 0 ? 0 : target.offsetTop - 8;
  };

  const snapToSection = (nextIndex, direction) => {
    const boundedIndex = clampIndex(nextIndex);
    const target = sections[boundedIndex];
    if (!target) {
      return;
    }

    isAnimating = true;
    activeSectionIndex = boundedIndex;
    wheelAccumulator = 0;
    const targetY = getSectionScrollTop(boundedIndex, direction);
    animateScrollTo(targetY);
  };

  window.addEventListener(
    'wheel',
    (event) => {
      if (isAnimating) {
        event.preventDefault();
        return;
      }

      if (event.ctrlKey) {
        return;
      }

      const interactiveElement = event.target.closest('input, select, textarea, button, canvas, a');
      if (interactiveElement) {
        return;
      }

      wheelAccumulator += event.deltaY;
      if (Math.abs(wheelAccumulator) < 50) {
        return;
      }

      activeSectionIndex = getCurrentSectionIndex();
      const direction = wheelAccumulator > 0 ? 1 : -1;

      if (!canSnapFromSection(activeSectionIndex, direction)) {
        wheelAccumulator = 0;
        return;
      }

      event.preventDefault();
      snapToSection(activeSectionIndex + direction, direction);
    },
    { passive: false }
  );

  window.addEventListener('scroll', () => {
    if (isAnimating) {
      return;
    }

    activeSectionIndex = getCurrentSectionIndex();
  });

  window.addEventListener('keydown', (event) => {
    if (isAnimating) {
      return;
    }

    if (event.key !== 'ArrowDown' && event.key !== 'PageDown' && event.key !== 'ArrowUp' && event.key !== 'PageUp') {
      return;
    }

    event.preventDefault();
    activeSectionIndex = getCurrentSectionIndex();
    const direction = event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 : -1;

    if (!canSnapFromSection(activeSectionIndex, direction)) {
      return;
    }

    snapToSection(activeSectionIndex + direction, direction);
  });
})();
