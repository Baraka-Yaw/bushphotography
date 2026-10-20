"use client";

import Image from "next/image";
import { useState } from "react";

import { Lightbox } from "@/components/media/Lightbox";
import { IMAGE_SIZES, resolveImage } from "@/lib/media";
import type { ImageRef } from "@/types/content";

/**
 * Photo-project gallery. Each frame is a real `<button>` so it is reachable and
 * activatable by keyboard; `<dialog>` then returns focus here on close.
 *
 * Images keep their intrinsic aspect ratio rather than being cropped to a uniform
 * box — a portfolio grid that crops every frame to the same rectangle throws away
 * the framing decisions the work is being judged on.
 */
export function Gallery({ images }: { images: ImageRef[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {images.map((image, index) => (
          <li key={image.src}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="frame group block w-full cursor-zoom-in"
            >
              <Image
                src={resolveImage(image)}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes={IMAGE_SIZES.gallery}
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <span className="sr-only">Open image {index + 1} in viewer</span>
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        images={images}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </>
  );
}
