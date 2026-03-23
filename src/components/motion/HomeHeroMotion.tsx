import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

type Props = {
  blogHref: string;
  profileHref: string;
  goalsHref: string;
  typingHref: string;
};

export default function HomeHeroMotion({ blogHref, profileHref, goalsHref, typingHref }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('[data-hero-deco]', {
        scale: 0.7,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
      })
        .from(
          '[data-hero-title]',
          {
            y: 22,
            opacity: 0,
            duration: 0.75,
          },
          '-=0.5',
        )
        .from(
          '[data-hero-lead]',
          {
            y: 14,
            opacity: 0,
            duration: 0.55,
          },
          '-=0.45',
        )
        .from(
          '[data-hero-stat]',
          {
            y: 18,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
          },
          '-=0.25',
        )
        .from(
          '[data-hero-link]',
          {
            y: 16,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
          },
          '-=0.35',
        );

      gsap.to('[data-hero-orb="left"]', {
        y: -16,
        x: 10,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to('[data-hero-orb="right"]', {
        y: 14,
        x: -12,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      const root = rootRef.current;
      const decoLayer = root?.querySelector<HTMLElement>('[data-hero-deco-layer]');
      if (!root || !decoLayer) return;

      const xTo = gsap.quickTo(decoLayer, 'x', { duration: 0.5, ease: 'power2.out' });
      const yTo = gsap.quickTo(decoLayer, 'y', { duration: 0.5, ease: 'power2.out' });

      const onPointerMove = (event: PointerEvent) => {
        const rect = root.getBoundingClientRect();
        const xRatio = (event.clientX - rect.left) / rect.width - 0.5;
        const yRatio = (event.clientY - rect.top) / rect.height - 0.5;
        xTo(xRatio * 22);
        yTo(yRatio * 16);
      };

      const onPointerLeave = () => {
        xTo(0);
        yTo(0);
      };

      root.addEventListener('pointermove', onPointerMove);
      root.addEventListener('pointerleave', onPointerLeave);

      return () => {
        root.removeEventListener('pointermove', onPointerMove);
        root.removeEventListener('pointerleave', onPointerLeave);
      };
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="hero-motion" aria-label="ホームヒーロー">
      <div className="hero-card">
        <div className="hero-deco" data-hero-deco-layer>
          <span data-hero-deco data-hero-orb="left" className="hero-orb hero-orb-left" />
          <span data-hero-deco data-hero-orb="right" className="hero-orb hero-orb-right" />
          <span data-hero-deco className="hero-grid" />
        </div>

        <p className="hero-kicker" data-hero-lead>
          Astro × GSAP Showcase
        </p>
        <h1 data-hero-title>トップページ</h1>
        <p data-hero-lead>
          軽量なAstro構成を保ちながら、GSAPのタイムラインとインタラクションで動きのあるUIにしています。
        </p>

        <div className="hero-stats">
          <p data-hero-stat>
            ブログ件数: <slot name="blog-count" />
          </p>
          <p data-hero-stat>
            タイピング記録件数: <slot name="typing-count" />
          </p>
        </div>

        <nav className="hero-links" aria-label="主要ページ">
          <a href={blogHref} data-hero-link>
            Blog
          </a>
          <a href={profileHref} data-hero-link>
            Profile
          </a>
          <a href={goalsHref} data-hero-link>
            Goals
          </a>
          <a href={typingHref} data-hero-link>
            Typing
          </a>
        </nav>
      </div>
    </section>
  );
}
