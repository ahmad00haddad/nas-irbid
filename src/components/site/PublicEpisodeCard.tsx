import { Link } from "@tanstack/react-router";
import { BriefcaseBusiness, CalendarDays, MapPin, Play } from "lucide-react";
import { motion } from "framer-motion";

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
};

export function PublicEpisodeCard({ episode }: { episode: PublicEpisode }) {
  const image = episode.cover_image_url ?? (episode.youtube_id ? `https://img.youtube.com/vi/${episode.youtube_id}/hqdefault.jpg` : null);

  return (
    <MotionLink
      to="/episodes/$slug"
      params={{ slug: episode.slug } as never}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      data-cursor-text="شاهد"
      className="group block overflow-hidden rounded-2xl border border-border/70 bg-card shadow-deep transition-colors duration-300 hover:border-primary/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {image ? (
          <img src={image} alt={`صورة حلقة ${episode.title}`} loading="lazy" width={480} height={360} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center pattern-geo" aria-hidden="true">
            <Play className="text-primary/50" size={36} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition group-hover:scale-110">
          <Play size={16} fill="currentColor" />
        </div>
        {episode.episode_number && (
          <span className="absolute left-4 top-4 rounded-full border border-card/40 bg-card/90 px-3 py-1 text-[11px] font-bold text-foreground backdrop-blur">
            الحلقة {episode.episode_number}
          </span>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-display text-xl leading-tight text-foreground transition-colors group-hover:text-primary">{episode.title}</h2>
        {episode.short_description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{episode.short_description}</p>}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border/50 pt-4 text-xs text-muted-foreground">
          {episode.character_name && <span className="font-semibold text-foreground">{episode.character_name}</span>}
          {episode.profession && <span className="inline-flex items-center gap-1"><BriefcaseBusiness size={12} />{episode.profession}</span>}
          {episode.neighborhood && <span className="inline-flex items-center gap-1"><MapPin size={12} />{episode.neighborhood}</span>}
          {episode.published_at && <span className="inline-flex items-center gap-1"><CalendarDays size={12} />{new Date(episode.published_at).toLocaleDateString("ar-JO", { year: "numeric", month: "short" })}</span>}
        </div>
      </div>
    </MotionLink>
  );
}