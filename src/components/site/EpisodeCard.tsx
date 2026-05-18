import type { Episode } from "@/lib/episodes";
import { Clock, MapPin } from "lucide-react";

export function EpisodeCard({ ep }: { ep: Episode }) {
  return (
    <article className="group relative overflow-hidden rounded-xl bg-card border border-border/60 hover:border-primary/40 transition-all shadow-deep">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={ep.image}
          alt={ep.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 sepia-[0.15]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur border border-primary/30">
          <span className="font-display text-xs text-primary">حلقة {ep.number}</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
          {ep.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {ep.excerpt}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={13} className="text-primary/70" />
            {ep.neighborhood}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} className="text-primary/70" />
            {ep.duration}
          </span>
        </div>
      </div>
    </article>
  );
}
