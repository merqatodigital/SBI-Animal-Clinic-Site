"use client";

import { useEffect, useRef, useState } from "react";

type SmartImageProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
};

/**
 * `<img>` that removes itself when the file cannot be loaded.
 *
 * Several photos are referenced by this project (hero, first-aid, clinic
 * interior) but have never been committed, so browsers were printing raw alt
 * text across the page. Hiding the node lets the surrounding designed
 * placeholder show through, while still rendering normally if the real photo is
 * dropped in later.
 *
 * Two failure paths have to be covered:
 *  - the image 404s after hydration, so `onError` fires normally;
 *  - the image 404s while the server HTML is still parsing, before React has
 *    attached listeners. The event is already gone by then, so the effect
 *    below re-checks the finished element and unmounts it.
 *
 * This lives in its own client module because the components that use it are
 * Server Components, and a Server Component cannot hand a function to the DOM.
 */
export function SmartImage({ src, alt, className, loading, fetchPriority }: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    // `complete` covers both decoded images and failed ones; a failed load has
    // no natural size, which distinguishes it from an image still in flight.
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed || !src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={() => setFailed(true)}
    />
  );
}
