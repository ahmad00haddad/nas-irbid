import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { Search, RotateCcw } from "lucide-react";
import { PublicEpisodeCard, type PublicEpisode } from "@/components/site/PublicEpisodeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

const searchSchema = z.object({
  q: z.string().optional().catch(""),
  n: z.string().optional().catch("all"),
});

export const Route = createFileRoute("/episodes")({
  validateSearch: searchSchema,
  component: EpisodesPage,
  head: () => ({
    meta: [
      { title: "أرشيف الحلقات · ناس إربد" },
      { name: "description", content: "كل حلقات برنامج ناس إربد الوثائقي، مرتبة ومفهرسة حسب الشخصية والحي والمهنة." },
      { property: "og:title", content: "أرشيف الحلقات · ناس إربد" },
      { property: "og:description", content: "كل حلقات البرنامج بجودة عالية، مع تفاصيل خلف الكواليس." },
      { property: "og:url", content: "https://nas-irbid.lovable.app/episodes" },
    ],
    links: [{ rel: "canonical", href: "https://nas-irbid.lovable.app/episodes" }],
  }),
});

function EpisodesPage() {
  const { q: query = "", n: neighborhood = "all" } = Route.useSearch();
  const navigate = Route.useNavigate();

  const setQuery = (val: string) => navigate({ search: (prev) => ({ ...prev, q: val }), replace: true });
  const setNeighborhood = (val: string) => navigate({ search: (prev) => ({ ...prev, n: val }), replace: true });
  const { data: episodes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["public-episodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes").select("*").eq("published", true)
        .order("episode_number", { ascending: false, nullsFirst: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const neighborhoods = useMemo(() => Array.from(new Set(episodes.map((ep) => ep.neighborhood).filter(Boolean))) as string[], [episodes]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ar");
    return episodes.filter((ep) => {
      const haystack = [ep.title, ep.character_name, ep.profession, ep.neighborhood, ep.short_description].filter(Boolean).join(" ").toLocaleLowerCase("ar");
      return (!needle || haystack.includes(needle)) && (neighborhood === "all" || ep.neighborhood === neighborhood);
    });
  }, [episodes, neighborhood, query]);

  return (
    <div className="container mx-auto px-6 py-20">
      <FadeIn className="max-w-3xl mb-14">
        <span className="text-xs font-bold accent-emerald tracking-widest divider-emerald">الأرشيف</span>
        <h1 className="font-display text-5xl md:text-6xl mt-3 mb-5 text-foreground">
          أرشيف <span className="text-gradient-gold">الحلقات</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          كل حلقات «ناس إربد» في مكان واحد. شاهدها بجودة عالية، اقرأ ملخصها التاريخي،
          واكتشف ما لم يظهر في المونتاج.
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mb-10 space-y-3">
        <label className="relative block">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={17} />
          <span className="sr-only">ابحث في الحلقات</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث باسم الشخصية، المهنة، الحي أو الحكاية…" className="min-h-12 w-full rounded-xl border border-border bg-input py-3 pl-4 pr-11 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
        {neighborhoods.length > 0 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="تصفية حسب الحي">
            <button
              type="button"
              onClick={() => setNeighborhood("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                neighborhood === "all"
                  ? "bg-primary text-primary-foreground border-primary shadow-glow"
                  : "bg-card border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              كل الأحياء
            </button>
            {neighborhoods.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNeighborhood(n === neighborhood ? "all" : n)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  neighborhood === n
                    ? "bg-primary text-primary-foreground border-primary shadow-glow"
                    : "bg-card border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </FadeIn>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="جاري تحميل الحلقات">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />)}
        </div>
      ) : isError ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-destructive/30 bg-card p-10 text-center">
          <h2 className="font-display text-2xl text-foreground">تعذّر تحميل الأرشيف</h2>
          <p className="mt-2 text-sm text-muted-foreground">تحقق من اتصالك ثم حاول مرة أخرى.</p>
          <Button className="mt-5 rounded-full" onClick={() => refetch()}>إعادة المحاولة</Button>
        </div>
      ) : episodes.length === 0 ? (
        <div className="text-center p-16 rounded-2xl bg-card border border-dashed border-border max-w-xl mx-auto">
          <p className="font-display text-xl text-foreground mb-2">قريباً جداً</p>
          <p className="text-sm text-muted-foreground">حلقات الموسم الأول قيد التصوير. تابعنا لتكون أول من يشاهد.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-xl text-foreground">لا توجد نتائج مطابقة</p>
          <p className="mt-2 text-sm text-muted-foreground">جرّب كلمة أخرى أو اعرض جميع الأحياء.</p>
          <Button variant="outline" className="mt-5 rounded-full" onClick={() => { setQuery(""); setNeighborhood("all"); }}><RotateCcw size={15} /> مسح البحث</Button>
        </div>
      ) : (
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ep) => (
            <StaggerItem key={ep.id}>
              <PublicEpisodeCard episode={ep as PublicEpisode} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
