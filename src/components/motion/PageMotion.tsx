import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function PageMotion() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from('[data-site-shell]', {
        opacity: 0,
        y: 18,
        duration: 0.7,
        ease: 'power3.out',
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element, index) => {
        gsap.from(element, {
          opacity: 0,
          y: 26,
          duration: 0.7,
          delay: Math.min(index * 0.04, 0.18),
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            once: true,
          },
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return <div ref={rootRef} aria-hidden="true" />;
}
