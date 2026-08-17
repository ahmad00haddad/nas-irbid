import { Link } from "@tanstack/react-router";
import { BriefcaseBusiness, CalendarDays, MapPin, Play } from "lucide-react";
import { motion } from "framer-motion";
import { toArabicNumerals } from "@/lib/utils";

const MotionLink = motion.create(Link);

export type PublicEpisode = {
  id: string;
  slug: string;
  title: string;
  character_name: string | null;
  profession: string | null;
  neighborhood: string | null;
  youtube_id: string | null;
  cover_image_url: string | null;
  short_description: string | null;
  episode_number: number | null;
  published_at: string | null;
  instagram_views?: number | null;
  instagram_likes?: number | null;
};

function formatCount(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export function PublicEpisodeCard({ episode, asPreview = false }: { episode: PublicEpisode; asPreview?: boolean }) {
  const image = episode.cover_image_url ?? (episode.youtube_id ? `https://img.youtube.com/vi/${episode.youtube_id}/hqdefault.jpg` : null);

  const Wrapper = asPreview ? (motion.div as any) : MotionLink;
  const wrapperProps = asPreview
    ? {}
    : {
        to: "/episodes/$slug",
        params: { slug: episode.slug } as never,
        whileHover: { y: -6 },
        whileTap: { scale: 0.97 },
        "data-cursor-text": "شاهد",
      };

  return (
    <Wrapper
      {...wrapperProps}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`group block overflow-hidden rounded-2xl border border-border/70 bg-card shadow-deep transition-colors duration-300 ${
        asPreview ? "" : "hover:border-primary/60"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {image ? (
          <BlurImage
            src={image}
            youtubeId={episode.cover_image_url ? null : episode.youtube_id}
            alt={`صورة حلقة ${episode.title}`}
            width={480}
            height={360}
            className="h-full w-full object-cover ease-out group-hover:scale-[1.07] sepia-[0.12] duration-[900ms]"
          />
        ) : (
          <div className="flex h-full items-center justify-center pattern-geo" aria-hidden="true">
            <Play className="text-primary/50" size={36} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/10 to-transparent" />

        {/* hover CTA */}
        {!asPreview && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-center gap-2 pb-16 text-sm font-bold text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            شاهد الحلقة
          </span>
        )}

        <div className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition duration-500 group-hover:scale-110">
          <Play size={16} fill="currentColor" />
        </div>

        {episode.instagram_views && episode.instagram_views > 0 ? (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 text-[11px] font-bold text-white drop-shadow-md">
            <Play size={10} fill="currentColor" className="opacity-90" />
            <span dir="ltr">{formatCount(episode.instagram_views)}</span>
          </div>
        ) : null}

        {episode.episode_number && (
          <span className="absolute left-4 top-4 rounded-full border border-primary/20 bg-card/85 px-3 py-1 font-display text-[11px] font-bold text-primary backdrop-blur">
            الحلقة {toArabicNumerals(episode.episode_number)}
          </span>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-display text-xl leading-tight text-foreground transition-colors group-hover:text-primary">{episode.title}</h2>
        {episode.short_description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{episode.short_description}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/50 pt-4 text-xs text-muted-foreground">
          {episode.character_name && <span className="font-bold text-foreground">{episode.character_name}</span>}
          {episode.profession && (
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness size={12} className="opacity-60" /> {episode.profession}
            </span>
          )}
          {episode.neighborhood && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} className="opacity-60" /> {episode.neighborhood}
            </span>
          )}
          {episode.published_at && (
            <span className="ms-auto inline-flex items-center gap-1.5 opacity-80">
              <CalendarDays size={12} className="opacity-60" />
              {new Date(episode.published_at).toLocaleDateString("ar-JO", { year: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>

    </Wrapper>
  );
}