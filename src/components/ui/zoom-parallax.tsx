'use client';

import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

interface Image {
  src: string;
  alt?: string;
}

interface ZoomParallaxProps {
  images: Image[];
}

/**
 * Zoom Parallax — faithful re-implementation of the 21st.dev component.
 *
 * How it works:
 *  • A 300vh outer container provides scroll travel.
 *  • A sticky 100vh inner container clips the effect.
 *  • Each image starts small (centred on its region) and zooms to ~4×.
 *  • transformOrigin is always 'center center' — the same as the original.
 *  • Background is #000 so the gaps at start show a cinematic dark void,
 *    not white or grey.
 *
 * Layout of up to 7 images:
 *
 *   [0: top-left]   [1: top-centre]   [2: top-right]
 *   [3: mid-left]   [4: CENTRE ★]     [5: mid-right]
 *                   [6: bottom wide]
 */

interface Tile {
  top: string;
  left: string;
  width: string;
  height: string;
  scaleRange: [number, number];
}

const TILES: Tile[] = [
  // ── Row 1 ──────────────────────────────────────────────────────────────────
  { top: '0%',    left: '0%',    width: '25vw', height: '25vh', scaleRange: [1, 5]   },
  { top: '0%',    left: '27.5vw',width: '45vw', height: '25vh', scaleRange: [1, 3.5] },
  { top: '0%',    left: '75vw',  width: '25vw', height: '25vh', scaleRange: [1, 5]   },
  // ── Row 2 ──────────────────────────────────────────────────────────────────
  { top: '27.5vh',left: '0%',    width: '25vw', height: '45vh', scaleRange: [1, 4]   },
  { top: '27.5vh',left: '27.5vw',width: '45vw', height: '45vh', scaleRange: [1, 2.5] }, // ★ centre
  { top: '27.5vh',left: '75vw',  width: '25vw', height: '45vh', scaleRange: [1, 4]   },
  // ── Row 3 ──────────────────────────────────────────────────────────────────
  { top: '75vh',  left: '0%',    width: '100vw',height: '25vh', scaleRange: [1, 3.5] },
];

function ParallaxImage({
  tile,
  src,
  alt,
  scrollYProgress,
}: {
  tile: Tile;
  src: string;
  alt: string;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const scale = useTransform(scrollYProgress, [0, 1], tile.scaleRange);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: tile.top,
        left: tile.left,
        width: tile.width,
        height: tile.height,
        overflow: 'hidden',   // clip the zoomed image to tile bounds
        scale,
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        loading="eager"
        draggable={false}
      />
    </motion.div>
  );
}

export function ZoomParallax({ images }: ZoomParallaxProps) {
  const container = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    /* 300vh gives ~200vh of scroll-through before the next section appears */
    <div ref={container} style={{ position: 'relative', height: '300vh' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          background: '#000', // cinematic dark bg; gaps at scroll-start are intentional
        }}
      >
        {TILES.map((tile, i) => {
          const image = images[i];
          if (!image) return null;
          return (
            <ParallaxImage
              key={i}
              tile={tile}
              src={image.src}
              alt={image.alt ?? ''}
              scrollYProgress={scrollYProgress}
            />
          );
        })}
      </div>
    </div>
  );
}
