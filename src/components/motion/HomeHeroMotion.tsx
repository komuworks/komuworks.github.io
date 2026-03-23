import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HomeHeroMotion() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.from('[data-hero-title]', { y: 18, opacity: 0, duration: 0.7 }).from(
        '[data-hero-meta]',
        { y: 12, opacity: 0, duration: 0.55, stagger: 0.1 },
        '-=0.35',
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="hero-motion">
      <h1 data-hero-title>トップページ</h1>
      <div className="hero-meta">
        <p data-hero-meta>
          ブログ件数: <slot name="blog-count" />
        </p>
        <p data-hero-meta>
          タイピング記録件数: <slot name="typing-count" />
        </p>
      </div>
    </div>
  );
}
