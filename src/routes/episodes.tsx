import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Play, MapPin } from "lucide-react";

export const Route = createFileRoute("/episodes")({
  component: EpisodesPage,
  head: () => ({
    meta: [
      { title: "أرشيف الحلقات · ناس إربد" },
      { name: "description", content: "كل حلقات برنامج ناس إربد الوثائقي، مرتبة ومفهرسة حسب الشخصية والحي والمهنة." },
      { property: "og:title", content: "أرشيف الحلقات · ناس إربد" },
      { property: "og:description", content: "كل حلقات البرنامج بجودة عالية، مع تفاصيل خلف الكواليس." },
    ],
  }),
});

function EpisodesPage() {
  const [filter, setFilter] = useState<string>("الكل");

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["public-episodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes").select("*").eq("published", true)
        .order("episode_number", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    episodes.forEach((e: any) => e.neighborhood && set.add(e.neighborhood));
    return ["الكل", ...Array.from(set)];
  }, [episodes]);

  const filtered = filter === "الكل" ? episodes : episodes.filter((e: any) => e.neighborhood === filter);

  return (
    <div className="container mx-auto px-6 py-20">
      <header className="max-w-3xl mb-14">
        <span className="text-xs font-bold text-primary tracking-widest">الأرشيف</span>
        <h1 className="font-display text-5xl md:text-6xl mt-3 mb-5 text-foreground">
          أرشيف <span className="text-gradient-gold">الحلقات</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          كل حلقات «ناس إربد» في مكان واحد. شاهدها بجودة عالية، اقرأ ملخصها التاريخي،
          واكتشف ما لم يظهر في المونتاج.
        </p>
      </header>

      {neighborhoods.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-12">
          {neighborhoods.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={
                f === filter
                  ? "px-4 py-2 rounded-full text-sm font-semibold bg-gradient-warm text-primary-foreground"
                  : "px-4 py-2 rounded-full text-sm font-semibold border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition"
              }
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-muted-foreground">جاري التحميل…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center p-16 rounded-2xl bg-card border border-dashed border-border max-w-xl mx-auto">
          <p className="font-display text-xl text-foreground mb-2">قريباً جداً</p>
          <p className="text-sm text-muted-foreground">حلقات الموسم الأول قيد التصوير. تابعنا لتكون أول من يشاهد.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ep: any) => (
            <Link
              key={ep.id}
              to="/episodes/$slug"
              params={{ slug: ep.slug }}
              className="group bg-card border border-accent/20 overflow-hidden hover:border-accent/60 transition hover:-translate-y-1 arch-frame"
            >
              <div className="aspect-[3/4] bg-background/40 relative overflow-hidden arch-top">
                {ep.cover_image_url ? (
                  <img src={ep.cover_image_url} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                ) : ep.youtube_id ? (
                  <img src={`https://img.youtube.com/vi/${ep.youtube_id}/hqdefault.jpg`} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/80 via-transparent to-transparent">
                  <div className="w-14 h-14 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow group-hover:scale-110 transition">
                    <Play size={20} className="text-primary-foreground translate-x-[-2px]" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                {ep.episode_number && <span className="text-[10px] font-bold text-primary tracking-widest">حلقة {ep.episode_number}</span>}
                <h3 className="font-display text-lg text-foreground mt-1 mb-2 line-clamp-2">{ep.title}</h3>
                {ep.short_description && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">{ep.short_description}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {ep.character_name && <span>{ep.character_name}</span>}
                  {ep.neighborhood && <span className="inline-flex items-center gap-1"><MapPin size={11} /> {ep.neighborhood}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
