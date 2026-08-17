import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  youtubeId?: string | null;
  priority?: boolean;
};

/** Builds a responsive WebP srcset for YouTube thumbnails (vi_webp endpoint). */
function youtubeSrcSet(id: string) {
  const base = `https://i.ytimg.com/vi_webp/${id}`;
  return [
    `${base}/mqdefault.webp 320w`,
    `${base}/hqdefault.webp 480w`,
    `${base}/sddefault.webp 640w`,
    `${base}/maxresdefault.webp 1280w`,
  ].join(", ");
}

export function BlurImage({ src, alt, className = "", width, height, youtubeId, priority }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className="relative block h-full w-full overflow-hidden">
      {/* blur placeholder */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 bg-secondary transition-opacity duration-700 ${loaded ? "opacity-0" : "opacity-100"}`}
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 40%, oklch(0.62 0.09 70 / 0.35), oklch(0.42 0.09 165 / 0.18))",
          filter: "blur(12px)",
        }}
      />
      <img
        src={src}
        srcSet={youtubeId ? youtubeSrcSet(youtubeId) : undefined}
        sizes={youtubeId ? "(max-width: 768px) 100vw, 33vw" : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}
