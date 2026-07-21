import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { Search, RotateCcw, X } from "lucide-react";
import { PublicEpisodeCard, type PublicEpisode } from "@/components/site/PublicEpisodeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { ErrorState } from "@/components/ui/error-state";

export const Route = createFileRoute("/episodes")({
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
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const { data: episodes = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["public-episodes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episodes").select("*").eq("published", true)
        .order("episode_number", { ascending: false, nullsFirst: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const normalize = (s: string) =>
    s.toLocaleLowerCase("ar")
      .replace(/[\u064B-\u065F\u0670]/g, "") // strip Arabic diacritics
      .replace(/[إأآا]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/\s+/g, " ")
      .trim();

  const filtered = useMemo(() => {
    if (!episodes || episodes.length === 0) return [];
    const needle = normalize(deferredQuery);
    if (!needle) return episodes;
    return episodes.filter((ep) => {
      const haystack = normalize(
        [ep.title, ep.character_name, ep.profession, ep.neighborhood, ep.short_description, ep.story]
          .filter(Boolean).join(" ")
      );
      return haystack.includes(needle);
    });
  }, [episodes, deferredQuery]);

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

      <FadeIn delay={0.1} className="mb-6">
        <label className="relative block">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={17} />
          <span className="sr-only">ابحث في الحلقات</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث باسم الشخصية، المهنة، الحي أو الحكاية…"
            className="min-h-12 w-full rounded-xl border border-border bg-input py-3 pl-11 pr-11 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="مسح البحث"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </label>
        {query.trim() && !isLoading && (
          <p className="mt-3 text-xs text-muted-foreground">
            {filtered.length > 0
              ? `${filtered.length} من ${episodes.length} حلقة`
              : "لا توجد نتائج"}
          </p>
        )}
      </FadeIn>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="جاري تحميل الحلقات">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="aspect-[4/5] rounded-2xl" />)}
        </div>
      ) : isError ? (
        <div className="py-8">
          <ErrorState
            title="تعذّر تحميل الأرشيف"
            description="تحقّق من اتصالك بالإنترنت ثم حاول مرة أخرى."
            variant="network"
            action={{ label: "إعادة المحاولة", onClick: () => refetch() }}
            backTo={{ to: "/", label: "الصفحة الرئيسية" }}
          />
        </div>
      ) : episodes.length === 0 ? (
        <div className="text-center p-16 rounded-2xl bg-card border border-dashed border-border max-w-xl mx-auto">
          <p className="font-display text-xl text-foreground mb-2">قريباً جداً</p>
          <p className="text-sm text-muted-foreground">حلقات الموسم الأول قيد التصوير. تابعنا لتكون أول من يشاهد.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-xl text-foreground">لا توجد نتائج مطابقة</p>
          <p className="mt-2 text-sm text-muted-foreground">جرّب كلمة أخرى.</p>
          <Button variant="outline" className="mt-5 rounded-full" onClick={() => setQuery("")}><RotateCcw size={15} /> مسح البحث</Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ep) => (
            <PublicEpisodeCard key={ep.id} episode={ep as PublicEpisode} />
          ))}
        </div>
      )}
    </div>
  );
}

