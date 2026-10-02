"use client";

import { useState } from "react";

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
 * placeholder show through instead, while still rendering normally if the real
 * photo is dropped in later.
 *
 * This lives in its own client module because the components that use it are
 * Server Components, and a Server Component cannot hand a function to the DOM.
 */
export function SmartImage({ src, alt, className, loading, fetchPriority }: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={() => setFailed(true)}
    />
  );
}
